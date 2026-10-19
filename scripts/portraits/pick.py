"""Stage 3: choose the most closely matched woman/man pair per slot from the provisional ratings, and the mascots.

  python3 scripts/portraits/pick.py
Distance between a woman and a man candidate = |age difference| / 3 + |attractiveness| + |warmth| + |competence|
differences (age in years, others on 1-7). Rejected candidates (a religious mark, see ratings.json) are skipped. Ties
go to the smaller difference in the linework proxy (analysis.json). A pair is flagged when the distance is 1 or more,
the age gap is 3 years or more, or the linework proxy differs by more than 0.03. One-off tied pairs (focal and
comparison of one group, same sex) are compared the same way and flagged at distance 1 or an age gap of 3 years.
Writes scores.json.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
MASCOTS = {"bear": "c0", "panda": "c1", "frog": "c2", "koala": "c0", "elephant": "c1", "penguin": "c3",
           "rabbit": "c0", "tiger": "c3"}  # chosen by eye for matched framing and detail; reasons in README


def main():
    r = json.load(open(os.path.join(HERE, "ratings.json")))["ratings"]
    an = json.load(open(os.path.join(HERE, "work", "analysis.json")))
    picks, flags, dist = {}, {}, {}
    for s in sorted({k.split("-")[0] for k in r if k.startswith("s")}, key=lambda x: int(x[1:])):
        best = None
        for i in range(3):
            for j in range(3):
                wi, mi = f"{s}-w-c{i}", f"{s}-m-c{j}"
                w, m = r[wi], r[mi]
                if w["note"].startswith("REJECTED") or m["note"].startswith("REJECTED"):
                    continue
                dd = abs(w["age"] - m["age"]) / 3 + sum(abs(w[x] - m[x]) for x in ("attractive", "warmth", "competence"))
                lw = abs(an[wi]["linework"] - an[mi]["linework"])
                if best is None or (dd, lw) < best[:2]:
                    best = (dd, lw, i, j)
        dd, lw, i, j = best
        picks[s] = {"w": f"c{i}", "m": f"c{j}"}
        w, m = r[f"{s}-w-c{i}"], r[f"{s}-m-c{j}"]
        dist[s] = dict(distance=round(dd, 2), age_gap=m["age"] - w["age"], linework_gap=round(an[f"{s}-m-c{j}"]["linework"] - an[f"{s}-w-c{i}"]["linework"], 3))
        why = []
        if dd >= 1:
            why.append(f"distance {dd:.2f}")
        if abs(m["age"] - w["age"]) >= 3:
            why.append(f"man rated {m['age'] - w['age']:+d} years")
        if abs(dist[s]["linework_gap"]) > 0.03:
            why.append(f"linework gap {dist[s]['linework_gap']:+.3f} (man minus woman)")
        if why:
            flags[s] = "FLAG: " + ", ".join(why)
    # one-off tied pairs: focal and comparison of one group, same sex (the game draws one sex for the pair)
    gen = json.load(open(os.path.join(HERE, "work", "generation-log.json")))["images"]
    oneoff_flags = {}
    groups = {}
    for k, j in gen.items():
        if j.get("kind") == "oneoff" and j["role"] in ("focal", "comparison"):
            groups.setdefault((j["group"], j["sex"]), {})[j["role"]] = k
    for (g, sex), pr in sorted(groups.items()):
        f, c = r[pr["focal"]], r[pr["comparison"]]
        dd = abs(f["age"] - c["age"]) / 3 + sum(abs(f[x] - c[x]) for x in ("attractive", "warmth", "competence"))
        if dd >= 1 or abs(f["age"] - c["age"]) >= 3:
            oneoff_flags[f"{pr['focal']} vs {pr['comparison']}"] = (
                f"FLAG: distance {dd:.2f}, comparison minus focal: age {c['age'] - f['age']:+d}, "
                f"attractive {c['attractive'] - f['attractive']:+d}, warmth {c['warmth'] - f['warmth']:+d}, "
                f"competence {c['competence'] - f['competence']:+d}")
    oneoffs = sorted([k for k in an if k.startswith("o")], key=lambda k: (int(k[1:].split("-")[0]), k.split("-")[1] != "w"))
    json.dump(dict(_note="Picks from pick.py on the PROVISIONAL ratings in ratings.json; re-run after P1 re-rates.",
                   picks=dict(cast=picks, mascots=MASCOTS, oneoffs=oneoffs),
                   pair_distance=dist, flags=flags, oneoff_pair_flags=oneoff_flags, scores=r), open(os.path.join(HERE, "scores.json"), "w"), indent=1)
    for s in picks:
        print(s, picks[s], dist[s], flags.get(s, ""))
    print(f"one-off tied pairs flagged: {len(oneoff_flags)} of {len(groups)}")
    for k, v in oneoff_flags.items():
        print(" ", k, v)


if __name__ == "__main__":
    main()
