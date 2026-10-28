/**
 * @file The Ludic Oracle's answers
 * @description What each answer to the three truthful questions leans the vision toward.
 *              Keys match the `records` of dialogues 4-6 in ludic-oracle.js.
 *
 * Keywords are word stems that must appear in the game-idea grammar (grammar.js) to have
 * any effect: a stem that matches no rule nudges nothing.
 */

/**
 * Question name -> answer value -> keywords to lean toward.
 * @type {Object<string, Object<string, string[]>>}
 */
var ANSWER_KEYWORDS = {
  // Why do you make games?
  why: {
    feeling: ["tender", "melancholy", "joyful", "memor", "family", "ghost", "remember", "dance"],
    worlds: ["village", "forest", "library", "city", "town", "kingdom", "carnival", "dreamscape"],
    compulsion: ["replay", "once a day", "minute", "mischievous", "impossible", "ever more", "same", "rewind"]
  },
  // What do you fear most in your work?
  fear: {
    blank: ["single button", "pen and paper", "speak", "jar", "still", "questions"],
    finishing: ["finished", "never be saved", "game ends", "never", "ever more", "once"],
    ignored: ["watches", "learns", "rumor", "forgotten you", "forgets", "remembers", "stranger"]
  },
  // What have you given up for the sake of play?
  sacrifice: {
    sleep: ["dream", "dark", "night", "sleep", "candlelight"],
    sensible: ["absurd", "impossible", "dragon", "robot", "bargaining", "giant", "monster", "uncanny"],
    people: ["family", "friends", "stranger", "peace", "cooperation", "dinner", "wedding", "share"]
  }
};
