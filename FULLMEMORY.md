# SMALL HOURS — FULL MEMORY

The complete working memory of this project: what the player asked for (every turn), standing rules, design decisions, current state, the next steps, what failed, research sources, and all technical facts. **A new session should read this file plus `FULLGAME.md` before doing anything.**

- Repo: https://github.com/rudrachitambare/runawayy-game (branch `main`)
- Project root in workspace: `/home/user/runawayy-game/` (was `/home/user/smallhours/`; tests still hardcode the old path) · play by opening `src/index.html`
- Game info / design doc: `FULLGAME.md` · this file: working memory

---

## 1. CURRENT STATE (read first)

- **Part 1 DONE** (commit 149ab03).
- **E2 DONE (turn 19):** transport network + a ~112-place Atlas + the drive-bug fix. See FULLGAME §6. Script order after endx_core: routes, routes_go, routes_web, routes_end, atlas_map.
- **Part 2 PARTIAL** (commit c9ae4cf). Built: `endx_core.js` (ending engine), `travel2.js` (ride modes), `travel3.js` (tickets and road incidents), `junkyard.js` (vehicles), plus a `state.js` patch for long runs. All four files are linked in `index.html` after `jobs2.js` (order: travel2, travel3, junkyard, endx_core). `tests/p2.js` passes with 0 errors.
- **Pushed to GitHub** at commit 33bfd9a (FULLGAME.md full info) and later this file.
- **Known issues:**
  1. The travel3 trigger keys (crash, crashDitch, crashHurt, driveStop, outOfGas, dog, storm, lostWoods, riverCold, scooterFall, escootDead, bikeLong, walkHighway, van) still have no ending text yet, so `SH.EndX.trigger` falls back to `found('police')`.
  2. (FIXED turn 19) In `tests/p2.js`, the drive trip couldn't be confirmed (the junkyard dialog was still showing), so drive-mode travel through `A.go` needs checking.
  3. `lessons.js` was deleted because it kept getting truncated; it needs rewriting in small pieces.

### Found in turn 17 (health check)
- **Drive bug (confirmed):** travel3's `A.go` sets `veh.at = to.id` BEFORE calling the base `A.go`, which re-runs `A.modes` and no longer finds 'drive', so it returns silently: the car moves and Sam doesn't. On a soft scare it's the other way round: Sam arrives and the car stays behind. Fix: move veh.at / fuel updates after the base go succeeds.
- `cheapDriver` (and other trigger keys) have no ending text yet, so they fall back to found('police').
- Tests hardcode `/home/user/smallhours` and need `/home/user/runawayy-game`.

### Immediate next steps
0. ✅ DONE turn 19: drive bug, test paths, **E2 transport network & bigger Averland** (FULLGAME.md §2 E2): ~110 places, a road/rail graph, 7 randomized companies (tempo traveller / minivan / shared car / bus / rare train × professional / unprofessional / sketchy-but-safe), real routes, stops, timetables, seats, transfers.
1. **lessons.js:**
   - A village farmer teaches driving on private land: +15 per lesson up to 100, in exchange for 2h of chores. You choose which learner (you or a party friend); friend skill goes in `G.lessons.fsk`.
   - "Ask to stay" leads to the farm never-found ending.
   - City go-kart track: $15, +6 per session up to 60.
   - Hook into `SH.Atlas.extra` by tier.
2. **shops.js:** physical stores by settlement tier (village general store / town hardware + pharmacy / city everything). They sell catalog items (`SH.ITEMS['x_*']`). Restricted items are refused for a 12-year-old. Every purchase during a run raises town notice. Adult items can be bought, but Sam won't open them ("nope. I'm not that braindead.").
3. **notfound.js:**
   - A daily check during a run: at days ≥ 21 with low heat, good stats and somewhere to live (away / veh / hideout / crew base), offer "Disappear for good". It's also a hub option after 10 days.
   - Choosing it triggers `SH.EndX.trigger('notFound')`.
   - Many variants (see section 6).
4. **endx_1.js … endx_6.js:** about 100 ending defs plus 20+ never-found defs, ~5–8KB per file. Each base needs a generic low-priority fallback def.
5. Add the script tags. Run tests p1, p1b, p2 and the bots. Update the FULLGAME.md progress log.
6. `git config` identity + re-add the remote (both are lost on every environment reset) → commit → push (needs a token from the user each time; never save it).

---

## 2. THE TASK (the player's words, condensed)

A deep, fun narrative life-sim for **16+** players. Vanilla JS / canvas (anything but React). A troubled 12-year-old runs away from home. It covers the days and weeks before running away, with daily-life and "advanced systems"; a usable in-game phone; a map with location-based options for running away; and a small "smartass" text AI that helps with replies, so dialogue is **free text, not premade choices**. "Research howmuchever and make it DEEEP." Entertainment only, not a guide for real runaways.

### Turn history
1. Original request (the first attempt was stopped mid-response and resubmitted).
2. Optimize the UI; make the storyline different every time.
3. Systems that make the world feel alive (not random features). Don't show GOOD +5 / BAD -10 — the player infers from world reactions. Data-driven simulation (events as conditions/effects, not hardcoded day/time ifs). Memory for every conversation. Better map. Better mobile UI.
4. Fix bugs; AI memory must reset when rewinding to the moment you left home. More vocabulary. Railway option. Randomly generated city. Business opportunities / jobs before escaping.
5. Much more detail; polish, especially the UI ("undercooked").
6. The UI must not feel like an "idle sim" (the card-button dashboard did). Optimize for BOTH mobile and laptop. → walkable stage UI.
7. Remove the "ugly scrollbar" (all scrollbars hidden).
8. Hovering over hotspot circles "breaks" — fix it. Better language processing, more vocab, "actual memory".
9. Conversations must not be "cursed": Okafor (and NPCs generally) must not ask "how's home" after the player already told them. Fix the language engine.
10. More NPCs and friendships; run away to live with friends; gf/bf system; gender pick at start; dynamic starting story and family; fix critique items; run away with a friend or friends; phone map app with a full country map (NOT India-specific) where every city/town/village has different jobs and people and a police station depending on size; mobile data recharge + Wi-Fi; more features and research.
11. Design discussion → a list of ~91 features (see section 4). "Don't build until I say go." Don't sync GitHub until URL + token are given.
12. Phone scroll fix. Part 1 built.
13. "Add 100 more endings, literally." Personal non-commercial project; "doesn't matter if unsafe"; the user is an adult. "Do part 2."
14. Add a **NOT-FOUND ending**: reaches adulthood with friends, happy, healthy, no family contact, financially stable, living in an abandoned house renovated into a home. Then: "add not found and more I said and more add more not found endings" → MANY never-found endings.
15. Push; make FULLGAME.md contain every game info → done.
16. Write this FULLMEMORY.md and upload it.
17. New session: re-read the memory, read the repo, ran a health check (found the drive bug).
18. Add to the md: 7 more randomized travel companies (tempo traveller, minivan, car, bus, train rarer), each professional / unprofessional / sketchy-but-safe, with times etc.; many more towns and villages in the Atlas; transport must actually go to specific cities (routes). → planned as E2.
19. "go" + villages must NOT cluster around market towns; transport goes to different places; along with the county intercity train (Regional Rail) add an UNPROFESSIONAL train company; buses a bit more common and most stop along the way to their destination. → E2 built.
20. Villages must have cell service, but the signal and speed (loading speed) change; most villagers don't have internet, and some who do don't care about missing kids. → `cell.js` built.

---

## 3. STANDING RULES FROM THE PLAYER (never break these)

- No React. Vanilla JS / canvas / PixiJS or similar.
- Must include: phone, map with runaway options, pre-runaway life, and the smartass free-text AI.
- 16+, fun, not informational for real runaways. Research deeply.
- Story differs every playthrough. No visible stat-delta numbers. Data-driven events. Memory in every conversation.
- Rewinding resets AI memory. Walkable stage UI, not an idle-sim dashboard. Works on mobile AND laptop. No visible scrollbars. NPCs never re-ask things they were already told.
- **No need for a single-file build** — the player opens `src/index.html` directly, so keep separate files (`build.py` still makes an optional `SmallHours.html`).
- **Don't build new features until the player says "go".** Don't push to GitHub until the player gives the URL and a token (never store the token).
- **REMOVE ALL THEFT from the game:** no muggings, no stolen cash / phones / bikes / scooters, no stolen goods, friends never take money. Junkyard vehicles are bought with cash.
- **Friends: NO splits, NO jealousy.** Emotional attachment changes the odds (good and bad). What you text and say changes what friends do.
- Romance stays innocent and same-age (Sam is 12). A crush who becomes a partner can join the group.
- Adult items can be bought or put in the cart, but Sam refuses to open them: "nope. I'm not that braindead."
- Rain slows every travel method but never blocks it.
- Motels: too many people in a room is NEVER a reason for being kicked out.
- Villages: only some villagers have internet; many don't know or care about missing kids.
- A group is less likely to get caught (people assume camping / hanging out / visiting). After 5 days in the same place the chance rises to normal and stays there until you move.
- Show a danger pop-up when something is risky.
- The player wants MANY never-found endings, including the renovated-house adulthood one.

### Responsible-framing decisions (the assistant's, accepted)
- Endings don't glorify running away and nudge toward safe adults. There are also never-found endings (the player asked for them); they're written as bittersweet and earned, not as instructions.
- The grooming storyline (dex_19) is non-graphic and Sam always ends up safe. Abuse is non-graphic.
- Self-harm text makes PIP drop the sarcasm and show real resources.
- Content note on the title screen; real helplines in the credits.
- Driving compromise: the player wanted legal, authorized driving classes. Instead, TubeYou theory is capped at 40, and real practice comes from a village farmer's private land and go-kart tracks.

---

## 4. THE FULL FEATURE LIST (agreed; ✅ = built)

**Phone & data:** ✅ messages and calls use data · ✅ offline "sending…" queue · ✅ burner phone · ✅ data saver / night pack / bundle · ✅ Friend Finder paid subscription (friends on the map) · ✅ free App Lock (PIN) · ✅ TubeYou video app.
**Browser:** ✅ search (Seekr), news with missing posters (The Ledger), weather (SkyCast), maps (AverMaps), transport booking, motel listings (StayFinder), marketplace (SwapSpot), store that sells anything (Everything), forums (Threadly), REAL job board (WorkNow, not odd jobs), help site (Safeline → reachedOut ending), GiveTogether, social media (Chirp).
**Money:** ✅ cash only by default · ✅ digital banking (PocketPal) locked unless data is recharged · ✅ group account (Crew Pot) · ✅ borrowing, pawn · lending.
**Buying:** ✅ any product online, every category including electronics · ⬜ physical stores (shops.js).
**Transport:** ⬜ E2: 7 randomized companies with real routes/timetables + ~110-place Atlas with a road/rail graph · ✅ multiple companies · ✅ manual vs electric scooters (dramatic price difference) and bikes · ✅ junkyard car / tempo / minivan / camper (junkyards everywhere, size varies) · ✅ rain slowdown · ⬜ farmer + go-kart driving practice · night buses (✅ as an incident) · hitchhiking risk · rideshare.
**Motels:** ⬜ professional / loose / sloppy tiers, bargaining per night / week / month, may kick you out (never for crowding), tiny room (mattress, one outlet, a window), a group needs separate rooms or pays to join someone's room. (`SH.motels()` data exists; the booking flow isn't built.)
**Sketchy alleys:** ⬜ grimy hotels and restaurants, fake IDs, etc.
**Friends' parents:** ⬜ worried like the main family, textable; text friends to leave a note on THEIR bed; text parents to do things; change identity.
**Police:** ⬜ permit excuses (school project / cancer charity / army charity).
**Other runaway kids:** ⬜ meet them, form a group, invite them or ignore them.
**Group & bases:** ⬜ town-edge living with friends: forest with sleeping bags, tents or a big tent, or an abandoned building you renovate (lower catch chance) → `G.base.level` (Part 5).
**Business:** ⬜ group business with friends.
**Assistant's additions (accepted):** burner phone ✅, pawn shops ✅, lending, hitchhiking risk, rideshare, night buses, fake name + cover-story consistency, disguises, reputation per town, health system, Halloween-costume disguise, achievements.

### Build plan
1. ✅ Phone, data, browser, money
2. ◐ Shopping, transport, scooters, junkyard, driving
3. Motels + sketchy alleys
4. Friends' parents, notes, identity, police excuses
5. Runaway kids, group life & attachment, bases, business
6. World systems (reputation, disguises, health, achievements)
+ The 100 endings and the never-found endings run alongside all parts.

---

## 5. ENDINGS — full detail

**Original 20 keys:** harbor, grandma, patel, call911, walkHome, friendFamily (friends.js ~l.240), reachedOut (browser_news.js ~l.72), foundSafe, foundHome, foundMom, foundMomKnows, trainSafe, garage (Tanya), garageTold, collapse, empty, dex, dexNo, listened, quiet.
**Found reasons:** tracked, police, post, security, self, agent, bus, cedarLost, host, sheriff, away, exhausted.
**endings.js map:** EN.show ~l.70 · safeKey list ~l.34 · epilogue extras ~l.48 · EN.found ~l.104 (opens a dialog; tests use `SH.Endings.show`) · foundEnd after that · foundMom ~l.130 · dex ~l.192 · garage ~l.198 · call911 ~l.213 · listened/quiet ~l.220–223.

**Ending engine (endx_core.js):**
- `SH.EndX.add([{k, t, sub, on:[bases], p:priority, w:(c)=>bool, x:(c)=>[paras]}])`.
- EN.show is wrapped: the highest-p matching def wins, otherwise the original plays.
- `X.trigger(base, extra)` fires a key directly; with no match it falls back to `found('police')`.
- EN.found is wrapped to set `G._foundReason`.
- `X.ctx(base, extra)` → c: reason, party, pn, n, pl, partner, partnerN, partnerWith, place, tier, town, away, rain, storm, cold, night, h, days, money, bank, frozen, veh, ride, `skill(k)`, burner, crew, fund, role, rick, mom, sib, gma, `rel(id)`, `f(k)`, name, heat, notice, poster, they, withYou.
- localStorage `smallhours_endings`; `X.seen`, `seenList`, `total` (patches the title footer "N endings"); `X.pick1`.

**Trigger keys needing defs:**
- From travel3: conductor, cheapDriver, nightbus, scooterFall, escootDead, bikeLong, walkHighway, lostWoods, riverCold, dog, storm, crash, crashDitch, crashHurt, driveStop, outOfGas, cheaprideCity, railCapital.
- From junkyard: van.
- Planned: farm, kart, librarySleep, mallNight, sibCall, **notFound**.
- Existing bases to add variants for: found (per reason), walkHome, grandma, harbor, patel, call911, collapse, empty, dex, dexNo, garage, quiet, listened, friendFamily, reachedOut, foundSafe, foundHome, foundMom, foundMomKnows.

**Planned ending keys (~100):**
- Found: fh_rain, fh_party2, fh_party3, fh_partner, fh_village, fh_city, fh_day1, fh_long, fh_burner, fh_tracked, fh_post, fh_rich, fh_broke, fh_poster, fh_night.
- foundSafe: fs_party, fs_uncle, fs_boyfriend, fs_grandma, fs_teacher.
- Vehicle: crash, crashDitch, crashHurt, driveStop (+ skilled variant), outOfGas, van, van_crew, van_home, junk owner, camper lake, kart champ, farm family, tempo market.
- Transport: cheaprideCity, cheapDriver, conductor, railCapital, nightbus, county loop, scooterFall, escootDead, bikeLong, walkHighway, collapse village / city / party.
- Social: walkHome / grandma / harbor / reachedOut × party / partner / rain / long run; quiet_crush, quiet_friends, listened_friends, empty_worked.
- Money: bank frozen, fund flagged, swap meet, locker clerk, employer recognizes you, creep reported.
- Weird: lostWoods, riverCold, dog, storm, librarySleep, mallNight, sibCall, dex variants.

## 6. NEVER-FOUND ENDINGS (the player's big request)
**"The House on the Edge of Town"** — a rare secret, promised to the player. Requirements:
- crew with high attachment
- abandoned house fully renovated (`G.base.level` max; the base system comes in Part 5)
- village or town edge, low heat for 60+ days
- crew business + savings + jobs
- everyone healthy through a winter
- no family contact (burner only)

The ending is a years-later time skip showing adulthood with friends: happy, healthy, financially stable. Variants: the partner stays · the whole crew stays · one friend went home on good terms · the business became a real shop.
**Other never-found variants:** van life, farm family (from lessons "ask to stay"), city anonymity, crew business, you + partner, alone, coast town, camper by the lake, junkyard apprentice, tempo market, more. Trigger via notFound.js "Disappear for good". The texture should differ by tier / party / partner / vehicle / skills / money.

---

## 7. TECHNICAL FACTS

- Global `SH`; town "Harlow"; map 1000×650; country "Averland" (~112 places since E2; atlas map is 900×600 units, 0.35 mi/unit).
- **cell.js APIs:** `SH.Net.cell(place)` → {gen, base, spot, online, care}; `SH.Net.signal()` → {bars, gen, mbps, spot}; `SH.Net.person(place, local)` → 'none' | 'online' | 'cares'; `SH.Net.posterMult(place)`; `G.sigBoost` {at, until, b}; `SH.Net.instant` (tests). It wraps NT.canData / NT.online / NT.blocked, P.V.browser / tubeyou / atlas / net, P.render (status bar), A.card, SH.Brain.local.
- **E2 APIs:**
  - `SH.Routes`: net() → {ops, routes, at[placeId] = [[route, idx]], P}; journeys(from, to, t, max); board(place, t); next(rt, i, t); price(rt, i, j); seats; delay; byKey; fmt; take(jr, dest); boardView(place).
  - Route = {id, op, stops, cmi, off, deps}; ids look like `op:pA-pB:dir`. Journey mode keys are `rt:<routeId>/<i>/<j>/<dep>|…`.
  - `A.arrive(to, {mins, cost, e}, extraLog)`; `A.svg(D, sel, W, H, {z, vb, hl})`; `A.cam`, `A.zoomBy`, `A.focus`. Places gained rail, halt, served and busStop; `D.lines`. The atlas is not in G (cached by seed).
- **Harlow LOC ids:** home, patel, jordan, school, store, library, park, police, mall, hospital, diner, laundromat, underpass, bus, trainyard, harbor (hidden), station, birch.
- **Beat days (remapped per seed):** d1 grade, d3 bully, d4 okafor1, d5 conference, d6 fight6, d7 grandmaCall, d9 bike, d12 moving, d15 juice, d16 bruiseSchool, d17 cps, d19 bigNight.
- **Cast:** Sam; Mom Dana; Rick (randomized); Lily 7 (randomized); Grandma Rose (Cedar Falls, 41 Larkspur Lane); Jordan (mom Tanya); Ms. Okafor; Tyler (the "7" is his jersey number); Mrs. Patel (Newton the beagle); Officer Lowe; Maya; Ms. Ruiz; Wren; Dolores; dex_19; PIP. Birch St: Nia, Marco, Priya, Eli, Theo, Hazel. Harbor House, 212 Wharf St.
- **G fields:** t, phase, loc, s{full,energy,hyg,mood,stress,health,warmth}, money, rel, bag, phone, threads, flags (hasBike default true), heat, reported, revealed, fam, gender, friends, crush, party, hideout, away, awayNotice, net.x, bank, crew, debts, owned, orders, swap, forum, fund, work{apps,gigs}, skills, tx, stats.hoursOut, missingAt, discoveredAt, veh{n,type,at,parts,work,fuel,running,warm,seats,nights,since}, escootBat, lastRide, junkSold, _foundReason, lessons (planned). **No `G.day`** — use `SH.day()`.
- **File landmarks:**
  - phone.js: P.push l.57, P.send l.99, P.incoming l.126, P.open l.146, wallet app.
  - phone2.js: P.notify l.13, V.home l.83, P.V/P.esc/P.hdr l.163.
  - state.js: weatherDay l.25, G.s l.85, SH.ITEMS l.111, addBag l.123, long-run rule ~l.257 (patched).
  - run.js: R.tick l.79, R.foundCheck (heat × LOC vis × 0.2; tracked if phone sharing is on).
  - atlas.js: A.svg(D, sel, W, H) l.101, A.go ~l.155, A.hub l.170 (A.extra hook).
- **Hooks:** `UI.dialog({title, text:[], choices:[{t, sub, cls, fn}]})`; `SH.Endings.show(key, title, sub, paras)`; `SH.advance` (wrapped by many modules); `P.V.x = fn(body)`; `P.extraApps {at, app:[id, icon, name, color]}`; `SH.Actions.list` returns `{acts}` (wrap it); `SH.Atlas.extra` array of `f(place, choices, dark)`; atlas `A.data().places` (id, name, tier, home, pop, biomes), `A.miles`, `A.modes`, `A.go`, `A.hub`, `A.here()`.
- **Part 1 APIs:**
  - SH.Net: x() → queue, inbox, burner, oldInbox; state().mb; spend; canData; buyBurner; nightPack; bundle.
  - SH.Bank: access, pay(amt, desc), state().bal, openCrew, crewAdd, crewTake (vote over $15), borrow, pawn.
  - SH.Catalog: ~110 `SH.ITEMS['x_*']` (ride, big, restricted, adult, vehicle, fix); C.search / byCat / give. Rides: x_kick, x_escoot, x_bikeused, x_bmx, x_bikenew, x_cargo. Car parts: x_carbat, x_tires, x_motoroil, x_sparkplugs.
  - SH.Browser: go(url), B.SITES, B.rnd(seed), reachOut(mode).
  - SH.Forum: post, creep.
  - SH.Shop: order, pickup (ready next day 11:00), listings, swapBuy, doMeet, list, sellMeet.
  - SH.TRANSPORT: averline / cheapride / rail / county {icon, n, rate, base, tiers, rule, strict, rail}.
  - SH.motels(id) → pro / loose / sloppy.
  - SH.Jobs2: apply, watch, work.
  - SH.skill(k): drive (theory ≤ 40), fix, mech, camp, cook, aid, build, biz.
- **Part 2 APIs:**
  - SH.Travel: rides(), wet(), ticket.
  - travel2: removes intercity and bike; adds kick ≤25 mi, escoot (bat × 0.18), bike ≤30, drive (veh running and at === from.id), co_<company> (rail only in rail towns / cities); rain × 1.4.
  - travel3: ticket strictness (averline → found('agent') or turned away; cheapride driver refuses), incident() → soft scare or EndX.trigger; escoot drain; drive fuel, veh.at, drive skill +1.
  - SH.Junk: TYPES, yard(p) (village 1–2 / small 2–3 / town 4 / city 6), open, buy (cash), part (owned part or used at 60%), work (2h, mech), check, fuel ($5 per 10%), sleep (warm; 12+ nights → 15% van trigger). Harlow trainyard: "Walk over to County Auto Salvage".

---

## 8. ERRORS & DEAD ENDS (don't repeat these)

- (Turn 19: in this Arena environment, 17KB writes worked fine; the ≤8KB rule is a precaution, not law.) **Big writes get truncated / time out.** Keep each file ≤ 8KB (writes have been cut at ~1.5–5KB when the conversation is long). `node --check` after every write. To fix truncation: cut at a marker with python and close the IIFE. For big docs, append with bash heredocs in chunks.
- Complex sed / inline python with nested quotes fails → write python to `/tmp/*.py` via a heredoc, using an asserting patch helper (a failed assert aborts all later replacements).
- edit_file fails if the text has already changed → grep first.
- Playwright's bundled chromium lacks libraries → use `/usr/bin/chromium`. If apt and the playwright CDN are blocked: `npm i @sparticuz/chromium@129` in /tmp, run its executablePath() (extracts /tmp/chromium), brotli-decompress bin/al2023.tar.br + swiftshader.tar.br into /tmp/al, and symlink /usr/bin/chromium to a wrapper that sets LD_LIBRARY_PATH=/tmp/al/lib:/tmp/al. After an environment reset run `bash tests/setup.sh` (reinstalls playwright-core).
- **git identity AND remote are lost on every reset** (.git/config isn't snapshotted) → `git config user.name "Small Hours Dev"; git config user.email dev@smallhours.local; git remote add origin https://github.com/rudrachitambare/runawayy-game.git`.
- **(Turn 17+: Arena now has gh/git auth configured, so no token is needed. Push to the session branch.)** Old note: **Push needs a token:** push to `https://x-access-token:<T>@github.com/...` directly, never saved into config. There's no gh CLI, and the Arena GitHub connector didn't show up in the chat's tools.
- `#daycard` blocks clicks on day 1 → tests remove it and hide `#modal`.
- In convo.js, a string setup passed to p.evaluate must be an invoked IIFE.
- EN.found opens a dialog → use `SH.Endings.show`. There's no Map.travelTo → use `SH.travel(id, option)`.
- Engine choices need `text`. Don't cache the phone app list. The random bot never leaves home.
- Hotspot selectors need `:not(.off)`. Quote digit-leading object keys. Use word-boundary regex for name substitution.
- Calling SH.Brain directly needs `c = {turn, mem:{}, used:{}}`; reset `c._fb` in converse and okafor.
- JS precedence: use `!flag && (flag = 1)`.
- Don't reintroduce converse's blocked-topic overwrite of Okafor answers. Guard the "I already told you" handler with `!an.memq`.
- Atlas tests must skip `blocked` modes. Talk tests need ~1.8 s waits.
- CDP synthesizeScrollGesture falsely reports 0 scroll → use Input.dispatchTouchEvent.
- Don't call `C.desc` before it's assigned in catalog.js. `A.svg` needs `(D, selId)`.
- Bank card orders fail if the balance is low at order time (test artifact). Shop pickup is ready the next day at 11:00.
- Before the state.js patch, runs were force-ended after 6 days (never-found endings need the patch).

## 9. RESEARCH (sources and takeaways)
- NRS / familyresourcesinc / lostnmissing: 47% of runaways cite family conflict; many are 10–14; 43% cite physical abuse.
- RHY Act / 45 CFR 1351.24(e): Basic Center shelters give up to 21 days of shelter, food and counseling; family must be contacted within 72h unless that's unsafe (then CPS).
- NRS / youthrights: running away is a status offense; police return the kid home unless the kid says home is unsafe; adults sheltering a runaway can be charged with harboring.
- cbs42 / ourrescue / influenced.org: predators approach runaways within ~48h; stations are risky.
- Amtrak: kids 12 and under can't ride alone; 13–15 only under conditions.
- Santa Clara 2017 study: of high schoolers without stable housing, 42% stayed at a relative's, 29% with a friend, 10% with a bf/gf, 19% in a shelter or on the street. PMC11189619 / HUD Voices of Youth Count: couch surfing dominates youth homelessness.
- PBS / Keene Sentinel / Lubbock 2016: many small towns have no police department (county sheriff / state police, 20+ min backup).
- Prepaid plans 2026: $10 top-ups; Tello 2GB $10; US Mobile 2GB $8; Total $25 = 1GB; Tracfone $25 = 6GB; $25 unlimited on some carriers.
- **Helplines (credits):** US Runaway Safeline 1-800-786-2929 · 988 · UK 116 000 · Childline 0800 1111 · India Childline 1098 · 112.

## 10. COMMIT HISTORY
- ce1dd50 — turn 10 base game (family, friends, atlas, net)
- 149ab03 — Part 1
- c9ae4cf — Part 2 partial
- 33bfd9a — FULLGAME.md full game info
- (next) — FULLMEMORY.md

## 11. HOW TO RESUME IN A NEW CHAT
Say: *"Continue Small Hours from FULLMEMORY.md and FULLGAME.md."* Then: read both files → `bash tests/setup.sh` → re-set git identity and remote → follow section 1 "Immediate next steps" in small files (≤ 8KB each) → test → commit → ask for a token to push.

## Request #21 — "make all the parts" ✅ DONE
Built Parts 2 (rest) through 7; see FULLGAME.md "PARTS 2–7 BUILT" table. Key APIs: `SH.K` (kit.js), `SH.Atlas.mods[]` + `SH.Atlas.noticed`, `SH.Lessons`, `SH.Stores`, `SH.Motels`, `SH.Alley`, `SH.Parents`, `SH.Identity`, `SH.Police`, `SH.Runaways`, `SH.Group`, `SH.Bases`, `SH.Biz`, `SH.World2` (cal/season/halloween/rep/ACH), `SH.NotFound`. State: G.lessons, G.room, G.roomEvt, G.fakeId, G.street, G.pw, G.cover, G.look, G.excuse, G.watch, G.rk, G.rkids (NOT G.crew: that's the bank crew), G.att, G.stay, G.base, G.biz, G.hp, G.helped. Flags used by endings: clerkCalled, fakeCaught, toldParentPlace, charityExposed, creepDiner, goneOffered, goneForGood, trickOrTreat, disguise.
Tests: `node tests/parts.js [n…]` + p1, p1b, p2, e2, bot, cell all pass. (e2 can rarely flake when a random incoming call screen covers a click.)
Next ideas (not started, need "go"): two-change trip planning; balance pass on money and notice numbers after real playtesting.

## Request #22 — "go, also add proper memory to speech engine and understanding and make pip actually useful" ✅ DONE
- **Two-change trips** (`src/routes2.js`): `R.journeys2` searches from → hub1 → hub2 → destination (each hub closer, ≥10 min connections, ≤2 days); `R.journeys` falls back to it when it has fewer than 2 results. Coverage of sampled place pairs went from ~27% to ~56%. The trip label in routes_go lists every change.
- **Speech memory** (`src/mind2.js`, on top of the original mind.js/converse.js/lex.js; mind.js now keys memory by `SH.Mind.who(id, c)`):
  - Each local/clerk/cop/runaway kid is their own person (`local:Name, Place`, `rk_3`).
  - CLAIMS per person in `G.claims[who]`: name, age, from, going, with, parents, story, school, family. Contradictions are caught ("You told me your name was X"; +4 notice for strangers; `rec.caught`); "actually / I mean" counts as a correction.
  - Short answers to the NPC's last question are understood. NPCs never re-ask a claim (`SH.Mind.noReask`), whether in talk replies, openers or texts.
  - "what's my name / how old am I / where am I going" is answered from that person's memory. Core characters know the real name.
  - Small places talk (`G.townTalk[pid]`): the next local may already know your name/story. Strangers react to new claims. Contact summary includes claims.
  - `SH.Brain` is now a Proxy that adds the claims layer on read (re-entrancy guarded with `c._cl`). Assign brains as before.
- **Understanding** (analyze wrapper in mind2.js):
  - More negation ("you're not stupid", "i never ran away"); "don't feel safe" → scared+unsafe; `refuseHome`, `broke`.
  - A name claim ("my name is Jordan") no longer reads as talk about friend Jordan.
  - Parsing of `an.claims`, `an.money`, `an.nights` (week=7, month=30) and `an.nums`; pronoun → `an.ref` (last person mentioned).
- **PIP** (`src/pip2.js`), on the road it covers:
  - Routes to any place (fuzzy names, group cost, warns when a change is in Harlow) and the departure board.
  - Where to sleep, motel tips, where to buy an item (store + price here, or the nearest bigger town).
  - Money runway plus ways to earn, how noticed you are, health/clinic, the Disappear pillars, friends' parents' worry, and coaching for cops/clerks/locals/kids.
  - PIP memory in `G.pipMem` (goal, last topic): "I want to get to X" is saved; "remind me" recalls it.
  - The road plan is short and ordered by need, with the goal's next departure. Unknown input gets a real menu.
  - ◉ suggestions for clerk (price offers based on the motel kind), cop (the excuse already told), local (the cover name/story), rk_*, host_*.
- **Balance** (`src/balance.js`, numbers in `SH.BAL`):
  - Notice now fades daily while you stay (village 12 / small 8 / town 7 / city 6; ×1.5 with a cover, ×1.4 with a room/base, ×0.5 at heat ≥ 60).
  - Familiar-face `A.mods` apply per tier. Towns remember your notice when you come back (−8/day away, `G.noticeAt`), with arrival time kept in `G.hereSince`.
  - Odd jobs pay $7–18.
  - 21-day sim (tests/part11): a village without a cover is found around day 5, with one it settles; a small town with a cover stays around 42; a town reported with a friend, cover and room stays around 48 (before: found on day 9).
- Tests: `tests/part8.js` (trips), `part9.js` (memory + understanding), `part10.js` (PIP), `part11.js` (balance). parts.js now accepts multi-digit part numbers; `TPMAX=n` env raises the print limit. All parts plus p1, p1b, p2, e2, bot and cell pass.
- ⚠️ Lesson: `src/mind.js` already existed (the original Mind). Always `ls`/grep before creating a file.
