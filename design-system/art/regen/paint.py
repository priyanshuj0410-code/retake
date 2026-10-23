"""Re-renders the Cricket raws (portraits and the scoreboard) with FLUX.2 klein so they can be re-graded from clean sources.
Run with the mflux python: ~/.local/share/uv/tools/mflux/bin/python paint.py"""
import json, os, time

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = '/Users/priyanshu/equal-lens-trainer/design-system/assets'
NO = (" Full-bleed edge to edge, no border, no frame, no people, no faces, no hands. No text, no letters, no numbers, no words, "
      "no logos, no badges, no religious symbols, no writing anywhere.")
BOARD2 = ("A giant old manual cricket scoreboard at a stadium at dusk, seen from the outfield: its tall black face fills the middle of the picture, "
          "rows of blank black hanging plates with nothing written on them, a ladder leaning against it, the floodlight towers dark and unlit, "
          "empty stands, a warm hazy sepia evening sky. Painted like a vintage Indian sports-magazine centre spread from the 1980s: deep outfield "
          "greens, chalk white and cherry red, warm sepia light, dramatic angle, faded glossy print." + NO)


def logged(name):
    p = json.load(open(os.path.join(ASSETS, name + '.webp.json')))['prompt']
    body, tail = p.rsplit('\n[', 1)
    seed = int(tail.split('seed ')[1].split(';')[0])
    return body, seed


def jobs():
    out = []
    b, s = logged('cricket-s-scoreboard')
    out.append(('board-orig-%d' % s, b, s, 512, 896))
    for seed in (7017, 7031):
        out.append(('board-new-%d' % seed, BOARD2, seed, 512, 896))
    for who in ('kamla', 'salim', 'raju', 'pammi', 'anita', 'vikram', 'arjun', 'meena'):
        b, s = logged('cricket-' + who)
        out.append(('face-%s' % who, b, s, 512, 512))
    return out


def main():
    import mlx.core as mx
    from mflux.models.common.config import ModelConfig
    from mflux.models.flux2.variants import Flux2Klein
    model = Flux2Klein(quantize=8, model_config=ModelConfig.flux2_klein_4b())
    lp = os.path.join(HERE, 'log.json')
    log = json.load(open(lp)) if os.path.exists(lp) else {}
    for name, prompt, seed, w, h in jobs():
        path = os.path.join(HERE, name + '.png')
        if os.path.exists(path):
            continue
        t = time.time()
        img = model.generate_image(seed=seed, prompt=prompt, num_inference_steps=4, width=w, height=h)
        img.save(path); mx.clear_cache()
        log[name] = dict(seed=seed, prompt=prompt, model=f'FLUX.2 klein 4B, 8-bit, mflux, 4 steps, {w}x{h}')
        json.dump(log, open(os.path.join(HERE, 'log.json'), 'w'), indent=1)
        print(name, round(time.time() - t, 1), flush=True)
    print('done', flush=True)


if __name__ == '__main__':
    main()
