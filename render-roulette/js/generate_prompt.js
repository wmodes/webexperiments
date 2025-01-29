/**
 * @file generate_prompt.js
 * @description Generates a random rendering prompt with sequential fade-in animation.
 * @requires jQuery
 */

class PromptGenerator {
  /**
   * Initializes the prompt generator with default values.
   */
  constructor() {
      this.readingTimingScale = 1500; // Base time for reading speed

      // Relative timing delays for each prompt part (multipliers of readingTimingScale)
      this.timingDelays = [1.0, 1.0, 1.8, 1.3, 1.5, 3.0];

      // Separators between prompt parts
      this.separators = [
          "&nbsp;",       // After start
          "&nbsp;—&nbsp;", // After source
          "&nbsp;—&nbsp;", // After composition
          "&nbsp;—&nbsp;", // After animation
          "...<br>",       // After style
          "."              // Final wildcard
      ];

      // Prompt categories
      this.promptKeys = ["start", "source", "composition", "animation", "style", "wildcard"];

      // Store generated elements for sequential reveal
      this.elements = [];

      // Store selected indexes for reproducibility
      this.choicesArray = [];

      // LocalStorage record of past choices
      this.choiceRecord = {};

      // Probability of reusing a previously selected prompt (percentage)
      this.reuseChanceIn100 = 25;

      // Initialize event listeners
      this.setupEventListeners();
  }

  /**
   * Retrieves the choiceRecord from localStorage.
   * If none exists, initializes a new empty record.
   */
  beforePrompt() {
      const storedRecord = localStorage.getItem("choiceRecord");

      if (storedRecord) {
          this.choiceRecord = JSON.parse(storedRecord);
      } else {
          this.resetChoiceRecord();
      }
  }

  /**
   * Saves the latest choices to localStorage.
   * If all options in a category have been used, resets that category to the latest choice.
   */
  afterPrompt() {
      this.choicesArray.forEach((index, keyIndex) => {
          const key = this.promptKeys[keyIndex];
          this.choiceRecord.prompts[key][index] = true; // Mark index as used
      });

      // Now check if any category needs to be reset
      this.promptKeys.forEach((key, keyIndex) => {
          const usedCount = Object.keys(this.choiceRecord.prompts[key] || {}).length;
          const totalChoices = prompts[key].length;

          if (usedCount >= totalChoices) {
              console.log(`Resetting choices for: ${key}`);
              this.choiceRecord.prompts[key] = { [this.choicesArray[keyIndex]]: true }; // Reset to most recent choice
          }
      });

      // Update timestamp
      this.choiceRecord.timestamp = Date.now();

      // Save back to localStorage
      localStorage.setItem("choiceRecord", JSON.stringify(this.choiceRecord));
  }

  /**
   * Selects a random index from an array, with a chance to reuse a past selection.
   * @param {Array} array - The array to pick from.
   * @param {string} key - The key corresponding to the category.
   * @returns {*} The selected element.
   */
  getRandomElementWithIndex(array, keyIndex) {
    const key = this.promptKeys[keyIndex];

    let selectedIndex;
    do {
        selectedIndex = Math.floor(Math.random() * array.length);

        // If the choice is new, use it immediately
        if (!this.choiceRecord.prompts[key][selectedIndex]) {
            break;
        }

        // Otherwise, roll for a chance to reuse
        const reuseRoll = Math.random() * 100;
        if (reuseRoll <= this.reuseChancein100) {
            break;
        }

        // Otherwise, loop again and pick a new random choice
    } while (true);

    // Store selection
    this.choicesArray[keyIndex] = selectedIndex;
    return array[selectedIndex];
  }

  /**
   * Resets the choiceRecord to an empty state.
   */
  resetChoiceRecord() {
      this.choiceRecord = {
          timestamp: Date.now(),
          prompts: {}
      };
      this.promptKeys.forEach(key => {
          this.choiceRecord.prompts[key] = {};
      });
  }

  /**
   * Generates and displays a new rendering prompt.
   */
  generatePrompt() {
      // Run pre-prompt logic
      this.beforePrompt();

      // Clear previous content
      $("#output").empty();
      this.elements = [];
      this.choicesArray = []; // Reset choices for new prompt

      // Set CSS variable for timing scale
      document.documentElement.style.setProperty("--timing-scale", this.readingTimingScale + "ms");

      // Generate all elements first and append them immediately
      this.promptKeys.forEach((key, index) => {
          const randomChoice = this.getRandomElementWithIndex(prompts[key], index);
          const spanElement = $(`<span class="prompt-part">${randomChoice}${this.separators[index]}</span>`);
          this.elements.push(spanElement);
          $("#output").append(spanElement);
      });

      // Reveal elements sequentially
      this.revealElements();

      // Run post-prompt logic
      this.afterPrompt();
  }

  /**
   * Reveals each prompt part sequentially using the defined delays.
   */
  revealElements() {
      let totalDelay = 0;

      this.elements.forEach((element, index) => {
          totalDelay += this.timingDelays[index] * this.readingTimingScale;

          setTimeout(() => {
              element.addClass("show");
          }, totalDelay);
      });

      // Show instructions after the final element
      setTimeout(() => {
          $("#instructions").addClass("show");
      }, totalDelay + 1000);
  }

  /**
   * Sets up event listeners for interaction.
   */
  setupEventListeners() {
      $(document).on("click", () => {
          $("#instructions").removeClass("show");
          this.generatePrompt();
      });

      $(document).ready(() => {
          this.generatePrompt();
      });
  }
}

// Initialize the Prompt Generator
const promptGenerator = new PromptGenerator();
