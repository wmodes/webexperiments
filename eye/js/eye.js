
// config variables
movementSpeed = 150;
xMin = -200;
xMax = 200;
yMin = -100;
yMax = 100;
minWait = 500;
maxWait = 4000;
highlightVariance = 3;

/**
 * Represents an Eye with x and y position tracking.
 */
class Eye {
  /**
   * Create a new Eye instance with initial position (0, 0).
   */
  constructor() {
      this.xPos = 0;
      this.yPos = 0;
  }

  /**
   * Move the Eye to the specified position.
   * @param {number} x - The x-coordinate of the new position.
   * @param {number} y - The y-coordinate of the new position.
   */
  moveTo(x, y) {
    // Apply limits to the new position
    x = Math.max(xMin, Math.min(xMax, x));
    y = Math.max(yMin, Math.min(yMax, y));

    this.xPos = x;
    this.yPos = y;

    // Define a custom "ease" easing function
    $.easing.ease = function (x) {
        return x * x;
    };

    // Use jQuery UI to animate the iris movement with the "ease" transition
    $("#iris").animate({
      left: x,
      top: y
    }, {
      duration: movementSpeed,
      easing: "ease" // Use "ease" as the easing function
    });
    
    // Apply the CSS class with the wiggle animation to #highlights
    $("#highlights").addClass("get-wiggly");
    // Remove the class after the animation is done
    setTimeout(() => {
      $("#highlights").removeClass("get-wiggly");
    }, movementSpeed);
  }

  // Get a random position within the defined boundaries
  getRandomPos() {
      const x = Math.random() * (xMax - xMin) + xMin;
      const y = Math.random() * (yMax - yMin) + yMin;
      return { x, y };
  }

  // Wait for a random duration between minWait and maxWait
  async waitAMoment() {
    const duration = Math.random() * (maxWait - minWait) + minWait;
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
  }

  // Move the iris randomly within boundaries, waiting for a random time in between
  async moveIrisRandomly() {
      while (true) {
          const { x, y } = this.getRandomPos();
          this.moveTo(x, y);
          await this.waitAMoment();
      }
  }
}

// Usage example:
const myEye = new Eye();
myEye.moveIrisRandomly();