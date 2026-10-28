/**
 * The Ludic Oracle's game-idea grammar.
 *
 * Every idea is built around a playable core: a concrete thing the player DOES, plus exactly
 * one layer and a twist that changes the doing. The layers are deliberately kept
 * apart, because they behave differently:
 *
 *   playRule   a gameplay constraint (format, input, time). It only works if it can transform
 *              the core's verb, so the list is short and used rarely.
 *   worldRule  a thematic constraint: a ritual, an embodied way of playing, or a law of the
 *              fictional world. It carries meaning, so it fits almost any core.
 *   themeFrame what the game is about, said one of several ways so no phrase is overused.
 *
 *   concept = [feeling] game about CORE, then ONE of: playRule | worldRule | themeFrame |
 *             set in SETTING (a place, often with you in it as someone) |
 *             seen through the eyes of PROTAGONIST (someone with no occupation to clash with the core)
 *   twist   = a clause that changes what the core asks of the player
 *
 * DESIGN PRINCIPLE: constrain the form, never the meaning.
 *
 * The Oracle is a source of provocations, not finished pitches. Its pieces are drawn
 * independently, and some pairings quarrel (a baker's cakes seen through a clockmaker's eyes,
 * a solo lighthouse game whose twist says "each player controls part of a shared character").
 * That friction is where the designer's imagination gets to work, and the closing lines say so
 * out loud. Do NOT add logic that makes the pieces agree: no tagging, matching, pairing or
 * "compatible with" tables, no pools that exist only to avoid a clash. Each one trades the
 * reader's discovery for the author's taste, and the strangeness is the point.
 *
 * What IS fixed is form: anything that makes a vision read as careless instead of strange.
 * Wrong articles, a repeated word, two relative clauses fighting over one noun, three layers
 * stacked on a core. Those get fixed. tools/check-grammar.js enforces both halves: form rules
 * that must hold, and checks that the pieces stay independent and the nudges stay gentle.
 *
 * Written for tracery-improved (it cycles through a symbol's rules before repeating one).
 * #feeling.a# and #twist.capitalize# need grammar.addModifiers(tracery.baseEngModifiers).
 */
var gameIdeaGrammar = {
  // origin forms the framing of the game idea.
  // Variations on "<p>The Oracle stirs. A vision!</p><p>[game-idea]</p><p>Go forth and make the game.</p>"
  // Opening and closing are separate so they combine freely (four of each was four fixed pairs).
  "origin": [
    "<p>#opening#</p><p>#game-idea#</p><p>#closing#</p>"
  ],

  "opening": [
    "The Oracle stirs. A vision has been revealed.",
    "The Oracle speaks: behold this revelation!",
    "A vision forms in the mists of the Oracle's mind.",
    "The Oracle awakens, trembling. A prophecy emerges."
  ],

  // How the Oracle sends the seeker off. The first four are the original closings. The rest are
  // deliberate: the pieces of a vision are drawn separately and sometimes quarrel (a baker's cakes
  // seen through a clockmaker's eyes), and these lines say that is on purpose. The Oracle hands the
  // reconciling to the designer; it does not do it. Keep new ones in that spirit: never apologize
  // for the vision, and never explain it.
  "closing": [
    "Go forth and make the game.",
    "Create this game to please the Ludic Gods.",
    "The Ludic Gods await your offering.",
    "It is your task to bring this game to life.",
    "Go forth and make the game, and make sense of whatever seems not to fit.",
    "Where the vision quarrels with itself, the game is hiding.",
    "The Oracle does not reconcile. That is your task.",
    "If the parts seem to disagree, they were meant to. Make them agree.",
    "Do not smooth the strange edges. Build on them.",
    "The contradiction is the gift. Unwrap it.",
    "What looks like a mistake in this vision is the door. Walk through it.",
    "The Oracle placed these pieces together on purpose. Find out why.",
    "Do not ask the Oracle to explain. The explaining is the game.",
    "The pieces do not fit by accident. Make them fit by design.",
    "Where the Oracle is unclear, you are being asked to decide.",
    "A vision is a question. Your game is the answer.",
    "The Ludic Gods do not give answers. They give puzzles, and then they wait.",
    "Make the strangeness make sense, and then keep the strangeness.",
    "The seams in this vision are intentional. Do not hide them.",
    "Hold the parts together until they become one game.",
    "Make it playable, and let it stay strange.",
    "The Oracle has shown you the pieces. The picture is yours to find."
  ],

  // The actual game idea.
  // Variations on "I see a game where...", or "Imagine an experimental..."
  // A twist that starts a new sentence (after "?" or "Know this:") takes .capitalize where it begins
  // a sentence; after "—" or ":" it stays lowercase. No opener joins its twist to the concept with
  // ", where": rules and protagonists already contain "where"/"who" clauses, and a second one
  // attaches to the nearest noun instead of the game.
  "game-idea": [
      "I see #concept#. The twist? #twist.capitalize#.",
      "Envision #concept#. Know this: #twist#.",
      "An experimental game awaits: #concept#. Its challenge? #twist.capitalize#.",
      "A bold creation: #concept#. Beware—#twist#.",
      "In my vision, I see #concept#. But heed this: #twist#.",
      "The Ludic Gods demand #concept#. The test? #twist.capitalize#."
  ],

  // The shape of the idea. #feeling.a# gives "a tender" / "an eerie".
  //
  // The rule: a core, EXACTLY ONE layer (a playRule, worldRule, themeFrame, protagonist or
  // setting), and the twist the opener adds. Never two layers. Each layer is a phrase that
  // hangs off the core, and a second one attaches to the wrong noun ("a baker who must choose
  // which mornings to spend, where every kindness costs something") and makes the idea read
  // as a pile of independent parts. A one-word feeling may sit beside a layer, since an
  // adjective can't attach to anything.
  //
  // Of ten shapes: one playRule, two worldRule, three themeFrame, one protagonist, three setting.
  "concept": [
    "#feeling.a# game about #core#, #playRule#",
    "#feeling.a# game about #core#, #worldRule#",
    "a game about #core#, #worldRule#",
    "#feeling.a# game about #core#, #themeFrame#",
    "a game about #core#, #themeFrame#",
    "a game about #core#, #themeFrame#",
    "a game about #core#, seen through the eyes of #protagonist#",
    "#feeling.a# game about #core#, set in #setting#",
    "#feeling.a# game about #core#, set in #setting#",
    "a game about #core#, set in #setting#"
  ],

  // How the game's theme is attached, as a phrase that follows a comma. Several ways of saying
  // the same thing, so "secretly about" is one voice among many rather than a tic.
  "themeFrame": [
    "secretly about #theme#",
    "a quiet comment about #theme#",
    "which engages the ideas of #theme#",
    "which troubles the ideas around #theme#",
    "wrestling with #theme#",
    "a meditation on #theme#",
    "with #theme# as its quiet subject"
  ],

  // The mood the idea is after. Single words that read after "a"/"an".
  "feeling": [
    "tender",
    "frantic",
    "eerie",
    "absurd",
    "cozy",
    "tense",
    "melancholy",
    "joyful",
    "uncanny",
    "mischievous"
  ],

  // The playable core: what the player does, to what, in what situation. Each is a gerund phrase
  // that reads after "about" or after "you are a [role],". One concrete moment of play you can picture.
  "core": [
    "balancing teacups on the back of a sleeping giant",
    "smuggling songs past the guards of a kingdom that has banned music",
    "tending a garden that grows from your mistakes",
    "sorting letters that were never meant to be delivered",
    "standing perfectly still as the one statue in a museum that moves when no one is watching",
    "stacking sandbags of bread against a rising tide",
    "guiding a flock of paper cranes through a thunderstorm with a single lantern",
    "bargaining with the weather, one favor at a time",
    "keeping a lighthouse lit through a very long night",
    "cooking a meal for a ghost who has forgotten what they like",
    "rescuing everyone from a collapsing carnival by rewinding the same minute",
    "teaching a clumsy robot to dance",
    "passing a secret down a line of strangers without being overheard",
    "building a bridge, plank by plank, out of things you have lost",
    "feeding a dragon who is afraid of fire",
    "painting a mural while the rain washes it away",
    "running a tiny night market in which every customer is lying",
    "herding scattered thoughts into a sleeping mind before the alarm rings",
    "delivering the last message across a city that has forgotten its own language",
    "swapping places with strangers on a night bus",
    "keeping the peace at a very long family dinner",
    "stitching a map together from the memories of passing travelers",
    "keeping a campfire alive by telling stories to the dark",
    "trading rumors in a village of people who speak only in questions",
    "racing your own shadow to the door",
    "conducting an orchestra of nervous animals",
    "catching dreams in a net before the sun comes up",
    "playing hide-and-seek in a town that rearranges itself whenever you blink",
    "building the tallest tower you can before your rival's clock strikes noon",
    "tuning a broken radio to find the one voice speaking to you",
    "growing a whole forest in a jar and defending it from the cat",
    "carrying a single flame across a rain-soaked city",
    "negotiating peace between two armies of very small knights",
    "keeping an enormous secret inside a very small room",
    "rowing a boat of sleepers across a lake made of their shared dream",
    "sneaking souvenirs out of the museum of your own past",
    "babysitting a god who was born this morning",
    "baking ever more impossible cakes for an ever more ambitious wedding",
    "reorganizing a library whose books keep rewriting themselves",
    "teaching a parrot to say the one thing you cannot say yourself"
  ],

  // GAMEPLAY constraints: how many play, for how long, with what. Each is a phrase that follows a
  // comma. These are mechanical claims, so they only help when they can transform the core's
  // verb; keep the list to ones that do, and don't add format notes that merely sit beside it.
  "playRule": [
    "played with a single button",
    "played in ninety-second rounds",
    "played by two players sharing one controller",
    "played with the controls reversed every minute",
    "played without ever pausing",
    "played with only pen and paper",
    "played by post, one move a day",
    "played on one phone passed between friends",
    "played in a single sitting that can never be saved",
    "played with a deliberate glitch you must learn to exploit"
  ],

  // THEMATIC constraints: a ritual, an embodied way of playing, or a law of the fictional world.
  // These make the playing mean something, so they suit almost any core. Each is a phrase that
  // follows a comma.
  "worldRule": [
    "played only at dusk, by the real clock",
    "played once a day, and never again until tomorrow",
    "played by candlelight, with real dice on a real table",
    "played with a stranger's old save file",
    "played by whispering to the game",
    "played by humming to open the way forward",
    "played with your breath as the controller",
    "played entirely in the dark, by sound alone",
    "in a world where no one is allowed to speak",
    "where every kindness costs something",
    "where you can only help the people who have forgotten you",
    "where the one who builds a thing is never allowed to see it finished",
    "where everything you lose is found by someone else",
    "where the dead are allowed one request",
    "where every door opens only once",
    "where you may only ask questions",
    "where promises are the only currency",
    "where every apology must be paid for",
    "where telling the truth makes the world a little smaller",
    "where nobody remembers yesterday except you",
    "where each night the world forgets one thing"
  ],

  // The twist: a clause that changes what the core asks of the player. Reads after "where",
  // "Beware—", "heed this:" and, capitalized, after "The twist?".
  "twist": [
    "every success makes the next task harder in a new way",
    "the rules change every time you lose",
    "your last attempt comes back as your rival",
    "winning means giving something up",
    "the game grows quieter the better you get",
    "whatever you ignore slowly turns into a monster",
    "the only way to win is to teach someone else to play",
    "time moves only when you do",
    "failure builds the world, and success quietly tears it down",
    "it can be finished only once, by only one player",
    "the town remembers you each time you replay the day",
    "the game forgets you if you stop playing",
    "your opponent is a recording of your own best run",
    "your helper is slowly learning to stop helping",
    "each level hides a smaller copy of itself",
    "whoever is losing gets to change the rules",
    "a single mistake is remembered for ten rounds",
    "the game ends the moment everyone agrees it should",
    "players must betray each other to survive",
    "cooperation is essential, but resources are scarce",
    "roles switch every minute, forcing constant adaptation",
    "resources are hidden until players share personal secrets",
    "each player controls part of a single, shared character",
    "victory conditions are revealed only after the game is complete",
    "it rewrites itself based on your failures",
    "the game evolves based on your breathing patterns",
    "time itself becomes an inventory item",
    "you can never replay the same game twice",
    "the game watches you and learns your habits over time"
  ],

  // For "set in". Two kinds of entry, both places:
  //  - scenery, from the old settings and environments;
  //  - a place with a person in it, "a place, with you as ...": the occupation-bound
  //    characters live here, so who you are is your ROLE in the place, never a second
  //    description competing with the core ("baking cakes, seen through the eyes of a
  //    clockmaker"). Places may repeat one another; what differs is who you are in them.
  // An identity is named only when it changes the story or the play, and never stacked
  // with another; each identity entry is written with a consequence attached.
  // No core may contain a "where" clause of its own, or a layer that also has one would double up.
  "setting": [
    // --- scenery ---
    "a fragmented dreamscape",
    "a decaying city trapped in a time loop",
    "an infinite library where books come to life",
    "a carnival filled with cryptic automatons",
    "a crumbling tower that reveals its secrets as you climb",
    "a maze where folklore guides your path",
    "a village where every action reshapes its culture",
    "a world where oral traditions keep history alive",
    "a minimalist black-and-white world",
    "a shifting maze of light and shadow",
    "a procedurally generated forest",
    "a landscape shaped by player emotions",
    "a realm where sound takes on physical form",
    "a world of floating islands connected by fragile threads",

    // --- a place, and who you are in it: identity, ability, culture ---
    "a town that has always left some streets dark, with you as its Black lamplighter",
    "a town whose old streets were erased from the map, with you as the Black mapmaker redrawing them",
    "a city built on stairs, with you as a courier who uses a wheelchair",
    "a city that keeps rearranging itself, with you as an autistic night courier who needs the route to stay the same",
    "a small town whose only safe place for couples is a bakery's back room, with you as the gay baker who keeps it",
    "a fishing village whose ancestors' fishing grounds now lie under the reservoir, with you as its Indigenous fisher",
    "a village the officials have come to close, with you as the immigrant beekeeper who translates for it",
    "a bakery on a long summer day of fasting, with you as the Muslim baker keeping the ovens going until sunset",
    "a port where every form asks you to choose, with you as its non-binary ferry pilot",
    "a river ferry whose passengers keep asking where you are really from, with you as its Asian-American pilot",
    "a village whose old hive records are written in Spanish, with you as the Latina beekeeper who can read them",
    "a town that must have every lamp lit before sundown on Friday, with you as its Jewish lamplighter",
    "a shop full of stopped clocks, with you as a clockmaker relearning how to use your hands after a stroke",
    "a lighthouse where every creak sounds like a storm warning, with you as the keeper whose anxiety hears them all",
    "a lighthouse whose light is the last thing you will see clearly, with you as its keeper, who is slowly going blind",
    "a river you can only read through the hull of a ferry, with you as its deaf pilot",
    "an apiary, with you as the beekeeper who has lost your sense of smell",
    "a bakery where every morning is a choice, with you as the baker in chronic pain who must decide which mornings to spend",
    "a town of clocks, with you as the clockmaker who remembers everything and has no sense of time",
    "a tailor's shop, with you as the tailor who cannot stop noticing every pattern",
    "a garden, with you as the gardener whose attention drifts at the worst moments",
    "a town of maps, with you as the mapmaker who gets lost in familiar places",
    "a city you have only just arrived in from another country, with you as its newest street musician",
    "a border crossing, with you as a baker carrying your grandmother's recipes across it",
    "a shore whose language is dying, with you as the last fisher who speaks it",
    "a tailor's shop, with you as the tailor stitching the first outfit that has ever felt like yours",
    "a town that disapproves of two lovers, with you as the courier carrying their letters",
    "a river where you are the only one who remembers the old bridge, with you as its ferry pilot",
    "a town that lights its lamps by hand, with you as its eighty-year-old lamplighter who refuses to retire",

    // --- a place, and who you are in it: situation, grief, strangeness ---
    "a village where everyone knows everyone's business, with you as its beekeeper",
    "a round of dark streets, with you as the lamplighter who is terrible at asking for help",
    "a shop of stopped clocks, with you as the grieving clockmaker who keeps every clock stopped at the same hour",
    "a village you promised never to leave, with you as the fisher who is quietly tempted",
    "a country of maps that are slightly wrong on purpose, with you as their mapmaker",
    "a garden no one else believes in, with you as the gardener who is sure the seeds will come up",
    "an empty concert hall, with you as the street musician who is the last of an orchestra",
    "a ferry crossing, with you as the pilot working double shifts to pay off an old debt",
    "an apiary that is all you have to talk to, with you as the beekeeper who talks to your hives instead of people",
    "a city whose streets you do not know yet, with you as a night courier who is new in town",
    "a lighthouse that must stay lit for a sick parent, with you as the child keeping the light",
    "a city after dark, with you as a courier who is afraid of the dark",
    "a bakery where lies are impossible, with you as the baker who cannot lie",
    "a city after dark, with you as a ghost working nights as a courier",
    "a river crossing, with you as a retired god working as its ferry pilot",
    "a kitchen, with you as an AI learning to bake"
  ],

  // Subtext: what the game is secretly about. Reads after "secretly about".
  "theme": [
    "human connection and loss",
    "the ethics of survival",
    "the fragility of memory",
    "the power of storytelling",
    "the resilience of cultural identity",
    "the complexity of belonging",
    "the beauty of imperfection",
    "the interplay between chaos and order",
    "how art reflects and reshapes society",
    "finding strength in diversity"
  ],

  // Whose eyes the game is seen through. Only people with NO occupation to clash with the core
  // live here, because they can pair with any core: the occupation-bound ones are in
  // "setting", where who you are is a role in a place. Each is a whole phrase (with its own
  // article) that reads after "seen through the eyes of": a strangeness, a stage of life, or a
  // trait that changes what the core asks of the player. Some are human, some are not.
  "protagonist": [
    "a swarm of bees that has decided to run for mayor",
    "a statue that has just learned to move",
    "a scarecrow guarding a field that no longer exists",
    "a ten-year-old left in charge for the day",
    "a retired god trying to be an ordinary neighbor",
    "a ghost who still keeps office hours",
    "an AI learning to feel",
    "a retired spy who is bad at retiring",
    "someone who promised never to leave the village and is quietly tempted",
    "someone who is terrible at asking for help",
    "someone who cannot lie",
    "a traveler who is new in town and doesn't know the streets",
    "someone who talks to their houseplants instead of people",
    "the only person left who still believes the seeds will come up",
    "someone who has outlived every argument they ever had",
    "a child with a very large imagination and a very small allowance"
  ]
};
