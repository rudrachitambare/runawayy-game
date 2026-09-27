/* SMALL HOURS — static world data */
window.SH = window.SH || {};
(function (SH) {
  SH.util = {
    rand: (a, b) => a + Math.random() * (b - a),
    ri: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    chance: (p) => Math.random() < p,
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    shuffle: (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    pad: (n) => String(n).padStart(2, '0'),
    dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  };

  SH.WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  SH.START_DATE = { month: 'October', day: 5 }; // Day 1 = Monday Oct 5
  SH.MONTHDAYS = 31;
  SH.HOME_DAYS = 21; // the prelude length

  // Day-opening lines (a little foreshadowing, in Sam's head)
  SH.DAY_LINES = {
    1: 'The fridge hums. The TV is already on downstairs. It is always already on.',
    2: 'Mom\'s scrubs are on the chair. She came home at midnight and left at six.',
    3: 'Tyler has been staring at you since Friday. You know what that means.',
    4: 'You slept four hours. The walls here are thin and Rick is loud.',
    5: 'Parent-teacher conferences today. You already know who won\'t come.',
    6: 'Saturday. Allowance day, if you did chores. If Rick remembers.',
    7: 'Sunday. Church bells from across the river. Nobody here goes anymore.',
    8: 'The phone bill came. Rick left it on the counter like evidence.',
    9: 'Your bike is in the garage. For now.',
    10: 'Lily\'s school play is tonight. She\'s a turtle. She\'s been practicing for weeks.',
    11: 'It rained all night. The gutter over your window drips like a clock.',
    12: 'Jordan texted at 1 AM: "can u talk tmrw. its important"',
    13: 'Saturday. The house is quiet in the dangerous way.',
    14: 'Mom\'s day off. The house smells like pancakes, which is almost suspicious.',
    15: 'Monday again. Lily spilled juice at breakfast. Rick was already up.',
    16: 'Your arm still hurts where he grabbed it. You wear the hoodie.',
    17: 'Everybody at school is talking about the Halloween dance. It feels like another planet.',
    18: 'Mom asked if you were okay. You said fine. She believed you, because she needed to.',
    19: 'Friday. Mom\'s on nights. It\'s just you, Lily, and Rick.',
    20: 'Morning. The house looks the same. That\'s the worst part.',
    21: 'Three weeks since the report card. It feels like three years.',
  };

  // Weather per day: hi/lo in F, condition
  SH.WEATHER = [null,
    { hi: 64, lo: 47, c: 'clear' }, { hi: 61, lo: 45, c: 'cloudy' }, { hi: 58, lo: 44, c: 'rain' }, { hi: 60, lo: 43, c: 'cloudy' },
    { hi: 63, lo: 46, c: 'clear' }, { hi: 57, lo: 41, c: 'clear' }, { hi: 55, lo: 40, c: 'cloudy' }, { hi: 54, lo: 42, c: 'rain' },
    { hi: 52, lo: 39, c: 'cloudy' }, { hi: 56, lo: 41, c: 'clear' }, { hi: 50, lo: 40, c: 'storm' }, { hi: 51, lo: 38, c: 'rain' },
    { hi: 53, lo: 37, c: 'fog' }, { hi: 58, lo: 40, c: 'clear' }, { hi: 49, lo: 36, c: 'cloudy' }, { hi: 47, lo: 35, c: 'rain' },
    { hi: 48, lo: 34, c: 'cloudy' }, { hi: 46, lo: 33, c: 'fog' }, { hi: 45, lo: 31, c: 'rain' }, { hi: 44, lo: 30, c: 'clear' },
    { hi: 43, lo: 29, c: 'clear' }, { hi: 42, lo: 30, c: 'cloudy' }, { hi: 40, lo: 28, c: 'storm' }, { hi: 41, lo: 29, c: 'rain' },
    { hi: 44, lo: 31, c: 'cloudy' }, { hi: 46, lo: 33, c: 'clear' }, { hi: 43, lo: 30, c: 'fog' }, { hi: 40, lo: 27, c: 'clear' },
    { hi: 39, lo: 27, c: 'cloudy' }, { hi: 41, lo: 28, c: 'rain' }, { hi: 42, lo: 29, c: 'clear' },
  ];
  SH.WICON = { clear: '☀️', cloudy: '☁️', rain: '🌧️', storm: '⛈️', fog: '🌫️' };
  SH.WICON_NIGHT = { clear: '🌙', cloudy: '☁️', rain: '🌧️', storm: '⛈️', fog: '🌫️' };

  // Mom's shifts: D 7-15, E 15-23, N 23-07(next), DD 7-23, OFF
  SH.MOM_SHIFTS = [null, 'E', 'DD', 'N', 'N', 'E', 'D', 'OFF', 'E', 'DD', 'E', 'N', 'N', 'D', 'OFF', 'E', 'DD', 'D', 'E', 'N', 'OFF', 'D',
    'E', 'E', 'D', 'N', 'E', 'D', 'OFF', 'E', 'E', 'D'];
  // How volatile Rick is each day (0..3)
  SH.RICK_DAY = [null, 1, 1, 1, 2, 2, 3, 1, 2, 2, 2, 1, 2, 2, 0, 3, 2, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

  // ---- Locations (map units: 1000 x 650) ----
  SH.LOC = {
    home: { name: 'Home', sub: '14 Maple St', x: 175, y: 470, type: 'house', icon: '🏠', indoor: true, vis: 1.0, bus: true,
      blurb: 'A two-bedroom rental with a sagging porch. Mom, Rick, Lily, and you.' },
    patel: { name: "Mrs. Patel's", sub: '16 Maple St', x: 230, y: 505, type: 'house2', icon: '🐕', indoor: true, vis: 0.6,
      blurb: 'Next door. Retired chemistry teacher. Has a very old beagle named Newton.' },
    jordan: { name: "Jordan's House", sub: '88 Birch Ln', x: 105, y: 285, type: 'house2', icon: '🛹', indoor: true, vis: 0.9,
      blurb: 'Your best friend. His garage has a couch, a mini fridge, and zero rules.' },
    school: { name: 'Lincoln Middle School', sub: 'Grade 7', x: 330, y: 300, type: 'school', icon: '🏫', indoor: true, vis: 1.0, bus: true,
      blurb: 'Brick, fluorescent lights, the smell of floor wax and cafeteria tots.' },
    store: { name: 'QuikMart', sub: 'Corner of Maple & 5th', x: 285, y: 575, type: 'store', icon: '🏪', indoor: true, vis: 0.5, bus: true,
      blurb: 'Open 6 AM to midnight. Hot dogs that have seen things.' },
    library: { name: 'Harlow Public Library', sub: 'Free wifi. Outlets. Warm.', x: 470, y: 250, type: 'library', icon: '📚', indoor: true, vis: 0.4, bus: true,
      blurb: 'The librarian, Mr. Abernathy, lets kids charge phones at the back tables.' },
    park: { name: 'Riverside Park', sub: 'Skate bowl & river path', x: 540, y: 410, type: 'park', icon: '🌳', indoor: false, vis: 0.7,
      blurb: 'Skate bowl, benches, a playground nobody uses after dark.' },
    police: { name: 'Harlow Police Dept.', sub: '24/7', x: 405, y: 140, type: 'police', icon: '🚓', indoor: true, vis: 1.0,
      blurb: 'Small-town station. Flag out front. Vending machine inside.' },
    mall: { name: 'Harlow Mall', sub: 'GameSwap • food court', x: 700, y: 205, type: 'mall', icon: '🛍️', indoor: true, vis: 0.6, bus: true,
      blurb: 'Half the stores are closed. GameSwap buys used games. Security guard named Big Lou.' },
    hospital: { name: "St. Brigid's Hospital", sub: "Where Mom works", x: 820, y: 110, type: 'hospital', icon: '🏥', indoor: true, vis: 1.0, bus: true,
      blurb: 'Mom works here as a nursing assistant. Everyone on 4 West knows your face from her phone.' },
    diner: { name: 'Nite Owl Diner', sub: 'Open 24 hours', x: 655, y: 520, type: 'diner', icon: '☕', indoor: true, vis: 0.5, bus: true,
      blurb: 'Vinyl booths, bottomless coffee, a waitress named Dolores who has seen everything twice.' },
    laundromat: { name: 'Suds & Duds', sub: 'Laundromat • 24h', x: 400, y: 555, type: 'laundromat', icon: '🧺', indoor: true, vis: 0.4, bus: true,
      blurb: 'Warm dryers, flickering lights, a sign: NO LOITERING. Nobody enforces it after 2 AM. Usually.' },
    underpass: { name: 'Route 9 Underpass', sub: 'Under the bridge', x: 560, y: 590, type: 'underpass', icon: '🌉', indoor: false, vis: 0.2,
      blurb: 'Concrete, graffiti, the roar of trucks overhead. People sleep here. Some are kids.' },
    bus: { name: 'Greyline Bus Depot', sub: 'Tickets • Intercity', x: 845, y: 420, type: 'bus', icon: '🚌', indoor: true, vis: 0.8, bus: true,
      blurb: 'Intercity buses to Cedar Falls and beyond. The ticket agent watches everyone.' },
    trainyard: { name: 'Old Rail Yard', sub: 'Fenced. Mostly.', x: 930, y: 250, type: 'trainyard', icon: '🚂', indoor: false, vis: 0.15,
      blurb: 'Rusted boxcars and a hole in the fence. It looks like freedom in movies. It is not a movie.' },
    harbor: { name: 'Harbor House', sub: 'Youth drop-in & shelter • 24/7', x: 905, y: 575, type: 'harbor', icon: '🏮', indoor: true, vis: 0.0, bus: true, hidden: true,
      blurb: 'A converted Victorian with a porch light that never goes off. For kids who can\'t go home tonight.' },
  };
  SH.BUS_ROUTE = ['home', 'store', 'laundromat', 'diner', 'harbor', 'bus', 'hospital', 'mall', 'library', 'school', 'home'];

  SH.OPEN = {
    home: () => true, patel: (h) => h >= 8 && h < 20, jordan: (h) => h >= 8 && h < 21.5,
    school: (h, wd) => wd < 5 && h >= 7.5 && h < 16, store: (h) => h >= 6 && h < 24,
    library: (h, wd) => wd === 6 ? (h >= 12 && h < 17) : (h >= 9 && h < 20), park: () => true, police: () => true,
    mall: (h) => h >= 10 && h < 21, hospital: () => true, diner: () => true, laundromat: () => true,
    underpass: () => true, bus: (h) => h >= 5 && h < 24, trainyard: () => true, harbor: () => true,
  };

  // ---- Items ----
  SH.ITEMS = {
    phone: { n: 'Phone', w: 0.3, i: '📱', d: 'Cracked case. Your whole life in a rectangle.', fixed: true },
    key: { n: 'House key', w: 0, i: '🔑', d: 'On a Skyforge keychain.' },
    buspass: { n: 'Student bus pass', w: 0, i: '🎫', d: 'Free city bus on weekdays, 6 AM – 7 PM.' },
    charger: { n: 'Phone charger', w: 0.3, i: '🔌', d: 'Needs an outlet. Outlets need buildings.' },
    powerbank: { n: 'Power bank', w: 0.6, i: '🔋', d: 'Holds about one full phone charge.', charge: 100 },
    hoodie: { n: 'Grey hoodie', w: 1, i: '👕', d: 'Worn soft. Warmth +15.', warm: 15 },
    coat: { n: 'Winter coat', w: 2, i: '🧥', d: 'Too small at the wrists, but warm. Warmth +30.', warm: 30 },
    blanket: { n: 'Fleece blanket', w: 2, i: '🛏️', d: 'Dinosaur print. Warmth +25 when sleeping.', sleepWarm: 25 },
    umbrella: { n: 'Umbrella', w: 0.8, i: '☂️', d: 'Blocks most rain penalties.' },
    water: { n: 'Water bottle', w: 0.8, i: '💧', d: 'Refillable. +4 fullness, helps with headaches.', food: 4, reusable: true },
    granola: { n: 'Granola bar', w: 0.15, i: '🍫', d: '+12 fullness.', food: 12 },
    chips: { n: 'Bag of chips', w: 0.25, i: '🥔', d: '+10 fullness. Loud to open.', food: 10 },
    sandwich: { n: 'PB&J sandwich', w: 0.35, i: '🥪', d: '+25 fullness. Squished.', food: 25 },
    apple: { n: 'Apple', w: 0.3, i: '🍎', d: '+10 fullness.', food: 10 },
    hotdog: { n: 'QuikMart hot dog', w: 0.3, i: '🌭', d: '+22 fullness. Questionable.', food: 22 },
    inhaler: { n: 'Old inhaler', w: 0.1, i: '🫁', d: 'Not needed anymore.' }, // turn 51: asthma removed; kept only so very old saves never crash (saves.js strips it)
    flashlight: { n: 'Flashlight', w: 0.4, i: '🔦', d: 'Makes dark places slightly less terrible.' },
    clothes: { n: 'Change of clothes', w: 1, i: '👖', d: 'Use for +25 hygiene (once).', hyg: 25 },
    toothbrush: { n: 'Toothbrush', w: 0.1, i: '🪥', d: 'Use at any sink for +6 hygiene.' },
    drawing: { n: "Lily's drawing", w: 0.05, i: '🐢', d: 'A turtle with a cape. "SAM IS MY HERO". Look at it: mood up.' },
    photo: { n: 'Photo of Grandma', w: 0.05, i: '🖼️', d: 'You and Grandma Rose at the lake. Her address is written on the back.' },
    sketchbook: { n: 'Sketchbook', w: 0.5, i: '📓', d: 'Drawing calms you down.' },
    ticket: { n: 'Bus ticket: Cedar Falls', w: 0, i: '🎟️', d: 'One way. Departure times are printed on the back.' },
    flyer: { n: 'Harbor House flyer', w: 0, i: '📄', d: '"Can\'t go home tonight? Harbor House. 24/7. No judgment." 212 Wharf St.' },
    safeline: { n: 'Blue Safeline card', w: 0, i: '📘', d: 'NATIONAL RUNAWAY SAFELINE · 1-800-RUNAWAY · 24/7 · free · confidential. The ticket agent gave it to you.' },
    card: { n: "Ms. Okafor's card", w: 0, i: '🪪', d: 'School counselor. "My door is always open." Her cell is handwritten.' },
    game1: { n: 'Skyforge Legends (disc)', w: 0.2, i: '💿', d: 'Could sell at GameSwap.', sell: 12 },
    game2: { n: 'Kart Chaos 3 (disc)', w: 0.2, i: '💿', d: 'Could sell at GameSwap.', sell: 9 },
    console: { n: 'Old game console', w: 2.5, i: '🎮', d: 'Dad gave it to you before he left. GameSwap would pay $55.', sell: 55 },
  };
  SH.BAG_CAP = 9;

  // ---- Characters ----
  SH.NPCS_META = {
    mom: { n: 'Mom', full: 'Dana Reyes', col: '#e98ab0', ini: 'M', ph: true },
    rick: { n: 'Rick', full: 'Rick Hollis (stepdad)', col: '#c0703a', ini: 'R', ph: true },
    lily: { n: 'Lily', full: 'Lily (half-sister, 7)', col: '#7bd88f', ini: 'L', ph: true },
    jordan: { n: 'Jordan', full: 'Jordan Pike', col: '#6aa7ff', ini: 'J', ph: true },
    grandma: { n: 'Grandma Rose', full: 'Rose Delgado', col: '#d9b86a', ini: 'G', ph: true },
    okafor: { n: 'Ms. Okafor', full: 'School counselor', col: '#5cc8b0', ini: 'O', ph: false },
    dex: { n: 'dex_19', full: 'dex_19 (Skyforge)', col: '#9aa3b5', ini: 'D', ph: true },
    wren: { n: 'Wren', full: 'Wren, 16', col: '#b48cff', ini: 'W', ph: false },
    dolores: { n: 'Dolores', full: 'Night-shift waitress', col: '#f28b66', ini: 'D', ph: false },
    patel: { n: 'Mrs. Patel', full: 'Neighbor', col: '#c7a4ff', ini: 'P', ph: false },
    tyler: { n: 'Tyler', full: 'Tyler Brandt', col: '#ff6b6b', ini: 'T', ph: false },
    officer: { n: 'Officer Lowe', full: 'Harlow PD', col: '#6f8cff', ini: 'L', ph: false },
    marcus: { n: 'Marcus', full: 'Harbor House counselor', col: '#f2a65a', ini: 'M', ph: false },
    agent: { n: 'Ticket agent', full: 'Greyline Depot', col: '#8aa0b8', ini: 'A', ph: false },
    tanya: { n: 'Mrs. Pike', full: "Jordan's mom", col: '#88c0ff', ini: 'T', ph: false },
    lighthouse: { n: 'Lighthouse Line', full: 'Youth crisis text line (in-game)', col: '#ffd479', ini: '✦', ph: true },
    pip: { n: 'PIP', full: 'Personal Intelligent Pal v0.9β', col: '#b48cff', ini: '◉', ph: true },
    class: { n: '7B 🔥 group', full: 'Class group chat', col: '#ff9f43', ini: '#', ph: true },
  };

  // Chirp (social app) filler posts
  SH.CHIRP_POOL = [
    ['maddie.k', 'who else is NOT ready for the science quiz 💀'], ['tyler.b', 'lunch was mid. as usual'],
    ['jpike_sk8', 'landed a kickflip finally. 3 months. dont talk to me'], ['harlow_hs_band', 'Fall concert tickets on sale!'],
    ['ava.reads', 'library has the new Wings of Ember book!!!'], ['devonnn', 'anyone selling a Skyforge battle pass code'],
    ['maddie.k', 'halloween dance theme is "Midnight Carnival" 🎪'], ['priya.draws', 'drew my cat as a knight. rate 1-10'],
    ['tyler.b', 'some ppl in 7B need a shower fr'], ['harlowweather', 'Frost advisory possible later this week. Bring pets in!'],
    ['coach.m', 'Cross country practice moved to the park. 3:30.'], ['ava.reads', 'rainy days are for reading. change my mind'],
    ['devonnn', 'my mom took my phone for a WEEK for a C'], ['jpike_sk8', 'riverside bowl got repainted 🔥'],
  ];

  SH.JOKES = [
    "Why don't skeletons fight? They don't have the guts. Unlike you, apparently, reading this at this hour.",
    "I told a joke about the bus schedule once. Nobody got it. Much like the bus.",
    "What do you call a phone at 1%? Me. You call it me.",
    "Why was the math book sad? Too many problems. Relatable content, huh.",
    "I'd tell you a UDP joke but you might not get it. That's a networking joke. I'm wasted on you.",
    "Parallel lines have so much in common. It's a shame they'll never meet. Anyway, how's your family?",
    "I'm reading a book about anti-gravity. It's impossible to put down. Unlike your grades.",
  ];
})(window.SH);
