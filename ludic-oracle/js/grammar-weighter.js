/**
 * @file GrammarWeighter
 * @description Tilts a Tracery grammar toward chosen keywords, so what the seeker
 *              typed, offered and answered nudges the vision the Oracle reveals.
 *
 * Tracery picks among a symbol's rules uniformly at random, so listing a rule more than
 * once makes it more likely. The weighter does exactly that to a copy of the grammar,
 * for every rule whose own words contain a keyword. Nothing is forced: a nudge raises the
 * odds, it never guarantees the outcome.
 */

/**
 * Symbols that frame the vision or shape its sentences rather than supply game content.
 * They are never weighted: a keyword shouldn't favor one sentence template by accident.
 * @type {string[]}
 */
var UNWEIGHTED_SYMBOLS = ["origin", "opening", "closing", "game-idea", "concept", "themeFrame"];

/**
 * Most extra copies any one rule can gain, however many nudges point at it. This is what
 * keeps the Oracle emergent: a nudge tilts the odds, it must never decide the outcome. A
 * rule at the cap is at most four times as likely as an untouched one. The cap was once 8,
 * and the worst journey then gave one theme half of all draws and one gameplay rule 40%;
 * a seeker who stacked their answers would get nearly the same vision every time. A single
 * nudge adds 3 copies, so this only limits stacking, not the nudges themselves.
 * @type {number}
 */
var MAX_EXTRA_COPIES = 3;

/**
 * Words too common to say anything about a tribute, or that appear in nearly every
 * rule ("players") and so would tilt nothing.
 * @type {Set<string>}
 */
var TRIBUTE_STOPWORDS = new Set((
  "about above after again also always because been before being between both could does done each " +
  "even ever from game games have here into just like make made many more most much must only other " +
  "over play played player players playing really same should some such than that their them then " +
  "there these they this those through very want were what when where which while will with would " +
  "your yours"
).split(" "));

class GrammarWeighter {
  /**
   * @param {Object} grammar - A Tracery grammar: symbol names mapped to arrays of rule
   *     strings. It is read but never modified.
   */
  constructor(grammar) {
    this.grammar = grammar;
    // symbol -> array parallel to its rules: how many extra copies each rule has gained
    this.extraCopies = {};
  }

  /**
   * Makes every rule that mentions any of the keywords more likely.
   * A rule matches when its own words (not the #symbols# it calls) contain a keyword.
   * @param {string[]} keywords - Words or word stems, e.g. "dream" matches "dreamscape".
   * @param {number} strength - Extra copies each matching rule gains.
   * @returns {GrammarWeighter} This weighter, so calls can be chained.
   */
  lean(keywords, strength) {
    var wanted = keywords.map((keyword) => keyword.toLowerCase());
    if (wanted.length === 0) return this;

    Object.entries(this.grammar).forEach(([symbol, rules]) => {
      if (UNWEIGHTED_SYMBOLS.includes(symbol)) return;
      if (!this.extraCopies[symbol]) this.extraCopies[symbol] = rules.map(() => 0);
      var extra = this.extraCopies[symbol];

      rules.forEach((rule, i) => {
        var ownWords = GrammarWeighter.ownWords(rule);
        if (wanted.some((keyword) => ownWords.includes(keyword))) {
          extra[i] = Math.min(MAX_EXTRA_COPIES, extra[i] + strength);
        }
      });
    });
    return this;
  }

  /**
   * Builds the weighted grammar, ready for tracery.createGrammar.
   * @returns {Object} A new grammar in which weighted rules appear more than once.
   */
  toGrammar() {
    var weighted = {};
    Object.entries(this.grammar).forEach(([symbol, rules]) => {
      var extra = this.extraCopies[symbol];
      weighted[symbol] = extra
        ? rules.flatMap((rule, i) => Array(1 + extra[i]).fill(rule))
        : rules.slice();
    });
    return weighted;
  }

  /**
   * A rule's own words: lower-cased, with the #symbol# calls removed, so a keyword like
   * "theme" can't match every rule that merely calls #theme#.
   * @param {string} rule - A Tracery rule string.
   * @returns {string} The rule's literal text.
   */
  static ownWords(rule) {
    return rule.replace(/#[^#]*#/g, " ").toLowerCase();
  }

  /**
   * Turns free text (a tribute) into keyword stems. Short and everyday words are dropped,
   * and each remaining word is cut to its first five letters, so "dreams" and "dreaming"
   * both find "dreamscape". The cut is crude on purpose; there is no dictionary here.
   * @param {string} text - What the seeker typed.
   * @returns {string[]} Distinct stems.
   */
  static keywordsFromText(text) {
    var words = text.toLowerCase().match(/\p{L}+/gu) || [];
    var stems = words
      .filter((word) => word.length >= 4 && !TRIBUTE_STOPWORDS.has(word))
      .map((word) => word.slice(0, 5));
    return [...new Set(stems)];
  }
}
