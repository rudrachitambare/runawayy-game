/* SMALL HOURS — towns as real places (3/5): the writing.
   Lines change with the town's size, the hour, the weather, how long you've been gone, whether your face is on
   posters yet, and how many times you've been somewhere. Pools cycle without repeating until they run out. */
(function (SH) {
  const TX = SH.TownText = {};
  const G = () => SH.G;
  const log = (t, c) => SH.UI.log(t, c || '');
  /* no-repeat picker: walks a pool in order (shuffled once per key) so you don't see the same line twice in a row */
  TX.pk = function (key, arr) {
    arr = arr.filter((x) => x); if (!arr.length) return '';
    const g = G(); g.twx = g.twx || {}; const s = g.twx[key] = g.twx[key] || { i: 0, o: null, n: 0 };
    if (!s.o || s.n !== arr.length) { s.o = arr.map((_, i) => i).sort(() => Math.random() - 0.5); s.n = arr.length; s.i = 0; }
    const v = arr[s.o[s.i % s.o.length]]; s.i++; if (s.i >= s.o.length) { s.o = null; }
    return typeof v === 'function' ? v() : v;
  };
  const ctx = () => { const g = G(), h = SH.hour(); return { g, h, dark: SH.isDark(), rain: SH.raining(), cold: SH.tempF ? SH.tempF() < 42 : false, days: g.missingAt ? Math.floor((g.t - g.missingAt) / 1440) : 0, rep: !!g.reported, broke: g.money < 3, hungry: g.s.full < 30, tired: g.s.energy < 30, party: (g.party || []).length, morning: h >= 5 && h < 10, evening: h >= 17 && h < 21, night: h >= 21 || h < 5 }; };
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  /* ---------- arriving ---------- */
  TX.arrive = function (p, T, at, visits) {
    const c = ctx(), L = T.locs[SH.Town.id(p.id, at)], tier = T.tier;
    if (visits > 1) return TX.pk('rearr' + tier, [
      `${p.name} again. ${L.name}, the same as you left it. ${c.dark ? 'The same streetlight is still flickering.' : 'Somebody has put a pumpkin out since last time.'}`,
      `Back in ${p.name}. You know where the bathroom is here. You know which clerk looks up. That's what home is, sort of, in a terrible way.`,
      `${p.name}. You recognize a truck. Worse: the truck's owner might recognize you.`,
    ]);
    const how = at === 'station' ? `The train sighs to a stop at ${L.name}. You step down onto the platform with your backpack and ${c.party ? 'your people' : 'nobody'}.`
      : at === 'edge' ? `You walk into ${p.name} the long way, past the ${tier === 'village' ? 'grain elevator' : tier === 'city' ? 'first overpass' : 'water tower'} and the sign that says WELCOME TO ${p.name.toUpperCase()}${p.motto ? `: ${p.motto.toUpperCase()}` : ''}.`
      : at === 'gas' ? `The ride drops you in the lot at ${L.name} and pulls out before you've got both straps on.`
      : tier === 'city' ? `The bus hisses into ${L.name}. Bay 14. Fluorescent light, pigeons inside the building somehow, a voice announcing departures to nobody.`
      : tier === 'village' ? `The bus lets you off at the shelter and keeps going. Its taillights are the last moving thing you can see.`
      : /depot|terminal/i.test(L.name) ? `The bus pulls into ${L.name} and exhales. A man with a clipboard, a vending machine, a bench bolted to the floor. You get off like you do this all the time.` : `The bus stops on ${T.street} long enough for you to get off. The doors fold shut behind you.`;
    const first = {
      village: [`${p.name} is one street and a sky. ${p.pop < 600 ? `Population ${p.pop}, and from the way a woman on a porch is watching you, she knows every one of them.` : 'A grain elevator, a church, a gas station, and a lot of porches.'}`, `A dog trots out to inspect you, decides you're fine, trots back. The whole village seems to have the same opinion, for now.`],
      small: [`${p.name}: brick storefronts, angle parking, a bank clock that says ${SH.fmt12 ? SH.fmt12() : 'the wrong time'} and ${Math.round(SH.tempF ? SH.tempF() : 50)}°.`, `The kind of town where the diner has regulars and the regulars have opinions.`],
      town: [(() => { const h = SH.Atlas.data().places.find((x) => x.home); return h && p.pop > h.pop * 1.15 ? `${p.name} is bigger than Harlow. Nobody looks twice at a kid with a backpack here. Yet.` : `${p.name} is about the size of Harlow, which is the strange part: the same kind of streets, all with the wrong names. Nobody looks twice at you. Yet.`; })(), `Chain stores at the edges, a real downtown in the middle, and people too busy to wonder about you.`],
      city: [`${p.name}. Noise, traffic, ten thousand strangers. Being invisible feels good for about ten minutes.`, `Sirens somewhere, always. A man sells phone cases from a blanket. Nobody here knows your name, and nobody wants to.`],
    }[tier] || [''];
    const mood = c.night ? 'It\'s the middle of the night. Everything is closed except whatever\'s open 24 hours, and the people who are awake now are awake for reasons.'
      : c.rain ? 'It\'s raining the fine, sideways kind of rain that gets into your collar.'
      : c.morning ? 'The town is just waking up: a delivery truck, a jogger, the smell of someone\'s bacon.'
      : c.evening ? 'The light is going gold and then gray. Porch lights come on one at a time.' : '';
    const worry = c.rep && (tier === 'village' || tier === 'small') ? ' Your face is on the internet now. In a town this size, somebody has seen it.' : '';
    return `${how} ${first[0]} ${first[1] || ''} ${mood}${worry}`.replace(/\s+/g, ' ').trim();
  };

  /* ---------- moving around town ---------- */
  TX.go = function (from, L, opt, n) {
    const c = ctx(), m = opt.mode === 'bus' ? 'take the city bus' : opt.mode === 'bike' ? 'ride' : 'walk';
    const on = {
      main: ['past the bank clock', 'past a barber pole that isn\'t spinning', 'past a hardware store with rakes out front'],
      gas: [ctx().dark ? 'toward the glow of the pumps' : 'toward the gas station sign', 'along the highway shoulder to the gas station', 'across the lot, where the air smells like gasoline and hot dogs'],
      diner: ['toward the smell of coffee', 'to the diner with the pie in the window'],
      library: ['to the library, the most honest building in any town', 'up the library steps'],
      church: ['around the side of the church to the door that\'s always open', 'up the church steps'],
      park: ['into the park', 'across the grass'],
      laundromat: ['toward the warm, humming glow of the laundromat'],
      edge: ['out to where the sidewalk gives up', 'past the last streetlight'],
      stop: ['back to the bus stop'], station: ['to the station'], motel: ['out to the motels by the highway'], police: ['toward the flag in front of the police station'],
      work: [`out to ${L.short || L.name}`], clinic: ['to the clinic'], backst: ['into the side streets'], shelter: ['to the brick house with the porch light'], grandma: ['onto Larkspur Lane, reading the house numbers'],
    }[L.kind] || ['across town'];
    const extra = c.rain && opt.mode !== 'bus' ? ' The rain finds the gap between your hood and your neck.' : c.night && opt.mode === 'walk' ? ' Your footsteps are the loudest thing in town.' : '';
    return `You ${m} ${TX.pk('go' + L.kind, on)} (${opt.mins} min).${n === 1 && L.blurb ? ' ' + L.blurb : ''}${extra}`;
  };
  TX.idle = (L, T) => TX.pk('idle' + L.kind, {
    main: ['You sit on the bank steps and watch the town do its thing. A man parallel parks for four minutes. A woman walks a cat on a leash. Nobody looks at you.', 'You sit on a bench outside the hardware store. The owner comes out to flip the sign and nods at you like you\'re a regular. Maybe you are now.'],
    gas: ['You lean against the ice machine. Trucks come and go. A trucker buys six energy drinks and a single banana.'],
    stop: ['You sit in the shelter and read the graffiti. JESS + TY. CLASS OF 09. SOMEBODY LOVES YOU. That last one is in pen, neat, like whoever wrote it meant it.', 'You watch the road. Every car is a bus until it isn\'t.'],
    park: ['You sit on a swing without swinging. The chains are cold.', 'A squirrel watches you eat nothing. You watch it eat something. Fair.'],
    edge: ['You sit on the guardrail. The wind comes across the fields like it\'s looking for somebody.'],
  }[L.kind] || ['You rest. Your legs thank you. Your brain doesn\'t shut up.', 'You sit and let the time go by. It goes by slowly, the way it does when you have nowhere to be.']);

  /* ---------- walking the main street: things happen ---------- */
  TX.walk = function (L, T, p) {
    const c = ctx(), g = c.g, r = Math.random();
    if (r < (p.danger || 0.03) * 1.3 && !c.morning) return SH.TownEvents ? SH.TownEvents.car(p) : null;
    if (r < 0.14 && !g.flags['found$' + p.id]) { g.flags['found$' + p.id] = 1; const amt = [1, 5, 1, 10, 5][Math.floor(Math.random() * 5)]; SH.money(amt); return log(`Something green in the gutter by the ${T.tier === 'city' ? 'bus shelter' : 'post office'}. A ${amt}-dollar bill, damp and real. You look around. Nobody. It's yours.`, 'good'); }
    if (c.rep && r < 0.3) return log(TX.pk('poster', [
      `On a telephone pole: a MISSING poster. Your school picture. Your name spelled right. Somebody printed this and drove it here and stapled it, four staples, one in each corner. You keep walking with your hood up and your heart going like a rabbit's.`,
      `The window of the ${T.tier === 'city' ? 'corner store' : 'hardware store'} has a flyer taped inside: HAVE YOU SEEN. You have. Every morning in the mirror. You turn and look at a display of snow shovels very hard until your face goes normal.`,
    ]), 'bad');
    const lines = {
      village: [`${p.name}'s whole street takes twelve minutes. A post office in somebody's front room. A notice board. A tractor for sale, "runs good, $1,800 OBO". ${T.people[0] ? T.people[0].n + ', who ' + T.people[0].role + ', waves like everybody waves at everybody.' : ''}`, 'A combine rolls down the middle of the street at walking pace, and three cars follow it patiently like a parade nobody planned.', 'You pass a yard with a hand-painted sign: EGGS $3, HONOR SYSTEM. A coffee can for the money. Someone trusts the whole world here.'],
      small: [`Main Street: ${(p.econ || ['a feed store'])[0]} trucks, a diner with pie in the window, a closed movie theater whose sign still says COMING SOON. It's been coming soon since before you were born.`, 'Two old men on a bench outside the barber argue about whether it\'s going to rain. It is. Both of them are wrong about when.', 'The bank has a clock and a thermometer. You stand under it and watch the temperature drop a degree like it\'s personally mad at you.'],
      town: [`${p.name} has a real downtown: a Dollar General, a pharmacy, a high school with a football field bigger than your whole block. A marquee says HOMECOMING FRIDAY — GO ${pick2(['EAGLES', 'BULLDOGS', 'PANTHERS', 'HORNETS'])}.`, 'A girl your age walks past with her mom, arguing about a phone. You would give anything for that argument.', 'You window-shop at a sporting goods store. A sleeping bag rated to 20°F costs $89. You do the math on your whole life and look away.'],
      city: ['Food carts, buses, sirens. You pass three people talking to themselves and only one of them is on a phone. You pass a sign for a youth center without meaning to read it.', 'A busker plays "Wonderwall" badly enough to be brave. You give him a nickel. He salutes you.', 'Glass towers, and in the doorway of one, a guy in a sleeping bag reading a paperback. He looks up. "Don\'t," he says, kind of gently. "Whatever you\'re doing. Call somebody." Then he goes back to his book.'],
    }[T.tier] || [''];
    log(TX.pk('walk' + p.id, lines), '');
  };
  const pick2 = (a) => a[Math.floor(Math.random() * a.length)];

  TX.board = function (L, T, p) {
    const c = ctx(), g = c.g;
    const notes = [
      `LOST: orange cat, answers to "Pumpkin", very fat, very loved. $20 reward. A phone number on tear-off tabs. Two are gone.`,
      `CHURCH SUPPER, WEDNESDAYS 5–7, ${T.locs[SH.Town.id(p.id, 'church')] ? T.locs[SH.Town.id(p.id, 'church')].name.toUpperCase() : 'COMMUNITY HALL'}. ALL WELCOME. FREE WILL OFFERING.`,
      `HELP WANTED: someone to stack firewood, cash, ask for ${(() => { const st = SH.Town.st(), w = T.people.find((q) => q.kind === 'work'); st.helpName = st.helpName || (w ? w.n : pick2(['Dale', 'Arlene', 'Mick'])); return st.helpName; })()} at ${T.locs[SH.Town.id(p.id, 'work')].short}.`,
      'FOR SALE: kids\' bike, needs chain. $15. "Or free to a good home, honestly."',
      'PIANO LESSONS. VOICE LESSONS. LIFE LESSONS (JOKING). Call Bev.',
      'Hand-lettered: THE BLESSING BOX by the fire station is restocked on Mondays. Food, socks, toothbrushes. Take what you need.',
    ];
    const lines = [TX.pk('board' + p.id, notes), TX.pk('board2' + p.id, notes)];
    if (c.rep) lines.push('And, newest, pinned over everything else: your face. MISSING. The date you left. A number to call. The paper is still crisp. Somebody put it up today.');
    log(`The notice board outside the post office. ${lines.join(' ')}`, c.rep ? 'bad' : '');
    if (c.rep) SH.st('stress', 8);
  };
  TX.post = (T, p) => TX.pk('post' + p.id, [
    `The post office lobby is one room with brass mailboxes and a radiator that clanks. A poster about duck stamps. A poster about mail fraud. ${ctx().rep ? 'A poster with your face on it.' : 'No poster with your face on it. Yet.'}`,
    'The postmaster is sorting mail behind a half door and humming. She says "Morning!" without looking. You say "Morning" back like you belong here. It works.',
  ]);
  TX.wash = (where) => TX.pk('wash' + where, [
    'Pink soap, brown paper towels, a mirror you avoid for the first minute. You scrub your face and neck and the backs of your ears like Mom used to make you. You look a little less like a runaway.',
    'Someone knocks while you\'re washing your armpits in the sink. "Just a minute!" you say, in your most normal voice. It comes out very normal. Suspiciously normal.',
    `You brush your teeth${SH.has('toothbrush') ? '' : ' with your finger'} and wet your hair down. In the mirror there's a kid who looks tired, and who looks like someone. You don't look for long.`,
  ]);
  TX.read = (T) => TX.pk('read', ['You read half a book about a girl who survives alone on an island for eighteen years. She had it easy. She had fish.', 'A graphic novel about a kid whose dad is a monster, literally, with horns. It ends okay. You read the last page twice.', 'You fall asleep for eleven minutes on a book about volcanoes. Nobody wakes you. You wake up with the page stuck to your cheek.', 'An atlas, the old paper kind. You find where you are, then where you came from. On paper it\'s only three inches.']);
  TX.libboard = function (L, T, p) {
    const sh = T.locs[SH.Town.id(p.id, 'shelter')];
    const lines = ['Toddler story time, Tuesdays. Free tax help. A knitting circle that meets "whenever Doris feels like it".'];
    if (!SH.has('safeline')) { SH.addBag('safeline', true); lines.push('And a tear-off flyer, blue: NATIONAL RUNAWAY SAFELINE · call or text · 24/7 · free · confidential. You tear off a tab without deciding to. It\'s in your pocket now.'); }
    else lines.push('The same blue Safeline flyer you already have one of. Someone else has torn off a tab since you were here. You wonder who.');
    if (sh) { SH.LOC[sh.id].hidden = false; lines.push(`${sh.name}: "Ages 11–17. Hot meals, showers, a bed. You don't have to explain anything tonight." An address. It's on your map now.`); }
    log(lines.join(' '), 'good');
  };
  TX.pew = (T) => TX.pk('pew', ['It\'s so quiet you can hear the radiator tick. Light comes through the stained glass in colors that land on your hands. You don\'t pray, exactly. You just sit there and let something be bigger than you for a while.', 'An old woman two pews up is praying out loud in a whisper, a long list of names. You hope somebody\'s saying yours. You hope somebody isn\'t.', 'You read the hymn numbers on the board. 412, 88, 203. You make them into a code, and the code means nothing, and it\'s nice to think about nothing.']);
  TX.pantry = (it) => TX.pk('pantry', [`A plastic shelf with a hand-lettered sign: TAKE WHAT YOU NEED, LEAVE WHAT YOU CAN. You take ${SH.ITEMS[it] ? 'a ' + SH.ITEMS[it].n.toLowerCase() : 'something'} and stand there a second, feeling like you owe somebody. You do. You'll pay it back someday. You decide that.`, `Canned corn, a lot of canned corn, and ${SH.ITEMS[it] ? 'a ' + SH.ITEMS[it].n.toLowerCase() : 'something you can actually eat'}. You take it. The sign says God bless. It's a lot to carry, a blessing.`]);
  TX.supper = (T) => TX.pk('supper', ['Folding tables, a paper tablecloth, four kinds of casserole and all of them have crushed potato chips on top. A lady in a Christmas sweater in October puts a second scoop on your plate. "Growing boy." "Whose are you, hon?" someone asks. You say your grandma\'s visiting her sister. They nod. They look at each other.', 'A man in overalls says grace for a very long time. Then: ham, green beans, Jell-O with things suspended in it. You eat like it\'s your job. Three people ask your name. You give three different ones. Nobody notices. Probably.']);
  TX.park = (T, c) => TX.pk('park' + T.tier, T.tier === 'village' ? ['A dad hits grounders to a kid who can\'t catch them. He keeps hitting them anyway, softer each time.', 'Just you and the bleachers and a wind that smells like cut hay.'] : ['A little kid on the slide screams with joy like it\'s the first time anyone has ever gone down a slide. For him, maybe it is.', 'A couple breaks up on the bench next to yours, quietly and completely. You pretend to be very interested in your shoes.', 'Pigeons, a man feeding them, a sign that says DO NOT FEED THE PIGEONS right next to the man.']);
  TX.draw = (T, L) => TX.pk('draw', [`You draw ${L.name}: the benches, a lamp post, a lady with a stroller. You leave a blank spot where you are. Then you draw yourself in, small, in the corner.`, 'You draw your sister from memory and get her nose wrong and fix it and get it wrong again. It\'s the best one you\'ve done.', 'You draw a map of everywhere you\'ve been since you left. It looks like a kid\'s drawing of a map. It looks like a long way.']);
  TX.dryers = (T) => TX.pk('dryers', ['You sit with your back against a running dryer. It\'s like leaning on a big warm animal. The TV in the corner shows the weather: colder tomorrow.', 'A woman folding towels hands you one, still warm, without a word. You hold it against your face. She goes back to folding.']);
  TX.edge = (T, p, c) => TX.pk('edge' + p.id, [`From out here ${p.name} is ${c.dark ? 'a handful of lights and one blinking red one on the water tower' : 'roofs and trees and a steeple'}. Somebody in one of those houses is making dinner. Somebody is arguing. Somebody is doing homework. None of them are you.`, 'The road goes both ways. That\'s the thing about roads.', `A pickup slows down, looks at you, speeds up. You let out a breath. ${c.dark ? 'The stars out here are ridiculous.' : 'A hawk sits on a fence post like it owns the county.'}`]);
  TX.road = (T, p) => TX.pk('road', ['You walk the shoulder for a mile and back. Cows watch you with total disinterest. It\'s restful to be unimportant to a cow.', 'The road is so straight you can see a truck coming for five minutes before it gets to you. The driver lifts one finger off the wheel. You lift one back. Country hello.']);

  /* ---------- work ---------- */
  TX.noWork = (where, T) => TX.pk('nowork' + where, where === 'diner' ? ['"Honey, I can\'t pay a kid under the table, the health department would eat me alive." She gives you a free biscuit, which is worse, somehow.', '"How old are you? ...Where are your folks?" You say they\'re at the motel. She says "Uh huh." You leave before the next question.'] : ['"Sorry, kid. Insurance." He says it kindly. It doesn\'t help.', '"You should be in school," a woman says, and reaches for her phone, and you are already walking.', '"Come back with a grown-up and we\'ll talk." You say you will. You won\'t.']);
  TX.didWork = (where, T, p, pay) => where === 'diner'
    ? TX.pk('workd', [`Two hours of dishes. The water is so hot your hands go pink and wrinkled. The cook, who never tells you his name, slides you a plate of fries halfway through and at the end, $${pay} in ones. "You didn't see me do that," he says.`, `You scrape plates into a bin and learn that people leave more food than they eat. The waitress gives you $${pay} from her tips and a look that says she knows. She doesn't say it. Yet.`])
    : TX.pk('workw' + p.id, [`You ${((p.kidjobs || ['stack boxes'])[0]).replace(/ \(.+\)$/, '')} for two hours. Your back hurts. Your hands smell like ${/coast|lake|river/.test(SH.Town.biome(p.biome)) ? 'fish and river mud' : SH.Town.biome(p.biome) === 'forest' ? 'pine sap' : 'hay and diesel'}. $${pay}, cash, and a bottle of water, and the question nobody asks hanging in the air.`, `A woman in a Carhartt jacket watches you work for ten minutes before she says anything. Then: "You're a hard worker. Where'd you learn that?" You say your grandpa. It's the first true thing you've said all day, sort of. $${pay}.`]);
})(window.SH);
