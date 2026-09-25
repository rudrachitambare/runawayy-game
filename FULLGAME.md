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
2. Shopping, transport, scooters, junkyard vehicles, driving (C, E)
3. Motels & sketchy alleys (F, G)
4. Friends' parents, notes, identity, police (H, I, J, K)
5. Runaway kids, group life & attachment, bases, business (L, M, N)
6. World systems (O)

## 4. Code map (src/)
`data, state, engine, nlp, npcs, phone, memory, world, rumors, talk, events, subplots, story, ambient, props, run, endings, actions, actions2, scene, portraits, scene2, map, map2, ui, phone2, city, rail, jobs, hustle, vocab, friends, atlas, net, okafor, lex, mind, converse, ui2, stage, saves, fixes, family, main, mobile` (+ `style.css, style2.css, style3.css`). Tests: `tests/` (Playwright bots).

## 5. Real resources (shown in credits)
US: National Runaway Safeline 1-800-786-2929 · 988 · UK: 116 000 · Childline 0800 1111 · India: Childline 1098 · 112
