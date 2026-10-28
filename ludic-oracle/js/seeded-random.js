/**
 * @file Seeded random numbers
 * @description Tracery draws on Math.random and has no seed of its own. To make a vision
 *              reproducible, so that a share link can bring the same one back, we swap
 *              Math.random for a seeded generator for the length of ONE synchronous call
 *              and always put the real one back. Nothing else in the page should call
 *              Math.random while the swap is in place, which is why `work` must be synchronous.
 */

/**
 * Makes a repeatable random number generator (mulberry32: small, fast, and good enough for
 * picking rules out of a list). The same seed always gives the same sequence.
 * @param {number} seed - A 32-bit integer.
 * @returns {function(): number} Returns a number in [0, 1) on each call, like Math.random.
 */
function seededRandom(seed) {
  var state = seed | 0;
  return function () {
    state = (state + 0x6d2b79f5) | 0;
    var t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Runs `work` with Math.random replaced by a seeded generator, then restores the real one,
 * even if `work` throws.
 * @param {number} seed - A 32-bit integer.
 * @param {function(): *} work - A SYNCHRONOUS function; anything it awaits would run unseeded.
 * @returns {*} Whatever `work` returns.
 */
function withSeededRandom(seed, work) {
  var realRandom = Math.random;
  Math.random = seededRandom(seed);
  try {
    return work();
  } finally {
    Math.random = realRandom;
  }
}
