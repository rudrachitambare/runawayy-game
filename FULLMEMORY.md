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

## Request #23: group chats with memory (`src/groupchat.js`, tests/part12.js)
- Class chat: remembers topics and who said what (`G.gc[id].log`), holds a grudge after insults until you apologize, answers "what did devon say / who said page 42 / did I say X / catch me up" (recap skips its own recall lines), remembers facts you share (`G.gc.class.facts`) and brings them up the next day.
- While missing: classmates react, and posting where you are raises heat (+14, `toldClassPlace`).
- "the squad" (`crew`) is created once you've met 2+ friends. Each friend answers through their own brain, says what they're really doing (`KIDS[x].hang`) and learns what you share; party members joke that they're right next to you.
- memory.js's unattributed callback lines are filtered out of group threads.

## Request #24: speech engine fixes, memory → actions, useful PIP (`src/talkfix.js`, `src/talkfix2.js`, converse.js followUp, tests/part13.js)
- The bug (Marco transcript): friend questions had no "?" so answers were ignored; repeats were swapped for random topic questions; filler glued "then what" onto a question; "things aren't great" wasn't a feeling; PIP repeated lines.
- Friend thread engine (wraps every `SH.Brain[kid]`, state in `c.mem.th`, persistent in `FR.st(id).rt {asks, where, dec, when}`):
  - run: where → how bad → decision → when. `rt.dec` ('in' / 'help' / 'no') is computed once from knows, rel and risk; asking again restates it.
  - 'in' → `f.wouldRun`; 'help' → `f.offer`; 'no' → `f.worry`, and at 2 worries without a promise `f.mayTell = tomorrow`.
  - "don't tell anyone / promise" → `f.secret` if rel ≥ 25 or they're in.
  - low mood → "what happened? home stuff?" → a yes or story sets `f.knows` (offer at rel ≥ 30). Plans ("wanna draw later?") → `f.plan`.
  - The thread engine's lines are fed into converse's said-list so they aren't repeated.
- Consequences (talkfix2): daily, if `mayTell` is due, the friend's parent calls mom (or heat +8 when you've left) and the friend apologizes (`f.told`). At 7 PM on `rt.when` the friend texts "still on for tonight?". `Mem.greeting` for friends: "are u mad at me?", "are we still doing it?", "u still thinking about the X thing?".
- converse `followUp`: feelings get sympathy (`SH.CONV_LOW`); "go on" only for story-like input; topic questions only stand alone when the talk has stalled; on repeats, no random topic swap.
- PIP ◉: friend-specific pools per thread state (where / how bad / when / tell / decide / are-u-ok / general, using their hobby). Each tone rotates through a history (`_sugH`) so every press changes, and anything you've already said (talk log or text thread) is excluded.

## Request #27: fullscreen maps (`src/mapfull.js`, tests/mapshot.js)
- ⛶ button on the Atlas and AverMaps: landscape on desktop, full-screen portrait on mobile. Esc, the backdrop, or leaving the map exits. Tapping places keeps you in fullscreen.
- Gotcha: on mobile `#right` is `position:fixed`, which creates its own stacking layer. In mapfull, lift `#right` (z 95), hide `#mfBg`, and hide `#top` and `#tabbar`.

## Request #28: "make all the websites 10x better, actually usable. where do u actually book / board?"
- `web_ui.js`: shared site kit (header, tabs, rows, inputs with a place datalist, pills, flash banner).
- `tickets.js`: **real tickets** (`G.tickets`). `SH.Tickets.book(key, destId, {pay:'card'|'cash', age})` returns a code, boarding point (bay or platform plus the depot or station), and changes.
  - Card: PocketPal charge (mom sees it, heat). Cash: reserve now, pay the driver when you board.
  - Strict pro companies refuse under-15 bookings. Lying about your age works online, but the door check still happens.
  - Cash-only companies refuse card payments.
  - States: booked / used / missed / cancelled. Card cancel refunds 90% (pro) or 50% (other companies).
- **Where you board:**
  - Away from home, the 🎫 Board option is in the town menu.
  - In Harlow, it's in the Actions list at the bus depot (`loc 'bus'`) or train station (`loc 'station'`) on the ticket.
  - From home, boarding asks "This is it", then runs `Run.start('ticket')`. It is only allowed within 90 minutes of departure; otherwise a toast says when to come back.
  - Then you wait and `R.take(jr)` runs as usual (conductor checks etc.). Prepaid card legs skip the fare.
- `rides_web.js` / `rides_web2.js`: **AverRides (rides.av)** is the central booking site.
  - Pages: Plan (from/to/when), results, trip page (legs, stops, rules, passengers, payment, Book), My trips, Departures, Companies.
  - Operator `.av` sites now show Book rows.
- `avermaps_web.js`: **AverMaps**.
  - Pan, zoom and pinch; tap a dot to open the place page (rides there and from there, motels, services, signal, police, how much people notice newcomers).
  - Directions page with bookable rides; Nearby filters (motel, wifi, shelter, hospital, no police, quiet, train, rides).
- `web_more.js`: browser home (grouped app tiles, next ticket, recent pages).
  - Seekr instant answers ("bus to X", place names).
  - TubeYou how-to videos; StayFinder booking note ("walk in at the desk").
  - PIP answers "where do I board / my ticket".
- Tests: `tests/part14.js` (booking, boarding from home, a full ride to Cedar Falls, card, age rule, cash-only, missed, cancel, AverMaps, Seekr, company sites, PIP).

## Request #29: "why can't u scroll? I'm on mobile" (`src/mobscroll.js`, tests/mobscroll_test.js)
- Cause: on phones `#center` was a fixed box with a 378px scene plus `#log` squeezed into about 200px. Swiping on the scene or buttons did nothing.
- Fix (CSS ≤760px): `#center` is the scroll container, and `#stage` and `#log` no longer flex, so the scene scrolls away. New lines only scroll into view when they're below the fold (never pushing the line's top off-screen). A "⬆ Scene" pill (`#toScene`) appears after scrolling past 60% of the scene. The title screen also scrolls (`align-items:safe center`).
- Testing touch scroll: `Input.synthesizeScrollGesture` does NOT work in this headless Chromium. Use CDP `Input.dispatchTouchEvent` touchStart/touchMove/touchEnd (see mobscroll_test.js). Note: #daycard covers everything for 4.2s after a new day.
- GitHub Pages is live from branch arena/01a0dd5d-runawayy-game: https://rudrachitambare.github.io/runawayy-game/ (root index.html redirects to SmallHours.html). It can't be reached from the sandbox (TLS error), so test SmallHours.html locally.

## Request #30: "fix bugs, NLP + context, keep shoplifting but no caught→home, old v1 characters, a stop for non-official transport"
- **Old v1 characters** (`src/famfix.js`, tests/famscan.js): the rolled family (mom, the adult man, sister, grandma, surnames, role) only reached text that went through `SH.nm`. The scene header ("Rick: asleep · Lily: home"), side panel, props, phone photos/notes and every ending's AFTER section leaked the defaults (73 leaks in the scan).
  - Fix: a MutationObserver runs all page text and title/placeholder/aria-label/alt through `SH.nm`, and canvas `fillText`/`strokeText`/`measureText` are wrapped too. It does nothing when the family matches the defaults. famscan now reports 0 leaks.
  - Jordan is canon (current best friend), not a leak.
- **Shoplifting** stays. On the run, getting caught is a clerk scene with 3 choices (put it back / "I'm just hungry" / drop it and run). There is **no Found ending** from shoplifting any more (the old `heat > 30 → Endings.found('security')` is gone). At home it's unchanged (the clerk scene plus suspicion).
- **Route 9 Pickup** (`src/pickup.js`, LOC `pickup`, x585 y318, open 24h, vis 0.5): the Gas-N-Go gravel lot where every **unofficial** road service boards.
  - `R.informal(o)` = tempo / minivan / car, or bus with style ≠ pro. It stays at the Greyline depot: Averline (express), County Transit, pro buses. Rail uses the station.
  - routes.js adds a Harlow feeder route for any informal operator that doesn't serve Harlow. This runs after all normal generation, so existing routes and timetables are unchanged.
  - `T.point` for Harlow plus an informal op returns "Route 9 pickup (the crate bench…)" with loc 'pickup'. Tickets board there.
  - Departures boards in Harlow are per spot. `R.only` is a filter applied inside `R.board`, **before** the 12-item cap.
  - Actions: 🚏 Rides leaving from here (at home it goes through "This is it" → `Run.start('pickup')` → board), Read the painted board, Ask a driver, Gas-N-Go chips and restroom, wait on the crate bench.
  - Scene art: `SH.ScenePL.pickup` (scene2.js now exports `SH.ScenePL`).
- **PIP context** (`src/pip_ctx.js`, tests/part16.js): `G.pipCtx {place, jr{key,to}, intent, when, at}`, expires after 12 game hours.
  - Follow-ups: how much / when / where do I get on / direct? / check IDs? / cheaper / faster (says so when it's already the cheapest) / and tonight|tomorrow|at 5pm / what about X / "X?" / book it (opens the rides.av trip).
  - "there/it/that town" means the last place. Place facts: motel, wifi/signal, police, hospital, shelter, stores, how far, tell me about.
  - `PIP.placeIn(text)` finds towns anywhere in a sentence, with Levenshtein typos ("birch crossig" → Birch Crossing, and it says it's guessing). Slang: tmrw/tonite/wher/wen….
  - Works in Harlow too. "my ticket" is passed through to web_more.
- Tests: part15 (pickup, per-spot boards, shoplift), part16 (PIP context), famscan.js. All parts 2–16 pass; bot runs have 0 errors.
- Sandbox resets happen mid-session: re-run the chromium setup, and `git fetch; git reset <pushed sha>` (mixed) when HEAD shows d467fc4.

## Requests #31–33: audit, then "away towns must be real places like Harlow, not a menu" (user asleep; I played and fixed it myself)
- Turn 31 audit correction: the suspected "family bug" (the intro showing a different story/family than the game) was **not a game bug**. It came from comparing two separate browser sessions (look.js vs drive.js), each with its own random seed.
- **Town system** (loaded after famfix.js): `town_gen.js` (SH.Town: procedural map per place from the atlas data; locations main/stop/gas/diner/library/church/park/laundromat/police/clinic/motel/work/edge/station/grandma/shelter/backst by tier and services; townies = atlas people + staff, ids `tw_<pid>_*`), `town_text.js` (arrival, walk lines, blurbs, notice board, work text, all time/weather/biome-aware), `town_play.js` (arrive into a real spot, per-location actions, walking/city-bus travel, work, library computer, timetables, sleep spots), `town_talk.js` (one townie brain: remembers name/age/cover story, never re-asks, asks "who's your aunt?" in small places, notices you faster once you're reported; the "too friendly" stranger is the danger and a gut "no" is right), `town_map.js` (town map + header + label collision), `town_art.js` (scene art `tw_*`).
- `A.arrive` calls `SH.Town.enter`. Town travel **bypasses** base `SH.travel`/passBy so no Harlow text leaks. Atlas biomes normalized by `TW.biome()` (coast, hill country, forest, lakeshore, river valley, prairie, farmland → coast/hills/forest/lake/river/fields).
- Walk minutes accumulate (`g._twc`) so a 3-min walk isn't a 10-min clock jump.
- Bus stop timetable shows road services only; station shows trains only (R.board wrapper sets `R.only` inside); the Atlas hub board still shows all.
- Notice board "ask for X at the <work>" uses the real foreman's name and guarantees that job once.
- Walking up to Grandma's door has its own ending intro (`Endings.grandma('walk')`); grandma name in town text uses `G.fam.gma`.
- Townie names never collide with Sam's family/Harlow regulars. Church/work roles name the real building; city librarians aren't part-time.
- mind2: townies (`tw_`) are strangers (don't know Sam's real name); brain replies can set `ack:1` to skip the generic "12. Huh." echo.
- Bugs fixed on the way: **G.room collision** (Harlow sub-room string 'bedroom' vs motel room object) made endings `Checkout Time`/`Room 14` fire with "undefined", gave the motel achievement for free, and crashed EndX; all guarded with `typeof g.room === 'object'`. Mobile map tab opened off-screen when the story log was scrolled (mobile.js now parks #center scroll while on the map tab). Atlas card no longer shows people's moods (spoiler). Junkyard "Hollis barn" (family surname leak) → Pruitt.
- Tests: tests/drive.js + d.sh (interactive driver), random away-town bot runs in the driver: 0 page errors after fixes. parts.js and bot.js d/m: 0 errors.
- Known leftovers: the floating scene "Map" chip overlaps the map's Close button (pre-existing). The random bot mostly ends in "The Ride Home" because it clicks everything; not balanced yet for real play.
## Requests #34–36: polish + NLP context, then "leaving Harlow = running away, friends convincible, L = back, scroll long lists"
- Turn 35: map chip vs map Close fixed (style3.css #mapWrap z7). Townie topical engine + cover stories in town_talk.js; identity cover set by townies. `src/ctx2.js` (after town_art.js): conversation history per convo (`I` strong intents + `meta`), "what did I just ask / what did you say" recall with gist(), "why not" answers (WHY table), follow-up carry ("what about tomorrow?" rewrites to the last strong question; pending cached because NLP.analyze runs more than once per say), a carried follow-up landing on an already-given answer becomes "Same answer, I'm afraid. <first sentence>". mind.js filler 'open' answer no longer echoes questions.
- Turn 36: `src/fix34.js` (last script): A.arrive outermost wrapper starts `SH.Run.start('leftTown')` when phase is 'home' and the destination isn't home (run.js has the leftTown log lines). **L key** = `SH.goBack()`: modal Back/Close/Never mind/etc. button → talk Leave (only when not typing) → fullmap → map → stage pop → allopen → phone back. Dialogs with ≥4 choices and no back-ish choice get an automatic "Back" (opt out with `o.noBack`). Dialog `.mchoices` scroll (overflow auto, touch, hidden scrollbar, bottom fade mask `.more`).
- Turn 36: `src/friends2.js` (after talkfix2.js): `FR.TROUBLE` — every friend has one of two troubles (seeded): nia Detroit move/divorce or brother in charge; marco food truck/rent or sent to uncle in Texas; priya failed test + forged signature or over-scheduled; eli dad gone weeks/empty fridge or 5th school move; theo dad withholds dinner after losses or cut from team over math; hazel eviction notice or dad working doubles. They tell you when asked how they are/about home (`f.shared`). Persuasion `f.pull` (never shown): start = knows 15 + (rel−30)/2 + sev (half if not shared) + risk·30; arguments once each: their trouble keywords +25 (needs shared), plan +15 (+10 if money ≥30 / tickets / grandmaAddr), together +12, can-go-back +8; pushing/insults −15. Threshold 60 (+10 strict family). Crossing it sets wouldRun + rt.dec 'in' (replaces talkfix's dice). Below it they acknowledge and say what's still bothering them. First refusal gets a hint that part of them wants to. FR.invite is a guaranteed yes when wouldRun (strict parent can take the phone 12%: "try tomorrow"). Worse trouble slows homesickness.

## Request #37: "do those still left. jordan has problems too, offers a place, if u say no he offers to come. multi-clause sentences break the engine"
- `src/friends3.js` (after fix34.js): Jordan flow: mention running/staying → garage offer (`f.offered`, flag jordanGarage); refuse (nah / your mom would call / they'd find me…) → "then i'm coming with u" + his trouble (`f.asksCome`); yes → `f.wouldRun`, joins now (Harlow run phase) or takes the bus (away); no → `asksCome='no'`. Jordan offers food/hoodie on hungry/cold. `FR.KIDS.jordan` registered in friends2.js (extra:true; not in friends.js IDS, so no Birch Street knock/metIds). `TR.jordan`: parents whisper-fighting since dad's hours got cut / moving to Ohio in December. host_jordan meta + brain alias to tanya (Mrs. Pike). Harlow action "Text Jordan: i left. come with?" once he said yes.
- Friends meet you in other towns: "You & your group" (K.me) → `FR.invite2(id)`; `G.frComing {id,pid,at}` (bus = miles·2.2+50, min 75; after 21:00 → first bus 7 AM). SH.advance wrapper joins on arrival (`FR.joinNow(id,'bus')`) or retargets +90 min if you moved.
- `src/clauses.js` (last script, outermost SH.Brain Proxy): splits lines into clauses (sentences; ", and/but/also/so/plus"; " and <clause start>"; "because/if…" stays attached; lone "no/ok/thanks" joins the next), groups same-topic clauses (shelter/run, food, cold, money, feelings, askthem), answers the top 3 by priority in said order through the same brain, merges (fillers dropped, no duplicates, one question per turn, ~420 char cap; skipped parts keep fx/narr). Strips a leading greeting before a request. Sets `c._turnRaw/_turnId` so friends2 weighs all persuasion arguments at once and answers once.
- town_talk.js: ordering from counter staff (diner/gas/cafe; laundromat drinks only): MENU with prices, TW.pay, feeds/warms; short on money → one freebie from kind staff.
- Found-rate tuning (balance.js): fade/day village 20, small 18, town 16, city 14; familiar face village [[3,.3],[2,.45],[1,.65]], small [[3,.35],[2,.5],[1,.7]], town [[4,.45],[2,.6],[1,.8]], city [[4,.55],[2,.7],[1,.85]]; hotX 0.7. sim.drv.js now idles to 21:00 and sleeps at the edge: careful village run levels ~50, town ~35–45; a busy 7-place small-town day still climbs slowly.

## Request #38: "about 10% of village should have internet. they shouldn't care about missing kids, it's reality. continue"
- cell.js: village `online` 0.08–0.12 (~1 in 10), `care` 0 (online villagers scroll past missing-kid posts) → NT.person is only 'none'/'online' in villages; `NT.posterMult(village)` = 0.8 (being reported doesn't raise village notice); new `NT.knowsFace(p, who)` (village false; small → person 'cares'; town/city true).
- town_talk.js: "Do I know you from somewhere / the Facebook thing" recognition only if `seen(q)` (NT.knowsFace). Villages can still call on a kid alone on a school day (oddness, not news). Village townies answer "do you have internet?" and "seen the missing kid posts?" by their own net status (separate mem flags netTalk / missTalk).
- town_text.js: village arrival worry line says hardly anyone out here is online; paper posters in villages rare (6% vs 30%), post-office board shows your poster in villages only after day 4. balance.js: heat doesn't slow village fade.
- Polish: village bus arrival "taillights" only at night (dust by day); PIP route ops collapse repeats ("County Transit (one change)"); closed gas station has no canopy glow / lit sign price.

## Request #39: "any more suggestions; villages: gather stone/branches/logs lying around to build a small shack (still counts as campsite in endings); resources can be bought from a nearby farmer or the main road"
- `src/shack.js` (after friends3.js). Villages + small towns only. Pile per town `G.res[pid]` {branch, log, stone, plank, straw, rope, tin, nail, tarp} (not in the backpack).
- Edge of town (daylight): gather branches (40 min, 4–7), drag a log (60 min, max 2/day/town), carry stones (40 min, 5–9); rain ×1.5 time, never blocked; notice k 0.02–0.03. "Walk out to the <Farmer> place" (20 min, 7–19): buy 4 boards $4, straw $4, twine $2, roofing tin $6, nails $2; work once/day: stack hay 2h ($10 or 6 boards + straw), muck stalls 1.5h ($8 or 2 straw + twine); first visit "Whose kid are you?" (notice 0.02).
- Main road: gas station hardware shelf (tarp $8, rope $3, nails $3); main street "Check the FREE pile" once/day (planks / tin / tarp / nothing).
- Build (daylight) = base `G.base {type:'camp', shack:true, …}`; parts are pushed into `SH.Bases.UPS` as upgrades (so bases.js fx/sleep/threats work): sh_frame (2 logs + 6 branches) → sh_walls (16 branches | 6 boards + 6 branches; warm+hide), sh_roof (tin | tarp | 8 boards + straw; dry), sh_bed (2 straw | 12 branches; rest+warm), sh_fire (10 stones; warm+mood), sh_door (4 boards + twine + nails; safe, after walls), sh_footing (16 stones; warm+critter, after walls). K.D wrapper hides shack parts from bases.js "Fix it up" (store upgrades still work on the shack). Blocked if a base exists elsewhere or a barn/building base here. Edge shows "🛖 Build a shack / Your shack" and at night "Sleep in your shack" (Bases.sleep).
- Endings: counts as the camp (goneCamp "The Clearing" needs ≥4 upgrades; shack variant first paragraph; ranger/found camp endings unchanged).


## 40. Village life, trades, quiet days, weather, "Keep living it" (turn 40)
Files: `src/village_life.js`, `src/later.js` (both loaded right after shack.js); edits in shack.js and notfound.js.
- Farmer work (shack.js `work`): always pays cash ($10 hay / $8 stalls), then offers the materials ("Take it" / "No thanks"). Declining bumps village warmth.
- Friends at the shack (shack.js): if `K.party()` is non-empty, build time ×0.6, gathering gets more (+3 branches, +1 log, +4 stones per friend), and a friend line is added (FLINE build/gather).
- `SH.Village` (village_life.js): `G.vill[pid] = {pts, perks[], wk, days, farmDrop}`. K.daily counts days in a village or small town; every 7 days one perk unlocks (order farm, diner, gas, nod, church, sorted by visit points; `TW.onArrive` bumps points by location kind). Perks:
  - farm: 3 boards + 1 straw a week;
  - diner: a free plate once a day;
  - gas: a free hot dog and +45% battery once a day;
  - church: a basement shower once a day, plus the blanket flag `vBlanket` (+10 warmth a day at base);
  - nod: notice falls.
  - Also A.mods ×(1 − 0.05·perks − 0.1 if nod), minimum 0.7. Warm people greet you. NO ending (user rule).
- Trades: new pile keys walnut, apple, greens, ramp, morel, berry, fish, spoon, line, knife (added to `SH.Shack.NAMES`).
  - Forage is once a day, by month and biome.
  - Fishing needs `line` ($3 kit at the gas station, water biomes only).
  - Whittling needs `knife` ($7) and a branch, and works at night with a fire ring.
  - You can eat from the pile, and cook fish at the fire ring.
  - Sell at the farm stand (`SH.Village.sell`, inside the farm dialog) or at a main-road card table (once a day, ×1.3 price, notice 0.12).
  - Edge: "Read the sky" (80% accurate tomorrow).
- Quiet days: `K.me` "⏩ Let some quiet days go by" at your base (heat <60, notice <55, food or money) for 3, 7 or 14 days. Each day simulates meals ($3.50 each, or pile food), awake hours, chores (spoons, forage, fish), a notice roll, and a 9h sleep. Stats are kept sane each night.
  - While it runs, `SH.UI.dialog` is intercepted: calm popups auto-pick their first calm choice and are listed under "Along the way"; anything matching DANGER stops the days and is shown for real.
  - Ends with a summary dialog (html).
- Phone Weather (`P.V.weather`) shows the current town, 5 days, and "FOR YOU" advice (freeze vs your base's warmth, rain vs your roof). Offline away from home it shows the cached forecast (`G._wx`) or nothing.
- "Keep living it" (later.js): after any 'gone' ending, the button `#keepLiving` sets `G.later = {first, firstTitle, t0, until: +120 days, beat}`, un-ends the game, and sends phase back to run.
  - K.me offers "🌱 Stop here (second ending)"; there are monthly log beats, and at 120 days `finish(true)` runs.
  - The second ending is `X.trigger('later')`: laterShort (<21 d, p6), laterShack (≥5 shack parts here, p5), laterFriends, laterBase, laterMoney (≥$300), laterSpring (fallback). Being found also counts as the second ending.
  - The second ending gets a "SECOND ENDING · N DAYS AFTER …" banner. Once per run. "Disappear for good" is hidden while `G.later` is set.
  - Never-found (gone and later) ending screens now replace the generic "After" section with never-found aftermath text.

## 41. More story: village stories, home, calendar (turn 41; user asked for "all")
File: `src/tales.js`, loaded after later.js.
- State: `G.tale = {q, done, kid, dog, cover, cards, lastCard}`. `SH.Tale = {pending, show, queue}`.
- Scenes are queued from K.hourly and shown after `SH.UI.afterAction` when nothing else is open (no modal, no talk, no quiet days). `village_life.js` exports `V.quietOn()`, and quiet days stop with "Something came up" when a scene is pending. Log-only scenes (search, drawing, vigil, cold, quiet) run immediately. The dedupe key is id + pid + key.
- Village stories (villages and small towns):
  - The kid your age, `kidOf(p)`, six steps, after school when you have a base or pile here. Truth or lie. The deputy warning (−12 notice), the emergency-kit socks, the "say bye" promise (flag kidPromise) or the purple coat in winter. "Go away" ends it.
  - The farmer's missing dog, after meeting the farmer and 5+ days: finding it gives a cover story (`G.tale.cover[pid]`, notice ×0.85).
  - The diner lady's son Danny (needs the diner perk and 9+ days); flag promisedCall.
  - The harvest supper (a fall Saturday at 4 PM).
  - The storm night at base: the shack holds with a roof and 2+ warmth; otherwise the farmer's truck (if you've met them) or the church porch.
- Home (days missing): 3 sibling message, 6 search party, 9 mom's plea (flag toldSafe, −15 heat), 13 stepdad (a log line if rickGone), 18 drawing, 24 mom's email reply (needs toldSafe; flag momWrote), 30 vigil, 42 case goes cold, 60 sibling's birthday (mail a gift), 90 quiet. Wording depends on whether you're online (phone) or offline (overheard in town).
- Postcards: at an open gas station while missing, $1, once a week, +3 heat, and `cards++`.
- Calendar: first snow, Thanksgiving (4th Thursday of November), Christmas Eve (a call home sets flag calledHome, +10 heat), New Year's Eve, and the first warm spring day (the stone footing matters).
- New later endings: laterCall (p7, calledHome) and laterPostcards (p5, 3+ cards). The other later endings get a line about the kid (if you told the kid the truth) and about Mom's emails (momWrote). The never-found "After" section's Mom line changes if you kept in contact.

## 42. No inspector in villages; findable hair dye (turn 42)
- User: no city inspector (or any stand-in) in villages; the "Condemned" ending must not happen in villages.
  - bases.js sleep(): the 'found' threat is filtered out for building bases when p.tier === 'village'.
  - endx_more.js: fBaseBuilding requires c.tier !== 'village'.
  - Bigger places are unchanged.
- Hair dye was hard to find. The dye is catalog category 'clothes', so pharmacies and supermarkets never stocked it, and village general stores randomly dropped a third of their items.
  - shops.js `stock()`: KEEP = x_dye, x_glasses, x_cap, x_beanie are always stocked at general stores, pharmacies and supermarkets. Villages never drop KEEP items or health items.
  - village_life.js: every gas station (all tiers) has "Buy box hair dye $12" and "Buy clear-lens reading glasses $11" via `SH.Catalog.give`. They are hidden once owned or used.
  - The identity.js hints now name the right places.

## 43. Villages don't care; friends say yes; items work (turn 43)
- USER RULE: nobody in a village cares about a runaway kid. No police in villages.
  - `src/village_calm.js` (loaded after tales.js):
    - `A.noticed` and `TW.notice` do nothing when the tier is village; awayNotice resets to 0 on arriving in a village.
    - `SH.Police.stop` is skipped.
    - `EN.found(reason)` is cancelled in a village unless it is chosen (`G._vol` is set by the call-the-sheriff actions in town_play.js and atlas.js, and by "tell the clerk" in town_map.js) or the reason is in CHOSEN (self, host, exhausted, harbor, grandma, cedarLost).
    - Queued `found` events are dropped in villages.
    - `SH.inVillage()`.
  - endx_more fVillageStore is disabled.
  - tales.js: the kid's "deputy" scene was rewritten (dad changes the channel; nobody here cares).
- Friends: every message about running away counts (`f.runAsks`). The 2nd gets a wavering line; the 3rd is a guaranteed yes (friends2.js).
  - Jordan (friends3.js): after the garage offer, any "come with me / pls" message means yes.
  - FR.invite2 texts: the 3rd invite is a guaranteed yes (`f.inv`).
- Items (village_calm.js wraps `SH.Actions.useItem`):
  - hygiene items (soap 6 uses, others 8, `G.useLeft`) work anywhere (sink, bottle or creek) at hygiene ×2.5;
  - the toothbrush works anywhere (+8);
  - food eats properly (catalog food ×1.6, multi-serving packs use `uses`) and says how full you feel (no numbers).

## #44 — Dial 911 instead of a sheriff button; nothing fakes an effect (turn 44)
- User: no separate "Call the sheriff" button; to call the police you dial 100 or 911 on the phone.
  Removed the button from town_play.js and atlas.js. New `src/dialer.js`: keypad on top of the Phone app's contacts (`P.dial(n)`).
  911/100/112/999 → dispatcher dialog (works with no data or in airplane mode, needs battery). Run phase: "I ran away, come get me" /
  "I'm not safe" → `G._vol=1` then `found('police')`, or `'sheriff'` where there's no station (villages allow it because it's chosen); "Hang up".
  At home: "Tell them about Rick" (at night → EN.call911 ending; by day → logged, flag toldPolice) or "wrong number". 988 or 1-800-786-2929 → Lighthouse. Anything else → not in service.
- User: find anything that says it does something but doesn't. Audits (tests/audit.drv.js, tests/audit_items.drv.js) found that catalog
  item props were never read. New `src/gear.js`:
  - warm clothes add insulation while they're in the bag (capped +55); sleeping bag and mat count when sleeping (bag, or owned at your base);
  - rain jacket (and a tarp when sleeping) soften rain;
  - band-aids and first-aid kit heal and treat blisters; cold medicine, pain reliever, inhaler2 and sunscreen work; toilet paper and pads are hygiene items;
  - energy drink gives energy; bottled water is drunk, not eaten;
  - camp stove cooks food from the bag (10 fuel uses); filter straw drinks from creeks outdoors;
  - flashlight or lantern eases nights outside; tarp and paracord go on the shack pile at your base;
  - wearables' toast now says what they're actually doing.
- #44b: user said a deputy should NOT come to a village at all, not even when you call. village_calm CHOSEN is now only harbor, grandma and cedarLost.
  `_vol` no longer overrides it in villages. Dialing 911 in a village reaches county dispatch: "I'll pass it along", and nobody comes.
  found('exhausted') in a village: a villager feeds you instead (stats up, no ending). The car-creep "tell the clerk" in a village: she stares the car away, and nobody calls anyone.
  Also fixed: dialer and gear used the nonexistent SH.Actions.here; they now use SH.Atlas.here.

## #45 — Story newest-first; the floating "⬆ Scene" button is gone (turn 45)
- User: "reset scroll where it doesn't belong" and the story text should be newest first, older as you go down.
- ui2.js UI.log/restoreLog: the #log DOM is now [day header][newest batch .lb][older .lb]… A batch holds all lines from one action (split by afterAction via newBatch),
  and lines inside a batch stay in reading order. G.log entries carry a 4th field, the batch id (G.logB). Trimming removes the oldest (last) children.
- mobscroll.js: the "⬆ Scene" pill is removed (sync deletes it; CSS hides #toScene). reveal() brings the newest batch into view at the top, not the bottom.
  mobile.js story tab: scrollTop 0. style3.css: .lb divider; #log top-fade mask removed so the newest line isn't faded.

## #46 — No theft, for real (turn 46)
- User lost a toothbrush and $33: that was the run.js sleep-outside robbery (40% roll took 2 items and 60% of cash). Replaced with a scare where a stranger
  shuffles off and nothing is taken. "Older kids": Keep walking no longer loses an item, and "Give them your snacks" is now "Offer them a snack" (one item, by choice, they soften).
- Kept (by choice or warned): Rick's drunk "I'm saving it" at home takes $20 (hustle.js:24, abuse story); the marketplace scam only happens if you pay after a warning.
