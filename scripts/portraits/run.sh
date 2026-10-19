#!/bin/bash
# Runs generation for the given groups, restarting after a crash (the Mac's GPU can time out under memory pressure).
# Usage: scripts/portraits/run.sh cast,mascots oneoffs     (each argument is one generate.py run; skips finished images)
cd "$(dirname "$0")"
PY=~/.local/share/uv/tools/mflux/bin/python
for g in "$@"; do
  for try in 1 2 3 4 5 6; do
    caffeinate -i "$PY" generate.py "$g" >> "work/run-$g.log" 2>&1 && break
    echo "retry $try for $g after a crash" >> "work/run-$g.log"
    sleep 20
  done
done
