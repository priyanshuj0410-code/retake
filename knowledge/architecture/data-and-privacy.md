---
type: architecture
title: Data and privacy on the shared Firebase project
description: How the evaluator stores records on the-equal-lens's Realtime Database, which of the registered storage protections the app enforces, and what Firebase cannot guarantee for the unlinked-record and mixing-pool design, stated plainly with what the app does about each.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-1/
  - https://app.plane.so/the-equal-lens/browse/EVAL-4/
  - https://app.plane.so/the-equal-lens/browse/EVAL-5/
  - https://app.plane.so/the-equal-lens/browse/EVAL-12/
---

# Data and privacy on the shared Firebase project

The registered design (candidates v12 3.0, 3.1, 3.8, 3.9; research plan v1, section 9) asks for
person-level records under a withdrawal code, unlinked crosswise and demographic records
held apart under separately keyed transforms by a named data custodian, a separately
administered mixing pool with no access log and no IP address, and no write time or arrival
order anywhere. The owner chose to store on the shared Firebase project `the-equal-lens`
(Realtime Database, Spark plan, Singapore). This page says what that choice can and cannot
carry. Nothing here has run with a participant: there are none before ethics approval.

## 1. The nodes

All under the one database, all prefixed `eval-`, held by `database.rules.json`
([firebase playbook](../playbooks/firebase.md)):

| Node | What | Who writes | Who reads |
|---|---|---|---|
| `eval-config/<dep>` | `releaseAt`, `deleteUntil` per deployment | owner | anyone |
| `eval-schedule/<firm>` | a firm's published training schedule | owner | anyone |
| `eval-explain/<dep>` | the scoring explanation | owner | signed-in devices, only after `releaseAt` |
| `eval-tokens/<token>` | `{dep, langs, s}`: issued, started, done | owner issues; a device moves `s` once each way | the device holding the token |
| `eval-claims/<uid>` | the device's open session: `{tok}` or `{enrol}` | the device, in the write that spends the token | nobody |
| `eval-alloc/<firm>/<month>` | a firm-month block's remaining arms (blocked randomisation), or nothing | the enrolling device, in the enrolment's write | signed-in devices |
| `eval-enrol/<hash>` | firm enrolment: batch, training date, timing arm, window, batch-month, sex label, state | the enrolling device, once | the holder of the enrolment code |
| `eval-codes/<hash>` | the deployment, so the explanation page recognises a code | the device, at submit | the holder of the code |
| `eval-play/<hash>` | the person-level record: cards, survey, screening, Inbox, ordinary decisions, wrap | the device, once, at submit | nobody through the rules |
| `eval-xw/<hash>` | one crosswise answer: item, answer, subsample, label | the device, once, at submit | nobody through the rules |
| `eval-demo/<hash>` | one optional demographic answer: item, answer | the device, once, at submit | nobody through the rules |
| `eval-profile/<hash>` | the optional pseudonymous season profile (EVAL-4): `{iv, ct}`, AES-GCM ciphertext encrypted on the device under a key derived from the player's recovery code; holds the display name, each saved season's band and numbers, day and withdrawal code | the code holder, any time | the code holder (the key is a 128-bit secret; nobody can list profiles) |
| `eval-long/<hash>` | the longitudinal research link of a profile that opted in: `{plays}`, the play keys of its saved seasons (consent PENDING v18) | the code holder; opting out deletes it | nobody through the rules |
| `eval-contact/<random>` | optional stay-in-touch details after a season result, or a profile's email for follow-ups (EVAL-12): `{nm?, em?, follow, research}`, linked to no record, code or profile on the server (a profile keeps only the key, inside its ciphertext) | whoever holds the key: written, replaced and deleted (since EVAL-12; was create-once) | nobody through the rules |

The season story's records use `eval-play` like the card games, with `dep` `season`. A
profile's `<hash>` is derived from its recovery code (PBKDF2, then HMAC: `src/story/profile.ts`),
never from the withdrawal code. The contact node is new personal data (a name and an email):
it needs a DPDP basis, a retention period and a deletion route before any participant, which
this prototype does not yet have.

Each `<hash>` is derived from the player's withdrawal code (PBKDF2 then HMAC, a different
label per store and per record: `src/engine/codes.ts`). The code is shown once and stored
nowhere. The research team reads records with the project's admin credentials, only after
every code is destroyed.

## 2. What the app enforces

- **No write time, no arrival order, no session id.** Nothing is written while a player plays.
  The session writes twice: the token spent at the start, and every record in one write at
  submit (`pnpm e2e` captures the browser's network frames and finds exactly these two). No
  record has a time field: the rules hold every record to a field whitelist and refuse any
  other field (`pnpm rules`). Record keys are random or derived from the code, so their sorted
  order carries no insertion order (`pnpm rules`, AT-9). The `n` on a card record is the
  card's position in that player's own season (the plan reads W by card position, PF-15),
  not an order across players.
- **One-time tokens.** A token goes issued, started, done, once each, in writes the rules
  check together with the device's claim; a replay and a second submission are refused (1000
  of each in `pnpm rules`). The token is never written into a record.
- **Unlinked records.** Crosswise and demographic records carry only their item, answer,
  subsample and label (and the deployment). Each sits at its own key derived from the code,
  not under a per-person node, so one player's crosswise answers are scattered among
  everyone's. No field of the person-level record appears in them.
- **Withdrawal.** Entering the code derives every key and deletes the records in all three
  stores in one write, until the deployment's `deleteUntil` (two weeks after `releaseAt`);
  the rules refuse it after that date.
- **The explanation's release.** The explanation is not in the app's bundle (`pnpm check`
  builds the app and looks for it); it is served from `eval-explain`, which the rules open at
  `releaseAt`.
- **M3's label.** The device computes the conduct-half label at submit from the in-memory
  card answers, attaches it to the crosswise records only, and keeps nothing; the browser's
  storage is inspected after a session (`pnpm e2e`).
- **The sex label (firm).** Asked at enrolment, held on the enrolment record, and copied onto
  the play record with the timing arm and batch-month only; the enrolment code and training
  date are never copied.

## 3. What Firebase cannot guarantee, and what the app does

| Registered requirement | What Firebase cannot do | What the app does | Residual for the ethics review |
|---|---|---|---|
| No write time or arrival order anywhere | Google keeps request logs on its side (time, IP, user agent, path) under its own retention; Cloud Audit Logs and usage metrics exist for the project; the Realtime Database itself is not configurable to drop them | Records carry none; the session writes once at the end, so a log shows one submit time per player, not per answer; keys reveal no order | **Provider-side logs link a submit time and an IP to the record paths written.** Anyone with Google Cloud log access on the project could tie a submission's keys to a time and an IP. Named, not removable on this stack. |
| A mixing pool run as a separate relay, administered by a custodian other than the person-level store's, with no access log and no IP address (predecessor build checks 2 to 4) | One project, one owner, one set of admin credentials: there is no split custody; the provider logs above apply to `eval-xw` as much as to `eval-play`; there is no server to queue and release blocks of 50 | Crosswise records are scattered at code-derived keys with no person grouping; release in cells of 50 is applied by `src/release/release.ts` at analysis | **The mixing pool is not built.** A crosswise write and the person-level write arrive in the same request from the same device: the provider's logs, or anyone who could observe the request, link them. The registered pool needs a separate relay (a Cloud Function on a second project with its own custodian, which needs the Blaze plan, or an external relay). |
| Separately keyed transforms, keys held by a named custodian | No server-side secret on the Spark plan: any key in the app ships to every phone | The transform is a slow hash (PBKDF2, 120,000 rounds) of a 59-bit random code, separate per store and per record; linking stores needs the code, which only the player holds | Without the code, the stores cannot be joined from their contents; with it, they can, by design (withdrawal needs it). No custodian holds a key. |
| Blind-signed release tokens (build check 6) | Not possible without a signer service | Not built | A flooding attack on a crosswise cell is possible by anyone who can open sessions. |
| The cell-open pre-check (build check 9) | Needs a pool with cell state | Not built | Crosswise answers are accepted until the study's own stopping rule. |
| Firm play windows blocked by firm and month | No server to hold the allocation | Permuted blocks of random size (2 or 4, drawn per block) within each firm and training month: `eval-alloc/<firm>/<month>` holds only the block's remaining arms (for example `after,before,before`), with no identity, token, count or time; the rules accept an enrolment only with the next arm the block allows, in the same write that shortens the pending state, so the arms are equal at every block's completion (`src/engine/firm.ts`; checked in `pnpm check` and `pnpm rules`) | Each block is drawn on the device, so a tampered device could choose its own block; a signed-in device could shorten or clear a pending state on its own, upsetting balance. Anyone who can read a block's pending state (any signed-in device that knows the firm and month) can see the coming arms: the state is readable because the device must read it to enrol. Concealment against colleagues comparing windows is at the permuted-block rate (random sizes 2 and 4), not complete. |
| No identity in the tool (rule 6) | Anonymous sign-in creates a Firebase Auth user per device (a uid, its creation time, and the provider's logs) | The uid is used only to hold the claim; no record carries it; the claim is deleted at submit | Firebase Auth holds an anonymous user record per device until deleted. An owner job should delete anonymous users after each deployment closes. |
| Hold records until codes are destroyed, then pass crosswise and demographic records to the pool | No scheduled jobs on Spark | `deleteUntil` closes withdrawal in the rules; destroying codes is an owner step: delete `eval-codes`, rekey `eval-play` to random keys, then hand the data to the research team | A manual step, logged by date and count (PO-21), not yet scripted. |
| A record is held to a size | The rules bound field lengths, not the number of records one claim writes | One submit per claim | A device with an open claim could write extra records in its one submit write. |
| The shared free plan's limits | 100 simultaneous connections shared by every Equal Lens app | A session holds a connection only while it starts and submits | A large panel fielding at once could meet the limit (the playbook's Blaze note). |

## 4. What this means

On this stack the app can make the stored data itself carry no time, no order and no
identity, keep the stores unjoinable without the player's code, spend tokens once, delete
on withdrawal and hold the explanation until release. It cannot give the registered mixing
pool, split custody or a keyed transform held by a custodian, and it cannot stop the
provider's own logs from recording when and from where each submission came. Before any
crosswise datum (the predecessor plan's build checks 1 to 9 are a precondition), the crosswise
store needs to move to a separately administered relay; the residuals above go to the ethics
review as named limitations.
