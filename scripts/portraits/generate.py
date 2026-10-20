"""Generate the base candidates with FLUX.2 klein 4B (mflux 0.19.1, 8-bit, 4 steps, 512 px).

Run with mflux's own interpreter:
  caffeinate -i ~/.local/share/uv/tools/mflux/bin/python scripts/portraits/generate.py GROUP[,GROUP] [id ...]
GROUP is cast, mascots or oneoffs. PORTRAIT_STORY=newsroom (or clinic) makes GROUP cast that story's cast, written to
work/stories/<story>/ (story.py).
Skips any image already on disk, so it can be stopped and resumed. Appends every seed, prompt and timing to
scripts/portraits/work/generation-log.json.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cast  # noqa: E402
import story  # noqa: E402

RAW = os.path.join(story.WORK, "raw")
LOG = os.path.join(story.WORK, "generation-log.json")


def main():
    os.makedirs(RAW, exist_ok=True)
    log = json.load(open(LOG)) if os.path.exists(LOG) else {
        "model": "black-forest-labs/FLUX.2-klein-4B, snapshot e7b7dc27, 8-bit via mflux 0.19.1",
        "steps": cast.STEPS, "size": cast.SIZE, "images": {}}
    todo = [j for j in cast.jobs(set(sys.argv[2:]) or None, sys.argv[1].split(",")) if not os.path.exists(os.path.join(RAW, j["id"] + ".png"))]
    print(f"{len(todo)} to generate", flush=True)
    if not todo:
        return
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2Klein
    t0 = time.time()
    model = Flux2Klein(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    print(f"model loaded {time.time() - t0:.1f}s", flush=True)
    for j in todo:
        t = time.time()
        img = model.generate_image(seed=j["seed"], prompt=j["prompt"], num_inference_steps=cast.STEPS,
                                   width=cast.SIZE, height=cast.SIZE)
        img.save(os.path.join(RAW, j["id"] + ".png"))
        mx.clear_cache()  # frees MLX's buffer cache between images; it otherwise grows into swap on a 24 GB Mac
        j["seconds"] = round(time.time() - t, 1)
        log["images"][j["id"]] = j
        json.dump(log, open(LOG, "w"), indent=1)
        print(j["id"], j["seconds"], flush=True)
    print(f"done {time.time() - t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
