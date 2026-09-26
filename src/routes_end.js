/* SMALL HOURS — E2c: endings the transport network can reach. Registered into the ending engine (SH.EndX).
   Each key has a group variant (higher priority when friends are with you) and a solo fallback, so no trip ever
   falls back to the generic "found by police". Honest, not glamorous; every one leaves a door to a safe adult. */
(function (SH) {
  const X = SH.EndX; if (!X) return;
  const to = (c) => (c.extra && c.extra.to && c.extra.to.name) || 'the next town';
  const co = (c) => (c.extra && c.extra.op && c.extra.op.n) || 'the bus company';
  const grp = (c) => c.n > 0;
  X.add([
    /* pro train: the conductor */
    { k: 'conductor', on: ['conductor'], p: 2, w: grp, t: 'Tickets, Please', sub: (c) => `Regional Rail · with ${c.pl}`, x: (c) => [
      `The conductor gets to your row, looks at ${c.n + 1} kids with backpacks and no adult, and doesn't punch anything. "Which one of you wants to tell me where your parents are?" Nobody does. ${c.pn[0]} cries first, which makes it okay for everyone else.`,
      `At ${to(c)} a transit officer is waiting on the platform with a box of granola bars. She splits you up only to take names, then puts you all back on one bench, because she can see you'd fight her otherwise.`,
      `Parents arrive one by one. ${c.mom} comes last. She doesn't yell. She holds on to you so long the officer finally says "Ma'am, the car's running," and she says "Let it run."`] },
    { k: 'conductor', on: ['conductor'], p: 1, t: 'Tickets, Please', sub: 'Regional Rail', x: (c) => [
      'The conductor is a heavy man with a gray mustache and a ticket clicker. He looks at your ticket, then at you, then sits down in the empty seat across the aisle, which conductors never do.',
      `"My granddaughter's about your age," he says. "She ran off once. Got as far as the bus station." He doesn't ask questions. He just stays there until ${to(c)}, where a transit officer is waiting on the platform.`,
      `She asks you if you're safe at home. It's the first time anybody's asked it straight out. You say "not really" to your shoes. She writes it down. That's the part that matters: someone wrote it down.`] },
    /* unprofessional train */
    { k: 'oldTrain', on: ['oldTrain'], p: 1, t: 'The Last Stop Before the Last Stop', sub: (c) => `The old local${c.withYou}`, x: (c) => [
      `The old conductor has been punching your ticket for three days in his head. Today he finally says it: "You're the kid from the paper." He shows you your own face, folded into quarters in his shirt pocket.`,
      `He doesn't radio anyone. He lets the train rattle on to its next little halt, a sign and a bench in a field, and walks you${grp(c) ? ' all' : ''} to the station agent's hut, where there's a space heater and a phone.`,
      `"You pick who we call," he says. "Your mom, the police, or the youth line. But we call somebody. That's my one rule and I've only got one." You pick. It takes a long time. He waits.`] },
    /* sketchy but safe: the driver who turns out kind */
    { k: 'kindDriver', on: ['kindDriver'], p: 1, t: 'The Wrong Stop', sub: (c) => `${co(c)} · cash, no questions`, x: (c) => [
      `The driver has a cigarette behind his ear and a radio full of static, and all trip he hasn't asked you a single thing. So when he misses the turn for ${to(c)}, you assume he's lost.`,
      `He isn't. He pulls up outside a building with a lighthouse on the sign. "Youth place," he says, not looking at you. "My sister stayed there when she was fourteen. Hot food, real beds. They don't call the cops on you the first night."`,
      `He waves off your money. "Fare's on me${grp(c) ? ', all of you' : ''}." Then, as the door folds open: "Hey. Whatever you're running from, you didn't deserve it." The bus pulls away before you can say anything back.`] },
    /* unprofessional driver recognizes the poster */
    { k: 'posterDriver', on: ['posterDriver'], p: 1, t: 'Seen', sub: (c) => co(c), x: (c) => [
      `Twenty minutes out, you catch the driver's eyes in the big mirror. Then again. Then he's looking at his phone at a red light, and then at you.`,
      `He pulls into a gas station "for a break" and doesn't come back. A sheriff's cruiser does. The deputy is younger than you expected, and she crouches by the bus steps so she's lower than you.`,
      `"You're not in trouble," she says. "I need to hear one thing from you: is it safe for you to go home?" ${c.n ? 'Your friends look at you. ' : ''}You open your mouth and, for once, the true answer comes out.`] },
    /* professional coach: station agent */
    { k: 'busAgent', on: ['busAgent'], p: 1, t: 'Scheduled Stop', sub: (c) => co(c), x: (c) => [
      `At the scheduled stop, a station agent climbs aboard with a clipboard and the driver points, apologetically, at your seat.`,
      `They're kind about it the way professionals are kind: a blanket, a juice box, a waiting room with a TV playing cooking shows. A police officer comes. Then a woman from Children's Services who asks better questions than the officer did.`,
      `You're home by midnight, or somewhere near home. The card she leaves has her direct number on the back, written in pen. You keep it in your phone case for a year.`] },
    /* night bus */
    { k: 'nightbus', on: ['nightbus'], p: 1, t: 'Night Run', sub: 'the bus nobody takes on purpose', x: (c) => [
      `A man two rows back has been talking to you for an hour: where you're going, who's meeting you, whether you're hungry. Every answer you give, he has another question.`,
      `When he moves up to the seat beside you${c.n ? ` and ${c.pn[0]} grabs your sleeve` : ''}, a woman in hospital scrubs stands up, says "Sit with me, baby, I saved you a seat," and marches you to the front. She tells the driver something quietly. The driver radios something back.`,
      `There's a police car at the next stop, for him, not you. But the officer sees you anyway. The nurse sits with you at the station until ${c.mom} arrives, and when she leaves she says: "You listened to your gut. Keep doing that."`] },
    /* tempo breaks down in a village */
    { k: 'tempoBreak', on: ['tempoBreak'], p: 1, t: 'Out of Road', sub: (c) => `a village with no name on the map${c.withYou}`, x: (c) => [
      'The tempo dies with a sound like a sigh, halfway up a hill, in a village that is a church, a feed store and eleven houses. The driver says it could be an hour. It is four.',
      `A woman brings everybody lemonade on a tray. She asks where you're headed. She asks who your people are. By the second glass she has figured it out, and she doesn't pretend she hasn't.`,
      '"There\'s no police here," she says. "Closest sheriff\'s forty minutes. I could call him. Or you could sit in my kitchen and call your grandma, or that helpline on the TV, and I\'ll make grilled cheese." She lets you choose. You choose the kitchen.'] },
    /* capital by train */
    { k: 'railCapital', on: ['railCapital'], p: 1, t: 'Port Aldine Central', sub: 'the biggest station in Averland', x: (c) => [
      'Port Aldine Central is enormous: marble, pigeons, a ceiling painted with stars. You step off the train into ten thousand strangers and for about a minute you feel completely free.',
      'Then a transit officer with a missing-child flyer on her tablet walks straight up to you, because stations are the first place anyone looks, and big stations have the most people looking.',
      `She buys you a pretzel. She asks what happened. The youth outreach worker who comes next has blue hair and a lanyard and knows every shelter in the city by first name. ${c.mom} is three hours away. For three hours, somebody listens.`] },
    /* legacy company keys (kept so old triggers never fall back) */
    { k: 'cheapDriver', on: ['cheapDriver', 'cheaprideCity'], p: 1, t: 'Driver Discretion', sub: 'CheapRide', x: (c) => [
      'The CheapRide driver takes your ticket, drives two exits, and pulls over at a rest stop. "I got kids," he says, to no one in particular, and makes a phone call with his back to the bus.',
      `The trooper who arrives is patient and tired. She asks the question everyone forgets to ask: "Did something happen at home?" ${c.n ? 'Everyone looks at you.' : ''} You nod. She takes out a notebook instead of handcuffs.`] },
  ]);
})(window.SH);
