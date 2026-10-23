"""Gives each world its own regulars (owner, 22 Oct 2026: "There are a lot of common names across stories still...
go pan india and be more secular"). The eight who used to appear in every world (Kamla, Pammi, Anita, Meena, Raju,
Arjun, Salim, Vikram) become eight different people in each world, named from across India and across faiths.
Hard facts stay on names that mark no community (the rule in cast.md). Portrait files keep their slot names
(enamel-kamla.webp and so on): each world's regulars keep the faces already drawn for that world.

Run once: python3 design-system/tools/rename_cast.py   (prints any line that still names one of the old eight)
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLOTS = ["Kamla", "Pammi", "Anita", "Meena", "Raju", "Arjun", "Salim", "Vikram"]
HI_SLOTS = {"Kamla": "कमला", "Pammi": "पम्मी", "Anita": "अनीता", "Meena": "मीना",
            "Raju": "राजू", "Arjun": "अर्जुन", "Salim": "सलीम", "Vikram": "विक्रम"}
# slot -> (English, Hindi, where the name comes from; "" = no community marked)
NAMES = {
    "Station": {
        "Kamla": ("Mumtaz", "मुमताज़", "a name common in Muslim families across India"),
        "Pammi": ("Kiran", "किरण", ""),
        "Anita": ("Gurpreet", "गुरप्रीत", "Punjabi, a Sikh name; the station master"),
        "Meena": ("Annamma", "अन्नम्मा", "Malayali, common in Christian families of Kerala"),
        "Raju": ("Sunil", "सुनील", ""),
        "Arjun": ("Prakash", "प्रकाश", ""),
        "Salim": ("Francis", "फ़्रांसिस", "Goan, common in Christian families"),
        "Vikram": ("Rohit", "रोहित", ""),
    },
    "Lugdi": {
        "Kamla": ("Saroj", "सरोज", ""),
        "Pammi": ("Jasleen", "जसलीन", "Punjabi, a Sikh name"),
        "Anita": ("Nirmala", "निर्मला", ""),
        "Meena": ("Kusum", "कुसुम", ""),
        "Raju": ("Dinesh", "दिनेश", ""),
        "Arjun": ("Velu", "वेलु", "Tamil"),
        "Salim": ("Anthony", "एंथनी", "common in Christian families across India"),
        "Vikram": ("Mehul", "मेहुल", "Gujarati; Mehul seth owns the trucks"),
    },
    "Jadugar": {
        "Kamla": ("Sarla", "सरला", ""),
        "Pammi": ("Rabia", "राबिया", "a name common in Muslim families across India"),
        "Anita": ("Mitali", "मिताली", "Bengali"),
        "Meena": ("Pushpa", "पुष्पा", ""),
        "Raju": ("Naresh", "नरेश", ""),
        "Arjun": ("Cyrus", "साइरस", "Parsi"),
        "Salim": ("Kader", "क़ादर", "a name common in Muslim families; the magician"),
        "Vikram": ("Gopal", "गोपाल", ""),
    },
    "Cricket": {
        "Kamla": ("Agnes", "एग्नेस", "Mangalorean, common in Christian families"),
        "Pammi": ("Bindu", "बिंदु", "Malayali"),
        "Anita": ("Gita", "गीता", ""),
        "Meena": ("Shirin", "शीरीं", "Parsi; the coach"),
        "Raju": ("Hari", "हरि", ""),
        "Arjun": ("Kabir", "कबीर", "used in Hindu and Muslim families alike"),
        "Salim": ("Mani", "मणि", "Tamil"),
        "Vikram": ("Tenzing", "तेनज़िंग", "Sikkimese, common in Buddhist families"),
    },
    "Rukavat": {
        "Kamla": ("Shampa", "शम्पा", "Bengali; she married into the house"),
        "Pammi": ("Pooja", "पूजा", ""),
        "Anita": ("Deepa", "दीपा", ""),
        "Meena": ("Dadi", "दादी", ""),
        "Raju": ("Rajan", "राजन", ""),
        "Arjun": ("Kunal", "कुणाल", ""),
        "Salim": ("Mahesh", "महेश", ""),
        "Vikram": ("Vivek", "विवेक", ""),
    },
}
WORLDS = list(NAMES)
PREFIX = {"Station": "enamel", "Lugdi": "pulp", "Jadugar": "jadugar", "Cricket": "cricket-face", "Rukavat": "sunday"}
OLD_RE = re.compile(r"\b(" + "|".join(SLOTS) + r")\b")


def rename(text, world):
    m = NAMES[world]
    text = OLD_RE.sub(lambda x: m[x.group(1)][0], text)
    for slot, hi in HI_SLOTS.items():
        text = re.sub(rf"(?<![ऀ-ॿ]){hi}(?![ऀ-ॿ])", m[slot][1], text)
    return text


def world_of(line, current):
    hit = re.search(r"\b(Station|Lugdi|Jadugar|Cricket|Rukavat)\b", line)
    return hit.group(1) if hit else current


def rename_doc(path, heading_world, generic):
    """Rename line by line: a heading that names a world sets it; inside a world's section every line uses that world;
    outside one, a line that names a world uses it. Generic replacements run first."""
    lines = path.read_text(encoding="utf-8").split("\n")
    out, current, left = [], None, []
    for ln in lines:
        for a, b in generic:
            ln = ln.replace(a, b)
        if ln.startswith("#"):
            current = heading_world(ln)
        named = set(re.findall(r"\b(Station|Lugdi|Jadugar|Cricket|Rukavat)\b", ln))
        has_old = OLD_RE.search(ln) or re.search("|".join(HI_SLOTS.values()), ln)
        w = current or (named.pop() if len(named) == 1 else None)
        if has_old and current and named - {current}:
            w = None   # names another world inside a world's section: left for a hand edit
        if w:
            ln = rename(ln, w)
        if OLD_RE.search(ln) or re.search("|".join(HI_SLOTS.values()), ln):
            left.append(ln)
        out.append(ln)
    path.write_text("\n".join(out), encoding="utf-8")
    return left


def chapter_world(h):
    m = re.search(r"\b(Station|Lugdi|Jadugar|Cricket|Rukavat)\b", h)
    return m.group(1) if m else None


GENERIC = [
    ("two of the eight", "two of the regulars"), ("the eight of every world", "each world's regulars"),
    ("than the eight", "than the regulars"), ("the eight are", "the regulars are"), ("The eight", "The regulars"),
    ("the eight", "the regulars"), ("of the eight", "of the regulars"),
]


def cast_table(path):
    """Replace the eight all-five-worlds rows with each world's own regulars."""
    t = path.read_text(encoding="utf-8")
    rows = []
    for slot in SLOTS:
        m = re.search(rf"^\| {slot} \| [^\n]*\| all five \| ([^|]*)\| ([^|]*)\| ([^|]*)\|$", t, re.M)
        age, look, roles = (x.strip() for x in m.groups())
        role = dict(r.split(": ", 1) for r in roles.split("; ") if ": " in r)
        gender = "woman" if slot in ("Kamla", "Pammi", "Anita", "Meena") else "man"
        for w in WORLDS:
            en, hi, _ = NAMES[w][slot]
            if en == "Dadi":
                continue
            rows.append(f"| {en} | {hi} | {gender} | {w} (regular) | {age} | {look} (drawn: {PREFIX[w]}-{slot.lower()}.webp) "
                        f"| {w}: {rename(role.get(w, ''), w)} |")
        t = t.replace(m.group(0) + "\n", "")
    first_new = re.search(r"^\| Yasmin \|", t, re.M)
    t = t[:first_new.start()] + "\n".join(rows) + "\n" + t[first_new.start():]
    marks = "\n".join(f"- **{NAMES[w][s][0]}:** {NAMES[w][s][2] or 'common everywhere, no community marked'} ({w})."
                      for w in WORLDS for s in SLOTS if NAMES[w][s][0] != "Dadi")
    t = t.replace("**Where the new names come from**",
                  "**Each world's own regulars** (22 Oct 2026: the owner asked for no names shared across stories, "
                  "from across India and across faiths; hard facts stay on names that mark no community):\n\n"
                  + marks + "\n\n**Where the new names come from**", 1)
    path.write_text(t, encoding="utf-8")


def main():
    content = ROOT / "knowledge/content"
    cast_table(content / "cast.md")
    report = {}
    for name in ("first-take.md", "cast.md", "world-voices.md"):
        report[name] = rename_doc(content / name, chapter_world, GENERIC)
    lj = ROOT / "design-system/review/lines.json"
    d = json.loads(lj.read_text(encoding="utf-8"))
    for ln in d["lines"]:
        for k in ("en", "hi", "speaker", "about", "title"):
            if ln.get(k):
                ln[k] = rename(ln[k], ln["world"])
    lj.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    chk = ROOT / "design-system/tools/check_first_take.py"
    c = chk.read_text(encoding="utf-8")
    c = re.sub(r'^SPEAKER = .*$', 'SPEAKER = {"Station": {"Gurpreet"}, "Lugdi": {"Mehul"}, "Jadugar": {"Kader"}, '
               '"Cricket": {"Shirin"}, "Rukavat": {"Dadi"}}', c, count=1, flags=re.M)
    chk.write_text(c, encoding="utf-8")
    for name, left in report.items():
        print(f"{name}: {len(left)} lines still name one of the old eight")
        for ln in left[:40]:
            print("   ", ln[:180])


if __name__ == "__main__":
    main()
