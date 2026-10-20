#!/bin/bash
# Runs generation for the given groups, restarting after a crash (the Mac's GPU can time out under memory pressure).
# Usage: scripts/portraits/run.sh cast,mascots oneoffs     (each argument is one generate.py run; skips finished images)
#        PORTRAIT_STORY=newsroom scripts/portraits/run.sh cast   (another story's cast, into work/stories/newsroom/)
cd "$(dirname "$0")"
LOGDIR=work
[ -n "$PORTRAIT_STORY" ] && [ "$PORTRAIT_STORY" != warehouse ] && LOGDIR="work/stories/$PORTRAIT_STORY"
mkdir -p "$LOGDIR"
PY=~/.local/share/uv/tools/mflux/bin/python
for g in "$@"; do
  for try in 1 2 3 4 5 6; do
    caffeinate -i "$PY" generate.py "$g" >> "$LOGDIR/run-$g.log" 2>&1 && break
    echo "retry $try for $g after a crash" >> "$LOGDIR/run-$g.log"
    sleep 20
  done
done
