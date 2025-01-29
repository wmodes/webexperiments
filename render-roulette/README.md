# Rendering Roulette

Rendering Roulette is a **randomized prompt generator** for 3D modeling projects. It provides **sequentially revealed constraints** for designing and animating a scene, ensuring a balance of **randomness, structure, and controlled reuse**.

## Features
- **Dynamic prompt generation** with six categories:
  - `start`
  - `source`
  - `composition`
  - `animation`
  - `style`
  - `wildcard`
- **Smooth, sequential fade-in animation** for each prompt part.
- **Probability-based reuse logic** to balance variety and repetition.
- **Persistent choice tracking** using `localStorage` to prevent immediate repeats.
- **Fully object-oriented (`PromptGenerator` class)** for maintainability and flexibility.

## How It Works
1. On page load or click, a new prompt is generated.
2. Each prompt part is revealed **sequentially** with natural reading delays.
3. Previously selected choices are stored in `localStorage`.
4. If a category has used all available options, **it resets while keeping the most recent choice**.
5. A **configurable probability (`reuseChancein100`)** allows some past choices to reappear.

## Configuration
You can adjust the following settings in `generate_prompt.js`:
```javascript
this.readingTimingScale = 1500;  // Controls overall pacing
this.reuseChancein100 = 25;      // % chance of reusing a past choice
```

## Installation & Usage
1. Clone or download the repository.
2. Open `index.html` in a browser.
3. Click anywhere to generate a new prompt.

## Future Improvements
- **Adaptive probabilities** that change based on usage patterns.
- **User-defined constraints** for even more control over randomness.
- **Export/share prompt history** for tracking inspiration.

## License
MIT License
