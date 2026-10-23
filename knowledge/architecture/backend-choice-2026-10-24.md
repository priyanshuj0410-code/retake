---
type: decision
title: "Backend choice: Supabase Pro in Mumbai behind a same-origin Vercel proxy, with Amazon SES Mumbai (24 Oct 2026)"
description: The evaluation the owner asked for ("evaluate firebase vs neon vs supabase... use the best") of the server for the Board, friends, moving phones and reminders (M4), against fifteen requirements drawn from the feature set and PRODUCT.md. Ten agents: a researcher per platform with current sources, an independent fact-checker per dossier, three judges (privacy and India, engineering, cost and risk), and a synthesis. The pick, how the judges' split was resolved, the architecture, costs, week-one go/no-go checks and the questions for the lawyer.
plane_issues:
  - https://app.plane.so/the-equal-lens/browse/EVAL-18/
---

> **How this was made.** Workflow run `wf_19e783c3-ace`, 24 Oct 2026. Judges' scores (privacy / engineering / cost): Firebase 8 / 4 / 5, Neon 6 / 6.5 / 6, Supabase 4.5 / 8 / 7.5. The fact-checkers found 8 to 9 claims wrong or outdated in each dossier; the corrections are applied below and listed near the end. Prices and dates are as the sources stated in October 2026; check them again before signing up.

# Backend choice: Supabase Pro in Mumbai, behind a same-origin proxy on Vercel (Mumbai), with Amazon SES Mumbai for code emails

## The decision

Retake's server will be one Supabase Pro project in South Asia (Mumbai, ap-south-1). Amazon SES in ap-south-1 sends the code emails. Every call from a phone goes through a thin proxy: Vercel Functions on the app's own domain, pinned to bom1 (Mumbai). Supabase provides the 6-digit, 10-minute, link-free email code as a managed service. It also gives plain SQL for the boards, friends and score checks, a scheduler inside the database for reminders and deletion, a hard spend cap, and a stack that is open source and portable. The proxy is part of the design, not an extra. Without it, Supabase's own logs would keep each player's IP address, approximate location and a TLS fingerprint in the EU, with no setting to turn that off, which breaks R2 and F-116 ("Nowhere: ... device fingerprints or location"). The 2026 Indian block of supabase.co would also cut sign-in and the Board. Expected cost before 18% GST, Vercel Pro included: about $25-45 a month for a public alpha, about $45 at 10k players and about $57-112 at 100k. Neon is the fallback if Supabase fails the week-1 checks below.

## How the three compare

Verdicts use the fact-checked fit, with corrections applied. All prices are USD a month before 18% GST.

| Req | Firebase (Firestore Mumbai + Functions + Scheduler, no Firebase Auth) | Neon (Singapore + Better Auth on Vercel + Neon Functions) | Supabase (as chosen: Mumbai, behind the Vercel proxy) |
|---|---|---|---|
| R1 Auth | With work. The SDK (13.1.0) has no email-code sign-in, so the team writes the code, sessions and limits. Firebase Auth is avoided because it is US-only and keeps IPs for weeks [45][46] | With work. Self-hosted Better Auth emailOTP (6 digits, 600 s, hashed). Neon's managed auth fails on iPhone because of its third-party cookie [63][64] | Mostly native. otp_length 6, otp_expiry 600, code-only templates, SES as the required SMTP, signOut "others" plus a session check [4][6][8] |
| R2 Server data | With work. All allowed fields fit, and IPs are kept only as a salted hash | With work (corrected from native). Neon sees only Vercel's IPs, but Better Auth's limiter stores raw IP and path, and preview branches copy production data [64][67] | Poor if phones call Supabase directly: logs hold IP, city, postcode, latitude/longitude, ASN and a JA3 fingerprint, in the EU, with no off switch [10][11]. With work behind the proxy |
| R3 Boards | With work. No rank primitive: 10-shard histograms plus a daily reconciliation job [53] | Native. SQL rank() and count | Native. SQL rank() and count in one RPC |
| R4 Friends | With work. Prefix search on normalised keys | Native. pg_trgm | Native. pg_trgm (test on Devanagari) |
| R5 Authorisation and abuse | With work. Rules deny all clients, and every check and limit is hand-written | With work (3 days, corrected). Better Auth's disableIpTracking turns off every built-in limit [64] | Native. RLS, SECURITY DEFINER RPCs and constraints. EXECUTE must be revoked from PUBLIC [17]. The proxy adds email and IP-hash limits |
| R6 Reminders | With work. Cloud Scheduler every 15 minutes in Mumbai; the 60 s timeout must be raised | With work. Neon Function Triggers, GA only since 18 Sep 2026, call a public URL with no credentials [62] | With work. pg_cron plus pg_net (raise the 2 s default timeout) call a Vercel Node sender using web-push [16][40] |
| R7 Deletion | With work. Batched deletes plus histogram decrements; 7 days of backup/PITR residue | With work. Cascades work, but backups are kept 30 days and preview branches can keep copies up to 6 months [67][68] | Native. deleteUser cascades; 7 days of residue in daily backups [18][21] |
| R8 India and DPDP | Best. Everything in asia-south1, and request logs can be excluded or held in a Mumbai bucket. DPA says "without undue delay" [50][51] | Weakest. Singapore only, the Databricks DPA is unreviewed, and access logs go to Logz.io [60][65][68] | With work. Database, Auth and backups in Mumbai. Logs are in the EU with no stated retention. DPA: 48 h "where feasible" [11][12] |
| R9 Weak networks, light phones | With work. No SDK (2-4 KB). Cold starts of 1-3 s unless a warm instance (about $11) is paid for | Native. Adds 0 KB and stays same-origin, but Singapore adds about 50-60 ms per round trip [69] | With work. About 3 KB of fetch code, same-origin, Mumbai. The full SDK would add 58 KB gzip [28] |
| R10 Engineering fit | With work. No Marketplace listing, no migrations, emulators need Java 21 | With work (corrected). Native on the Marketplace with Drizzle, but previews copy production personal data | Native. Migrations, config and email templates in git; Docker local stack; pgTAP; generated types |
| R11 Ops | With work (corrected). 99.99% SLO, but no hard spend cap and the region must be pinned in code | Native on the Launch plan. No SLA below Scale; Free suspends the database when its quota runs out | Native. Pro never pauses, has a hard spend cap and daily backups. No SLA below Enterprise; the 2026 India block is mitigated by the proxy |
| R12 Cost | Cheapest up to 10k | Highest through 10k | In between; flat and predictable |
| R13 Lock-in and longevity | Poor. Proprietary, no self-host, an exit takes 5-8 days | With work (corrected). Postgres, but the self-host engine has been stale since Jul 2025, and Databricks can change terms on its own | Native. Postgres, the whole stack is open source, and the vendor is well funded [25] |
| R14 Research | With work. Analysis runs on a BigQuery copy, not live data | Native. Free separate project, live SQL | With work. A separate org in Mumbai at $25 on Pro (corrected), live SQL |
| R15 Existing assets | Partial reuse: the Google account, billing, DPA and emulator habits, but not the-equal-lens itself | Nothing reused | Nothing reused |
| Judges (privacy / engineering / cost) | 8 / 4 / 5 | 6 / 6.5 / 6 | 4.5 / 8 / 7.5 |
| Build effort, R1-R15 | About 31 days (dossier 28) | About 28-29 days (dossier 25.25) | About 28-29 days with the proxy (26 if phones called Supabase directly; dossier 25) |
| Cost, alpha (100-1,000) | About $0, plus Vercel $0 or $20 | $0-40 | $0 for a closed alpha; $25-45 for a public one |
| Cost, 10k players | About $4.5, plus about $11 for a warm instance, plus Vercel $0 or $20 | About $45 (Vercel Pro included) | About $45 (Vercel Pro included) |
| Cost, 100k players | About $85-110, plus Vercel | About $80-122 (Vercel Pro included) | About $57-112 (Vercel Pro included) |

Where the effort figures come from. R1-R11: the engineering judge's corrected figures (Firebase 27-28, Neon 26-27, Supabase 24). R12-R15: the dossiers. The proxy adds 2-3 days, the same estimate both the engineering and cost judges gave.

## Why Supabase

1. **The team writes the least security-critical code (R1, R5).** GoTrue, Supabase's auth server, handles generating and checking the 6-digit code, the 600 s expiry, attempt limits, refresh-token rotation, the per-user resend interval (60 s by default) and a project-wide emails-per-hour cap [4][7]. The proxy only holds pass-through routes and counters. Firebase would need all of this hand-written with no managed service behind it [45]. Neon would run a library inside our functions whose planned settings silently turn off every built-in rate limit [64].
2. **Boards, friends and checks are plain SQL (R3, R4, R5, R14).** rank() and "count of higher scores, plus 1" give shared places; keyset queries give the five rows around the player; pg_trgm handles name search; primary keys and CHECK constraints enforce one score per level per day and a plausible range. There are no histogram shards to drift, which was the Firebase design's correctness risk [53]. Researchers query live data with SQL, not a daily BigQuery copy.
3. **Player data sits in India (R8).** The database, Auth and backups stay in ap-south-1 [11][15]. Neon has no India region at all [60].
4. **The scheduler is inside the database (R6, R7, F-96c).** pg_cron can run every second, and pg_net makes the HTTP calls [16]. No Vercel Cron is needed (Hobby runs once a day, ±59 min [30]), and nothing depends on Neon Functions, GA since 18 Sep 2026 [62].
5. **Money and uptime safety for a two-person team (R11, R12).** Pro is never paused, Postgres is always on, and Supabase is the only one of the three with a hard spend cap [1][19][29]. The base fee is a flat $25 [1].
6. **A real exit (R13).** It is standard Postgres, and pg_dump takes auth.users too. GoTrue, PostgREST and Edge Runtime are open source and self-hostable [25]. Funding: $500M Series F at a $10B pre-money valuation, Jun 2026 [25].
7. **It fits the repo (R9, R10).** The same-origin /api keeps the existing CSP rule `connect-src 'self'` [71], and no SDK is added. Migrations, auth settings and email templates live in git, and RLS and grants are tested with pgTAP [20].

**How the judges' split was resolved.** The engineering judge (8) and the cost judge (7.5) picked Supabase. The privacy judge picked Firebase (8) and scored Supabase 4.5.
- Every one of the privacy judge's objections to Supabase comes from phones talking to Supabase directly: gateway logs with IP, location and JA3; auth logs pairing email with IP; GoTrue writing IP and user agent into auth.sessions; and the ISP block. That judge named the cure itself: "a Mumbai proxy (Vercel bom1) in front of Supabase". The other two judges named the same proxy as their path if the lawyer refuses Supabase's logs.
- I make the proxy the default from day one instead of waiting for a lawyer. R2 and F-116 are "never" and "nowhere" rules, so a design that only works if a lawyer accepts a breach of the product's own promise is not a design.
- The proxy also defends better against a repeat block than the $10 custom domain: a custom domain is a CNAME that Supabase itself calls an "interim option" [13][14]. It removes the need for the unsupported hourly scrub of auth.sessions, because GoTrue then records the proxy's address and user agent, not the phone's [9].
- What it costs: 2-3 days, and Vercel Pro ($20), which is likely needed anyway. It saves the $10 custom domain.
- The privacy judge called the proxied design "Neon-like with more moving parts". The request path is like Neon's. The difference is that the data and the login service sit in Mumbai rather than Singapore, the login is managed rather than a library the team must patch, and the scheduler is pg_cron. Both designs use the same number of vendors: Vercel, the platform and SES.
- Firebase keeps one real privacy edge. It can drop request logs entirely and keep the rest in a Mumbai bucket [50]. In the chosen design, the player's IP sits in Vercel's function logs for up to about 1 day on Pro, and that cannot be shortened [34]. I accept this residual, subject to the lawyer, because Firebase's price for it is hand-written auth (a breach-level risk under DPDP Rule 6 if it is wrong), hand-built ranks, no SQL, no hard spend cap and proprietary lock-in. Those are the risks the other two judges rank highest.
- The engineering judge's effort lead for Supabase (24 days for R1-R11, against 26-27 and 27-28) shrinks to about level with Neon once the proxy is counted. So the choice over Neon rests on region, managed auth, scheduler maturity, the DPA and portability, not on effort.

## Why not the other two

**Firebase.** It is the strongest on log control and India residency, the cheapest up to 10k (about $4.5 a month [Firebase dossier]), and the privacy judge's pick. The deciding gaps:
- No email-code login (R1). The team would write the code, sessions and every limit, which is security-critical code with no managed service behind it [45].
- Leaderboard places come from hand-built histogram shards that drift if a decrement is missed (R3) [53].
- No SQL, so research works on BigQuery copies (R14).
- No hard spending cap on Blaze (R11, R12). An attack keeps billing until someone notices, and the only hard stop takes the whole app down [Firebase check].
- Proprietary storage with no self-host option (R13).
- The most effort of the three: about 31 days.
- The check moved R11 from native to with-work: the region must be pinned in code, logs are global by default, and PITR is off by default [50][52].

Once Supabase sits behind a Mumbai proxy, Firebase's privacy advantage narrows to Vercel's short IP logs.

**Neon.** It came second under every judge's lens. It is same-origin with clean data minimisation, the cheapest to move to another Postgres, and research projects are free [61]. The deciding gaps:
- No India region (R8, R9). It is Singapore only, about 50-60 ms further away [60][69], and a forced migration if India storage becomes required.
- Auth is a library inside our own functions, and the dossier's settings switch off every built-in rate limit (R1, R5) [64].
- Reminders and inactivity deletion would rest on Neon Functions: GA only since 18 Sep 2026, with public, unauthenticated trigger URLs that can retry (R6, R7) [62].
- Since 14 Oct 2026 it runs under Databricks' Master Cloud Services Agreement, with a unilateral change clause and a Databricks DPA nobody has reviewed. Public development of the open-source engine stopped in mid-2025 (R8, R13) [65][66].
- Preview branches copy production personal data (R7, R10) [67].

With the proxy, Supabase matches Neon's request shape and effort while keeping data in Mumbai. Neon is the named fallback.

## The architecture

### Region and projects
- **One Supabase org owned by the NGO, with the project retake-prod on Pro.** Choose the region explicitly as "South Asia (Mumbai)" ap-south-1, because the "APAC" option resolves to Singapore [15]. Create it in Supabase, not through the Vercel Marketplace: Marketplace projects make Supabase, Inc. (US) the processor [11][14]. Link it to the Vercel project equal-lens-daily for environment sync only.
- **Keys.** Use the new `sb_publishable_` and `sb_secret_` keys; the legacy anon and service_role keys are deprecated by the end of 2026 [27]. Both keys live only in Vercel's server environment and no key ships to phones. Even so, treat the publishable key as public: RLS and revoked grants are what protect the data.
- **Proxy region.** Vercel Functions are pinned to bom1 (Mumbai). Hobby allows one function region, and bom1 is available [33]. vercel.json moves from a static output to Vite plus an /api folder.
- **Research.** A separate org owned by the research custodian, also in Mumbai, with its own Vercel environment and proxy, so research phones never reach Supabase directly either.
- **Firebase.** The-equal-lens is left untouched for the evaluator [48].

### Request path and the proxy
The path is: phone (plain fetch, about 3 KB) → `https://<app domain>/api/*` (Vercel, bom1) → Supabase ap-south-1 (`/auth/v1/*`, `/rest/v1/rpc/*`). The proxy:
- Allows a fixed list of routes. Each outbound request is built fresh with an allow-list of headers (Authorization, Content-Type, apikey) and a fixed User-Agent. It never forwards the phone's User-Agent, X-Forwarded-For or any client header, so Supabase's gateway and auth logs see Vercel's address [9][10].
- Uses the client IP only to build `HMAC(daily salt, IP)` as a rate-limit key, stored with an expiry of 24 h or less and purged hourly. It never logs IPs, emails or codes; extend the repo's `scripts/privacy-check.ts` with header and log tests [71].
- Keeps the access and refresh tokens in HttpOnly, Secure, SameSite=Strict cookies on the app's own domain and attaches Authorization itself, so the page's JavaScript never sees the tokens.

Routes: `/api/auth/code`, `/api/auth/verify`, `/api/auth/signout`, `/api/join`, `/api/score`, `/api/board`, `/api/friends/{search,request,add-back,not-now,remove}`, `/api/push/{register,time,played,unregister}`, `/api/me/export`, `/api/me/delete`, plus `/api/cron/remind` and `/api/cron/sweep` (callable only by pg_net with a secret header).

**Supabase's per-IP limits.** All traffic now arrives from Vercel's addresses, so Supabase's per-IP buckets would throttle the whole player base. The defaults are 30 code sends and 30 verifies per 5 min, and 150 token refreshes per 5 min [7]. Raise them, since they are configurable, and enforce real limits in the proxy. Keep the per-user interval and the project emails-per-hour cap as Supabase-side backstops. If the ceilings turn out too low, see the week-1 checks.

**No CAPTCHA.** Turnstile and hCaptcha are third-party scripts. They conflict with "no trackers" (R8) and with the CSP rule `script-src 'self'` [71].

### Auth flow for the 6-digit code
1. The notice (F-113) is accepted before the email sheet, and nothing leaves the phone before that (F-114). GoTrue creates the auth user when the first code is sent [4], so the notice must come first.
2. `POST /api/auth/code {email, lang}`. The proxy checks the per-email-hash limit (for example 5 an hour), the per-IP-hash limit and a global daily cap (for example 2,000). The examples are from the Firebase and Neon dossiers. It then calls `/auth/v1/otp`, creating the user if new, with an allow-listed `/en` or `/hi` redirect URL. The template reads that URL only to choose the language and never prints it [5].
3. GoTrue makes a 6-digit code (otp_length 6), valid 600 s (otp_expiry 600) [4]. It sends it through SES SMTP in ap-south-1 using the "Confirm signup" template for a new user and "Magic link" for a returning one. Both templates carry only `{{ .Token }}`, so no link is ever sent [4][5].
4. "Send again" repeats step 2. The UI shows no counter (F-78a).
5. `POST /api/auth/verify {email, code}` → `/auth/v1/verify` returns a session. The proxy then calls `/auth/v1/logout` with scope "others", so the player's other phones are signed out. Every write RPC checks that `auth.jwt()->>'session_id'` still exists in auth.sessions, so an old phone's still-valid JWT (up to 1 h) stops writing at once [8]. Turn on Pro's "Single session per user" as a second layer [1].
6. First join: `/api/join {consentVersion, adult: true}` calls create_player, then claim_road_name. That takes the lowest free number for the base name ("Ghat Ka Jugnu 2") under UNIQUE(latin_base, suffix) and stores the Devanagari spelling. Only "18 or older" is sent, never the birth date (F-115).
7. Sign out (F-112a) uses scope "local", never the JS default "global", which would also sign out the other phone [8]. A new phone (F-172) uses the same flow.
8. **Email setup.**
   - SES in ap-south-1 with DKIM, SPF and DMARC on a sending subdomain. Request production access in week 1.
   - Turn off Virtual Deliverability Manager engagement tracking at account level, because it adds an open pixel and link wrapping [37].
   - Opt out of the Essentials plan to à la carte at $0.10 per 1,000 [36].
   - Raise the project emails-per-hour cap from its starting value of 30 [6].
   - English and Hindi templates live in config.toml through content_path [5].

### Tables
All tables are in schema `app` with RLS on. Dates are kept as dates, with no times, except the expiry on rate-limit rows. GoTrue's own auth.users and auth.sessions hold the email and sign-in times, and their IP and user-agent columns hold the proxy's values.

| Table | Columns | Notes |
|---|---|---|
| players | id uuid PK → auth.users ON DELETE CASCADE; adult bool NOT NULL CHECK (adult); consent_version; latin_base; suffix int; deva_name; latin_key; deva_key; joined_on date; last_active date | UNIQUE (latin_base, suffix) |
| play_days | player_id → players CASCADE; day date; level smallint CHECK 1-3; puzzle_no int; score smallint CHECK (range) | PK (player_id, day, level); index (level, day, score DESC) |
| practice_counted | player_id, level, puzzle_no | PK, so each puzzle counts once (F-92) |
| practice_week | player_id, level, week_start date, n | PK (player_id, level, week_start); index (level, week_start, n DESC) |
| practice_all | player_id, level, n, listed bool | partial index (level, n DESC) WHERE listed (F-96c) |
| friend_links | requester, addressee → players CASCADE; state pending, hidden or accepted | PK (requester, addressee); one row per direction |
| push_subs | token_hash PK; endpoint; p256dh; auth; slot_ist smallint (minute of day, a multiple of 15); played_on date; last_sent date; player_id NULL → players CASCADE | no login needed (F-127) |
| rl | key (HMAC of email or IP with a daily salt, or uid plus day for caps); n; expires_at | purged hourly by pg_cron |

### Authorisation rules
- The first migration sets the security baseline [17]:
  - RLS on every table; table grants revoked from anon and authenticated; "Automatically expose new tables" off.
  - `ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`, because new functions are otherwise executable by anyone.
  - Every RPC is SECURITY DEFINER with `search_path=''`, and EXECUTE is granted to authenticated only.
  - Only register_push, mark_played and unregister_push are anon-callable. They are keyed by a random token held on the phone and throttled by the proxy.
- **submit_score.**
  - The game day is computed on the server: the day starts at 4 am IST (F-08).
  - The puzzle number must equal today's.
  - The score must be in the level's plausible range, and the PK gives one row per level per day.
  - A daily cap applies to past puzzles.
  - Only if a new row was inserted does it add practice_counted and increment the week and all-time counts.
  - A queued score that arrives after the 4 am rollover counts as a past puzzle, All time only (F-92); the owner should confirm this.
- Board and search RPCs return only road names (Latin and Devanagari) and figures.
- pgTAP tests assert the grants and RLS, and Security Advisor must be clean.

### How boards are computed (SQL sketch)
```sql
-- Game day starts 04:00 IST (F-08); week starts Monday 04:00 IST (F-90)
create function app.game_day() returns date stable language sql set search_path = '' as
$$ select ((now() at time zone 'Asia/Kolkata') - interval '4 hours')::date $$;
create function app.game_week() returns date stable language sql set search_path = '' as
$$ select date_trunc('week', app.game_day())::date $$;

-- The three boards share one shape (level, player_id, v)
create view app.b_today as select level, player_id, score as v from app.play_days     where day = app.game_day();
create view app.b_week  as select level, player_id, n     as v from app.practice_week where week_start = app.game_week();
create view app.b_all   as select level, player_id, n     as v from app.practice_all  where listed;

-- EVERYONE (shown for Today; Week and All time are the same against their views).
-- Each part is its own indexed query, so nothing scans the whole board.
select count(*) as total, count(*) filter (where v > :my_v) + 1 as my_place   -- ties share a place
from app.b_today where level = :lvl;

select p.latin_base, p.suffix, p.deva_name, b.v                                  -- top 3
from app.b_today b join app.players p on p.id = b.player_id
where b.level = :lvl order by b.v desc, p.latin_base, p.suffix limit 3;

select ... where b.level = :lvl and (b.v > :my_v or (b.v = :my_v and (p.latin_base, p.suffix) < (:my_base, :my_suf)))
order by b.v asc, p.latin_base desc, p.suffix desc limit 2;                      -- 2 above me
select ... where b.level = :lvl and (b.v < :my_v or (b.v = :my_v and (p.latin_base, p.suffix) > (:my_base, :my_suf)))
order by b.v desc, p.latin_base, p.suffix limit 2;                               -- 2 below me
-- place of each returned row r = 1 + count(v > r.v); band ("Top 9%") = my_place / total

-- FRIENDS (a small set): rank directly
select p.latin_base, p.suffix, p.deva_name, b.v,
       rank() over (order by b.v desc) as place, count(*) over () as total
from app.b_today b join app.players p on p.id = b.player_id
where b.level = :lvl
  and b.player_id in (select :me union select addressee from app.friend_links
                      where requester = :me and state = 'accepted')
order by b.v desc, p.latin_base, p.suffix;
```
- get_board(level) returns all six boards for a level in one JSON response, read when the tab opens, with no realtime.
- With fewer than 20 players, or before anyone has played, the response is one line plus the rows there are, with no band (F-96a). The client formats "1,960th".
- The shared part (top 3 and counts) may be cached briefly. The player's own rows are never cached publicly [Neon check].
- If Everyone reads get heavy, a pg_cron job can write top 3 and counts to a snapshot table every 5 minutes [Supabase dossier].
- Load-test locally with 200k synthetic players.

### Friends
- **search_names.** pg_trgm GIN indexes on the lower-cased, unaccented Latin form and on the NFC-normalised Devanagari form [Supabase dossier]. Results show each look-alike's number, are limited to 10 and exclude the searcher.
- **Request:** the adder's row is pending; they see "Waiting" with no figures.
- **Add back:** both directions become accepted.
- **Not now:** the request becomes hidden. Later requests from the same name stay hidden silently, the adder still sees Waiting, and the player can still add the other person herself (F-85a).
- **Remove:** deletes both directions; neither player is told (F-87).
- **Undo for 5 s:** the client holds the call for 5 seconds (F-86).
- No push notification is sent for any of this.

### Reminders
- **Subscribing.** The phone calls `pushManager.subscribe` with the VAPID public key. This works on Android Chrome, and on iPhone only for home-screen apps on iOS 16.4+ after a tap [39]. It then calls `/api/push/register {subscription, slot, token}`; no login is needed (F-127). `/api/push/played` sets played_on for the game day; for a signed-in player, submit_score sets it too.
- **Scheduling.** A pg_cron job runs `*/15 * * * *` in UTC; IST's +5:30 offset lines up with 15-minute slots. It claims due rows atomically: `UPDATE push_subs SET last_sent = game_day WHERE slot_ist is within the current quarter-hour AND played_on IS DISTINCT FROM game_day AND last_sent IS DISTINCT FROM game_day RETURNING ...`. That gives at most one reminder a day and none if today is played (F-128).
- **Sending.** The job posts batches of about 200 through pg_net (built for about 200 requests a second) with an explicit `timeout_milliseconds`, because the default is 2,000 ms [16]. The receiver is the Vercel Node function `/api/cron/remind`. It uses web-push 3.6.7, a mature library last published Jan 2024 [40]; the VAPID keys are in Vercel's environment and the shared secret is in Supabase Vault. It deletes subscriptions that answer 404 or 410.
- **Why Vercel for the sender.** A Supabase Edge Function using jsr:@negrel/webpush is possible, but that library has not been reviewed by crypto experts, and npm web-push on Deno is unverified [40]. The proxy already lives on Vercel, so the Node sender adds no new deploy surface.
- **Trade-off.** A row is marked sent before the push goes out, so a failed send loses that day's reminder. That is the right side to fail on, since the rule is at most one a day.
- Reminders off, or Delete all, removes the row, and the phone unsubscribes.

### Deletion and inactivity
- **Delete all (F-112).** The proxy:
  - calls unregister_push for this phone's token;
  - if the player is signed in, calls `auth.admin.deleteUser(uid)` with the secret key, which cascades to auth.sessions, players, play_days, practice, friend_links and linked push_subs [21];
  - removes the address from SES's account-level suppression list [38];
  - clears the cookies.

  The phone then clears its own state.
- **Inactivity (F-96c).** A daily pg_cron job sets `listed = false` after N days without play, which drops the name from Everyone and from Friends lists. After the lawyer's period it hands the ids through pg_net to `/api/cron/sweep`, which calls deleteUser for each. Unlinked push_subs past the period are deleted too.
- **What lingers, and must be in the deletion wording:** daily backups for 7 days [18]; Supabase's log copies, whose retention is unstated [11]; Vercel's logs for up to about 1 day [34]. Supabase deletes customer data 30 days after the contract ends [12]. Do not buy PITR.
- A weekly encrypted `supabase db dump` goes to storage the NGO controls in ap-south-1, kept 7 days. That keeps the deletion promise and is also the exit copy.

### Logs and IP retention

| Where | What it holds | How long | Control |
|---|---|---|---|
| Vercel (static PWA and /api) | Player IP and user agent | 1 h on Hobby (12 h per another Vercel page), about 1 day on Pro [34] | Cannot be shortened; our code never logs IPs |
| Proxy rate-limit rows | HMAC(daily salt, IP) | 24 h or less, purged hourly | Ours |
| Supabase gateway and auth logs | Vercel's address, Cloudflare location of that address, the player's email on auth events | Visible to us for 7 days; Supabase's own retention unstated; stored in the EU [10][11][23] | Get the retention in writing from privacy@supabase; turn off "Write audit logs to the database" |
| auth.sessions | The proxy's address and user agent | Until the session ends; deleted about 24 h after expiry [9] | None needed |
| Amazon SES | Recipient address, delivery events | Until removed (suppression list) | Tracking off; suppression entry removed on delete |
| Apple and Google push services | The push endpoint | Their terms | Named on the notice |

If the lawyer reads DPDP Rules 6(1)(e) and 8(3) as requiring one year of logs, the options are a Supabase log drain to NGO-owned storage ($60 per drain a month, plus $0.20 per million events and $0.09/GB [23]) or a minimal security-log table of our own.

### What runs on Vercel and what runs on the platform

| Vercel (equal-lens-daily, bom1) | Supabase (ap-south-1) | Others |
|---|---|---|
| Static PWA; the /api proxy; the push sender (web-push, VAPID); the deletion sweep; export | Postgres (tables, RLS, RPCs); GoTrue Auth; PostgREST; pg_cron; pg_net; Vault; daily backups | Amazon SES ap-south-1 (code emails); browser push services; on the phone, a fetch client, an IndexedDB outbox and a service-worker push handler |

Not used: supabase-js on the phone, Realtime, Storage, Vercel Cron, CAPTCHA, analytics.

**Offline queue (R9).** The IndexedDB outbox is keyed by game day and level. It flushes on app open, on the online event and on visibilitychange, and by Background Sync on Android Chrome; iOS retries on the next open. Retries are idempotent through the primary key [Firebase dossier].

### Local development and CI
- **In git, under `supabase/`:** migrations, config.toml (OTP length and expiry, rate limits, single session, email templates through content_path), seed.sql (200k synthetic players) and pgTAP tests [20].
- **Local and in GitHub Actions:** `supabase start` runs in Docker. The Docker-free native runtime is only for the experimental `supabase stack` commands, so do not use it [20]. The local mail catcher allows end-to-end tests of the code email. Vitest covers the proxy against the local stack, and `pnpm e2e` is extended with tests that no IP or user agent passes through the proxy.
- **Types:** `supabase gen types typescript` output is committed, and CI fails on drift.
- **Deploys:** `supabase db push` and `supabase config push` from CI on main. No schema edits in the dashboard.
- **Previews:** Vercel previews point at Supabase preview branches, which start without data and cost $0.01344 per branch-hour [1][20]. They never point at production.

## Costs

Usage figures are from the Supabase dossier.
- **At 10k players:** about 346k score writes, 130k board reads and 170k token refreshes a month, so about 650k proxy calls. Reminders: about 39k pushes in about 3k cron runs plus about 200 batch calls. About 2k code emails.
- **At 100k players:** about 3.5M score writes, 1.3M board reads and 1.7M refreshes, so about 6.5M calls. About 390k pushes in about 5k calls. About 20k code emails.

All prices are USD a month. Add about 18% GST: Supabase has collected it since May-Jun 2026 [3], and Google, AWS and probably Vercel do the same [56].

| Stage | Arithmetic | Total | With 18% GST |
|---|---|---|---|
| Closed alpha (invited testers) | Supabase Free $0 [1] + Vercel Hobby $0 (only if no one is paid [31]) + SES 1,000 × $0.10/1,000 = $0.10 [36] | about $0.10 | about $0.12 |
| Public alpha (100-1,000 players) | Pro $25, with Micro compute covered by the $10 credit [1][3] + SES $0.10; proxy about 65k calls, inside Hobby's 1M [32] | $25.10, or $45.10 with Vercel Pro ($20) | $29.62 / $53.22 |
| 10k players | Pro $25 (Micro; database grows 0.4-0.6 GB a year of the 8 GB included; egress under 3 GB of 250 GB) + SES 2,000 × $0.10/1,000 = $0.20 + Vercel Pro $20 | $45.20 | $53.34 |
| 100k players, Small compute | Pro $25 + Small $15 − $10 credit = $30 [2] + SES 20,000 × $0.10/1,000 = $2 + Vercel Pro about $25-35 | $57-67 | $67-79 |
| 100k players, Medium (if board queries need it) | $25 + $60 − $10 = $75 + $2 + $25-35 | $102-112 | $120-132 |

Notes on the costs:
- **Free is not for a public app.** It pauses after 7 quiet days, has no backups [19], and removing Supabase branding from emails is Pro-only [1].
- **Why Vercel Pro at 10k.** About 650k proxy calls, plus push batches and static and service-worker requests, come near Hobby's 1M invocations, 4 h of Active CPU and 1M Edge Requests. Hobby pauses the feature for up to 30 days when Edge Requests run out [32][Firebase check], which is a live-app outage risk.
- **The Vercel figure at 100k** is the Neon dossier's estimate for 8-9M function calls, an upper bound for our 6.5M: $20 plus $0.60 per million invocations beyond the included credit [32].
- **Not bought:** PITR at $100, which also needs Small compute [18], and the $10 custom domain, which the proxy replaces.
- **To watch:**
  - auth users (MAU) above 100k cost $3.25 per 1,000 [1][22];
  - Logs Ingest over 20 GB costs $0.50/GB from 2027; the estimate at 100k is 10-20 GB a month [23];
  - disk over 8 GB costs $0.125/GB, about $0.50 a month in year 2 [1];
  - SES at the Essentials rate ($0.16/1,000) would add about $1 at 100k [36].
- **Research build:** a separate org on Pro is $25 a month (corrected from $10), or Free at $0 if pauses and no backups are acceptable [3].
- **Two years:** 6 months of public alpha at $25-45, 9 months at 10k at about $45 and 9 months at 100k at $57-112 come to about $1.07k-1.69k before GST and research. The cost judge's two-year figures for comparison: Firebase about $0.9-1.0k, Neon about $1.4k, and Supabase without the proxy about $0.9-1.3k. The proxy's premium is mostly Vercel Pro, which the commercial-use test may require anyway.
- **Vercel plan:** Supabase forces no Vercel Cron, because pg_cron does the scheduling. Hobby is non-commercial: a paid person working on the project makes it commercial, while donations do not, according to Vercel staff [31].

## Risks and what to check before launch

**Week-1 go/no-go checks. If one fails and cannot be fixed, switch to Neon.**
1. Run a proxied sign-in, score and board call against the hosted Mumbai project, then read its edge and auth logs. Confirm that only Vercel's address appears: no player IP, user agent, location or JA3.
2. Confirm that Supabase's per-IP auth limits can be raised enough for every player arriving from Vercel's addresses. The 150 refreshes per 5 min default would throttle at scale [7]. If they cannot, send `Sb-Forwarded-For` with the secret key on `/auth/v1/otp` and `/auth/v1/verify` only. Then disclose that Supabase's auth logs hold the player's IP, in the EU, for 7 days or more [7][10].
3. Test web-push from the Vercel Node function on a real Android phone and a real iPhone home-screen app [39].
4. Test pg_trgm on Devanagari names. If combining vowel signs split the trigrams, fall back to prefix search on normalised keys, as in the Firebase design.
5. Check the email: code-only and bilingual in both templates, chosen by `{{ .RedirectTo }}` [5]. Get SES production access, DKIM, SPF and DMARC done, and turn VDM tracking off at account level [37].
6. Confirm that the Vercel bom1 → supabase.co path is not affected by consumer-ISP blocks. The 24 Feb to 3 Mar 2026 block hit Jio, Airtel and ACT [13]. Not verified; play still works offline and scores queue on the phone.

**Before launch**
- **Security baseline:** revoked grants and EXECUTE, RLS on every table, a session check in every write RPC, pgTAP in CI, Security Advisor clean [17].
- **Sign-out:** "local" scope everywhere [8].
- **Spend cap:** on through 10k. Turn it off before auth users reach about 90k and add usage alerts, because hitting a capped quota repeatedly brings fair-use restrictions (402s or read-only) across the whole org [29].
- **Limits:** per-email, per-IP-hash and global daily code caps in the proxy; raise Supabase's emails-per-hour cap from 30 [6].
- **Backups and monitoring:** daily backups for 7 days, plus the weekly 7-day dump in Mumbai. A free external uptime check and Vercel function error alerts.
- **Vendor risks:** there is no uptime SLA below Enterprise, and a restore makes the project inaccessible while it runs [18]. Supabase's us-east-2 region was down 3 h 42 min on 12 Feb 2026; Mumbai was not affected [26]. Acquisition or repricing is the long-run risk, softened by Postgres portability and the weekly dump [25].
- **Card payments:** confirm that the NGO's card handles recurring USD charges [3]. Unverified; a failed payment is a continuity risk.
- **Vercel terms:** decide between Hobby and Pro. Vercel's own pages conflict on donations, so ask Vercel Support [31].

**For the lawyer (DPDP Act 2023 and Rules 2025)**
1. **Retention rules.** Rule 6(1)(e) asks for one year of logs, and Rule 8(3) for at least one year of personal data, traffic data and logs, both from about 13 May 2027 [41][42]. Both conflict with Delete all, inactivity deletion and short IP retention. MeitY's Jan 2026 proposal would bring compliance forward to 13 Nov 2026, three weeks away, and cut Rule 8(3) to 3 months; it was not notified as of Oct 2026 [43]. Track it.
2. **Breach timing (Rule 7).** Notice to the Board and to each affected player without delay, and a detailed report within 72 h [41]. Supabase promises notice "without undue delay, and where feasible, within 48 hours" [12]. Does the processor's awareness start the NGO's clock? "24 h left" is one conservative reading [44]. Write the NGO's own runbook.
3. **Processing outside India.** Supabase's logs and telemetry are in the EU, its support staff are global, and Cloudflare is a sub-processor [11]. Add Vercel and the Apple and Google push services. Is this allowed under the Section 16 negative list [42]? Get Supabase's own log retention in writing.
4. **DPA terms.** The DPA is with Supabase Pte. Ltd. It does not name DPDP but says "all applicable laws, including..." [12]. Record its acceptance.
5. **Notice wording (F-113).** It must cover:
   - the processors: Supabase, Vercel, AWS SES, Apple and Google push services;
   - the residue: 7 days of backups, Vercel's logs of up to about 1 day, Supabase's log copies;
   - whether Vercel's roughly one-day IP logs count as "as long as delivery needs";
   - the inactivity period (F-96c);
   - whether an age check held on the phone is enough under Rule 10.
6. **Research build.** The registered design asks for no access log and no IP address. The proxy helps, but the mixing pool still needs a separate relay [71].

## Facts that were corrected during checking

| Claim | Correction | Source |
|---|---|---|
| Supabase at 100k costs $97-98 with Medium compute, $140-200 with PITR | $88 with Medium; $143-188 with PITR | [2][3] |
| A Supabase research project in a separate org costs $10 a month | $25 a month (its own Pro plan); $10 is an extra project in the same org | [3] |
| A Vercel rewrite is an alternative defence against an ISP block | A rewrite makes every player share Vercel's IP for Auth's per-IP limits; a server function is needed | [7] |
| The custom domain is the main defence against a repeat block | It is a CNAME that beats host and SNI blocks, probably not DNS-target or IP blocks; Supabase calls it "interim" | [13][14] |
| Supabase gateway logs keep IP and user agent | They also keep Cloudflare city, region, postcode, latitude/longitude, ASN, JA3 fingerprint and bot score; "7 days" is only the customer's view, and Supabase's own retention is unstated | [10][11] |
| The Supabase DPA does not cover DPDP | It covers "all applicable laws, including..."; DPDP is not named but is arguably covered | [12] |
| CI can use Supabase's Docker-free native runtime | That is the experimental `supabase stack` only; `supabase start` always uses Docker | [20] |
| New Supabase functions are safe once table grants are revoked (missed) | Every new function is executable by PUBLIC until EXECUTE is revoked | [17] |
| pg_net is fine for batched sends (missed) | Its default request timeout is 2,000 ms; set timeout_milliseconds | [16] |
| Supabase's bundle impact: repo app at 100,710 B gzip (index-xyoxfyaw.js) | The file is index-C1CiNxJt.js, 369,198 B raw / 101,217 B gzip; full supabase-js is 58,192 B gzip (about 57%) | [28][71] |
| Asking for donations makes Vercel Hobby use commercial (Neon and Supabase dossiers) | Vercel says donations are not commercial; paid staff is. One page version conflicts | [31] |
| DPDP: only Rule 6 log retention matters | Rule 8(3) requires at least one year of personal data, traffic data and logs; a 2026 proposal could move compliance to 13 Nov 2026 | [41][43] |
| Supabase's 48 h leaves 24 h of the 72 h | One conservative reading; whether the processor's awareness starts the clock is a legal question | [44] |
| Costs are as stated (all dossiers) | Add 18% GST; Supabase has collected it since May-Jun 2026 | [3][56] |
| Neon's Managed Better Auth lacks a 10-minute expiry | The docs show 15-minute verification codes and a 10-minute sign-in example; it is rejected for the cross-site cookie | [63] |
| Better Auth's disableIpTracking only stops IP tracking | In v1.7.12 it turns off all built-in rate limits; 1.7.12 was published 20 Oct, not 22 Oct | [64] |
| Neon's operative DPA is its PDF | Since 14 Oct 2026 it is the Databricks DPA under the MCSA | [65] |
| Neon's SOC 2 report is Scale-only | Any customer can get the SOC 2 report on request | [65] |
| Neon's engine is self-hostable, with slower activity | Public development effectively stopped; the release branch has been frozen since 25 Jul 2025 | [66] |
| Neon preview branches are harmless (missed) | They copy production personal data and can last up to 6 months | [67] |
| SES costs $0.10 per 1,000 in every region | New accounts default to Essentials at $0.16 per 1,000 since 21 Jul 2026; à la carte at $0.10 is still available | [36] |
| SES has no trackers by default (missed) | VDM engagement tracking (open pixel, link wrapping) is on by default in the onboarding wizard | [37] |
| Firebase: named Firestore databases get no free tier | The free tier goes to the first database created in a project, whatever its name | [47] |
| Firebase Blaze's free Functions allowance is 400K GB-s, 200K CPU-s and 5 GB | That is 1st gen. 2nd gen: 2M requests, 360K GiB-s, 180K vCPU-s, 1 GiB egress (North America only) | [49] |
| Firebase CLI 15.17+ deploys functions to the data source's region | Only event-triggered functions; HTTPS and scheduled functions still default to us-central1 unless pinned | [52] |
| Firebase's default Firestore location may be fixed in old projects | Those APIs are decommissioned; the location is chosen per database | [55] |
| Firebase Spark shuts an over-quota product off for the rest of the month | Firestore quotas are daily and reset daily | [47] |
| Firestore text and geospatial search went GA on 19 Oct 2026 | Still Preview in the latest notes found | [54] |
| Firebase reminders cost $0 in Cloud Scheduler | 4-5 jobs on one billing account, about $0.10-0.20 | [59] |
| Firebase R11 ops is native | With work: PITR off by default, logs global, region pin needed, no hard cap, cold starts | [50][52] |
| Firebase's Cloud Logging can be set to keep logs in India | _Default and _Required are created in "global" and cannot be moved; a rerouted sink or an org setting is needed | [50] |
| Firebase forces no Vercel plan | True only without the /api rewrite (Hobby's 1M Edge Requests) | [32] |
| Firebase cost: 8 writes per submit | 9-10 writes plus about 3 reads; adds $5-10 at 100k | [Firebase check] |

## Sources

**Supabase**
1. https://github.com/supabase/supabase/blob/master/packages/shared-data/plans.ts ; https://github.com/supabase/supabase/blob/master/packages/shared-data/pricing.ts (= https://supabase.com/pricing)
2. https://github.com/supabase/supabase/blob/master/apps/www/data/PricingAddOnTable.json (= https://supabase.com/docs/guides/platform/compute-and-disk)
3. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/billing-faq.mdx (= https://supabase.com/docs/guides/platform/billing-faq)
4. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-email-passwordless.mdx ; https://github.com/supabase/auth/blob/master/internal/conf/configuration.go ; https://github.com/supabase/auth/blob/master/internal/api/magic_link.go
5. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-email-templates.mdx ; https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-hooks/send-email-hook.mdx
6. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/auth-smtp.mdx
7. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/rate-limits.mdx
8. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/signout.mdx ; https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/sessions.mdx
9. https://github.com/supabase/auth/blob/master/migrations/20231027141322_add_session_refresh_columns.up.sql ; https://github.com/supabase/auth/blob/master/internal/models/sessions.go
10. https://github.com/supabase/supabase/blob/master/packages/shared-data/log-constants.ts ; https://supabase.com/docs/guides/observability/log-field-reference
11. https://github.com/supabase/supabase/blob/master/apps/www/data/legal/privacy-resources/data-residency-and-transfers-faq/v1.mdx
12. https://supabase.com/legal/dpa (https://github.com/supabase/supabase/blob/master/apps/www/data/legal/customer-resources/data-processing-addendum/v1.mdx)
13. https://supabase.com/blog/navigating-regional-network-blocks ; https://www.techcrunch.com/2026/02/27/india-disrupts-access-to-popular-developer-platform-supabase-with-blocking-order/ ; https://www.medianama.com/2026/02/223-supabase-isp-level-block-jiofiber-users-india/
14. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/custom-domains.mdx ; https://supabase.com/docs/guides/integrations/vercel-marketplace
15. https://github.com/supabase/supabase/blob/master/packages/shared-data/regions.ts ; https://supabase.com/docs/guides/functions/regional-invocation
16. https://supabase.com/docs/guides/cron ; https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/database/extensions/pg_net.mdx
17. https://supabase.com/docs/guides/api/securing-your-api
18. https://supabase.com/docs/guides/platform/backups
19. https://supabase.com/docs/guides/platform/free-project-pausing
20. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/local-development/docker-and-native-runtimes.mdx ; https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/local-development/testing/overview.mdx ; https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/deployment/branching.mdx
21. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/managing-user-data.mdx
22. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/manage-your-usage/monthly-active-users.mdx
23. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/manage-your-usage/logs-ingest.mdx ; https://github.com/supabase/supabase/blob/master/apps/www/_blog/2026-03-05-log-drains-now-available-on-pro.mdx
24. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/functions/examples/push-notifications.mdx
25. https://github.com/supabase/supabase/blob/master/apps/www/_blog/2026-06-04-supabase-series-f.mdx ; https://github.com/supabase/supabase/blob/master/apps/www/_blog/2026-04-22-supabase-is-now-iso-27001-certified.mdx ; https://github.com/supabase/supabase/blob/master/apps/www/_blog/2026-10-02-supabase-is-acquiring-turso.mdx
26. https://github.com/supabase/supabase/blob/master/apps/www/_blog/2026-02-12-supabase-incident-on-february-12-2026.mdx
27. https://github.com/supabase/supabase/blob/master/apps/docs/content/_partials/api_keys_deprecation.mdx
28. https://www.npmjs.com/package/@supabase/supabase-js (2.118.0, measured with esbuild)
29. https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/platform/cost-control.mdx (spend cap, as checked by the cost judge)

**Vercel**

30. https://vercel.com/docs/cron-jobs/usage-and-pricing
31. https://vercel.com/docs/limits/fair-use-guidelines ; https://community.vercel.com/t/donations-on-the-hobby-plan/50665
32. https://vercel.com/docs/plans/hobby ; https://vercel.com/docs/plans/pro-plan
33. https://vercel.com/docs/regions ; https://vercel.com/docs/functions/configuring-functions/region
34. https://vercel.com/docs/runtime-logs ; https://vercel.com/docs/observability/observability-plus
35. https://vercel.com/docs/marketplace-storage

**Amazon SES**

36. https://aws.amazon.com/ses/pricing/ ; https://aws.amazon.com/about-aws/whats-new/2026/07/amazon-ses-pricing-plans/ ; https://docs.aws.amazon.com/ses/latest/dg/pricing-plans.html
37. https://docs.aws.amazon.com/ses/latest/dg/vdm-settings.html ; https://docs.aws.amazon.com/general/latest/gr/ses.html
38. https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_DeleteSuppressedDestination.html

**Web Push**

39. https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
40. https://registry.npmjs.org/web-push ; https://jsr.io/@negrel/webpush

**DPDP Act and Rules**

41. https://ssrana.in/articles/meity-notifies-final-digital-personal-data-protection-rules-2025/ ; https://dpdpa.com/dpdparules/rule6.html ; https://www.dpdpa.com/dpdparules/rule7.html
42. https://www.khaitanco.com/sites/default/files/2025-11/ERGO%20-%20Digital%20Personal%20%20Data%20Protection%20Rules%20-%2015%20November%202025.pdf ; https://www.mondaq.com/india/data-protection/1708164/digital-personal-data-protection-rules-2025-notified ; https://www.barandbench.com/amp/story/view-point/meity-notifies-final-digital-personal-data-protection-rules-2025
43. https://ssrana.in/articles/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs/ ; https://www.storyboard18.com/digital/meity-seeks-industry-views-on-fast-tracking-dpdp-act-rollout-proposes-12-month-compliance-timeline-88332.htm
44. https://tsaaro.com/blogs/responding-to-data-breaches-key-obligations-under-the-dpdpa-2023-and-dpdp-rules-2025

**Firebase and Google Cloud**

45. https://registry.npmjs.org/firebase/-/firebase-13.1.0.tgz ; https://firebase.google.com/docs/auth/web/email-link-auth
46. https://firebase.google.com/support/privacy
47. https://cloud.google.com/firestore/pricing ; https://docs.cloud.google.com/firestore/quotas
48. https://firebase.google.com/docs/firestore/locations ; https://firebase.google.com/docs/database/locations
49. https://cloud.google.com/run/pricing ; https://registry.npmjs.org/firebase-tools/-/firebase-tools-15.34.1.tgz
50. https://docs.cloud.google.com/logging/docs/buckets ; https://docs.cloud.google.com/logging/docs/regionalized-logs
51. https://cloud.google.com/terms/data-processing-addendum
52. https://firebase.google.com/docs/functions/locations ; https://firebase.google.com/support/release-notes/cli
53. https://firebase.google.com/codelabs/build-leaderboards-with-firestore
54. https://docs.cloud.google.com/firestore/docs/release-notes
55. https://firebase.google.com/docs/reference/firebase-management/rest/v1beta1/projects.defaultLocation/finalize
56. https://docs.cloud.google.com/billing/docs/resources/vat-overview
57. https://cloud.google.com/identity-platform/pricing
58. https://firebase.google.com/pricing
59. https://cloud.google.com/scheduler/pricing

**Neon**

60. https://neon.com/docs/introduction/regions
61. https://neon.com/docs/introduction/plans
62. https://neon.com/docs/compute/functions/triggers/schedule
63. https://neon.com/docs/auth/guides/plugins/jwt ; https://neon.com/docs/auth/guides/email-verification ; https://neon.com/docs/auth/guides/webhooks
64. https://www.better-auth.com/docs/plugins/email-otp ; https://github.com/better-auth/better-auth (tag v1.7.12, packages/better-auth/src/api/rate-limiter/index.ts)
65. https://neon.com/platform-terms ; https://neon.com/pdf/DPA.pdf
66. https://github.com/neondatabase/neon
67. https://neon.com/docs/guides/vercel-overview ; https://neon.com/docs/guides/vercel-branch-cleanup
68. https://neon.com/docs/security/security-overview ; https://neon.com/docs/introduction/monitor-logs
69. https://www.economize.cloud/resources/aws/latency/ap-south-1-vs-ap-southeast-1/
70. https://docs.databricks.com/aws/en/oltp/projects/integrations

**Repository (read-only)**

71. /home/user/retake/knowledge/ux/feature-set.md (F-08, F-78a, F-84, F-85a, F-86, F-87, F-90, F-92, F-96a, F-96c, F-112, F-112a, F-113, F-115, F-116, F-127, F-128, F-172) ; /home/user/retake/knowledge/architecture/data-and-privacy.md ; /home/user/retake/vercel.json (CSP) ; /home/user/retake/dist/assets/index-C1CiNxJt.js
