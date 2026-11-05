---
type: playbook
title: The evaluator on the-equal-lens Firebase project
description: How the Equal Lens Evaluator joins the shared Firebase project, the exact registration the owner applies in The Equal Lens repo, how its rules piece is tested, and what this repo never does.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-24/
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-13/
---

# The evaluator on `the-equal-lens`

> **Retake's rating (EVAL-24, 5 Nov 2026).** Retake has one small piece of its own, `firebase/retake.rules.json`, naming only
> `retake-feedback` and `retake-feedback-gate`, registered in The Equal Lens repo's `firebase/apps.json`. `firebase.json` loads it
> for `pnpm rules`, and the deploy guard still refuses a rules deploy from here. It goes live only by the owner's deploy from
> `~/"The Equal Lens"/firebase`. The evaluator's piece below stays in `database.rules.json`, unregistered and unused.
>
> **Going live, in this order, or players' ratings are refused and lost (EVAL-24).**
> 1. Renew the login: `firebase login:add`, choosing priyanshu.jain@theequallens.com (not `login --reauth`, which overwrites the
>    global default).
> 2. Commit only `firebase/retake.rules.json` on top of `retake/main` and push it, with no app code: a push of this branch would
>    ship the app before its rules. The rules build reads each piece from GitHub `main`.
> 3. In The Equal Lens repo, add to `firebase/apps.json`:
>    `{ "name": "Retake", "repo": "priyanshuj0410-code/retake", "dir": "equal-lens-trainer", "rules": "firebase/retake.rules.json", "nodes": ["retake-feedback", "retake-feedback-gate"] }`,
>    make `fetchPiece` in `build-rules.mjs` read `app.dir ?? ` the repo name for `--local` (the checkout is not `~/retake`), and add
>    Retake's row to that playbook's section 2. Not before step 2: the build refuses to run while a registered piece is missing
>    from `main`, for every app.
> 4. The owner deploys: `cd ~/"The Equal Lens"/firebase && firebase deploy --only database --project the-equal-lens`.
> 5. On the real database, send one `entry()` and delete it with curl, and check `pnpm feedback` reads.
> 6. Only then push the app.
>
> **Trainer branch (EVAL-13).** Apart from that rating, the trainer does not use Firebase. `database.rules.json`,
> `firebase.json`, `.firebaserc` and the deploy guard are kept unchanged; the evaluator's
> emulator rules check (`pnpm rules`) was retired with the evaluator's code on this branch, so
> the rules piece is tested only on the evaluator's branch. Nothing here changes rules.

Every Equal Lens app shares one Firebase project, `the-equal-lens`, and one Realtime Database
with one ruleset built from each app's piece (The Equal Lens repo,
`knowledge/playbooks/firebase.md`). This repo follows that pattern, after Spot the
Stereotype's. What the storage can and cannot guarantee is in
[data and privacy](../architecture/data-and-privacy.md).

## 1. What this repo holds and never does

- **The rules piece:** `database.rules.json`, naming only the `eval-` nodes: `eval-config`,
  `eval-schedule`, `eval-explain`, `eval-tokens`, `eval-claims`, `eval-enrol`, `eval-alloc`,
  `eval-codes`, `eval-play`, `eval-xw`, `eval-demo`. No grant at the root.
- **The deploy guard:** `firebase.json` runs `scripts/deploy-guard.sh` before any rules
  deploy, and it always refuses. Deployed from here, this piece alone would replace every
  other app's rules (Spot's, The Keepers').
- **`.firebaserc` points at `demo-eval`**, an emulator-only project, so no command run from this
  folder can reach the live project by default.
- **Never from this repo:** `firebase deploy`, `firebase use the-equal-lens`, or any write to
  the live database. Tests run against the emulator only (`pnpm rules`, `pnpm e2e`).

## 2. The owner's registration step (in The Equal Lens repo, not done here)

Apply these when the owner decides the evaluator goes on the project. Nothing below has been
run.

1. **Register the web app** (from a folder whose `firebase.json` sets the theequallens.com
   account, see The Equal Lens playbook, section 6):

   ```bash
   firebase apps:create web "Equal Lens Evaluator" --project the-equal-lens
   firebase apps:sdkconfig web <the new app id> --project the-equal-lens
   ```

2. **Add the app to `firebase/apps.json`** in The Equal Lens repo, as the last entry of `apps`:

   ```json
   {
     "name": "Equal Lens Evaluator",
     "repo": "priyanshuj0410-code/equal-lens-evaluator",
     "rules": "database.rules.json",
     "nodes": ["eval-config", "eval-schedule", "eval-explain", "eval-tokens", "eval-claims", "eval-enrol", "eval-alloc", "eval-codes", "eval-play", "eval-xw", "eval-demo"]
   }
   ```

   The repo slug assumes the GitHub owner of the other apps; this repo has no remote yet, so
   push it there first (the build reads each piece from its repo's `main`).

3. **Add a row to section 2** of The Equal Lens playbook: app, repo, Realtime Database and
   Anonymous sign-in, the eleven `eval-` nodes, the web app id, status "Registered, not live".

4. **Build and check**, from `~/"The Equal Lens"/firebase`:

   ```bash
   node build-rules.mjs --local
   PATH="/opt/homebrew/opt/openjdk/bin:$PATH" firebase emulators:exec --only database --project demo-equal-lens 'node check.mjs'
   ```

   The build refuses a node two apps claim; no other app uses an `eval-` name today.

5. **Deploy the whole ruleset**, only with the owner's go-ahead and only after
   `pnpm check` passes here:

   ```bash
   cd ~/"The Equal Lens"/firebase && firebase deploy --only database --project the-equal-lens
   ```

6. **Seed the owner-written nodes** with the admin credentials: `eval-config/<dep>`
   (`releaseAt`, `deleteUntil` in ms), `eval-schedule/<firm>`, and `eval-explain/<dep>` from
   `content/explanation.json` (the rules keep it closed until `releaseAt`). Tokens are issued by
   the owner per panel provider batch into `eval-tokens/<token>` as `{dep, langs, s: "issued"}`.

7. **Point the app at the project:** set `VITE_STORE=firebase`, `VITE_FIREBASE_API_KEY` and
   `VITE_FIREBASE_DATABASE_URL` in the hosting variables, and set `"demo": false` in
   `content/config.json`. Not before ethics approval: until then the app runs in demo mode on
   the demo store or the emulator.

## 3. Owner jobs after each deployment closes

- After `deleteUntil`: delete `eval-codes`, rekey every `eval-play/<hash>` to a random key,
  delete `eval-enrol`, `eval-alloc` and any leftover `eval-claims`, log the date and counts only (PO-21).
- Delete the anonymous Auth users the deployment created.
- Export the records for the research team; release results only through
  `src/release/release.ts` (cells of 50 or more).

## 4. Testing the piece

```bash
pnpm rules   # the rules piece in the emulator: tokens, whitelist, refusals, withdrawal, order
pnpm e2e     # a real browser session on the emulator, with a network capture
```

Both need the Firebase CLI and a Java runtime (`/opt/homebrew/opt/openjdk/bin` is put on the
path by the scripts) and run on the `demo-eval` project only.
