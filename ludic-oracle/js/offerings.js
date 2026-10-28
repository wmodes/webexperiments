/**
 * @file The Ludic Oracle's offerings
 * @description The pool of things a seeker may lay before the Oracle. Each visit draws a
 *              few at random, so a returning seeker faces a different choice.
 */

/**
 * Everything a seeker might offer. `name` is a noun phrase that reads in a sentence
 * ("a sleepless night") and, capitalized, as a button; `judgment` is the Oracle's
 * verdict on that offering, spoken after it is chosen; `keywords` are word stems the
 * vision leans toward when this offering is made (see GrammarWeighter).
 * @type {Array<{id: string, name: string, judgment: string, keywords: string[]}>}
 */
var OFFERINGS = [
  {
    id: "bug",
    name: "a bug you never fixed",
    judgment: "A bug left to live. Mercy shown to a machine is never wasted.",
    keywords: ["glitch", "rewrit", "mistake", "broken", "rules change", "fail"]
  },
  {
    id: "sleepless-night",
    name: "a sleepless night",
    judgment: "A night surrendered to the work. The Oracle remembers the hours you cannot get back.",
    keywords: ["dream", "dark", "night", "sleep", "candlelight"]
  },
  {
    id: "unfinished-prototype",
    name: "an unfinished prototype",
    judgment: "A thing begun and never finished: the most honest offering there is.",
    keywords: ["build", "tiny", "jar", "single button", "pen and paper", "impossible", "never allowed to see it finished"]
  },
  {
    id: "childhood-game",
    name: "a game from your childhood",
    judgment: "The first game is always the truest. The Oracle is moved.",
    keywords: ["hide-and-seek", "dance", "dragon", "cake", "family", "dice", "paper"]
  },
  {
    id: "stolen-hour",
    name: "an hour stolen from something sensible",
    judgment: "Time taken from the sensible world and given to play. The Ludic Gods approve.",
    keywords: ["clock", "time", "minute", "once a day", "ninety", "dusk"]
  },
  {
    id: "secret",
    name: "a secret about your work",
    judgment: "A secret, spoken aloud in a temple. It will be kept. Mostly.",
    keywords: ["secret", "whisper", "rumor", "hidden", "lying", "overheard", "betray"]
  },
  {
    id: "old-save-file",
    name: "an old save file",
    judgment: "A life you left paused. The Oracle will hold it a while.",
    keywords: ["save file", "saved", "memor", "forget", "remember", "past", "ghost", "lost"]
  },
  {
    id: "kind-word",
    name: "a kind word for a stranger",
    judgment: "Generosity with no audience. Rarer than gold in this temple.",
    keywords: ["stranger", "friends", "peace", "cooperation", "share", "tender", "family", "helping"]
  },
  {
    id: "held-breath",
    name: "a held breath",
    judgment: "The breath before the jump, the moment before the boss. The Oracle inhales with you.",
    keywords: ["breath", "speak", "whisper", "hum", "quiet", "still", "tense"]
  }
];

/**
 * Finds an offering by its ID.
 * @param {string} id - An offering's `id`.
 * @returns {Object|undefined} The offering, or undefined if there is none with that ID.
 */
function findOffering(id) {
  return OFFERINGS.find((offering) => offering.id === id);
}

/**
 * The text of the button that offers something: its name, capitalized, with a full stop,
 * matching the other buttons ("Start over.").
 * @param {Object} offering - An entry from OFFERINGS.
 * @returns {string} Button text, e.g. "A held breath."
 */
function offeringLabel(offering) {
  return offering.name.charAt(0).toUpperCase() + offering.name.slice(1) + ".";
}

/**
 * Draws offerings at random, without repeats, for the seeker to choose among.
 * @param {number} count - How many offerings to draw.
 * @returns {Array<Object>} `count` offerings from OFFERINGS, in random order.
 */
function drawOfferings(count) {
  var pool = OFFERINGS.slice();
  // Fisher-Yates shuffle, so every order is equally likely
  for (var i = pool.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
