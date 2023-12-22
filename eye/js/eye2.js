/*
  eye.js - JavaScript for faces
  author: Wes Modes, Shelby Decker
  date: 2023
*/

// CONSTANTS
const FACE_HTML_ELEMENT = "input-video";
const CANVAS_HTML_ELEMENT = "canvas";
// how often we track face
const TRACK_INTERVAL = 100; // milliseconds
// how often we move eye
const MOVE_INTERVAL = 300; // milliseconds
// how fast we move to new eye position
const MOVEMENT_SPEED = 150;
// eye scale relative to image size
const EYE_SCALE = 0.3;
// for pause between movements
const MIN_MOVE_WAIT = 500;
const MAX_MOVE_WAIT = 4000;
// how much wiggle in eye reflection during movement
const REFLECTION_WIGGLE = 3;
// are we drawing the face tracking?
const IS_DRAW_FACES = false;
// how similar do faces need to be to match
const SIMILARITY_THRESHOLD = 400;
// how long do we keep stale faces
const STALE_FACE_DURATION = 2000;

/**
 * Manages face detection and tracking in video streams.
 * Utilizes face-api.js for real-time face and landmark detection.
 * Maintains and updates detected face records with position, size, and score.
 * Optionally draws visual indicators (e.g., "+") on a canvas overlaying the video.
 *
 * @class
 * Methods:
 *  - run(): Initializes face detection.
 *  - loadModels(): Loads face detection models.
 *  - startVideo(): Starts the webcam video stream.
 *  - onPlay(): Detects faces and processes them continuously.
 *  - recordFacePositions(detections): Processes and stores face detection data.
 *  - normalizePosition(p): Normalizes face position coordinates.
 *  - drawFaces(p): Draws visual indicators on the canvas for detected faces.
 *
 * Assumes specific HTML elements for video and canvas and certain global configuration variables.
 */
class Faces {
  constructor() {
    this.videoEl = document.getElementById(FACE_HTML_ELEMENT);
    this.canvasEl = document.getElementById(CANVAS_HTML_ELEMENT);
    this.ctx = this.canvasEl.getContext('2d');
    this.displaySize = { width: $(this.canvasEl).width(), height: $(this.canvasEl).height() };
    this.currentFaces = [];
  }

  run() {
    this.loadModels().then(() => {
      this.startVideo();
      $(this.videoEl).on('play', () => this.onPlay());
    });
  }

  async loadModels() {
    // Load the models here
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/');
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/');
  }

  async startVideo() {
    // Start video stream
    navigator.getUserMedia({ video: {} },
      stream => this.videoEl.srcObject = stream,
      err => console.error(err)
    );
  }

  async onPlay() {
    // console.log("onPlay()")
    // Calculate the display size (in case it has changed)
    this.displaySize = { width: $(this.canvasEl).width(), height: $(this.canvasEl).height() };
    // Resize the canvas to the input dimensions
    faceapi.matchDimensions(this.canvasEl, this.displaySize, true);

    // Detect faces and landmarks
    const detections = await faceapi.detectAllFaces(this.videoEl, new faceapi.TinyFaceDetectorOptions());
    if (detections.length) {
      // Clear the current faces
      this.currentFaces = [];
      const resizedDetections = faceapi.resizeResults(detections, this.displaySize);
      this.ctx.clearRect(0, 0, this.displaySize.width, this.displaySize.height);
      this.recordFacePositions(resizedDetections);
    }

    setTimeout(() => this.onPlay(), TRACK_INTERVAL); // Adjust the timeout as needed
  }

  recordFacePositions(detections) {
    const ctx = this.ctx;
    const canvasWidth = $(this.canvasEl).width();
    detections.forEach(det => {
      // console.log("det:", det);
      // Record our certainty
      const score = det.score;

      // Bounding box coordinates and dimensions
      const box = det.box;
      const x = canvasWidth - box.x - box.width;
      const y = box.y;
      const w = box.width;
      const h = box.height;
  
      // Calculate Bindi X and Y
      const bindiX = x + w / 2;
      const bindiY = y + h / 4;

      var faceRecord = { 
        size: h, 
        score: score, 
        x: bindiX, 
        y: bindiY, 
        time: Date.now() 
      }

      faceRecord = this.normalizePosition(faceRecord);

      if (IS_DRAW_FACES) {
        this.drawFaces(faceRecord);
      }

      // Record the faces
      this.currentFaces.push(faceRecord);
    });
    // console.log("currentFaces:", this.currentFaces);
  }

  normalizePosition(p) {
    const xNormMin = -1;
    const xNormMax = 1;
    const yNormMin = -1;
    const yNormMax = 1;

    const canvasWidth = $(this.canvasEl).width();
    const canvasHeight = $(this.canvasEl).height();
    const xNorm = p.x / canvasWidth * (xNormMax - xNormMin) + xNormMin;
    const yNorm = p.y / canvasHeight * (yNormMax - yNormMin) + yNormMin;
    // add normalized x and y to p
    p.xNorm = xNorm;
    p.yNorm = yNorm;
    return p;
  }

  drawFaces(p) {
    const plusSize = p.size / 16;

    ctx.strokeStyle = 'red'; // Change to a visible color
    ctx.lineWidth = 2; // Adjust the line width for visibility

    // Draw a + over the bindi
    ctx.beginPath();
    ctx.moveTo(p.x - plusSize / 2, p.y);
    ctx.lineTo(p.x + plusSize / 2, p.y);
    ctx.stroke();
    ctx.moveTo(p.x, p.y - plusSize / 2);
    ctx.lineTo(p.x, p.y + plusSize / 2);
    ctx.stroke();
  }
}

/**
 * Represents an eye within the application, capable of animating iris movements.
 * The eye's iris can move to specific coordinates within defined boundaries or follow random patterns.
 * Animations are applied to the movement for a realistic effect.
 *
 * @class
 * Methods:
 *  - moveTo(x, y): Animates the iris to a new position, applying boundary constraints.
 *  - getRandomPos(): Calculates a random position for the iris within its movement boundaries.
 *  - waitAMoment(): Waits for a random duration within defined wait limits.
 *  - moveIrisRandomly(): Continuously moves the iris to random positions, simulating natural eye movement.
 *
 * Requires a face application instance for context and jQuery for DOM manipulations.
 * Assumes the presence of HTML elements with specific IDs for animation targets.
 */
class Eye {
  constructor(faceApp) {
    this.faceApp = faceApp;
    this.xPos = 0;
    this.yPos = 0;
    this.faceList = [];
    this.nextId = 1; // Counter for generating unique IDs
  }

  // Find the width and height of the eye image
  calculateEyeImageDims() {
    const viewportWidth = $(window).width();
    const viewportHeight = $(window).height();
    // Assuming the eye image is already loaded and its natural dimensions are known
    const $eyeImage = $('#eye img'); // Adjust the selector to target the actual image
    if ($eyeImage.length === 0 || !$eyeImage.get(0).naturalWidth || !$eyeImage.get(0).naturalHeight) {
      return { width: 0, height: 0 }; // Return default values if the image isn't available
    }
    const imageAspectRatio = $eyeImage.get(0).naturalWidth / $eyeImage.get(0).naturalHeight;
    let imageDisplayedWidth, imageDisplayedHeight;
    // Adjust the calculation to consider both width and height constraints
    if (viewportWidth / viewportHeight > imageAspectRatio) {
      // Height is the limiting factor
      imageDisplayedHeight = viewportHeight;
      imageDisplayedWidth = imageDisplayedHeight * imageAspectRatio;
    } else {
      // Width is the limiting factor
      imageDisplayedWidth = viewportWidth;
      imageDisplayedHeight = imageDisplayedWidth / imageAspectRatio;
    }
    return { width: imageDisplayedWidth, height: imageDisplayedHeight };
  }

  // Calculate the offset of the iris image within the eyehole
  calculateEyeImageOffset(p) {
    const eyeDims = this.calculateEyeImageDims();
  
    // Translate normalized coordinates (-1 to 1) to eye image pixel coordinates
    // For x coordinate: -1 maps to 0, 1 maps to eyeArea.width
    // For y coordinate: -1 maps to 0, 1 maps to eyeArea.height
    const xOffset = p.xNorm * eyeDims.width * EYE_SCALE; 
    const yOffset = p.yNorm * eyeDims.height * EYE_SCALE;
  
    return { x: xOffset, y: yOffset };
  }
  
  // given an obj within currenfFaces, move the iris to that position
  // p is the face record, but we may need to wait until xNorm and yNorm are available
  moveToFace(p) {
    // wait until we have xNorm and yNorm 
    if (!p.xNorm || !p.yNorm) {
      setTimeout(() => this.moveToFace(p), 500);
      return; 
    }
    // console.log("moveToFace() p:", p);
    const offset = this.calculateEyeImageOffset(p);
    // console.log("offset:", offset);
    this.moveTo(offset.x, offset.y);
  }

  moveTo(xOffset, yOffset) {
    $.easing.ease = function (x) { return x * x; };
    $("#iris").css('transition', `transform ${MOVEMENT_SPEED}ms ease`);
    $("#iris").css('transform', `translate(${xOffset}px, ${yOffset}px)`);
  
    $("#highlights").addClass("get-wiggly");
    setTimeout(() => { $("#highlights").removeClass("get-wiggly"); }, MOVEMENT_SPEED);
  }  

  async waitARandomMoment() {
    const duration = Math.random() * (MAX_MOVE_WAIT - MIN_MOVE_WAIT) + MIN_MOVE_WAIT;
    return new Promise((resolve) => { setTimeout(resolve, duration); });
  }

  async waitAMoment() {
    return new Promise((resolve) => { setTimeout(resolve, MOVE_INTERVAL); });
  }

  async moveIrisRandomly() {
    while (true) {
      const { x, y } = this.getRandomPos();
      this.moveTo(x, y);
      await this.waitAMoment();
    }
  }

  updateFaceList(currentFaces) {
    currentFaces.forEach(currentFace => {
      const matchedFace = this.matchFaces(currentFace, this.faceList);
      if (matchedFace) {
        this.updateFaceInList(currentFace, matchedFace);
      } else {
        this.addNewFace(currentFace);
      }
    });

    // Remove stale faces here or in a separate method
    if (this.faceList.length > 1) {
      this.removeStaleFaces();
    }
  }

  matchFaces(newFace, faceList) {
    let bestMatch = null;
    let lowestDistance = Infinity; // Start with the highest possible distance

    faceList.forEach(trackedFace => {
      const distance = this.calculateDistance(newFace, trackedFace);

      // Update the best match if this face is closer than the current best match
      if (distance < lowestDistance) {
        lowestDistance = distance;
        bestMatch = trackedFace;
      }
    });

    // Only return a match if the distance is below a certain threshold
    return (lowestDistance < SIMILARITY_THRESHOLD) ? bestMatch : null;
  }

  calculateDistance(face1, face2) {
    // Calculate a distance metric between two faces
    // This could be a simple Euclidean distance between their positions
    // and/or a difference in their sizes
    const positionDistance = Math.sqrt(Math.pow(face1.x - face2.x, 2) + Math.pow(face1.y - face2.y, 2));
    const sizeDifference = Math.abs(face1.size - face2.size);
    return positionDistance + sizeDifference; // Example combination
  }

  updateFaceInList(newData, face) {
    // Update all properties from newData to face
    Object.keys(newData).forEach(key => {
      face[key] = newData[key];
    });

    // Update the last updated timestamp
    face.lastUpdated = Date.now();
  }

  addNewFace(faceData) {
    const faceHash = this.createFaceHash(faceData);
    const newFace = {
      id: faceHash,
      ...faceData,
      lastUpdated: Date.now()
    };
    this.faceList.push(newFace);
  }

  createFaceHash(face) {
    // Create a string from key face attributes
    const faceString = `${face.size}-${face.score}-${face.x}-${face.y}`;
  
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < faceString.length; i++) {
      const char = faceString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  removeStaleFaces() {
    const currentTime = Date.now();
    this.faceList = this.faceList.filter(face => {
      // Calculate the time since the face was last updated
      const timeSinceLastUpdate = currentTime - face.lastUpdated;

      // Keep the face if the time since last update is less than the threshold
      return timeSinceLastUpdate < STALE_FACE_DURATION;
    });
  }

  // Run the eye application
  async run() {
    while (true) {
      // process the next face update
      this.updateFaceList(this.faceApp.currentFaces);
      console.log(this.faceList);
      // if we have faces detected
      if (this.faceList.length > 0) {
        // move to the first face
        this.moveToFace(this.faceList[0]);
      }
      // wait a moment
      await this.waitAMoment();
    }
  }
  
}

// Document ready
// $(document).ready(function() {

  const faceApp = new Faces();
  faceApp.run();

  // Usage
  const myEye = new Eye(faceApp);
  myEye.run();
  // myEye.moveIrisRandomly();
// });



