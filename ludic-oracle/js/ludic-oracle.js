

var dialog = {
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
}

function showSpeech(n) {
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

function gameIdea() {
  // Generate a game idea using Tracery
  var grammar = tracery.createGrammar(gameIdeaGrammar);
  // grammar.addModifiers(tracery.baseEngModifiers); // Add default modifiers
  
  var gameIdea = grammar.flatten("#origin#");

  $("#game-idea").html(gameIdea);
}

$(document).ready(function () {
  // gameIdea();
  showSpeech(1);
});