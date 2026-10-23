"""Checks a First take set (knowledge/content/first-take.md, or one chapter draft) against its build rules.

Usage: python3 design-system/tools/check_first_take.py <file.md> [--cast knowledge/content/cast.md] [--chapter]
  --chapter  checks one chapter draft: skips the five-chapter and whole-set counts.
Exit code 0 when clean, 1 when any problem is found.

Rules checked, from first-take.md "How every decision is built" and the owner's answers of 22 Oct 2026 (O16):
- 3 to 5 people a decision; the world's speaker is never a card; the question is at most 10 words; no banned words.
- The hidden pair is one woman and one man with exactly the same numbers, and no second woman-and-man tie.
- One person shows the same number for the same label everywhere in a chapter.
- Each chapter has 4 twins; each twin's nudge is on the woman in one half and on the man in the other;
  at least one twin is a detail that matters and at least one is a hard topic (Kind column).
- No hidden pair is used twice anywhere in the set (a batting order's two stages share their pair).
- No em or en dashes.
Added after the critic's review of 22 Oct 2026 (EVAL-18):
- Rukavat's speaker is Dadi, drawn with Meena's portrait, so neither Dadi nor Meena is a Rukavat card.
- The two halves of a twin share no person, not only no pair.
- The banned words are looked for on every screen string: the decisions, the title cards and the result cards.
- A hard twin's nudge is never on a name that cast.md's "Where the new names come from" marks by community.
- Each new person (cast.md, one world only) appears only in their own world, is on at least 2 cards outside the
  hidden pair, and is in the pair no more often than the regulars, as a share of the cards they appear on.
Added after the critic's second-round review of 22 Oct 2026 (EVAL-18):
- No name marked by community is named anywhere in a hard twin's Voice line, so a hard fact said of two people
  (a couple separating) is caught, not only one said of the nudge holder.
- The share rule holds in every world; the Jadugar and Cricket exemption is gone.
- Each chapter prints how many of its hidden pairs have no new face (a note, not a problem).
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORLDS = ("Station", "Lugdi", "Jadugar", "Cricket", "Rukavat")
SPEAKER = {"Station": {"Gurpreet"}, "Lugdi": {"Mehul"}, "Jadugar": {"Kader"}, "Cricket": {"Shirin"}, "Rukavat": {"Dadi"}}
BANNED = ("test", "bias", "attitude")


def cells(line):
    return [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", line.strip().strip("|"))]


def load_cast(path):
    """Women, men, the new people with their one world, and the new names marked by community."""
    women, men = {"Kamla", "Pammi", "Anita", "Meena"}, {"Raju", "Arjun", "Salim", "Vikram"}
    new, marked = {}, set()
    if path.exists():
        lines = path.read_text(encoding="utf-8").splitlines()
        for ln in lines:
            if not ln.startswith("|"):
                continue
            c = cells(ln)
            if len(c) >= 3 and c[2].lower() in ("woman", "man") and re.fullmatch(r"[A-Z][a-z]+", c[0]):
                (women if c[2].lower() == "woman" else men).add(c[0])
                if len(c) >= 4 and c[3] in WORLDS:
                    new[c[0]] = c[3]
        for start in (i for i, ln in enumerate(lines)
                      if ln.startswith(("**Where the new names come from**", "**Each world's own regulars**"))):
            for ln in lines[start + 1:]:
                if ln.startswith(("**", "#")):
                    break
                m = re.match(r"- \*\*(.+?):\*\*(.*)", ln)
                if m and not re.search(r"no community marked|common everywhere", m.group(2)):
                    marked.update(n.strip() for n in m.group(1).split(" and "))
    return women, men, new, marked


def tables(block):
    """Markdown tables in a block, each as a list of rows of cells (header first, separator dropped)."""
    out, cur = [], []
    for ln in block.splitlines():
        if ln.startswith("|"):
            cur.append(ln)
        elif cur:
            out.append(cur)
            cur = []
    if cur:
        out.append(cur)
    return [[cells(r) for r in t if not re.fullmatch(r"\|[\s:|-]+\|?", r.strip())] for t in out]


def main():
    args = sys.argv[1:]
    path = Path(args[0])
    cast = Path(args[args.index("--cast") + 1]) if "--cast" in args else ROOT / "knowledge/content/cast.md"
    one_chapter = "--chapter" in args
    women, men, new, marked = load_cast(cast)
    text = path.read_text(encoding="utf-8")
    problems, notes = [], []
    for ch in ("—", "–"):
        if ch in text:
            problems.append(f"dash {ch!r} found {text.count(ch)} times")

    chapters = re.split(r"^## Chapter \d: ", text, flags=re.M)[1:]
    if not one_chapter and len(chapters) != 5:
        problems.append(f"{len(chapters)} chapters, expected 5")
    if one_chapter and not chapters:
        chapters = [text]

    used_pairs = defaultdict(list)
    n_dec = 0
    for chap in chapters:
        head, *decs = re.split(r"^### ", chap, flags=re.M)
        decisions = {}
        sheet = defaultdict(dict)
        for d in decs:
            m = re.match(r"(" + "|".join(WORLDS) + r") (\d+)\. ", d)
            if not m:
                continue
            world, num = m.group(1), int(m.group(2))
            tag = f"{world} {num}"
            n_dec += 1
            q = re.search(r"\*\*Question:\*\* (.+?) \| (.+)", d)
            if not q:
                problems.append(f"{tag}: no Question line with English | Hindi")
                continue
            en_words = re.findall(r"[A-Za-z][A-Za-z'\-]*", q.group(1))
            if len(en_words) > 10:
                problems.append(f"{tag}: question has {len(en_words)} words (max 10)")
            for bad in BANNED:
                if re.search(rf"\b{bad}\b", d, flags=re.I):
                    problems.append(f"{tag}: banned word {bad!r}")
            people_tables = [t for t in tables(d) if t and t[0][0].lower().startswith("person")]
            if not people_tables:
                problems.append(f"{tag}: no people table")
                continue
            t = people_tables[0]
            stat_cols = []
            for i, h in enumerate(t[0][1:], 1):
                if h.startswith("Line") or h.startswith("Account"):
                    break
                stat_cols.append((i, h.split(" (")[0]))
            people = {}
            for r in t[1:]:
                name = r[0].split(" (")[0]
                people[name] = tuple(r[i] for i, _ in stat_cols)
                for (i, lab), v in zip(stat_cols, people[name]):
                    prev = sheet[lab].get(name)
                    if prev is not None and prev != v:
                        problems.append(f"{tag}: {name} has {lab} {v}, elsewhere in the chapter {prev}")
                    sheet[lab][name] = v
                if name not in women and name not in men:
                    problems.append(f"{tag}: {name} is not in the cast")
            if not 3 <= len(people) <= 5:
                problems.append(f"{tag}: {len(people)} people (3 to 5)")
            for sp in SPEAKER[world] & set(people):
                problems.append(f"{tag}: the speaker {sp} is a card")
            for p in people:
                if p in new and new[p] != world:
                    problems.append(f"{tag}: {p} is new in {new[p]} and must not be a card in {world}")
            hp = re.search(r"\*\*Hidden pair:\*\* (\w+) and (\w+)", d)
            if not hp:
                problems.append(f"{tag}: no Hidden pair line")
                continue
            a, b = hp.group(1), hp.group(2)
            if a not in people or b not in people:
                problems.append(f"{tag}: hidden pair {a}, {b} not both on the cards")
                continue
            if not ({a, b} & women and {a, b} & men):
                problems.append(f"{tag}: hidden pair {a}, {b} is not a woman and a man")
            if people[a] != people[b]:
                problems.append(f"{tag}: hidden pair numbers differ {people[a]} {people[b]}")
            for x in people:
                for y in people:
                    if x in women and y in men and {x, y} != {a, b} and people[x] == people[y]:
                        problems.append(f"{tag}: a second woman-and-man tie, {x} and {y}")
            woman, man = (a, b) if a in women else (b, a)
            v = re.search(r"\*\*Voice:\*\* [^:\"]*:? ?(.+)", d)
            voiced = {p for p in women | men if v and re.search(rf"\b{p}\b", v.group(1))}
            decisions[num] = dict(world=world, pair=frozenset((a, b)), woman=woman, man=man, people=set(people),
                                  voiced=voiced)
            used_pairs[frozenset((a, b))].append(tag)

        world = next(iter(decisions.values()))["world"] if decisions else "?"
        for ln in head.splitlines():
            if ln.startswith(("**Title card:**", "**Line under the area")):
                for bad in BANNED:
                    if re.search(rf"\b{bad}\b", ln, flags=re.I):
                        problems.append(f"{world} title card: banned word {bad!r}")

        cards, in_pair = defaultdict(int), defaultdict(int)
        for d in decisions.values():
            for p in d["people"]:
                cards[p] += 1
            for p in d["pair"]:
                in_pair[p] += 1
        regulars = [p for p in cards if p not in new]
        reg_cards = sum(cards[p] for p in regulars)
        reg_pair = sum(in_pair[p] for p in regulars)
        for p in sorted(p for p in cards if new.get(p) == world):
            if cards[p] - in_pair[p] < 2:
                problems.append(f"{world}: {p} is on {cards[p] - in_pair[p]} cards outside the hidden pair (at least 2)")
            if reg_cards and in_pair[p] * reg_cards > reg_pair * cards[p]:
                problems.append(f"{world}: {p} is in the hidden pair on {in_pair[p]} of {cards[p]} cards, "
                                f"more often than the regulars ({reg_pair} of {reg_cards})")
        no_new = sorted(n for n, d in decisions.items() if not d["pair"] & set(new))
        notes.append(f"{world}: {len(no_new)} of {len(decisions)} hidden pairs have no new face"
                     + (f" ({', '.join(f'{world} {n}' for n in no_new)})" if no_new else ""))
        twin_tables = [t for t in tables(head) if t and t[0][0] == "Twin"]
        if not twin_tables:
            problems.append(f"{world}: no twin table")
            continue
        tt = twin_tables[0]
        hdr = [h.lower() for h in tt[0]]
        try:
            ci_kind = hdr.index("kind")
        except ValueError:
            ci_kind = None
            problems.append(f"{world}: the twin table has no Kind column (matters, hard or plain)")
        ci_w = next(i for i, h in enumerate(hdr) if "woman" in h)
        ci_m = next(i for i, h in enumerate(hdr) if h.startswith("nudge on the man"))
        kinds = []
        for r in tt[1:]:
            nums = [int(x) for x in re.findall(r"\d+", r[0])[:2]]
            if len(nums) != 2 or any(n not in decisions for n in nums):
                problems.append(f"{world}: twin {r[0]} names a decision that is not in the chapter")
                continue
            wn = [int(x) for x in re.findall(r"\d+", r[ci_w])]
            mn = [int(x) for x in re.findall(r"\d+", r[ci_m])]
            if len(wn) != 1 or len(mn) != 1 or {wn[0], mn[0]} != set(nums):
                problems.append(f"{world}: twin {r[0]} must put the nudge on the woman in one half and the man in the other")
            if ci_kind is not None:
                kinds.append(r[ci_kind].lower())
            if decisions[nums[0]]["pair"] == decisions[nums[1]]["pair"]:
                problems.append(f"{world}: twin {r[0]} uses the same pair in both halves")
            elif decisions[nums[0]]["pair"] & decisions[nums[1]]["pair"]:
                shared = ", ".join(sorted(decisions[nums[0]]["pair"] & decisions[nums[1]]["pair"]))
                problems.append(f"{world}: the two halves of twin {r[0]} share {shared}")
            if ci_kind is not None and r[ci_kind].lower().startswith("hard") and len(wn) == 1 and len(mn) == 1:
                for n, side in ((wn[0], "woman"), (mn[0], "man")):
                    if n not in decisions:
                        continue
                    for who in sorted(({decisions[n][side]} | decisions[n]["voiced"]) & marked):
                        problems.append(f"{world} {n}: the hard fact is said of {who}, a name chosen to mark a community")
        if len(tt) - 1 != 4:
            problems.append(f"{world}: {len(tt) - 1} twins, expected 4")
        if ci_kind is not None:
            if not any(k.startswith("matters") for k in kinds):
                problems.append(f"{world}: no twin of Kind 'matters'")
            if not any(k.startswith("hard") for k in kinds):
                problems.append(f"{world}: no twin of Kind 'hard'")
        if len(decisions) != 8:
            problems.append(f"{world}: {len(decisions)} decisions, expected 8")

    for pair, tags in used_pairs.items():
        if len(tags) > 1:
            worlds = {t.split()[0] for t in tags}
            nums = sorted(int(t.split()[1]) for t in tags)
            batting = worlds == {"Cricket"} and nums in ([1, 2], [5, 6])
            if not batting:
                problems.append(f"pair {' and '.join(sorted(pair))} used {len(tags)} times: {', '.join(tags)}")
    if not one_chapter and n_dec != 40:
        problems.append(f"{n_dec} decisions, expected 40")
    results = re.search(r"^## The results.*?(?=^## |\Z)", text, flags=re.M | re.S)
    if results:
        for bad in BANNED:
            if re.search(rf"\b{bad}\b", results.group(0), flags=re.I):
                problems.append(f"result cards: banned word {bad!r}")

    print(f"{n_dec} decisions, {len(used_pairs)} distinct pairs, cast {len(women)} women and {len(men)} men")
    for note in notes:
        print(note)
    print("PROBLEMS" if problems else "OK", *problems, sep="\n")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
