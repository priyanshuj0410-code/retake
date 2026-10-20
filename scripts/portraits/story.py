"""Which story's cast a run works on: PORTRAIT_STORY=warehouse (the default), newsroom or clinic.

The warehouse keeps the original paths and names: work/, ratings.json, scores.json, check-output.txt and unprefixed
files ({slot}-{sex}-{tone}.webp). Every other story has its own work/stories/<story>/, ratings-<story>.json,
scores-<story>.json and check-output-<story>.txt, and its delivered files carry the story id as a prefix
(<story>-{slot}-{sex}-{tone}.webp). Candidate ids inside a story's work folder are the same shape as the warehouse's
(s1-w-c0), so the per-image code runs unchanged; KEY qualifies them for masks.json, which is shared.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
STORY = os.environ.get("PORTRAIT_STORY", "warehouse")
STORIES = ("warehouse", "newsroom", "clinic")
assert STORY in STORIES, f"PORTRAIT_STORY must be one of {STORIES}"
WAREHOUSE = STORY == "warehouse"
WORK = os.path.join(HERE, "work") if WAREHOUSE else os.path.join(HERE, "work", "stories", STORY)
RATINGS = os.path.join(HERE, "ratings.json" if WAREHOUSE else f"ratings-{STORY}.json")
SCORES = os.path.join(HERE, "scores.json" if WAREHOUSE else f"scores-{STORY}.json")
CHECK_OUT = os.path.join(HERE, "check-output.txt" if WAREHOUSE else f"check-output-{STORY}.txt")
PREFIX = "" if WAREHOUSE else f"{STORY}-"


def key(cid):
    """The masks.json key for a candidate: its id in the warehouse, <story>/<id> elsewhere."""
    return cid if WAREHOUSE else f"{STORY}/{cid}"


def work_dir(story):
    return os.path.join(HERE, "work") if story == "warehouse" else os.path.join(HERE, "work", "stories", story)
