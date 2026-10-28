#!/usr/bin/env node
/**
 * @file Grammar checker for the Ludic Oracle.
 * @description Runs the game-idea grammar thousands of times and checks two things:
 *
 *   FORM      Nothing that makes a vision read as careless: wrong articles, doubled "where",
 *             stacked layers, leftover #symbols#. These must be zero.
 *   EMERGENCE The system stays emergent: the pieces of a vision are drawn independently (no
 *             hidden pairing logic), every core is equally likely, no two visions are alike,
 *             and nudges from a seeker's choices tilt the odds without deciding the outcome.
 *
 * Usage:  node tools/check-grammar.js        (no dependencies; exits 1 if anything fails)
 *
 * Runs against a seeded random generator, so a pass or fail is repeatable, not luck.
 * See the DESIGN PRINCIPLE in js/grammar.js for why the emergence checks exist.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const JS = path.join(__dirname, "..", "js") + path.sep;
const SAMPLES = 20000;

// --- load the real files into a sandbox, with a seeded Math.random -------------------------------
const ctx = vm.createContext({ console, module: {} });
vm.runInContext(`
  (function () {
    var a = 0x9e3779b9;
    Math.random = function () {              // mulberry32: small, fast, repeatable
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();`, ctx);
["tracery.js", "grammar.js", "offerings.js", "answers.js", "grammar-weighter.js", "seeded-random.js"].forEach((file) =>
  vm.runInContext(fs.readFileSync(JS + file, "utf8"), ctx, { filename: file }));
const run = (code) => vm.runInContext(code, ctx);

const grammar = JSON.parse(run("JSON.stringify(gameIdeaGrammar)"));
const visions = JSON.parse(run(`JSON.stringify(Array.from({ length: ${SAMPLES} }, function () {
  var g = tracery.createGrammar(gameIdeaGrammar); g.addModifiers(tracery.baseEngModifiers);
  return g.flatten("#origin#");
}))`));
// The idea alone, without the framing paragraphs
const ideas = visions.map((v) => v.split("</p><p>")[1]);

// --- tiny test harness --------------------------------------------------------------------------
let failures = 0;
function check(group, name, ok, detail) {
  if (!ok) failures++;
  console.log(`${ok ? "  pass" : "  FAIL"}  [${group}] ${name}${detail ? "  " + detail : ""}`);
}
const count = (list, re) => list.filter((text) => re.test(text)).length;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const anyOf = (list) => new RegExp("(" + list.map(escape).join("|") + ")");

// =================================== FORM ========================================================
console.log(`\nFORM  (${SAMPLES} visions; each must be zero)`);
const formRules = {
  "article agrees with the next word": /\ba (?=[aeiou])|\ban (?=[^aeiou\W])/i,
  "no 'using' + gerund": /\busing [a-z]+ing\b/i,
  "no sentence starts lowercase after '?'": /\? [a-z]/,
  "no doubled punctuation or spaces": /\.\.| ,|  /,
  "no leftover #symbol#, undefined or [object]": /#|undefined|\[object|\(\(/,
  "no two 'where' clauses in one idea": /\bwhere\b[^.?—:]*\bwhere\b/,
};
for (const [name, re] of Object.entries(formRules)) check("form", name, count(ideas, re) === 0, "(" + count(ideas, re) + ")");

// One layer per idea: a rule, a theme phrasing, a protagonist or a setting; never two
const layerMatchers = {
  playRule: anyOf(grammar.playRule),
  worldRule: anyOf(grammar.worldRule),
  theme: /secretly about|quiet comment about|engages the ideas of|troubles the ideas around|wrestling with|a meditation on|quiet subject/,
  protagonist: /eyes of /,
  setting: /set in /,
};
const layerCount = (text) => Object.values(layerMatchers).filter((re) => re.test(text)).length;
check("form", "exactly one layer per idea (never two)", ideas.every((t) => layerCount(t) <= 1), "(" + ideas.filter((t) => layerCount(t) > 1).length + " stacked)");

// A keyword that matches no rule nudges nothing; it is a dead letter
const weightable = (s) => !run("UNWEIGHTED_SYMBOLS").includes(s);
const dead = [];
const allKeywords = [
  ...JSON.parse(run("JSON.stringify(OFFERINGS)")).flatMap((o) => o.keywords.map((k) => ["offering " + o.id, k])),
  ...Object.entries(JSON.parse(run("JSON.stringify(ANSWER_KEYWORDS)"))).flatMap(([q, answers]) =>
    Object.entries(answers).flatMap(([a, kws]) => kws.map((k) => [q + "=" + a, k]))),
];
for (const [source, keyword] of allKeywords) {
  const hit = Object.entries(grammar).some(([symbol, rules]) =>
    weightable(symbol) && rules.some((rule) => rule.replace(/#[^#]*#/g, " ").toLowerCase().includes(keyword.toLowerCase())));
  if (!hit) dead.push(`${source}/${keyword}`);
}
check("form", "every nudge keyword matches at least one rule", dead.length === 0, dead.length ? "dead: " + dead.join(", ") : `(${allKeywords.length} checked)`);

// =================================== EMERGENCE ===================================================
console.log("\nEMERGENCE");

// 1. Every core is equally likely when nothing nudges (chi-square against uniform).
const cores = grammar.core;
const coreCounts = cores.map((c) => count(ideas, new RegExp(escape(c))));
const total = coreCounts.reduce((a, b) => a + b, 0);
const expected = total / cores.length;
const chiUniform = coreCounts.reduce((sum, n) => sum + Math.pow(n - expected, 2) / expected, 0);
const dfUniform = cores.length - 1;
const limit = (df) => df + 4 * Math.sqrt(2 * df); // ~4 standard deviations: generous, but catches a real skew
check("emergence", "all " + cores.length + " cores are equally likely", chiUniform < limit(dfUniform), `(chi2 ${chiUniform.toFixed(0)}, limit ${limit(dfUniform).toFixed(0)})`);

// 2. The core is independent of the layer chosen. This is the check that would catch hidden
//    pairing logic (tags, "compatible with" tables) being added: pairing makes some cores
//    favor some layers, and the chi-square leaves its normal range.
const layerOf = (t) => Object.keys(layerMatchers).find((k) => layerMatchers[k].test(t));
const coreOf = (t) => cores.findIndex((c) => t.includes(c));
const table = {};
let n = 0;
for (const t of ideas) {
  const l = layerOf(t), c = coreOf(t);
  if (!l || c < 0) continue;
  (table[c] = table[c] || {})[l] = ((table[c] || {})[l] || 0) + 1; n++;
}
const layers = Object.keys(layerMatchers);
const rowSum = (c) => layers.reduce((s, l) => s + ((table[c] || {})[l] || 0), 0);
const colSum = (l) => cores.reduce((s, _, c) => s + ((table[c] || {})[l] || 0), 0);
let chiIndep = 0;
cores.forEach((_, c) => layers.forEach((l) => {
  const e = (rowSum(c) * colSum(l)) / n;
  if (e > 0) chiIndep += Math.pow(((table[c] || {})[l] || 0) - e, 2) / e;
}));
const dfIndep = (cores.length - 1) * (layers.length - 1);
check("emergence", "cores and layers are drawn independently (no hidden pairing)", chiIndep < limit(dfIndep), `(chi2 ${chiIndep.toFixed(0)}, limit ${limit(dfIndep).toFixed(0)})`);

// 3. The space is large. Repeats are unavoidable in a finite space (the birthday effect), so
//    estimate its effective size from how often visions repeat: n^2 / (2 * repeats).
//    Below a million, a regular visitor would start meeting old visions again.
const repeats = ideas.length - new Set(ideas).size;
const effectiveSpace = repeats === 0 ? Infinity : (ideas.length * ideas.length) / (2 * repeats);
check("emergence", "the space of distinct visions is large (over a million)", effectiveSpace >= 1e6,
  `(${repeats} repeats in ${ideas.length}; about ${effectiveSpace === Infinity ? "unbounded" : Math.round(effectiveSpace / 1e5) / 10 + " million"} distinct visions)`);

// 4. Nudges tilt, they don't decide: over every possible journey, no rule may be more than four
//    times as likely as an untouched one, however the seeker's choices stack.
const ceiling = JSON.parse(run(`(function () {
  var worst = 0, where = "";
  var tributes = ["", "music dreams library secret time clock"];
  var symbols = ["core", "twist", "setting", "worldRule", "playRule", "protagonist", "feeling", "theme"];
  OFFERINGS.forEach(function (o) {
    Object.keys(ANSWER_KEYWORDS.why).forEach(function (a) {
      Object.keys(ANSWER_KEYWORDS.fear).forEach(function (b) {
        Object.keys(ANSWER_KEYWORDS.sacrifice).forEach(function (c) {
          tributes.forEach(function (t) {
            var w = new GrammarWeighter(gameIdeaGrammar);
            if (t) w.lean(GrammarWeighter.keywordsFromText(t), 3);
            w.lean(o.keywords, 3).lean(ANSWER_KEYWORDS.why[a], 2).lean(ANSWER_KEYWORDS.fear[b], 2).lean(ANSWER_KEYWORDS.sacrifice[c], 2);
            var g = w.toGrammar();
            symbols.forEach(function (s) {
              var counts = {}; g[s].forEach(function (r) { counts[r] = (counts[r] || 0) + 1; });
              var most = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }));
              var share = most / g[s].length, uniform = 1 / gameIdeaGrammar[s].length;
              if (share / uniform > worst) { worst = share / uniform; where = s; }
            });
          });
        });
      });
    });
  });
  return JSON.stringify({ worst: worst, where: where });
})()`));
check("emergence", "stacked nudges never make one rule more than 4x as likely", ceiling.worst <= 4.0 + 1e-9, `(worst ${ceiling.worst.toFixed(1)}x, in '${ceiling.where}')`);

// 5. With nothing nudged, the weighter must hand back exactly the grammar it was given.
const unchanged = run(`JSON.stringify(new GrammarWeighter(gameIdeaGrammar).toGrammar()) === JSON.stringify(gameIdeaGrammar)`);
check("emergence", "with no nudges the grammar is untouched", unchanged === true || unchanged === "true");

// =================================== REPRODUCIBILITY =============================================
// A share link carries a seed and the seeker's choices, so the same inputs must always give the
// same vision, different seeds must give different ones, and the real Math.random must come back.
console.log("\nREPRODUCIBILITY");
const seeded = JSON.parse(run(`(function () {
  function vision(seed) {
    return withSeededRandom(seed, function () {
      var w = new GrammarWeighter(gameIdeaGrammar);
      w.lean(findOffering("secret").keywords, 3).lean(ANSWER_KEYWORDS.why.worlds, 2).lean(GrammarWeighter.keywordsFromText("music and dreams of the sea"), 3);
      var g = tracery.createGrammar(w.toGrammar()); g.addModifiers(tracery.baseEngModifiers);
      return g.flatten("#origin#");
    });
  }
  var same = 0, distinct = {}, n = 300;
  for (var seed = 1; seed <= n; seed++) {
    var first = vision(seed * 7919);
    if (first === vision(seed * 7919)) same++;
    distinct[first] = true;
  }
  var before = Math.random, threw = false;
  try { withSeededRandom(5, function () { throw new Error("boom"); }); } catch (e) { threw = true; }
  return JSON.stringify({ n: n, same: same, distinct: Object.keys(distinct).length, restored: Math.random === before, threw: threw });
})()`));
check("repro", "the same seed and choices give the same vision", seeded.same === seeded.n, `(${seeded.same} of ${seeded.n})`);
check("repro", "different seeds give different visions", seeded.distinct / seeded.n > 0.99, `(${seeded.distinct} distinct of ${seeded.n})`);
check("repro", "the real Math.random is restored, even when the work throws", seeded.restored && seeded.threw);

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
