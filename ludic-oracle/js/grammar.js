var gameIdeaGrammar = {
  // origin forms the framing of the game idea. 
  // Variations on "<p>The Oracle stirs. A vision!</p><p>[game-idea]</p><p>Go forth and make the game.</p>"
  "origin": [
    "<p>The Oracle stirs. A vision has been revealed.</p><p>#game-idea#</p><p>Go forth and make the game.</p>",
    "<p>The Oracle speaks: behold this revelation!</p><p>#game-idea#</p><p>Create this game to please the Ludic Gods.</p>",
    "<p>A vision forms in the mists of the Oracle's mind.</p><p>#game-idea#</p><p>The Ludic Gods await your offering.</p>",
    "<p>The Oracle awakens, trembling. A prophecy emerges.</p><p>#game-idea#</p><p>It is your task to bring this game to life.</p>"
  ],

  // The actual game idea.
  // Variations on "I see a game where...", or "Image an experimental..."
  "game-idea": [
      "I see #concept#. The twist? #twist#.",
      "Envision #concept#, where #twist#.",
      "An experimental game awaits: #concept#. Its challenge? #twist#.",
      "A bold creation: #concept#. Beware—#twist#.",
      "In my vision, I see #concept#. But heed this: #twist#.",
      "The Ludic Gods demand #concept#. The test? #twist#."
  ],

  "concept": [
    "a multiplayer game where #dynamic#",
    "a cooperative experience where players must #goal_verb# while navigating #environment#",
    "a competitive game where #mechanic# creates constant tension in #setting#",
    "a narrative-driven experience where #player_role# must #goal_verb# in #setting#",
    "a branching narrative where every decision reshapes #environment# and explores #theme#",
    "a story-rich game where players explore #theme# through #mechanic#",
    "a surreal adventure through #environment#",
    "an exploration game where players discover #theme# hidden in #setting#",
    "a dreamlike journey where #player_role# unravels #goal_noun# by using #mechanic#",
    "an experimental sandbox that explores #theme#",
    "a creative game where players use #mechanic# to shape #environment#",
    "a simulation game where #theme# unfolds dynamically in #setting#",
    "a puzzle game where solving #goal_noun# reveals #theme#",
    "a roguelike game where #mechanic# leads to unexpected consequences in #environment#",
    "a rhythm-based game where #player_role# uses music to #goal_verb#",
    "a rhythm-based game where #player_role# uses music to accomplish #goal_noun#",
    "a horror game where #theme# emerges through interactions with #setting#",
    "a game where #representation# culture is explored through #mechanic# in #environment#",
    "a reflective game where players embody a #representation# character to experience #theme#",
    "a story about a #representation# individual who must #goal_verb# in #setting#",
    "a game where the boundaries of #theme# are pushed using #mechanic#",
    "an unconventional game where #player_role# must navigate #dynamic# in #environment#",
    "an abstract game that turns #theme# into #mechanic#"
  ],


  "mechanic": [
      "rewinding time every minute",
      "controlling the flow of time through your movements",
      "permanently altering the story's tone through dialogue choices",
      "dictating the game's difficulty based on the protagonist's emotions",
      "rewriting NPC memories by solving abstract puzzles",
      "collaborating with other players to create art as a weapon",
      "sculpting the game environment in real time using players' voices",
      "revealing hidden paths through traditional music",
      "building bridges to overcome obstacles through storytelling",
      "unlocking ancient knowledge through symbolic gestures",
      "connecting the player to the environment through ceremonial rituals",
      "drawing power from the spirits of your ancestors"
  ],

  "setting": [
    "a fragmented dreamscape",
    "a decaying city trapped in a time loop",
    "a world where oral traditions keep history alive",
    "an infinite library where books come to life",
    "a landscape where memories shape the environment",
    "a carnival filled with cryptic automatons",
    "a realm of interconnected timelines influenced by cultural stories",
    "a crumbling tower that reveals its secrets as you climb",
    "a maze where folklore guides your path",
    "a village where every action reshapes its culture"
  ],

  "player_role": [
      "a #representation# hero navigating #environment#",
      "a #representation# individual rediscovering their identity",
      "a #representation# spirit lost in the echoes of time",
      "a #representation# AI learning to feel",
      "a #representation# child exploring the ruins of forgotten gods"
  ],

  "goal_noun": [
      "ancient secrets",
      "hidden truths",
      "the resilience of cultural identity",
      "a lost language",
      "the mysteries of a forgotten world",
      "the path to redemption",
      "a map of endless possibilities"
  ],
  "goal_verb": [
      "uncover hidden truths",
      "reshape reality itself",
      "preserve cultural traditions",
      "overcome systemic barriers",
      "rebuild a shattered community",
      "reconnect with ancestral spirits",
      "honor those who came before"
  ],

  "dynamic": [
    "players must betray each other to survive",
    "cooperation is essential, but resources are scarce",
    "roles switch every minute, forcing constant adaptation",
    "alliances form and dissolve in unpredictable ways",
    "players have to vote on mechanics mid-game",
    "resources are hidden until players share personal secrets",
    "players must work together while unable to communicate directly",
    "each player controls part of a single, shared character",
    "victory conditions are revealed only after the game is complete",
    "players must interpret cryptic symbols to progress"
  ],

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

  "environment": [
    "a minimalist black-and-white world",
    "a shifting maze of light and shadow",
    "a procedurally generated forest",
    "a landscape shaped by player emotions",
    "an endless series of labyrinthine dreams",
    "a realm where sound takes on physical form",
    "a world of floating islands connected by fragile threads",
    "a village where traditions shape its evolution",
    "a surreal space of ever-changing geometric patterns",
    "a temple guarded by riddles of cultural significance"
  ],

  "representation": [
    "#rep_adj#",
    "#rep_adj#",
    "#rep_adj#, #rep_adj#",
    "#rep_adj#, #rep_adj#, #rep_adj#"
  ],
  "rep_adj": [
    "Indigenous",
    "Gay-coded",
    "Occult",
    "Folkloric",
    "Visually-impaired",
    "Non-binary",
    "Neurodivergent",
    "Elderly",
    "Disabled",
    "Deaf",
    "Genderqueer",
    "Asian-American",
    "Latinx",
    "Black",
    "Post-human"
  ],

  "twist": [
    "players' decisions affect real-world outcomes",
    "you can never replay the same game twice",
    "the mechanics change as the story progresses",
    "it rewrites itself based on your failures",
    "you communicate with NPCs only through music",
    "the game evolves based on your breathing patterns",
    "your death is permanent, but your actions remain in the game world",
    "the game watches you and learns your habits over time",
    "time itself becomes an inventory item",
    "the player's physical movements outside the game influence the story"
  ]
};
