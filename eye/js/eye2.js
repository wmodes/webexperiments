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
// how long do we glance at the most dominent face
const BASE_GLANCE_DURATION = 2000;
// threshold-based check on iris movement
const MOVEMENT_THRESHOLD = 25; // pixels

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
    const canvasWidth = $(this.canvasEl).width();
    detections.forEach(det => {
      // console.log("det:", det);
      // Record our certainty
      const certainty = det.score;

      // Bounding box coordinates and dimensions
      const box = det.box;
      const x = canvasWidth - box.x - box.width;
      const y = box.y;
      const w = box.width;
      const h = box.height;
  
      // Calculate Bindi X and Y
      const bindiX = x + w / 2; // centered
      const bindiY = y + h / 4; // 1/4 from top

      var faceRecord = { 
        height: h, 
        width: w,
        certainty: certainty, 
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

  drawFaces(faceRecord) {

    // Set properties for the bounding box
    this.ctx.strokeStyle = 'red'; // Set the color of the box
    this.ctx.lineWidth = 2; // Set the width of the box's border

    // Calculate the top-left corner of the bounding box
    const topLeftX = faceRecord.x - faceRecord.width / 2;
    const topLeftY = faceRecord.y - faceRecord.height / 4;

    // Draw the bounding box
    this.ctx.beginPath();
    this.ctx.rect(topLeftX, topLeftY, faceRecord.width, faceRecord.height);
    this.ctx.stroke();
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
    this.currentFocusFaceId = null;
    this.lastFocusChangeTime = 0;    
    // threshold-based check on iris movement
    this.lastFocusPosition = { x: null, y: null };
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
    const sizeDifference = Math.abs(face1.height - face2.height);
    return positionDistance + sizeDifference; // Example combination
  }

  addNewFace(faceData) {
    const faceHash = this.createFaceHash(faceData);
    const viewportHeight = $(window).height();
    const normSize = faceData.height / viewportHeight;  
    const newFace = {
      id: faceHash,
      score: faceData.certainty * normSize,
      ...faceData,
      lastUpdated: Date.now()
    };
    this.faceList.push(newFace);
  }

  updateFaceInList(newData, face) {
    // Update all properties from newData to face
    Object.keys(newData).forEach(key => {
      face[key] = newData[key];
    });

    // Update the last updated timestamp
    face.lastUpdated = Date.now();
    // Update the score
    const viewportHeight = $(window).height();
    const normSize = face.height / viewportHeight;
    face.score = face.certainty * normSize; 
  }

  createFaceHash(face) {
    // Create a string from key face attributes
    const faceString = `${face.height}-${face.certainty}-${face.x}-${face.y}`;
  
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

  calculateFocusDuration(face) {
    // If there's only one face in the list, assign BASE_GLANCE_DURATION
    if (this.faceList.length === 1) {
      return BASE_GLANCE_DURATION;
    }
    const dominantFaceScore = this.faceList[0].score; // Assuming faceList is sorted
    // Scale duration based on score difference
    const scoreRatio = face.score / dominantFaceScore;
    return BASE_GLANCE_DURATION * scoreRatio;
  }
  
  isSignificantMovement(newFace) {
    // Check if the last focus position is set
    if (this.lastFocusPosition.x === null || this.lastFocusPosition.y === null) {
      return true; // No previous position to compare, so movement is significant
    }
    // Calculate the difference in position
    const deltaX = Math.abs(newFace.x - this.lastFocusPosition.x);
    const deltaY = Math.abs(newFace.y - this.lastFocusPosition.y);  
    // Determine if the movement exceeds the threshold
    return deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD;
  }

  noFacesIdle() {
    // Do something when no faces are detected
    // Example: Move the iris to a random position
  }

  async run() {
    while (true) {
      this.updateFaceList(this.faceApp.currentFaces);

      if (this.faceList.length > 0) {
        // Sort the faces based on their score
        this.faceList.sort((a, b) => b.score - a.score);

        const now = Date.now();
        const currentFocusFaceIndex = this.faceList.findIndex(face => face.id === this.currentFocusFaceId);

        if (currentFocusFaceIndex === -1) {
          // Focus on the first face in the list if the current one is no longer present
          this.currentFocusFaceId = this.faceList[0].id;
          this.lastFocusChangeTime = now;
          this.lastFocusPosition = { x: null, y: null }; // Reset the last position
        } else {
          const currentFocusFace = this.faceList[currentFocusFaceIndex];
          const focusDuration = this.calculateFocusDuration(currentFocusFace);

          if (now - this.lastFocusChangeTime >= focusDuration) {
            // Shift focus to the next face in the list
            const nextFocusFaceIndex = (currentFocusFaceIndex + 1) % this.faceList.length;
            this.currentFocusFaceId = this.faceList[nextFocusFaceIndex].id;
            this.lastFocusChangeTime = now;
            this.lastFocusPosition = { x: null, y: null }; // Reset the last position
          } else if (this.isSignificantMovement(currentFocusFace)) {
            // Move the iris to the current focus face only if significant movement is detected
            this.moveToFace(currentFocusFace);
            this.lastFocusPosition = { x: currentFocusFace.x, y: currentFocusFace.y };
          }
        }
      } else {
        // If no faces are detected, invoke the idle behavior
        this.noFacesIdle();
      }

      await this.waitAMoment();
    }
  }

  
}

// Document ready
// $(document).ready(function() {

  const faceApp = new Faces();
  faceApp.run();

  // Usage
  const eyeApp = new Eye(faceApp);
  eyeApp.run();
  // myEye.moveIrisRandomly();
// });



