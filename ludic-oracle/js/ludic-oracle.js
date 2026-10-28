/**
 * @file The Ludic Oracle
 * @description A JavaScript application that simulates an oracle revealing experimental game ideas 
 *              inspired by Shigeru Miyamoto's sacred number (3). Users interact with the Oracle on 
 *              specific days or receive a message guiding them to return.
 * 
 * Features:
 * - Day-based access logic using the number 3.
 * - Dynamic dialogues with fade-in and fade-out animations.
 * - Tracery grammar-based experimental game idea generation.
 * 
 * @author Wes Modes
 * @version 1.0.0
 * @license MIT
 * @date 2024-12-02
 */

/**
 * Dialog object containing all Oracle speeches, options, and destinations.
 * Each dialogue is identified by a unique key (e.g., 0, 1, 2).
 *
 * The journey of an open day: 1 greeting, 2 and 4-6 the three questions, 7 the offering,
 * 15 its judgment, 16-19 the gong, 8 and 9 the trance, 10 the vision. Dialogues 0 and
 * 11-14 are the way past a closed day (see judgeTribute). Dialogue 20 shows a vision someone
 * shared by link (see readSharedVision).
 *
 * A dialogue may also have:
 * - `speech` as a function(visit) returning HTML, to echo the seeker's words back.
 * - `options` as a function(visit) returning the button labels.
 * - `onShow`, a function(visit) run just before the dialogue is built, to prepare `visit`.
 * - `narration`, true if this is the world speaking (sounds, scenery), not the Oracle:
 *   it is shown as a caption with no speech-bubble tail.
 * - `records`, { name, values }: clicking option i stores values[i] in `visit[name]`.
 *   `values` may be a function(visit) when the options themselves are.
 * - `destinations[i]` may be a function(i) instead of a dialogue ID: clicking the button runs
 *   it and stays on the same dialogue (Copy, Share link).
 * - `vision`, true if the dialogue contains `#game-idea`: the vision is generated into it
 *   from `visit.seed` once the dialogue is shown.
 * - `trance`, { next, beats }: the dialogue is not spoken but runs the Oracle's trance, then
 *   shows dialogue `next`. `beats` (default 6) sets how long it lasts: 9 is the full trance
 *   before the first vision, 21 the abbreviated one before "Another vision".
 * - `input`, a text field for the seeker to type into:
 *     { name, placeholder, submitLabel, maxLength, route }
 *   The typed text is stored in `visit[name]`, then `route(text)` returns the ID of the
 *   next dialogue, so a dialogue can judge the text (e.g. send a stingy tribute back).
 * @type {Object}
 */
var dialog = {
  0: {
    speech: `<div style='display: flex; align-items: center;'>
      <div style='flex-basis: 75%;'>
        This is not an auspicious day, seeker. The Oracle is silent today. 
        Return in #days#, when the power of three—the sacred number of Shigeru Miyamoto—shall open the Oracle's mind to your questions.
        Yet the Oracle is not deaf to devotion: a generous tribute may stir what the calendar has stilled.
      </div>
      <div style='flex-basis: 25%;'>
        <img src='img/sundial.png' style='width: 150px;'>
      </div>
    </div>`,
    options: ["Offer a tribute."],
    destinations: [11],
  },
  1: {
    speech: "Welcome to the great Ludic Oracle, seeker. I am the Oracle, the living conduit through which Shigeru Miyamoto communicates, and I will guide you on your quest to be the great game dev that you are destined to be. I see uncertainty in your eyes, but fear not, for I will show you the way and offer you an idea for an experimental game that will please the Ludic Gods.",
    options: [
        "I am not ready, Oracle.",
        "I am ready, Oracle.",
    ],
    destinations: [3, 2],
  },
  2: {
    speech: "Very well, seeker. Let us begin. I will ask you three questions, and you must answer them truthfully. The Oracle knows when you lie.",
    options: [
        "I will answer truthfully.",
    ],
    destinations: [4],
  },
  3: {
    speech: "Very well, seeker. Return to me when you are ready to begin your quest.",
    options: [
        "Start over."
    ],
    destinations: [1],
  },

  // --- The three truthful questions. Each answer is remembered in `visit` ---
  4: {
    speech: "First: why do you make games, seeker?",
    options: [
        "To make people feel something.",
        "To build a world of my own.",
        "Because I cannot stop.",
    ],
    destinations: [5, 5, 5],
    records: { name: "why", values: ["feeling", "worlds", "compulsion"] },
  },
  5: {
    speech: "Second: what do you fear most in your work?",
    options: [
        "The blank page.",
        "Finishing.",
        "Being ignored.",
    ],
    destinations: [6, 6, 6],
    records: { name: "fear", values: ["blank", "finishing", "ignored"] },
  },
  6: {
    speech: "Third: what have you given up for the sake of play?",
    options: [
        "Sleep.",
        "A sensible life.",
        "Time with the people I love.",
    ],
    destinations: [7, 7, 7],
    records: { name: "sacrifice", values: ["sleep", "sensible", "people"] },
  },

  // --- The offering: three drawn from the pool each visit ---
  7: {
    speech: "The Oracle requires sacrifice. Choose what you will lay upon the altar.",
    // Drawn when the dialogue is shown, so the options and recorded values agree
    onShow: (visit) => {
      visit.offeringChoices = drawOfferings(3).map((offering) => offering.id);
    },
    options: (visit) => visit.offeringChoices.map((id) => offeringLabel(findOffering(id))),
    destinations: [15, 15, 15],
    records: { name: "offering", values: (visit) => visit.offeringChoices },
  },
  15: {
    // The Oracle names the offering, and judges it
    speech: (visit) => {
      var offering = findOffering(visit.offering);
      return `The Oracle receives your offering: <i>${offering.name}</i>.<br>${offering.judgment}`;
    },
    options: [
        "Continue."
    ],
    destinations: [16],
  },

  // --- The effort: three strikes of the gong, each one a pause in itself ---
  16: {
    speech: "The Oracle requires a sacrifice of <b>time and effort</b>, too. Strike the gong three times, so the Ludic Gods know you are in earnest.",
    options: [
        "Strike the gong."
    ],
    destinations: [17],
  },
  17: {
    narration: true,
    speech: "<b>BONG.</b> The sound rolls through the columns and fades into silence.",
    options: [
        "Strike again."
    ],
    destinations: [18],
  },
  18: {
    narration: true,
    speech: "<b>BONG.</b> The air trembles. The statues seem to listen.",
    options: [
        "Strike a third time."
    ],
    destinations: [19],
  },
  19: {
    narration: true,
    speech: "<b>BONG.</b> Three. The sacred number. Something in the temple stirs.",
    options: [
        "Continue."
    ],
    destinations: [8],
  },

  8: {
    speech: "The Oracle will now enter a trance and reveal the game idea to you. Be silent, and we shall begin.",
    options: [
        "Continue."
    ],
    destinations: [9],
  },
  // The full trance, before the first vision
  9: {
    trance: { next: 10 },
    speech: "",
    options: [],
    destinations: [],
  },
  // The abbreviated trance, before "Another vision": half the beats
  21: {
    trance: { next: 10, beats: 3 },
    speech: "",
    options: [],
    destinations: [],
  },
  10: {
    vision: true,
    // Each showing is a new vision, so "Another vision" is this dialogue again (after a short trance)
    onShow: (visit) => {
      visit.seed = randomSeed();
    },
    speech: "<div id='game-idea'></div>",
    options: [
        "Another vision.",
        "Copy.",
        "Share link.",
        "Start over."
    ],
    destinations: [21, copyVision, shareVision, 1],
  },

  // A vision shared by link: shown straight away, with a way into the ritual
  20: {
    vision: true,
    speech: "<div id='game-idea'></div>",
    options: [
        "Copy.",
        "Consult the Oracle yourself."
    ],
    destinations: [copyVision, consultYourself],
  },

  // --- Tribute: how a seeker gets past an inauspicious day (see judgeTribute) ---
  11: {
    speech: "Then prove your devotion, seeker. Speak your tribute aloud, and make it generous. The Oracle weighs words, and the sincerity behind them.",
    options: [
        "Withdraw."
    ],
    destinations: [0],
    input: {
      name: "tribute",
      placeholder: "Speak your tribute...",
      submitLabel: "Offer.",
      route: judgeTribute,
    },
  },
  12: {
    // Too few words
    speech: () => pickOne(scornForPittance),
    options: [
        "Offer again."
    ],
    destinations: [11],
  },
  13: {
    // Enough words, but they are noise, echoes or repetition
    speech: () => pickOne(scornForNoise),
    options: [
        "Offer again."
    ],
    destinations: [11],
  },
  14: {
    // Tribute accepted: quote it back, then join the ordinary ritual
    speech: (visit) => pickOne(acceptanceOfTribute)(escapeHtml(visit.tribute)),
    options: [
        "Continue."
    ],
    destinations: [1],
  }
};

/**
 * The Oracle's scorn for a tribute of too few words. One is picked at random.
 * @type {string[]}
 */
var scornForPittance = [
  "A pittance! The Ludic Gods have been offered more by a passing sparrow. Be generous, seeker, and mean it.",
  "That is not a tribute, seeker; that is a shrug. The Oracle does not stir for so little.",
  "Is this all you carried up the steps to my temple? Even the humblest sacrifice weighs more than this. Try again."
];

/**
 * The Oracle's scorn for a tribute that has enough words but not enough meaning.
 * @type {string[]}
 */
var scornForNoise = [
  "The Oracle does not speak this tongue. Offer true and varied words, not noise.",
  "Echoes and mutterings! The Oracle is ancient, not foolish. Offer words that mean something.",
  "You insult the Oracle with babble. The Ludic Gods can tell a tribute from a cat walking across a keyboard."
];

/**
 * The Oracle's acceptance of a tribute. Each entry is a function taking the
 * (already HTML-escaped) tribute, so it can be quoted back to the seeker.
 * @type {Array<function(string): string>}
 */
var acceptanceOfTribute = [
  (tribute) => `The Oracle weighs your tribute: <i>&ldquo;${tribute}&rdquo;</i> It is adequate. The stars are unfavorable, but the Oracle will stir.`,
  (tribute) => `<i>&ldquo;${tribute}&rdquo;</i> The Oracle turns these words over in the dark and finds them generous. The calendar bows to devotion.`,
  (tribute) => `The Oracle has heard your words, <i>&ldquo;${tribute}&rdquo;</i>, and judges them adequate. Let it be known that the Oracle can be moved.`
];

/** Fewest distinct, plausible words that make a tribute generous. */
var MIN_TRIBUTE_WORDS = 3;

/** Smallest share of a tribute's words that must be plausible, so real words can't pad out noise. */
var MIN_PLAUSIBLE_SHARE = 0.7;

/**
 * Letters that are consonants for the purpose of spotting keyboard mashing. "w" and "y"
 * are left out on purpose: they behave like vowels in clusters such as "ow", "ay", "wn".
 * @type {string}
 */
var CONSONANTS = "bcdfghjklmnpqrstvxz";

/**
 * Consonant pairs that occur in ordinary English words (150+ times in a 210,000-word
 * dictionary). Keyboard mashing is full of pairs outside this set ("sd", "fs", "fd").
 * Only these statistics are kept; no word list ships with the page. This is a rough
 * screen, so a word may have one unusual pair ("glitch" has "tc") but not two.
 * @type {Set<string>}
 */
var COMMON_CONSONANT_PAIRS = new Set(
  ("bc bd bj bl br bs bt ch ck cl cr cs ct db df dg dh dl dm dn dr ds dv fl fr ft gh gl gm gn gr gs " +
   "hb hf hl hm hn hr ht kh kl km kn kr ks lb lc ld lf lg lk lm ln lp ls lt lv mb ml mn mp ms nb nc " +
   "nd nf ng nh nj nk nl nm np nq nr ns nt nv nz ph pl pn pr ps pt rb rc rd rf rg rh rk rl rm rn rp " +
   "rs rt rv sb sc sf sh sk sl sm sn sp sq st tb tc tf th tl tm tn tp tr ts xc xp xt").split(" ")
);

/**
 * Picks one entry from a list at random.
 * @param {Array} list - Non-empty list.
 * @returns {*} A randomly chosen entry.
 */
function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Decides whether a single word of a tribute looks like a real word. This is a
 * plausibility check, not a dictionary: it must accept names, invented words and
 * other languages, and reject keyboard mashing, runs of one letter, and bare numbers.
 * @param {string} word - A word with surrounding punctuation already stripped.
 * @returns {boolean} True if the word could plausibly be a word.
 */
function isPlausibleWord(word) {
  // Letters (any alphabet) plus apostrophes and hyphens inside words; no digits or symbols
  if (!/^[\p{L}\p{M}'’-]+$/u.test(word)) return false;
  // Four or more of the same character in a row ("aaaaa", "zzzz") is mashing
  if (/(.)\1{3,}/u.test(word)) return false;
  // Scripts without Latin vowels (Greek, Cyrillic, CJK...) can't be vowel-checked, so trust them
  if (!/\p{Script=Latin}/u.test(word)) return true;
  // One Latin letter is a word only as "a" or "I"
  if (word.length === 1) return /^[ai]$/i.test(word);

  // Accents and apostrophes stripped, so "é" counts as "e" and "grandmother's" is one run of letters
  var letters = word.normalize("NFD").replace(/[\p{M}'’-]/gu, "").toLowerCase();

  // Any letter that isn't a consonant or "w" counts as a vowel, including unfamiliar ones like "ø"
  var vowelCount = [...letters].filter((c) => !CONSONANTS.includes(c) && c !== "w").length;
  if (vowelCount === 0) return false;
  if (letters.length >= 4 && vowelCount / letters.length < 0.1) return false;

  // Count consonant pairs that English rarely uses; doubles like "ll" are fine
  var rarePairs = 0;
  for (var i = 0; i < letters.length - 1; i++) {
    var pair = letters.slice(i, i + 2);
    if (pair[0] !== pair[1] && CONSONANTS.includes(pair[0]) && CONSONANTS.includes(pair[1]) &&
        !COMMON_CONSONANT_PAIRS.has(pair)) {
      rarePairs++;
    }
  }
  return rarePairs <= 1;
}

/**
 * Judges a seeker's tribute, and routes to the Oracle's verdict. A tribute is generous
 * when it has at least MIN_TRIBUTE_WORDS distinct, plausible words, and at least
 * MIN_PLAUSIBLE_SHARE of everything typed is plausible.
 * @param {string} text - The typed tribute.
 * @returns {number} ID of the dialogue to show: 12 (too few words), 13 (noise), 14 (accepted).
 */
function judgeTribute(text) {
  var words = text.split(/\s+/).filter(Boolean);
  if (words.length < MIN_TRIBUTE_WORDS) return 12;

  // Strip surrounding punctuation ("dream," -> "dream")
  var plausibleWords = words
    .map((word) => word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ""))
    .filter((word) => word && isPlausibleWord(word));

  // The Set drops repeats; the share test stops a few real words from carrying a pile of noise
  var distinctCount = new Set(plausibleWords).size;
  var plausibleShare = plausibleWords.length / words.length;
  return distinctCount >= MIN_TRIBUTE_WORDS && plausibleShare >= MIN_PLAUSIBLE_SHARE ? 14 : 13;
}

/**
 * What the seeker has said and chosen so far this visit. Dialogues read it to echo
 * the seeker's words back, and the vision grammar will lean toward it.
 * @type {Object}
 */
var visit = {};

/**
 * Escapes seeker-typed text for safe insertion into speech HTML. Anything from `visit`
 * that a dialogue echoes back must go through this: the text is user input, and once
 * visions can be shared by link it will also arrive from other people's URLs.
 * @param {string} text - Raw text.
 * @returns {string} Text safe to place inside HTML element content.
 */
function escapeHtml(text) {
  return $("<div>").text(text).html();
}

/**
 * True while a speech is fading out, waiting, or fading in. Guards against a
 * double-click on a button firing two transitions at once.
 * @type {boolean}
 */
var isTransitioning = false;

/**
 * Displays the Oracle's speech based on the given dialogue ID.
 * Handles fade-out, a delay, and fade-in animations for smooth transitions.
 * @param {number} n - The ID of the dialogue to display.
 */
function showSpeech(n) {
  console.log("Showing dialogue", n);

  // Ignore clicks that arrive mid-transition. This comes before anything below that
  // changes `visit`, so a double-click can't change it twice.
  if (isTransitioning) return;
  isTransitioning = true;

  var entry = dialog[n];

  // A trance dialogue has no speech of its own: it runs the trance, then moves on
  if (entry.trance) {
    trance(entry.trance.next, entry.trance.beats);
    return;
  }

  // A dialogue may prepare `visit` first (e.g. draw the offerings to choose among)
  if (entry.onShow) entry.onShow(visit);
  // Speech and options may be functions of the visit so far, so they can quote the seeker
  var speech = typeof entry.speech === "function" ? entry.speech(visit) : entry.speech;
  var options = typeof entry.options === "function" ? entry.options(visit) : entry.options;
  var destinations = entry.destinations;
  var input = entry.input;

  // Hide the bubble-wrapper for a brief pause
  $(".bubble-wrapper").fadeOut(200, () => {
    // Use setTimeout to create a 1-second delay before showing new speech
    setTimeout(() => {
      var html = "<p>" + speech + "</p>";
      if (input) {
        html += `<form id="input-form"><input type="text" name="${input.name}" maxlength="${input.maxLength || 120}" placeholder="${input.placeholder || ""}" autocomplete="off"></form>`;
      }
      html += '<div class="button-box">';
      for (var i = 0; i < options.length; i++) {
        // type="button" so these never submit the input form
        html += `<button type="button" onclick="chooseOption(${n}, ${i})">${options[i]}</button>`;
      }
      if (input) {
        // Lives in the button box for layout, but is tied to the form by its id (so Enter works too)
        html += `<button type="submit" form="input-form">${input.submitLabel || "Offer"}</button>`;
      }
      html += '</div>';
      $(".speech-bubble").html(html);
      // Set while the wrapper is hidden, so the bubble never visibly changes shape
      $(".bubble-wrapper").toggleClass("narration", Boolean(entry.narration));

      if (input) {
        $("#input-form").on("submit", (event) => {
          event.preventDefault();
          var text = $("#input-form input").val().trim();
          visit[input.name] = text;
          showSpeech(input.route(text));
        });
      }

      // Reveal the bubble-wrapper with the new content
      $(".bubble-wrapper").fadeIn(200, () => {
        isTransitioning = false; // Buttons are live again
        if (input) {
          $("#input-form input").trigger("focus"); // Ready to type
        }
      });

      // Generate the game idea if this dialogue holds a vision
      if (entry.vision) {
        gameIdea();
      }
    }, 1500); // 1.5-second delay
  });
}

/**
 * Handles a click on option `i` of dialogue `n`: remembers the choice if the dialogue
 * records it, then moves on to that option's destination, or runs it if it is an action.
 * @param {number} n - The ID of the dialogue the button belongs to.
 * @param {number} i - Index of the clicked option.
 */
function chooseOption(n, i) {
  // Mid-transition clicks are ignored by showSpeech; don't let them change `visit` either
  if (isTransitioning) return;
  var entry = dialog[n];
  if (entry.records) {
    var values = typeof entry.records.values === "function" ? entry.records.values(visit) : entry.records.values;
    visit[entry.records.name] = values[i];
  }
  var destination = entry.destinations[i];
  if (typeof destination === "function") {
    destination(i); // An action (Copy, Share link): stay on this dialogue
  } else {
    showSpeech(destination);
  }
}

/**
 * How long one beat of the trance lasts; each beat adds a dot. The halo's breathing in the
 * stylesheet (halo-breath, 2.4s) is two beats, so keep the two in step.
 * @type {number}
 */
var TRANCE_BEAT_MS = 1200;

/**
 * The Oracle's trance: the temple dims and the halo glows (both done by the "trancing" class in
 * the stylesheet) while a line of ellipses grows, shown as a caption since it is the world
 * speaking, not the Oracle. Then it moves on to the next dialogue as the light returns.
 * @param {number} nextDialogId - The ID of the dialogue to transition to after the trance.
 * @param {number} [beats=6] - How many beats it lasts (TRANCE_BEAT_MS each, one dot per beat).
 */
function trance(nextDialogId, beats) {
  var currentDots = 3;
  var maxDots = currentDots + (beats || 6);

  $("#content").addClass("trancing");

  // Let the last speech slip away first, so the bubble doesn't visibly change shape
  $(".bubble-wrapper").fadeOut(200, () => {
    $(".speech-bubble").html(`<div class='ellipses'>${'.'.repeat(currentDots)}</div>`);
    $(".bubble-wrapper").addClass("narration").fadeIn(200);

    // Start the ellipses animation
    var interval = setInterval(() => {
      currentDots++;
      $(".ellipses").text('.'.repeat(currentDots));

      if (currentDots >= maxDots) {
        clearInterval(interval); // Stop animation
        $("#content").removeClass("trancing"); // The light returns while the vision gathers
        isTransitioning = false; // The trance is over; let the next dialogue take its turn
        showSpeech(nextDialogId); // Move to the next dialogue
      }
    }, TRANCE_BEAT_MS);
  });
}

/**
 * Extra copies each rule gains from each kind of nudge (see GrammarWeighter). What the
 * seeker chose to say or give counts for more than a multiple-choice answer.
 * @type {Object<string, number>}
 */
var NUDGE_STRENGTH = { tribute: 3, offering: 3, answer: 2 };

/**
 * Builds the grammar for this visit: the game-idea grammar, tilted toward the seeker's
 * tribute, offering and answers. Whatever the seeker has not given is simply skipped.
 * @returns {Object} A Tracery grammar.
 */
function grammarForVisit() {
  var weighter = new GrammarWeighter(gameIdeaGrammar);

  // The words of the tribute itself, if the seeker needed to offer one
  if (visit.tribute) {
    weighter.lean(GrammarWeighter.keywordsFromText(visit.tribute), NUDGE_STRENGTH.tribute);
  }

  var offering = findOffering(visit.offering);
  if (offering) {
    weighter.lean(offering.keywords, NUDGE_STRENGTH.offering);
  }

  // Each truthful answer, e.g. visit.fear === "blank" -> ANSWER_KEYWORDS.fear.blank
  Object.keys(ANSWER_KEYWORDS).forEach((question) => {
    var keywords = ANSWER_KEYWORDS[question][visit[question]];
    if (keywords) {
      weighter.lean(keywords, NUDGE_STRENGTH.answer);
    }
  });

  return weighter.toGrammar();
}

/**
 * Generates an experimental game idea using Tracery grammar, tilted by this visit.
 * The result is inserted into the speech bubble. It is generated from `visit.seed`, so the
 * same seed with the same visit always gives the same vision (that is what a share link carries).
 */
function gameIdea() {
  if (visit.seed === undefined) visit.seed = randomSeed();

  var vision = withSeededRandom(visit.seed, () => {
    // Generate a game idea using Tracery
    var grammar = tracery.createGrammar(grammarForVisit());
    // The grammar relies on the .a (a/an) and .capitalize modifiers
    grammar.addModifiers(tracery.baseEngModifiers);
    return grammar.flatten("#origin#");
  });

  $("#game-idea").html(vision);
}

/**
 * A new seed for a vision.
 * @returns {number} A random 32-bit unsigned integer.
 */
function randomSeed() {
  return Math.floor(Math.random() * 4294967296);
}

/**
 * The most characters a tribute may have (also the limit of its text field). A shared link
 * carries the tribute, because it tilts the vision, so a link can't be made to carry more.
 * @type {number}
 */
var TRIBUTE_MAX_LENGTH = 120;

/**
 * Builds a link that brings back the vision on screen: its seed, plus what the seeker offered
 * and answered, since those tilt the grammar. The tribute travels in the link too. It stays in
 * the URL hash, which browsers never send to a server.
 * @returns {string} A URL to the current page with the vision in its hash.
 */
function visionLink() {
  var params = new URLSearchParams();
  params.set("seed", visit.seed.toString(36));
  ["offering"].concat(Object.keys(ANSWER_KEYWORDS)).forEach((key) => {
    if (visit[key]) params.set(key, visit[key]);
  });
  if (visit.tribute) params.set("tribute", visit.tribute.slice(0, TRIBUTE_MAX_LENGTH));
  return location.href.split("#")[0] + "#" + params.toString();
}

/**
 * Reads a shared vision out of the URL hash. A link is untrusted input, so every part is
 * checked: the seed must be a 32-bit integer, the offering and answers must be ones the Oracle
 * knows, and anything else is ignored. A hash that isn't a valid vision returns null and the
 * page behaves as normal.
 * @returns {Object|null} A `visit` ({seed, offering?, why?, fear?, sacrifice?, tribute?}), or null.
 */
function readSharedVision() {
  var params = new URLSearchParams(location.hash.slice(1));
  var seed = parseInt(params.get("seed"), 36);
  if (!params.has("seed") || !Number.isInteger(seed) || seed < 0 || seed > 4294967295) return null;

  var shared = { seed: seed };
  var offering = params.get("offering");
  if (offering && findOffering(offering)) shared.offering = offering;

  Object.keys(ANSWER_KEYWORDS).forEach((question) => {
    var answer = params.get(question);
    if (answer && Object.prototype.hasOwnProperty.call(ANSWER_KEYWORDS[question], answer)) {
      shared[question] = answer;
    }
  });

  var tribute = params.get("tribute");
  if (tribute) shared.tribute = tribute.slice(0, TRIBUTE_MAX_LENGTH);
  return shared;
}

/**
 * Copies text to the clipboard. Uses the Clipboard API where the browser allows it, and falls
 * back to a hidden text field where it doesn't (an insecure page, an older browser).
 * @param {string} text - The text to copy.
 * @returns {Promise<boolean>} Resolves true if the text was copied.
 */
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true, () => false);
  }
  var field = $("<textarea>").val(text).css({ position: "fixed", opacity: 0 }).appendTo("body");
  field.trigger("select");
  var copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  field.remove();
  return Promise.resolve(copied);
}

/**
 * Briefly changes a button's label to confirm what it did.
 * @param {number} index - Index of the button in the button box.
 * @param {string} label - The label to show for a moment.
 */
function flashButton(index, label) {
  var button = $(".button-box button").eq(index);
  var original = button.text();
  button.text(label);
  setTimeout(() => button.text(original), 1800);
}

/**
 * Copies the vision's text, without its markup, to the clipboard.
 * @param {number} index - Index of the clicked button, for its confirmation.
 */
function copyVision(index) {
  copyToClipboard($("#game-idea").get(0).innerText.trim()).then((copied) => {
    flashButton(index, copied ? "Copied." : "Copy failed.");
  });
}

/**
 * Copies a link that brings back this vision. If the browser won't allow a copy, shows the
 * link to copy by hand.
 * @param {number} index - Index of the clicked button, for its confirmation.
 */
function shareVision(index) {
  var link = visionLink();
  copyToClipboard(link).then((copied) => {
    if (copied) {
      flashButton(index, "Link copied.");
    } else {
      window.prompt("Copy this link:", link);
    }
  });
}

/**
 * Leaves a shared vision and enters the ritual, as a seeker who arrived without a link would.
 */
function consultYourself() {
  history.replaceState(null, "", location.href.split("#")[0]);
  visit = {};
  visitOracle();
}

/**
 * Determines if today is an "auspicious day" (a day of the month that is a multiple of 3).
 * @returns {boolean} True if today is a multiple of 3, false otherwise.
 */
function isAccessibleToday() {
  const today = new Date().getDate(); // Get the current day of the month
  return today % 3 === 0;
}

/**
 * Calculates the number of days until the next "auspicious day" (a day that is a multiple of 3).
 * @returns {number} The number of days until the next accessible day.
 */
function daysUntilNextAccessible() {
  const now = new Date();
  const today = now.getDate();
  const remainder = today % 3;
  if (remainder === 0) return 0;

  // Day 0 of next month = last day of this month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // If the next multiple of 3 would fall past the end of the month (e.g. the 31st,
  // or the 28th/29th in February), the next auspicious day is the 3rd of next month.
  if (today + (3 - remainder) > daysInMonth) {
    return daysInMonth - today + 3;
  }
  return 3 - remainder;
}

/**
 * Initializes the Oracle interaction.
 * If the page was opened from a shared link, shows that vision. Otherwise, if today is an
 * accessible day, starts the Oracle dialogue, and if not, displays a message.
 */
function visitOracle() {
  var shared = readSharedVision();
  if (shared) {
    visit = shared; // Someone else's vision: no gate, no ritual, just the vision
    showSpeech(20);
  } else if (isAccessibleToday()) {
    showSpeech(1); // Start the Oracle's dialogue
  } else {
    const daysRemaining = daysUntilNextAccessible();
    const dayLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`; // Generate "1 day" or "N days"

    // Update the speech for dialog[0] dynamically
    dialog[0].speech = dialog[0].speech.replace("#days#", dayLabel);
    
    // Use showSpeech to display the message with delay and animations
    showSpeech(0);
  }
}

/**
 * Shows a shared vision, waiting if the page is in the middle of a transition or the trance.
 * Used when a link arrives while the page is already open, which is not a page load.
 * @param {Object} shared - A `visit` from readSharedVision.
 */
function showSharedVisionWhenReady(shared) {
  if (isTransitioning) {
    setTimeout(() => showSharedVisionWhenReady(shared), 250);
    return;
  }
  visit = shared;
  showSpeech(20);
}

/**
 * Initializes the Oracle application on page load.
 */
$(document).ready(function () {
  visitOracle(); // Initialize the Oracle logic on page load

  // Pasting a shared link into a tab that is already open changes only the part after the #,
  // so the browser doesn't reload and visitOracle never runs. Listen for that change and show
  // the vision. (Clearing the hash ourselves in consultYourself doesn't fire this.)
  $(window).on("hashchange", function () {
    var shared = readSharedVision();
    if (shared) showSharedVisionWhenReady(shared);
  });
});
