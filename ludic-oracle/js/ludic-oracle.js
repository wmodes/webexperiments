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
 * @type {Object}
 */
var dialog = {
  0: {
    speech: `<div style='display: flex; align-items: center;'>
      <div style='flex-basis: 75%;'>
        This is not an auspicious day, seeker. The Oracle is silent today. 
        Return in #days#, when the power of three—the sacred number of Shigeru Miyamoto—shall open the Oracle's mind to your questions.
      </div>
      <div style='flex-basis: 25%;'>
        <img src='img/sundial.png' style='width: 150px;'>
      </div>
    </div>`,
    options: [],
    destinations: [],
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
    speech: "Very well, seeker. Let us begin. I will ask you a series of questions, and you must answer them truthfully. Are you ready?",
    options: [
        "No, Oracle.",
        "Yes, Oracle. I will answer truthfully.",
    ],
    destinations: [3, 4],
  },
  3: {
    speech: "Very well, seeker. Return to me when you are ready to begin your quest.",
    options: [
        "Start over."
    ],
    destinations: [1],
  },
  4: {
    speech: "The Oracle requires sacrifice. Did you bring an offering?",
    options: [
        "No, Oracle.",
        "Yes, Oracle. I have brought an offering.",
    ],
    destinations: [6, 5],
  },
  5: {
    speech: "Very well, seeker. You may proceed. The Oracle requires a sacrifice of <b>time and effort.</b> Are you willing to proceed?",
    options: [
        "I am not ready, Oracle.",
        "I am ready, Oracle.",
    ],
    destinations: [6, 7],
  },
  6: {
    speech: "The Oracle requires a sacrifice. Return when you are ready to proceed.",
    options: [
        "Start over."
    ],
    destinations: [1],
  },
  7: {
    speech: "The Oracle will enter a trance and reveal the game idea to you. Are you ready?",
    options: [
        "No, Oracle.",
        "Yes, Oracle.",
    ],
    destinations: [6, 8],
  },
  8: {
    speech: "We shall begin.",
    options: [
        "Continue."
    ],
    destinations: [9],
  },
  9: {
    speech: "<div class='ellipses'>...</div>",
    options: [],
    destinations: [],
  },
  10: {
    speech: "<div id='game-idea'></div>",
    options: [
        "Start over."
    ],
    destinations: [1],
  }
};

/**
 * Displays the Oracle's speech based on the given dialogue ID.
 * Handles fade-out, a delay, and fade-in animations for smooth transitions.
 * @param {number} n - The ID of the dialogue to display.
 */
function showSpeech(n) {
  console.log("Showing dialogue", n);
  var speech = dialog[n].speech;
  var options = dialog[n].options;
  var destinations = dialog[n].destinations;

  // Special case for dialogue 9 (trance effect)
  if (n === 9) {
    trance(10); // Call trance and pass the next dialogue ID
    return; // Exit early for special case
  }

  // Hide the bubble-wrapper for a brief pause
  $(".bubble-wrapper").fadeOut(200, () => {
    // Use setTimeout to create a 1-second delay before showing new speech
    setTimeout(() => {
      var html = "<p>" + speech + "</p>";
      html += '<div class="button-box">';
      for (var i = 0; i < options.length; i++) {
        html += `<button onclick="showSpeech(${destinations[i]})">${options[i]}</button>`;
      }
      html += '</div>';
      $(".speech-bubble").html(html);

      // Reveal the bubble-wrapper with the new content
      $(".bubble-wrapper").fadeIn(200);

      // Generate game idea if reaching dialogue 10
      if (n === 10) {
        gameIdea(); // Call gameIdea function
      }
    }, 1500); // 1.5-second delay
  });
}

/**
 * Creates a trance-like animation of ellipses before transitioning to the next dialogue.
 * @param {number} nextDialogId - The ID of the dialogue to transition to after the trance.
 */
function trance(nextDialogId) {
  var maxDots = 9;
  var currentDots = 3;
  $(".speech-bubble").html(`<p><div class='ellipses'>${'.'.repeat(currentDots)}</div></p>`);

  // Start the ellipses animation
  var interval = setInterval(() => {
    currentDots++;
    $(".ellipses").text('.'.repeat(currentDots));

    if (currentDots >= maxDots) {
      clearInterval(interval); // Stop animation
      showSpeech(nextDialogId); // Move to the next dialogue
    }
  }, 1000); // 1-second interval
}

/**
 * Generates an experimental game idea using Tracery grammar.
 * The result is inserted into the speech bubble.
 */
function gameIdea() {
  // Generate a game idea using Tracery
  var grammar = tracery.createGrammar(gameIdeaGrammar);
  // grammar.addModifiers(tracery.baseEngModifiers); // Add default modifiers
  
  var gameIdea = grammar.flatten("#origin#");

  $("#game-idea").html(gameIdea);
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
  const today = new Date().getDate();
  const remainder = today % 3;
  return remainder === 0 ? 0 : 3 - remainder;
}

/**
 * Initializes the Oracle interaction.
 * If today is an accessible day, starts the Oracle dialogue. Otherwise, displays a message.
 */
function visitOracle() {
  if (isAccessibleToday()) {
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
 * Initializes the Oracle application on page load.
 */
$(document).ready(function () {
  visitOracle(); // Initialize the Oracle logic on page load
});
