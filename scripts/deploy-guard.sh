#!/bin/bash
# Runs before any rules deploy from this repo (firebase.json, predeploy), and always refuses.
# The evaluator's rules are one piece of the shared ruleset of the-equal-lens's one database,
# which every Equal Lens app uses and only The Equal Lens repo's firebase/ folder builds and
# deploys (knowledge/playbooks/firebase.md). Deployed from here, this piece alone would
# replace every other app's rules.
echo "deploy-guard: deploy rules from The Equal Lens repo's firebase/ folder, not from here (EVAL-1)" >&2
exit 1
