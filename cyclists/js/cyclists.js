


// Tree Stuff
var treesAbove = [];
var treesBelow = [];
const treeTypesAbove = ["🌲", "🌳", "🌴", "🌿"];
const treeTypesBelow = ["🌲", "🌳", "🌴", "🌿", "🍃", "🍂", "🌾"];
let treeBufferAbove, treeBufferBelow; // Buffers for trees

// Cyclist Stuff
var cyclists = [];
const cyclistEmojis = [
  "🚴🏻", "🚴🏻‍♀️", "🚴🏻‍♂️", 
  "🚴🏽", "🚴🏽‍♀️", "🚴🏽‍♂️", 
  "🚴🏿", "🚴🏿‍♀️", "🚴🏿‍♂️"
];
var numCyclists = 5;
var cyclistWidth = 50;
var cyclistHeight = 50;

// Explosion Stuff
let explosions = [];
const explosionFrames = ["✨", "💥", "💥", "💨", ""]; // Empty string for disappearing
const explosionSizes = [20, 80, 50, 30, 0]; // Scale up, then shrink
const EXPLOSION_DURATION = 500;

// Skull Stuff
var skulls = [];
const skullEmojis = ["☠️", "💀"]
// Constants for skull visibility and fade-out duration
const SKULL_VISIBLE_TIME = 20000; // 20 seconds fully visible
const SKULL_FADE_TIME = 5000; // 5 seconds fade-out

// Ghost Stuff
var ghosts = [];
const ghostEmoji = "👻";
const GHOST_LIFETIME = 4000; // Ghost lasts for 4 seconds
const GHOST_RISE_SPEED = 0.5; // How fast the ghost rises
const GHOST_WAVE_SPEED = 0.05; // Slight left-right drift

// Sound Stuff
let explosionSounds = [];
let boneSounds = [];
const explosionFiles = [
  "explosion1.wav",
  "explosion2.wav",
  "explosion3.wav",
  "explosion4.wav",
  "explosion5.wav",
  "explosion6.wav",
  "explosion7.wav"
];
const boneFiles = ["bones1.wav", "bones2.wav", "bones3.mp3"];
const soundDir = "sounds/";

function preload() {
  soundFormats('wav', 'mp3'); // ✅ Supports both formats

  explosionSounds = explosionFiles.map(file => loadSound(soundDir + file));
  boneSounds = boneFiles.map(file => loadSound(soundDir + file));
}

// Set up canvas
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create buffers for trees
  treeBufferAbove = createGraphics(width, height);
  treeBufferBelow = createGraphics(width, height);

  initializeCyclists();
  initializeTrees();
	cursor("pointer");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  treeBufferAbove = createGraphics(width, height);
  treeBufferBelow = createGraphics(width, height);

  initializeCyclists();
  initializeTrees();
	skulls = [];
	ghosts = [];
}

// Initialize cyclists
function initializeCyclists() {
  cyclists = [];
  for (var i = 0; i < numCyclists; i++) {
    var cyclist = {
      position: random(width),
      speed: random(1, 4),
      yOffset: random(-5, 5), // Random vertical offset
      exploded: false,
      explosionTime: 0,
      skullSpawned: false,
      emoji: random(cyclistEmojis) // ✅ Assign a random emoji
    };
    cyclists.push(cyclist);
  }
}

function initializeTrees() {
	treesAbove = []; // ✅ Clear existing trees before adding new ones
  treesBelow = [];
  const ORIGINAL_HEIGHT = 720;
  const ORIGINAL_WIDTH = 960;
  const ORIGINAL_TREE_COUNT = 200;
  const TREE_DENSITY = ORIGINAL_TREE_COUNT / ORIGINAL_WIDTH;
  
  treeBufferAbove.clear();
  treeBufferBelow.clear();

  let numTrees = Math.floor(width * TREE_DENSITY);

  for (let i = 0; i < numTrees; i++) {
    let aboveX = random(width);
    let aboveY = random(height * (250 / ORIGINAL_HEIGHT), height * (0.5 - 10 / ORIGINAL_HEIGHT));
    let belowX = random(width);
    let belowY = random(height * (0.5 + 40 / ORIGINAL_HEIGHT), height);

    // Draw background trees (Above)
    treeBufferAbove.textSize(10 + 100 * (aboveY / height));
    treeBufferAbove.fill(34, 139, 34);
    treeBufferAbove.text(random(treeTypesAbove), aboveX, aboveY);

    // Draw foreground trees (Below)
    treeBufferBelow.textSize(10 + 100 * (belowY / height));
    treeBufferBelow.fill(34, 139, 34);
    treeBufferBelow.text(random(treeTypesBelow), belowX, belowY);
  }
}

function draw() {
  background(255);
  drawSky();
  drawSun();
  drawCanyon();
  
  image(treeBufferAbove, 0, 0); // ✅ Draw background trees FIRST

  drawGhosts(); // Draw ghosts floating up
  drawSkulls(); // Draw skulls before cyclists
	drawExplosions();
	drawCyclists();

  image(treeBufferBelow, 0, 0); // ✅ Draw foreground trees LAST (so they appear in front of cyclists)
}

function drawCyclists() {
  for (var i = 0; i < cyclists.length; i++) {
    if (cyclists[i].exploded) {
      if (!cyclists[i].skullSpawned) {
        let skullX = cyclists[i].position;
        let skullY = height / 2 + cyclists[i].yOffset;

        // Spawn skull
        skulls.push({
          x: skullX,
          y: skullY,
          velocity: cyclists[i].speed,
          rotation: 0,
          rotationSpeed: -cyclists[i].speed * 0.05,
          time: millis(),
          emoji: random(skullEmojis)
        });

        // Spawn ghost
        ghosts.push({
          x: skullX,
          y: skullY,
          time: millis(),
          riseSpeed: cyclists[i].speed * 0.025,
          initialDrift: min(cyclists[i].speed * 5, 40),
          driftOffset: cyclists[i].speed
        });
        cyclists[i].skullSpawned = true;
      }

      if (millis() - cyclists[i].explosionTime < EXPLOSION_DURATION) {
        drawExplosion(cyclists[i]);
      } else {
        respawnCyclist(cyclists[i]);
      }
    } else {
      updateCyclist(cyclists[i]);
      drawCyclist(cyclists[i]);
    }
  }
}

// Update cyclist position and refresh emoji + vertical offset on wraparound
function updateCyclist(cyclist) {
  cyclist.position -= cyclist.speed;

  if (cyclist.position < -50) { // ✅ If cyclist wraps around...
    cyclist.position = width + 50; // Move to the right side
    cyclist.yOffset = random(-5, 5); // ✅ New vertical offset
    cyclist.emoji = random(cyclistEmojis); // ✅ New random emoji
  }
}

// ✅ Fix: Use the cyclist’s stored emoji inside drawCyclist()
function drawCyclist(cyclist) {
  textSize(50);
  fill(255, 0, 0);
  text(cyclist.emoji, cyclist.position, height / 2 + cyclist.yOffset); // ✅ Uses cyclist's emoji
}

function drawExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    drawExplosion(explosions[i]);

    // Remove explosion if it's done animating
    if (millis() - explosions[i].startTime > EXPLOSION_DURATION) {
      explosions.splice(i, 1);
    }
  }
}

function drawExplosion(explosion) {
  let elapsedTime = millis() - explosion.startTime;
  let frameIndex = floor(map(elapsedTime, 0, EXPLOSION_DURATION, 0, explosionFrames.length));

  // Ensure frameIndex is within valid bounds
  if (frameIndex < 0 || frameIndex >= explosionFrames.length) return; 

  let frame = explosionFrames[frameIndex];

  // ✅ Ensure text is not undefined or empty before drawing
  if (frame && frame.trim() !== "") {
    let size = explosionSizes[frameIndex];
    textSize(size);
    textAlign(CENTER, CENTER);
    text(frame, explosion.x, explosion.y);
  }
}

function drawSkulls() {
  textSize(25);
  fill(50);

  for (var i = skulls.length - 1; i >= 0; i--) {
    drawSkull(skulls[i]);

    // Remove skull when fully faded
    let timeElapsed = millis() - skulls[i].time;
    if (timeElapsed > SKULL_VISIBLE_TIME + SKULL_FADE_TIME) {
      skulls.splice(i, 1);
    }
  }
}

function drawSkull(skull) {
  // Apply velocity to movement
  skull.x -= skull.velocity;

  // Reduce rolling and movement more gradually
  skull.rotationSpeed *= 0.98;
  skull.velocity *= 0.98;

  // Stop rolling and spinning when very slow
  if (skull.velocity < 0.2) {
    skull.velocity = 0;
    skull.rotationSpeed = 0;
  }

  skull.rotation += skull.rotationSpeed; // Apply rotation update

  // Determine fade progress
  let timeElapsed = millis() - skull.time;
  let alpha = 255; // Default to fully visible

  if (timeElapsed > SKULL_VISIBLE_TIME) {
    let fadeProgress = (timeElapsed - SKULL_VISIBLE_TIME) / SKULL_FADE_TIME;
    alpha = map(fadeProgress, 0, 1, 255, 0); // Fade to transparent
  }

  // ✅ Fix: Rotate from the center of the skull
  push();
  translate(skull.x, skull.y);
  rotate(skull.rotation);
  textAlign(CENTER, CENTER); // Centers the emoji
  fill(50, alpha); // Apply fade effect
  text(skull.emoji, 0, 0);
  pop();
}

function drawGhosts() {
  textSize(30);
  fill(255, 255, 255, 200); // Ghosts always have some transparency

  for (var i = ghosts.length - 1; i >= 0; i--) {
    drawGhost(ghosts[i]);

    // Remove ghost when it fully fades out
    if (millis() - ghosts[i].time > GHOST_LIFETIME) {
      ghosts.splice(i, 1);
    }
  }
}

function drawGhost(ghost) {
  let elapsedTime = millis() - ghost.time;

  // Ghost rises at scaled cyclist speed
  let riseAmount = elapsedTime * ghost.riseSpeed;

  // Make left drift decay slower so it floats toward the upper-left corner
  let driftFactor = map(elapsedTime, 0, GHOST_LIFETIME, 1, 0.7);
  let leftDrift = ghost.initialDrift * driftFactor;

  // DriftOffset now progressively increases over time
  let drift = cos(elapsedTime * 0.01) * 5 - (ghost.driftOffset * elapsedTime * 0.03);

  // Fade out over time
  let alpha = map(elapsedTime, 0, GHOST_LIFETIME, 128, 0);

  // Draw ghost
  push();
  translate(ghost.x + drift - leftDrift, ghost.y - riseAmount);
  fill(255, 255, 255, alpha);
  text(ghostEmoji, 0, 0);
  pop();
}

// Draw canyon scenery
function drawCanyon() {
  var canyonColor1 = color(194, 178, 128);
  var canyonColor2 = color(155, 144, 101);
  
  fill(canyonColor1);
  rect(0, height / 2, width, height / 2);

  fill(canyonColor2);
  beginShape();
  var d = 100;
  var f = 0.5;
  vertex(0, height / 2 - d);
  vertex(100, height / 2 - f * 100 - d);
  vertex(300, height / 2 - f * 50 - d);
  vertex(500, height / 2 - f * 150 - d);
  vertex(700, height / 2 - f * 50 - d);
  vertex(width, height / 2 - f * 100 - d);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function drawTrees() {
  image(treeBufferAbove, 0, 0); // Draw background trees first
  image(treeBufferBelow, 0, 0); // Draw foreground trees last (in front of cyclists)
}

// Draw sky gradient
function drawSky() {
  var skyColor1 = color(255, 155, 97);
  var skyColor2 = color(248, 192, 117);
  setGradient(0, 0, width, height / 2 - 100, skyColor1, skyColor2);
}

// Draw sun
function drawSun() {
  fill(255, 240, 96);
  noStroke();
  ellipse(width / 2, height / 2 - 120, 200, 200);
}

// Function to draw a gradient
function setGradient(x, y, w, h, color1, color2) {
  for (var i = y; i <= y + h; i++) {
    var inter = map(i, y, y + h, 0, 1);
    var c = lerpColor(color1, color2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

// Handle mouse click to trigger explosion
function mousePressed() {
	userStartAudio();
  for (var i = 0; i < cyclists.length; i++) {
    if (isCyclistClicked(cyclists[i])) {
      cyclists[i].exploded = true;
      cyclists[i].explosionTime = millis();

      // 🚀 Add explosion at the clicked cyclist's position
      explosions.push({
        x: cyclists[i].position,
        y: height / 2 + cyclists[i].yOffset,
        startTime: millis()
      });

      // 🔊 Play a random explosion sound immediately
      if (explosionSounds.length > 0) {
        let sound = random(explosionSounds);
        sound.play();
      }

      // ⏳ Play bones sound *almost immediately* (1ms delay)
      setTimeout(() => {
        if (boneSounds.length > 0) {
          let sound = random(boneSounds);
          sound.play();
        }
      }, 1); // 🔥 Previously EXPLOSION_DURATION, now 1ms

      break;
    }
  }
}

// Check if a cyclist was clicked using a properly aligned bounding box
function isCyclistClicked(cyclist) {
  let boxWidth = cyclistWidth;  // Approximate width of the emoji
  let boxHeight = cyclistHeight * 1.2; // Extend height slightly

  let left = cyclist.position - boxWidth / 2;  // ✅ Adjusted for center alignment
  let right = cyclist.position + boxWidth / 2; // ✅ Right side is now correct
  let top = height / 2 + cyclist.yOffset - boxHeight / 2; // ✅ Adjusted for Y alignment
  let bottom = top + boxHeight;  

  return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom;
}

// Respawn a cyclist with a new random yOffset
function respawnCyclist(cyclist) {
  cyclist.position = width + 50;
  cyclist.speed = min(cyclist.speed * 1.1, 10);
  cyclist.yOffset = random(-5, 5); // ✅ New vertical offset
  cyclist.emoji = random(cyclistEmojis); // ✅ New random emoji
  cyclist.exploded = false;
  cyclist.skullSpawned = false;
}

