# SMALL HOURS — Full Game Info

A narrative life-sim for **16+** players about **Sam**, a troubled 12-year-old, in the days/weeks before running away from home — and what happens after.
Vanilla JS + canvas (no React). Entertainment, **not** a guide for real runaways. Endings never glamorize running away and always leave a path to safe adults.

**Play:** open `src/index.html` (loads separate files) or the single-file build `SmallHours.html` (`python3 build.py`).

---

## 1. What is BUILT (as of turn 10)

### Core
- **Every playthrough differs:** seeded story (catalyst, trait, 4 openings, 10 subplots, remapped story beats, weather).
- **Data-driven events** (conditions/effects), no "GOOD +5" numbers — you read the world's reactions.
- **Walkable stage UI** with hotspots, desktop + mobile layouts, hidden scrollbars.
- **Random town layout** of Harlow (home, school, store, library, park, police, mall, hospital, diner, laundromat, underpass, bus, trainyard, station, Birch Street, hidden Harbor House).
- **Needs:** fullness, energy, hygiene, mood, stress, health; money; grades; inhaler.
- **Jobs & hustles** before running; railway option; rewind to the moment you left home (AI memory resets correctly).

### Free-text conversation AI
- Type anything; NLP + big vocabulary + lexicon + "mind" (per-NPC memory of what you told them, topics, tone).
- Conversation manager avoids "cursed" loops (no asking "how's home" after you already told them).
- **PIP** — a small sarcastic AI on the phone that whispers suggestions. Self-harm text makes PIP drop the sarcasm and show real resources.

### Characters
- Mom, the adult man in the house (stepdad / Mom's boyfriend / uncle — **randomized name & role**), little sister (random name/age), Grandma (Cedar Falls), Jordan, Ms. Okafor (counselor), Tyler (bully), Mrs. Patel, Maya, Ms. Ruiz, Wren, Dolores, Officer Lowe, dex_19 (non-graphic grooming storyline — Sam always ends up safe).
- **Start screen:** pick **boy / girl / nonbinary**; family preview + 🎲 reroll. All text adapts (pronouns, mijo/mija, brother/sister).
- **Six friends on Birch Street:** Nia (artist), Marco (clown/skater), Priya (science), Eli (gamer), Theo (basketball), Hazel (climber). Each has routines, likes/dislikes, compatibility, free-text chat.
- **Friends' parents** (basic): Dr. Nair, Mrs. Delgado, etc. Knock on their door during the run → free-text talk → they call your mom, let you stay a night, or (if you tell the truth) start kin placement.
- **Crush / relationship system:** innocent, same-age (ask out → yes / gentle no).

### Running away
- Run alone, or **text friends to come with** (multiple friends can join the party; groups get noticed faster).
- **Stay with a friend** path + new ending **friendFamily** (kin placement).
- 16 endings: found, foundSafe, foundHome, foundMom, grandma, walkHome, garage, harbor, collapse, dex, patel, call911, stayed, listened, quiet, friendFamily.

### Phone
- Messages, calls, Chirp (social), Music, Skyforge (game), PIP, **Atlas**, **Network**, location sharing, battery, airplane mode.
- **Atlas app:** procedurally generated country **Averland** — 37 places (cities, towns, small towns, villages). Each has population, economy, jobs, kid jobs, named locals, services (hospital/shelter/library/wifi/bus), danger & notice levels. **Police depend on size** — villages have no police, only a county sheriff 20–45 min away.
  - Travel: walk ≤9 mi, bike ≤22 mi, county bus ≤40 mi. Intercity bus/train refuses under-13s traveling alone.
  - Town hub: walk around (danger events), buy food, find wifi, work (daytime only), talk to locals (free text), sleep rough. A **notice meter** fills (faster in small towns / with a group).
- **Network app:** Mom's prepaid plan with limited data; apps consume data; Wi-Fi per location (some password-locked); QuikMart top-up cards ($10=2GB, $15=5GB, $25=15GB). Mom may cut the line after you've been missing a while.

---

## 2. PLANNED — full feature list (~91 features, agreed with the player)

### Design rules the player set
- **No theft anywhere** (nobody steals from you, no stolen goods, friends don't take money).
- **No group splits, no jealousy** — emotional attachment keeps the group together.
- Too many people in a motel room is **not** a reason to be kicked out.
- **Danger pop-ups:** a clear "⚠️ This is risky" warning before any dangerous choice. You still decide.
- You can try anything; the world reacts realistically.

### A. Phone & data
1. **Messages and calls use data** (text tiny, photo more, voice medium, video a lot). No data/wifi → messages wait on "sending…".
2. Recharge options: top-up cards, monthly bundles, night packs, data-saver mode.
3. Wi-Fi varies: free public (drops), motel wifi, password-locked, shady hotspots that leak location.
4. Burner phone (new number, you choose who gets it).
5. Phone risks: battery, cracked screen, location sharing, Mom tracking, factory reset.
6. **Friend Finder subscription** — see friends' live locations on the map (monthly, needs data).
7. **Free App Lock** — PIN any app.
8. **TubeYou** video app (tutorials incl. driving theory; uses a lot of data).

### B. Web browser (fake sites)
9. Search engine (results depend on town).
10. Local news — missing posters appear, update, get shared, comments.
11. Weather site (forecasts, rain/cold alerts).
12. Transport company sites (timetables, booking, delays, age rules).
13. Motel listing sites (fake photos, fake + real reviews).
14. Marketplace (used scooters/bikes/gear, scams, red-flag sellers).
15. Online store for **ANY product**, delivered to pickup lockers / motel / store.
16. Forums (runaway posts, camping tips, abandoned places, creeps).
17. **Job boards with real jobs** (dishwasher, farm hand, dog walker, shelf stacker, car wash, delivery helper, tutoring) with realistic pay/hours/requirements — many say 16+ / work permit, so Sam must find ones that will take a 12-year-old.
18. Chirp social integration (friends post about you, Mom's pleas, strangers share posters).
19. **Help sites** (helplines, shelters). Using them ends the run in a **bittersweet, costly** way: phone handed over, contact with the group cut for a while, possibly back in the same house (with a social worker checking in), or with Grandma, or foster care. Honest about what you lost; friends can reach out again later. *(Agreed compromise — help is costly but never framed as ruin.)*
20. Browser history is visible if someone gets your phone.
21. Maps site (routes, satellite view, junkyard locations).
22. Charity / crowdfunding pages (fake ones can be exposed).

### C. Shopping — buy ANY product
23. Universal shop across every category: food, clothes, gear, tools, **electronics** (chargers, power banks, speakers, lights, heaters, fans, gaming, solar kits), medicine, hygiene, toys, sports, camping, disguises, vehicle parts, fuel, locks, batteries, gifts.
24. Prices vary by town size, store type (supermarket / gas station / corner shop / alley stall), condition (new/used/broken).
25. Some stores refuse to sell to kids (medicine, lighters, knives, fuel).
26. **Adult-only items can go in the cart, but Sam refuses:** "nope. I'm not that braindead."
27. Carry limits: backpack, duffel, cargo bike, vehicle trunk.

### D. Money & banking
28. **Cash-only by default** (wallet, shoebox, socks; can be lost or soaked — never stolen).
29. **Digital banking locked unless data is recharged**; logins from new towns may trigger alerts.
30. **Group account:** balance, savings pot, goals, contribution log, votes on big purchases.
31. Personal savings vs pocket money.
32. Pawn shops (quick cash, bad rates).
33. Lending/owing — debts are remembered.

### E. Transport
34. Multiple companies:
    - **Averline Coaches** — professional, strict ID, refuses kids.
    - **CheapRide** — sloppy, cheap, late, patchy ticket checks.
    - **Regional Rail** — strict, conductor rounds.
    - **County Bus** — local, cheap, no questions.
    - **Night buses** — risky.
    - **Rideshare apps** — shouldn't take kids; some drivers do (risk).
35. Dynamic prices, delays, missed connections, lost luggage.
36. **Rain slows every mode** (still possible, slower, more crash/sickness risk).
37. **Buy scooters** (manual cheap vs electric expensive, needs charging) **and bikes** (BMX, used, new, cargo). Flat tires, repairs.
38. **Junkyard vehicles** in every town (size varies): car, tempo, minivan, old camper. Fix battery/tires/engine, fuel. Use as a **mobile base** (sleep, storage, charging). Driving at 12 = very high crash/spotted/stopped risk unless driving skill is learned.
39. **Driving skill:** TubeYou theory + **a farmer teaching on private farmland in a village** (legal on private land) + go-kart tracks in bigger towns. Choose which friend in the group learns.
40. Hitchhiking (dangerous; triggers safety events).

### E2. Transport network & a bigger Averland ✅ BUILT (turn 19): see §6 progress log for what shipped
**Why:** right now companies "go anywhere" within their allowed town sizes. There are no real routes, stops or departure times, and only 37 places.

**Bigger Atlas (seeded, same every replay of a seed):**
- About **110 places** instead of 37: 5 cities · 15 towns · 30 small towns · 60 villages. Villages cluster around market towns. Farm hamlets sit near the coast, forest and prairie.
- A **road graph**:
  - Highways link cities and towns. County roads link small towns. Dirt and farm roads reach villages.
  - Distances follow the road, not a straight line.
- **Rail lines:** 2–3 lines through the cities and some towns. Most places have no station.
- The Atlas map gets zoom and pan (like the Harlow map), road and rail layers, a search box, and route lines drawn for the ride you pick.
- New places reuse the tier data: police by size, jobs, people, services, junkyard size, internet share in villages.

**7 randomized travel companies per story** (added on top of Averline / CheapRide / Regional Rail / County Transit):
- Every seed draws 7 operators from name pools, so names, colors and slogans change each playthrough.
- Each gets a **vehicle type**:
  - 🚐 **Tempo traveller**: 12–17 seats, village ↔ market town, leaves when full.
  - 🚙 **Minivan shuttle**: 7 seats, small town ↔ town, cheap, a few runs a day.
  - 🚗 **Shared car / taxi-pool**: 4 seats, any short hop, pricey, driver's choice of route.
  - 🚌 **Bus line**: 40+ seats, town ↔ city, fixed timetable.
  - 🚆 **Train**: **rare**, at most 1 of the 7. Only on rail lines, fast, strict.
- Each gets a **style**:
  - **Professional**: timetable kept, ID and age rules enforced, calls someone about a kid alone.
  - **Unprofessional**: late, overbooked, rules on paper only, the driver decides.
  - **Sketchy but safe**: cash only, no questions, rattly, smoky, blasting radio, stops wherever. The operator is **never** the danger: no theft, nothing bad from the crew. The risks are delays, breakdowns and being seen.
- Each gets **real routes**:
  - A list of stops along the road or rail graph, with daily departure times (e.g. 06:10, 09:40, 17:15) and a trip time from road distance, vehicle speed and a stop count.
  - Price by distance and style, delays by style, weekend and night gaps, and "last one's gone, wait till morning".
- **Group fit:** seats limit how many of your crew fit (a minivan might take only 3 of you; the rest wait for the next run). Groups are noticed less, per the group rule.
- **Transfers:** A → hub town → B. Missed connections mean a night in the hub town.
- **Booking:**
  - Walk to the stop, stand, or haggle with the driver (free text for sketchy ones).
  - Or book on the company's page in the browser (listed in Seekr, with a timetable).
  - Rain slows every line (×1.4) but never cancels one.
- **Ending hooks** (plug into the ending engine): tempo breakdown in a village, a minivan driver who recognizes the poster, a sketchy-but-kind driver who drops you at a shelter, a missed last train, a sleepover in a depot.

**Build files (≤8KB each):** `atlas2.js` (more places + road/rail graph), `atlas_map.js` (zoom/pan/layers), `routes.js` (company generator + timetables), `routes_go.js` (stops, boarding, transfers, seats), `routes_web.js` (company pages). Fix the drive bug in `travel3.js` first (see memory §8).

### F. Motels & hotels
41. Tiers: **Professional** (ID, calls police on kids) / **Unprofessional** (some questions, persuadable) / **Really sloppy & cheap** (cash, no questions, 1 tiny room: mattress, one outlet, window; mold, noise).
42. **Free-text haggling** per night / week / month. Prepay = cheaper but you can be kicked out without refund.
43. Kick-out reasons: noise, spooked manager, police drive-by, late payment, new clerk. *(Not room overcrowding.)*
44. Groups: separate rooms each, or join someone's room for an extra fee.
45. Room life: fighting over the one outlet, vending-machine dinners, motel pool, neighbors, a clerk who becomes friend or threat.

### G. Sketchy alleys
46. Every town has back streets; cities have more.
47. Contain the sloppiest motels, greasy cheap restaurants, alley stalls, pawn shops, "people who know people".
48. **Fake IDs** — expensive, often terrible or a scam; fool only sloppy places; pros spot them instantly (heat up).
49. Dangers (non-graphic): scams, creeps offering "help", fights — with ⚠️ risk pop-ups.
50. Street reputation — regulars remember you.

### H. Friends' parents as full characters
51. Each parent has routines, personality, memory, secrets and worries — like the main cast.
52. When their kid is missing too: frantic calls, police reports, calling your mom, driving around, Chirp posts, crying texts.
53. **You can text them:** reassure, ask for help/money/ride, lie, beg them not to call police — responses depend on who they are.
54. Parents talk to each other and your mom — one slip can expose the group.

### I. Notes & messages
55. **Text friends to leave a note on THEIR bed** before sneaking out; you choose what it says; their parent reacts.
56. Leave notes yourself (own bed, sibling, Mom, teacher).
57. Ask a friend to deliver a note to your house.
58. Scheduled texts ("I'm safe, don't look").

### J. Identity (game-only)
59. Fake name + cover story per stranger; NPCs remember; inconsistent lies raise suspicion.
60. Change appearance (haircut, dye, clothes, glasses) → lower poster match.
61. Group cover stories ("we're cousins", "school camping trip", "waiting for our uncle").

### K. Police & excuses
62. Officer asks about your stand/business → free-type excuse: **school project, cancer charity, army/veteran charity**, or your own. Good + consistent story → let go; bad → questions / call home / name check; exposed fake charity → big heat.
63. Police routines per town size (city patrols / small-town cruiser / village sheriff).

### L. Other runaway kids
64. Meet runaway kids at stations, alleys, parks, motels, shelters.
65. Each has a story, skills and trustworthiness (some are being used by adults).
66. Ignore / trade / **invite to your group** / join theirs / help them reach a safe adult (good ending path).

### M. Group runaway, attachment & bases
67. Run away with multiple friends — everyone has reasons, fears, homesickness.
68. **Emotional attachment** between group members, built by shared time, texts, conversations, hard moments. **High** → cover for each other, share money, stay calm (lower catch odds). **Low** → hesitate, slip up, weaker cover story.
69. **Texts & conversations affect friend actions** (calm someone down, convince them to come / stay home).
70. **Catch-chance rule for groups:** starts **lower** (people assume camping / hanging out / visiting someone). **After 5 days in the same place** it rises to normal and stays there **until the group moves** to another place.
71. **Crush → relationship → partner can join the group** (text, in person, or show up at the base). Boosts mood/morale; starts with high attachment to Sam; their parent is a full character who worries and searches; the group warms up to them (no jealousy). Stays innocent (holding hands, sitting together, sharing snacks).
72. Bases at the town edge: forest camp, abandoned building, old barn, closed motel, junkyard vehicle.
73. Gear: sleeping bags, small tent, **big tent**, tarps, stove, power bank, solar charger, water filter, lantern.
74. **Renovate:** clean up, patch roof, lock, curtains, rain catcher, hidden entrance, stash spot, charging station, heater → lower catch chance / more comfort.
75. Threats: urban explorers, owners, noise complaints, weather, animals.
76. Survival: cold, sickness, injury, food spoiling, bathrooms, boredom.

### N. Business
77. **Group businesses:** snack stand, bike/scooter repair, car wash, yard work, flea-market reselling, drawing commissions, tech help, dog walking, fixed-up junkyard parts.
78. Roles by skill; profits → group account.
79. Problems: competition, permit questions (see K), nosy customers, money arguments.
80. Solo hustles/jobs carry over.

### O. World systems
81. Gossip network (kids, parents, clerks, locals).
82. Poster heat spreads town by town (higher with police).
83. **Villages:** only some villagers have internet; many don't know or care about missing kids.
84. Weather (rain, cold, heat, storms) affecting travel, bases, sickness.
85. **Rebuilt Mom** — actively searches, texts, calls parents, posts, drives around; mood evolves over days.
86. Journal (auto + your own entries).
87. Town reputation.
88. Health system (colds, blisters, sleep debt, clinics that ask questions).
89. Seasons & holidays (Halloween costume disguise, cold snaps).
90. Achievements & endings tracker; sound (rain, motel hum, forest night, phone buzz).
91. Safe exits everywhere; endings honest, never glamorizing.

---

## 3. Build plan
1. Phone, data, browser, money & banking (A, B, D)
2. Shopping, transport, scooters, junkyard vehicles, driving (C, E) + **E2 transport network & bigger Averland**
3. Motels & sketchy alleys (F, G)
4. Friends' parents, notes, identity, police (H, I, J, K)
5. Runaway kids, group life & attachment, bases, business (L, M, N)
6. World systems (O)

## 4. Code map (src/, in load order)
Open `src/index.html` to play. CSS: `style.css, style2.css, style3.css`. Tests live in `tests/` (Playwright + /usr/bin/chromium, run `bash tests/setup.sh` first).

| File | Size | What it does |
|---|---|---|
| `data.js` | 15 KB | static world data |
| `state.js` | 18 KB | core state & simulation |
| `engine.js` | 8 KB | data-driven event engine. Events, props, rumor reactions and ambient life are plain data: { id, pool, when: ["rel.jordan < 40", "hour > 17", "weather in rain,storm"], cha |
| `nlp.js` | 33 KB | local natural-language engine + PIP, the smartass assistant |
| `npcs.js` | 37 KB | character brains. Each returns {say, fx:{rel,stress,mood}, end, narr, flags} |
| `phone.js` | 28 KB | the phone |
| `memory.js` | 18 KB | NPC memory, conversation logs, and tone reading. NPCs remember specific things you said (quoted, dated), notice contradictions and repeats, and every conversation — in pe |
| `world.js` | 8 KB | living world: NPC routines, weather effects, discovery. |
| `rumors.js` | 10 KB | rumor system. Tell one person something; it travels a social graph, mutating as it goes, and people react to the version *they* heard. |
| `talk.js` | 5 KB | free-text conversations |
| `events.js` | 28 KB | scripted & random events |
| `subplots.js` | 18 KB | side stories. Each run the Story director picks 3–4 and schedules them. Beat format: { off: days after the rolled day, h: [from, to], c: condition, run, interrupt } |
| `story.js` | 17 KB | procedural story director. Every new game rolls a seed that decides: beat timing, which beats happen at all, the breaking point ("catalyst"), 3–4 side stories, Sam's trai |
| `ambient.js` | 13 KB | ambient life, all data. Pools: mundane (things that just happen), notify (phone buzzes), run (street life while you're gone), story (world reactions like rumor fallout). |
| `props.js` | 18 KB | small interactions: sit, inspect, read signs, vending machines, browse, eavesdrop. Everything is data: { id, ic, l, when, min, texts|text(fn), fx, cost } keyed by locatio |
| `run.js` | 26 KB | the run |
| `endings.js` | 31 KB | endings, epilogues, journal, snapshots |
| `actions.js` | 14 KB | what you can do, where (part 1: locations) |
| `actions2.js` | 16 KB | actions part 2: home, school day, computer, packing, items |
| `scene.js` | 12 KB | animated location vignette |
| `portraits.js` | 16 KB | procedural SVG portraits. Every character has a look; faces shift with mood (neutral · warm · sad · angry · worried · guarded · tired). dex_19 never gets a face. |
| `scene2.js` | 46 KB | scene renderer v2: layered, detailed, alive. Static layers are cached per (place, room, size, 10-min slot, weather); life (people, cars, weather, flicker) is drawn every  |
| `map.js` | 11 KB | the town map |
| `map2.js` | 10 KB | map upgrades: zoom/pan/pinch, fog of war, learned routines (people dots), weather layers, route preview, richer info sheet. |
| `ui.js` | 16 KB | UI |
| `phone2.js` | 17 KB | phone OS layer: notification centre, People (memory + transcripts + rumors), camera & gallery, calendar, clock/alarm. Wraps the base phone renderer. |
| `city.js` | 11 KB | procedural Harlow. Every story seed builds a different town: river side, street grid, rail line, where you live and where everything else ends up. Saved in G.city so a pl |
| `rail.js` | 18 KB | the railway. Harlow Station on the Northline, the freight yard, and why a twelve-year-old can't just buy a ticket. (Real-world basis: on Amtrak-style railroads, children  |
| `jobs.js` | 15 KB | work before the run: odd jobs (gigs) and little businesses with stock, prices, demand and risk. Money is the one number the game shows plainly — because a kid counting do |
| `hustle.js` | 11 KB | how you find work, how the world reacts to your money, and the Hustle app. All events are engine data. |
| `vocab.js` | 21 KB | bigger vocabulary for the text AI: texting slang, typos (fuzzy matching), emoji, negation, ~20 new intents, and new replies for every main character when they'd otherwise |
| `friends.js` | 35 KB | more people, real friendships, crushes. Six new kids around Harlow with their own personalities, routines, families and opinions. Friendship grows by talking, hanging out |
| `atlas.js` | 29 KB | Atlas: a whole (fictional) country in your pocket. Seeded per story: cities, towns, small towns, villages. Each place has its own size, economy, jobs, people, services an |
| `net.js` | 10 KB | mobile data, wifi, top-ups. Your phone is on Mom's prepaid plan: a few GB a month, which runs out faster than you'd think. Texts and calls don't need data; Chirp, Atlas,  |
| `catalog.js` | 11 KB | Part 1c: the product catalog ("buy ANY product"). Every category exists. Items register into SH.ITEMS as x_<id> so the bag/stash/pawn systems understand them. Big things  |
| `net2.js` | 14 KB | Part 1a: messaging over data, offline queue, held inbox, burner phone, data saver, bundles, night pack, Friend Finder subscription, free App Lock. Messages & calls are in |
| `bank.js` | 17 KB | Part 1b: money. Cash is the default. Digital money lives in PocketPal (a teen card linked to Mom's account): it needs MOBILE DATA (banking apps refuse public wifi; home w |
| `browser.js` | 10 KB | Part 1d: the web browser. Made-up sites, each costs data per page. History is saved (and can be seen by whoever gets your phone, unless you clear it or App-Lock the brows |
| `browser_news.js` | 10 KB | Part 1e: The Ledger (local news; your missing poster appears, updates, gets comments), Safeline (help — reaching out ends the run, bittersweet and honest), Threadly (foru |
| `forum.js` | 9 KB | Part 1f: Threadly forums. Read boards, post your own question (free text) and get replies. Some DMs are creeps: the game throws a ⚠️ risk pop-up before you engage. |
| `browser_shop.js` | 16 KB | Part 1g: Everything (online store — any product; pickup locker; pay by card or cash at pickup) and SwapSpot (used marketplace: fair sellers, scams that want a deposit, an |
| `browser2.js` | 10 KB | Part 1h: transport company sites (timetables, prices, age rules — booking arrives in Part 2), StayFinder (motel listings with fake + real reviews — booking arrives in Par |
| `jobs2.js` | 14 KB | Part 1i: WorkNow (a real job board: real jobs, realistic pay, real age rules — most say 16+, so a 12-year-old has to find the ones that'll take them) and TubeYou (videos  |
| `travel2.js` | 2 KB | Part 2a: getting around Averland. Rides: walk, kick scooter, e-scooter (battery!), bike, your own vehicle (fuel + driving skill). Tickets: County Transit (anyone), CheapR |
| `travel3.js` | 5 KB | Part 2b: the trip itself — tickets, battery, fuel, and things that happen on the road. |
| `junkyard.js` | 7 KB | Part 2c: junkyards (every town; size varies) and vehicles you can buy for cash, fix, fuel, sleep in, and (badly, then less badly) drive. No theft: the owner sells "as-is, |
| `routes.js` | 17 KB | E2a: operators (famous 4 + 7 randomized), route + timetable generator, journeys (direct / 1 change), departures, seats, delays. `SH.Routes` |
| `routes_go.js` | 13 KB | E2b: Atlas journey modes (`rt:` keys), riding (wait, age check, seats, delays, transfers, incidents), departures board |
| `routes_web.js` | 4 KB | E2d: a website per operator + AverRides hub |
| `routes_end.js` | 8 KB | E2c: endings for transport incidents |
| `atlas_map.js` | 5 KB | E2e: Atlas phone view with zoom / pan / pinch / search / route highlight |
| `cell.js` | 9 KB | cell signal per place (bars, 5G/LTE/3G/EDGE, hourly flicker, weather), loading times & timeouts, No service, signal hunting, villagers' internet (none / online / cares) and poster recognition |
| `endx_core.js` | 5 KB | ending engine. Sits in front of SH.Endings.show: whenever the story reaches an ending, the engine builds a context (who's with you, where, weather, vehicle, money, days g |
| `okafor.js` | 18 KB | Ms. Okafor v2: an actual counselor. She tracks what you've told her (this visit AND past visits), reflects your specifics back, asks the NEXT question instead of the same |
| `lex.js` | 18 KB | lexicon v3. A deeper parse of whatever the player types: - ~350 more slang / shorthand / misspelling mappings and multi-word phrase rewrites - more ways to say every feel |
| `mind.js` | 30 KB | the Mind: real, specific memory for every character. - Facts you tell someone ("my favorite color is green", "i have a test friday") are remembered BY THAT PERSON, dated. |
| `converse.js` | 26 KB | conversation manager (outermost layer over every brain). Tracks what's been talked about in THIS conversation (and per-person across visits), handles meta-talk ("can we t |
| `ui2.js` | 24 KB | UI v2: HUD, character panel, grouped actions, richer story log, portrait dialogs, a living conversation screen, day cards with a recap of yesterday, stacked toasts, polis |
| `stage.js` | 27 KB | the Stage. The scene becomes the game: a camera that follows Sam, objects you click to act on, people standing where they actually are, a door for the big choices, and a  |
| `saves.js` | 6 KB | full world saves: autosave + 3 slots + export/import, migration, and a record of every choice. |
| `fixes.js` | 4 KB | robustness layer: - snapshots are keyed per playthrough (not per seed), so a replay of the same story never loads another run's memories - every restore (rewind / load) r |
| `family.js` | 11 KB | who you are and who you live with. Gender pick on the title screen; the family (names, who the "problem adult" is, Dad's story, money, Mom's job) is rolled from the story |
| `main.js` | 5 KB | boot |
| `mobile.js` | 3 KB | mobile shell: bottom tabs (Story / You / Phone / Map), swipe-free, thumb-sized. |
| `phonescroll.js` | 1 KB | Drag-to-scroll inside the phone for mouse users (scrollbars are hidden, so give them a grip). |

## 5. Real resources (shown in credits)
US: National Runaway Safeline 1-800-786-2929 · 988 · UK: 116 000 · Childline 0800 1111 · India: Childline 1098 · 112

---

## 6. Progress log
- **Part 1 DONE** (phone, data, browser, money & banking):
  - Messages/calls over data, offline "sending…" queue, held inbox, burner phone, data saver, night pack, monthly bundle
  - Friend Finder+ subscription, free App Lock
  - PocketPal bank (needs mobile data, refuses public wifi, Mom sees every transaction and may freeze it), savings, cash-back / cash-load at QuikMart
  - Crew Pot group account (goals, contribution log, votes over $15), borrowing & IOUs, pawn counter (mall)
  - Browser with 22 sites: Seekr, The Ledger (missing poster + comments), SkyCast, AverMaps (junkyards), Everything (any product, locker pickup, card or cash), SwapSpot (fair / scam / creep listings, selling), Threadly (forums, posting, creep DMs), Safeline (bittersweet "reachedOut" ending), Averline / CheapRide / Regional Rail / County Transit, StayFinder, GiveTogether, WorkNow (real jobs + age rules), History
  - TubeYou app (skills: driving theory capped at 40, repair, mechanics, camping, cooking, first aid, building, business)
  - Catalog of ~110 products across 11 categories (adult items exist; Sam refuses)
  - Phone scrolling fixed (touch, wheel, mouse drag)
- Next: Part 2 (shopping in physical stores, transport booking, scooters/bikes riding, junkyard vehicles, driving lessons)
- **Part 2 PARTIAL** (commit c9ae4cf):
  - Long runs: the forced "exhausted" ending now only fires if health < 40, fullness < 25 or energy < 20, or after 9+ days with no place to stay (away town / vehicle / hideout / base)
  - Ride modes: kick scooter (≤25 mi), e-scooter (battery, range ≈ battery × 0.18 mi), bike (≤30 mi), drive (own running vehicle), transport companies (CheapRide, Averline, Regional Rail, County Transit)
  - Rain makes every travel mode 1.4× slower (never blocks)
  - Ticket strictness per company; road incidents (some are just scares, some end the run)
  - Junkyards everywhere: buy car / tempo / minivan / camper for cash, install parts, work on it, fuel it, sleep in it
  - Ending engine (context-aware ending picker + endings-found counter on title screen)
- **E2 DONE** (turn 19):
  - **Averland is ~112 places:** 5 cities, 16 towns, 31 small towns, 60 villages. Villages are scattered evenly over the map on a jittered grid, **not clustered around market towns**.
  - **Road graph:** nearest-neighbour roads, a highway spanning tree through towns and cities, and forced connectivity. Road miles are winding (highway ×1.05, county ×1.15, village roads ×1.3).
  - **2–3 named rail lines.** The Northline always runs Harlow – Cedar Falls – Port Aldine. Little unstaffed **halts** sit beside the lines, and only the slow train stops there.
  - The atlas is **no longer stored in the save**. It's regenerated from the seed and cached (saves are smaller).
  - **11 operators per story:**
    - **The famous 4:** Averline (pro express coach), CheapRide (unprofessional bus), Averland Regional Rail (the pro county intercity train), County Transit (local buses).
    - **7 randomized:** an **unprofessional train company** (always one), 3 bus companies, a tempo traveller service, a minivan shuttle and a shared-car pool. Names, colours and slogans come from pools.
    - Styles are pro / unprofessional / sketchy-but-safe, with at least one of each. The crew is never the danger.
  - **Real routes (~330 incl. reverse):**
    - Each has stops along the road (or rail) path, a daily timetable (per type: count, window, speed, dwell), delays and breakdowns by style, and a price by distance × style.
    - **Buses stop along the way** (towns and small towns, some villages as flag stops). Express coaches only stop at towns and cities. Tempos stop everywhere, villages included. Shared cars go direct. Some sketchy buses and old trains have night runs.
  - **Journeys:** direct or one change (no backtracking), shown in the Atlas as "Leaves 9:12 · arrives 10:40 · 4 stops · change at X". About 10 remote villages have no service at all (walk, bike or drive).
  - **Riding:**
    - A wait prompt (with ⚠️ for night runs) and age checks by style: pro refuses and may call someone; unprofessional lets you try a cover story; sketchy never asks.
    - Seats per departure. A group that doesn't fit waits for the next one together (no splits); sketchy drivers squeeze you in.
    - Delays, breakdowns, missed connections (you're stranded at the hub), flavour text per vehicle, and incidents → endings.
  - **Departures board** in every served town hub, plus Harlow's bus and train stations during the run. Pick a departure, then pick any stop further down the line.
  - **Company websites** (the famous 4 now show real timetables) + **AverRides** (rides.av) listing every operator.
  - **Atlas map:** zoom (buttons, wheel, pinch), drag to pan, search, labels that appear as you zoom, and the best ride drawn in the company's colour.
  - **New endings:** conductor (group + solo), oldTrain, kindDriver, posterDriver, busAgent, nightbus, tempoBreak, railCapital, cheapDriver/cheaprideCity.
  - **Drive bug fixed** (the car and Sam now always arrive together).
  - Test `tests/e2.js`. Tests now use the `/home/user/runawayy-game` path.
- **Cell signal & village internet DONE** (turn 20, `cell.js`):
  - **Coverage by size:** cities 5G, towns LTE (some 5G), small towns LTE/3G, villages 3G/LTE/EDGE.
  - **Villages have service, but it's patchy:** 1–3 bars that change by the hour, rain −1 bar, storm −2. Each village/small town has a "best signal spot" (water tower hill, church steps…): **📶 Look for better signal** in the hub gives +1–2 bars for 90 min.
  - **Loading speed:** browser pages and data apps (TubeYou, Atlas) show a loading bar lasting as long as the connection says: size × 8 / Mbps, scaled, 0.15–7 s. 1 bar of EDGE/3G can **time out** (Try again). Wi-Fi loads fast.
  - **Zero bars = No service:** data blocked, messages queue on "sending…", calls fail, location stops updating.
  - The status bar shows bars + generation. The Network app has a CELL SIGNAL section.
  - **Villagers:** only ~12–37% of a village is online; of those, only some care about missing-kid posts (the rest use it for weather and church groups). In small towns most are online.
  - Each local is tagged no-internet / online-doesn't-care / online-reads-the-news. The Atlas card lists them. Asking a local about wifi/internet/news gets an answer that fits.
  - **Only "reads the news" locals can recognize you** from a poster (a chance on turn 2+ if you're reported).
  - The poster multiplier on notice in villages is 0.8 + 2 × online × care (≈1.05 on average vs 1.6 in towns). A new kid still stands out in a village, though.
  - Tests: `tests/cell.js`. `SH.Net.instant = true` skips load times in tests.
- **Part 2 TODO:** driving lessons (farmer + go-kart), physical shops, ~100 new endings + never-found endings, ending text for all new trigger keys (they fall back to "found by police" for now)

---

## 7. Story & world reference

### Premise
Sam (12, gender picked at start) lives in **Harlow**. Home is falling apart: Mom **Dana**, the adult man in the house (**Rick** by default; name and role randomized: stepdad / boyfriend / uncle), and a little sister (**Lily**, 7 by default; randomized). The game covers roughly 19 days before the run, then the run itself, then an ending.

### Harlow locations
home, patel (Mrs. Patel's house, Newton the beagle), jordan (Jordan's house, his mom Tanya), school, store (QuikMart), library, park, police, mall, hospital, diner, laundromat, underpass, bus (bus station), trainyard, station (train station), birch (Birch Street, where the six friends live), harbor (Harbor House youth shelter, 212 Wharf St; hidden until discovered).

### Story beats (base days; each seed remaps them)
d1 report card · d3 bully · d4 first Okafor talk · d5 parent conference · d6 fight at home · d7 Grandma's call · d9 bike · d12 "we're moving" · d15 juice incident · d16 bruise noticed at school · d17 CPS visit · d19 big night (the natural run moment).

### Characters
- **Family:** Mom Dana · Rick (randomized) · sister Lily (randomized) · **Grandma Rose** (Cedar Falls, 41 Larkspur Lane).
- **Adults:** Ms. Okafor (school counselor) · Mrs. Patel · Officer Lowe · Ms. Ruiz · Dolores · Tanya (Jordan's mom).
- **Kids:** Jordan (best friend) · Tyler (bully; the "7" in his lines is his jersey number) · Maya · Wren.
- **Birch Street friends:** Nia (artist), Marco (skater/clown), Priya (science), Eli (gamer), Theo (basketball), Hazel (climber). Each has routines, likes, compatibility, free-text chat, and parents you can text or visit.
- **dex_19:** online groomer storyline. Non-graphic; Sam always ends up safe.
- **PIP:** sarcastic phone AI that suggests replies. It drops the sarcasm and shows real helplines if self-harm comes up.

### Needs & stats (hidden numbers, shown only through world reactions)
full, energy, hyg (hygiene), mood, stress, health, warmth · money · grades · heat (how hard people are looking) · notice (per town) · relationships per NPC · skills: drive (TubeYou theory max 40), fix, mech, camp, cook, aid, build, biz.

### The country: Averland (Atlas app)
37 generated places across 4 tiers: city, town, small town, village. Each has population, economy, jobs, locals, services (hospital / shelter / library / wifi / bus / rail), junkyard size, and danger and notice levels. **Police depend on size:** villages have no police, only a county sheriff 20–45 minutes away. Many villagers have no internet and don't follow missing-kid news.

### Getting around
| Mode | Range | Notes |
|---|---|---|
| Walk | ≤9 mi | free, slow, tiring |
| Kick scooter | ≤25 mi | cheap to buy |
| E-scooter | battery × 0.18 mi | costs far more than a kick scooter; recharge at an outlet; push it when it's dead |
| Bike | ≤30 mi | used / BMX / new / cargo |
| Drive | any | junkyard vehicle that runs + fuel ($5 per 10%); skill decides crash / pull-over odds |
| County Transit | ≤40 mi | loose about kids |
| CheapRide | intercity | drivers may refuse kids alone |
| Averline | intercity | strict; may turn you away or call an agent |
| Regional Rail | rail towns/cities | conductor checks |
Rain = 1.4× travel time for every mode.

### Money
Cash by default. **PocketPal** bank needs mobile data, refuses public wifi, and Mom can see or freeze it. **Crew Pot** group account (goals, votes on anything over $15). Borrowing / IOUs, pawn counter at the mall. Prepaid data: $10 = 2GB, $15 = 5GB, $25 = 15GB; burner phone available. **No theft anywhere in the game** (player's rule).

### Motels (StayFinder / SH.motels)
Professional / loose / sloppy tiers. Per-night, weekly and monthly prices, with bargaining. Tiny room (mattress, one outlet, a window). A group needs separate rooms or can pay to share one. Too many people in one room is never a reason to get kicked out.

### Group rules (player-designed)
A group is noticed less (people assume they're camping or visiting) until 5 days in the same place; then odds go back to normal until you move. Emotional attachment between friends changes odds, good or bad. No splits, no jealousy. A crush who becomes a partner can join the group (kept innocent).

---

## 8. Endings

### Original 20 ending keys
harbor · grandma · patel · call911 · walkHome · friendFamily · reachedOut · foundSafe · foundHome · foundMom · foundMomKnows · trainSafe · garage · garageTold · collapse · empty · dex · dexNo · listened · quiet

### "Found" reasons (variants of `found`)
tracked (phone location) · police · post (missing poster) · security · self · agent (ticket agent) · bus · cedarLost · host · sheriff · away · exhausted

### How the ending engine works (endx_core.js)
Every ending goes through `SH.EndX`. It builds a context (who's with you, partner, place, town size, weather, night, days gone, money, bank frozen, vehicle, skills, heat, found reason…) and picks the highest-priority variant whose condition matches. If none matches, the original ending plays. Found endings are saved in localStorage (`smallhours_endings`) and counted on the title screen.

### New trigger keys already fired by the game (ending text still to write)
conductor · cheapDriver · nightbus · scooterFall · escootDead · bikeLong · walkHighway · lostWoods · riverCold · dog · storm · crash · crashDitch · crashHurt · driveStop · outOfGas · cheaprideCity · railCapital · van

### Planned ~100 endings
- **Found variants:** rain, party of 2, party of 3+, with partner, village, city, day 1, long run, burner, tracked, poster, rich, broke, night; foundSafe with party / uncle / partner / grandma / teacher.
- **Vehicle:** crash, ditch, hurt, pulled over (and a skilled variant), out of gas, van life, van crew, van home, junkyard owner, camper by the lake, kart champion, farm family, tempo market.
- **Transport:** CheapRide city, driver refuses, conductor, capital by rail, night bus, county loop, scooter fall, dead e-scooter, long bike ride, highway walk, collapse (village / city / party).
- **Social:** walkHome / grandma / harbor / reachedOut variants with party, partner, rain and long runs; quiet crush, quiet friends, listened friends, empty-but-worked.
- **Money:** bank frozen, fund flagged, swap meet, locker clerk, employer recognizes you, creep reported.
- **Weird:** lost woods, cold river, dog, storm, library sleepover, mall night, sister's call, dex variants.

### NEVER-FOUND endings (planned; the player's big request)
A daily check after 21+ days with low heat, good health and somewhere to live offers "Disappear for good" (also a hub option after 10 days). Then a years-later epilogue. Variants:
- **The House on the Edge of Town** (rare secret): crew with high attachment, abandoned house fully renovated (base level max), village or town edge, low heat for 60+ days, crew business plus savings plus jobs, everyone healthy through a winter, no family contact (burner only). Sub-variants: partner stays · whole crew stays · one friend went home on good terms · the business became a real shop.
- Van life · farm family · city anonymity · crew business · you + partner · alone · coast town · camper by the lake · junkyard apprentice · more.
- Bases (forest camp, tents, abandoned building renovation) come in Part 5, so some never-found endings are only reachable after it.

---

## 9. Developer reference (for continuing the build)

### Global state `SH.G`
t, phase, loc, s{full,energy,hyg,mood,stress,health,warmth}, money, rel, bag, phone, threads, flags, heat, reported, revealed, fam, gender, friends, crush, party, hideout, away, awayNotice, net.x, bank, crew, debts, owned, orders, swap, forum, fund, work{apps,gigs}, skills, tx, stats.hoursOut, missingAt, discoveredAt, veh{n,type,at,parts,work,fuel,running,warm,seats,nights,since}, escootBat, lastRide, _foundReason. No `day` field: use `SH.day()`.

### Key APIs
- `UI.dialog({title, text:[], choices:[{t, sub, cls, fn}]})` · `SH.Endings.show(key, title, sub, paras)` · `SH.advance(mins)` (wrapped by many modules)
- Phone: `P.V.x = fn(body)`, `P.extraApps` (`{at, app:[id, icon, name, color]}`), `P.notify`, `P.push`, `P.send`
- Atlas: `A.data().places`, `A.miles(a,b)`, `A.modes`, `A.go`, `A.hub`, `A.here()`, `A.svg(D, sel)`, `SH.Atlas.extra` (array of `f(place, choices, dark)`)
- `SH.Net`, `SH.Bank`, `SH.Catalog`, `SH.Browser`, `SH.Forum`, `SH.Shop`, `SH.Jobs2`, `SH.TRANSPORT`, `SH.motels(id)`, `SH.skill(k)`
- Part 2: `SH.EndX.add([{k, t, sub, on:[bases], p, w:(c)=>bool, x:(c)=>[paras]}])`, `SH.EndX.trigger(base, extra)`; `SH.Travel`; `SH.Junk` (yard, open, buy, part, work, check, fuel, sleep)

### Gotchas
- Keep source files small (≤8KB) and `node --check` every write.
- Hotspot selectors need `:not(.off)`; `#daycard` blocks clicks on day 1 in tests.
- git identity is lost after an environment reset: re-run `git config user.name/email` and re-add the remote.

### Tests
`tests/p1.js`, `p1b.js` (Part 1), `p2.js` (rides + junkyard), `bot.js` / `convo.js` (random-play and conversation bots), `mshot.js` (mobile screenshots).

---
## ✅ PARTS 2–7 BUILT (request #21: "make all the parts")
Shared helpers: `src/kit.js` (`SH.K`: dialogs `K.D`, `K.pay`, `K.ask` free-text input, `K.hub`/`K.me` menu hooks, `K.daily`/`K.hourly` time hooks, `K.party()` = friends + runaway kids). Town-hub notice formula is pluggable: `SH.Atlas.mods` (multipliers) + `SH.Atlas.noticed(p,k)`.
| Part | File | What it does |
|---|---|---|
| 2a | lessons.js | Farm driving lessons in villages/farm small towns (2h chores → +15, learner = you or a friend; "ask to stay" → **farm** never-found ending). Go-karts in towns/cities ($15, +6, max 60). Group's best driver counts. |
| 2b | shops.js | Stores by size: village general store → small town +hardware/pharmacy → town supermarket/sporting/electronics → city mall. Restricted items refused; adult items: "nope. I'm not that braindead." Buying raises notice (less in cities). |
| 2c | endx_road.js | Endings for every road incident (crash ×2, ditch, hurt, driveStop ×2, gas, van, dog, storm, woods, river, scooter, e-scooter, bike, highway) + farm. |
| 3a | motels.js | pro / loose / sloppy motels. Free-text clerk: haggling (numbers), stories (mom in the car, tournament), week/month prepay discount, fake-ID checks. Room: sleep, shower, charge. Kick-outs: late payment, noise, spooked manager, police drive-by, new clerk. **Never crowding.** Groups: one room +$5/head or separate rooms. |
| 3b | alley.js | Side streets: diner (food, rumors, tips), alley stall (used), pawn shop (sell YOUR stuff), fake-ID guy ($60 bad / $150 ok; needs street rep or a city), ⚠️ creep encounters with safe exits. Street rep `G.street`. |
| 4a | parents.js | Friends' parents' worry `G.pw` (warm/strict/away), texts on host_<id> threads (textable: real replies), call your mom, Chirp post. Note on the bed (free text; tone matters). Nightly "I'm safe" text (slows worry, may ping a tower). |
| 4b | identity.js | Cover name + story per town (`G.cover`); locals notice a changed name. Disguises: haircut, dye, glasses, clothes (`G.look`; −12% poster effect each). |
| 4c | police.js | Cop stops by your work/business: free-text excuses (school project, charity, family, church) remembered per town; fake charities may get checked → heat. Truth → safe ending. |
| 5a | runaways.js | Other runaway kids in some towns (free-text, earn trust): invite into group (`G.rkids`) or walk them to a safe adult. |
| 5b | attach.js | Attachment `G.att`; groups safer under 5 days in one place, riskier after (`G.stay`, `SH.Group.mult`). Homesick comfort talk. Crush can join. |
| 5c | bases.js | Forest camp / abandoned building / barn; 10 upgrades from real store items; nightly threats (raccoons, storm, cold, teens, being found). |
| 5d | business.js | Group business: 6 kinds, name it, roles (make/sell/lookout), 3h shifts, problems, cop visits, group jar. |
| 6 | worldsys.js | Real calendar past November, seasons, winter nights, Halloween (trick-or-treat, costume = best disguise). Town reputation (derived, never a number). Health: colds, blisters, sleep debt, clinics; fever/exhaustion endings. 20 achievements (localStorage). |
| 7 | notfound.js, endx_gone.js, endx_found.js, endx_more.js | **Disappear for good** (after 21 days: low heat + 3 of 4 pillars: a place to sleep, a way to eat, a believable story, people who'd vouch). 35 never-found endings incl. **The House on the Edge of Town**; 37 context "found" endings; health endings. ~96 new ending defs total. |
Tests: `tests/parts.js` (runs `tests/part2.js`…`part7.js`, fresh page each).

## REQUEST #22 BUILT — memory, understanding, useful PIP, trips, balance
| File | What it does |
|---|---|
| `routes2.js` | Two-change journeys (from → hub → hub → destination) when direct/one-change routes are missing; about 2× more place pairs reachable |
| `mind2.js` | Per-person identity memory (name/age/from/going/story…), contradiction catching, no re-asking, "what's my name?", small-town gossip, core characters know your real name; better negation, money/nights parsing, pronouns |
| `pip2.js` | PIP for the road: routes, departures, sleep, motels, buying, money runway, notice, health, Disappear pillars, parents, coaching, remembered goal, context-aware ◉ replies for clerks/cops/locals/kids/parents |
| `balance.js` | Notice fades while you stay (more with a cover/room), familiar-face discount per town size, towns remember you when you return, odd jobs $7–18 (`SH.BAL`) |
| `groupchat.js` | Group chats with memory: the class chat (topics, beef/apologies, "what did X say", "catch me up", next-day callbacks; while you're missing, posting your location raises heat) and the friends' chat "the squad" (each friend replies in their own voice, says what they're really up to, hears what you share) |
| `talkfix.js` | Friend conversation threads: running away (where → how bad → their decision, decided once and remembered → when), low mood ("what happened?"), plans ("wanna draw later?"), promises; negated feelings and "or nah / tell quick" understood; friends' questions always end in "?" |
| `talkfix2.js` | Consequences: a friend who's in texts you that evening, one who helps offers their place, a scared friend without a promise tells their parent the next day (mom gets a call, or heat +8 if you've left); greetings remember the thread; PIP ◉ options follow the thread, rotate on every press, never repeat what you already said |

## REQUESTS #27–28 BUILT: fullscreen maps, real booking and boarding, rebuilt websites
- **Book** on AverRides (rides.av) or any company site. You get a ticket code, the boarding point (for example "Bay 2 · Harlow bus depot" or "Platform 1 · Harlow Station"), a "be there by" time, and changes. Pay by card (mom sees it) or reserve and pay cash on board.
- **Board**: go to that spot and tap 🎫 Board (town menu when away; the depot or station in Harlow). From home that's the moment you run away, possible only within 90 minutes of departure. Miss it and the ticket's gone.
- **AverMaps** is a real maps site: explore, place pages, directions, and nearby filters. The ⛶ button makes any map fullscreen.
- Browser home page, Seekr instant answers, TubeYou, and PIP ticket help. See FULLMEMORY #27/#28 for the APIs.

## REQUEST #30 BUILT
- Your rolled family's names now show everywhere: scene header, props, phone, and every ending's epilogue. No more default Rick/Lily/Dana/Rose leaking in.
- Shoplifting stays, but getting caught on the run never ends the story. The clerk just deals with you.
- **Route 9 Pickup** (Harlow, Gas-N-Go lot): cheap buses, tempos, van shuttles and car pools board here. The Greyline depot has only the official lines, and Harlow Station only trains. Every unofficial company in your story runs at least once from Harlow.
- PIP understands follow-ups and context ("bus to oakton" → "how much?" → "tomorrow?" → "is there a motel there?" → "book it"), and typo'd town names.

## REQUESTS #31–33 BUILT: away towns are real places
Every town you reach has its own map, streets, open/closed places, people with names and jobs who remember what you told them, work, sleeping spots, a timetable, a notice board, a library computer, and endings that fit how you got there. See FULLMEMORY.md #31–33.
