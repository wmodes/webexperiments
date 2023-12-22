/*
  faces.js - JavaScript for faces
  author: Wes Modes, Shelby Decker
  date: 2023
*/

// CONSTANTS
const faceHTMLelement = "input-video";
const canvasHTMLelement = "canvas";

class Faces {
  constructor() {
    this.videoEl = document.getElementById(faceHTMLelement);
    this.canvasEl = document.getElementById(canvasHTMLelement);
    this.ctx = this.canvasEl.getContext('2d');
    this.displaySize = { width: $(this.canvasEl).width(), height: $(this.canvasEl).height() };
    this.currentFaces = [];
  }

  run() {
    this.loadModels().then(() => {
      this.startVideo();
      $(this.videoEl).on('play', () => this.onPlay());
      $(window).on('resize', () => this.resizeVideoAndCanvas());
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
      this.drawFaces(resizedDetections);
    }

    setTimeout(() => this.onPlay(), 500); // Adjust the timeout as needed
  }

  drawFaces(detections) {
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
      // console.log(`Face at ${Math.round(bindiX)}, ${Math.round(bindiY)}`);
      const plusSize = h / 16;

      ctx.strokeStyle = 'red'; // Change to a visible color
      ctx.lineWidth = 2; // Adjust the line width for visibility
  
      // Draw a + over the bindi
      ctx.beginPath();
      ctx.moveTo(bindiX - plusSize / 2, bindiY);
      ctx.lineTo(bindiX + plusSize / 2, bindiY);
      ctx.stroke();
      ctx.moveTo(bindiX, bindiY - plusSize / 2);
      ctx.lineTo(bindiX, bindiY + plusSize / 2);
      ctx.stroke();

      // Record the faces
      this.currentFaces.push({ size: h, score: score, x: bindiX, y: bindiY, time: Date.now() });
    });
    console.log("currentFaces:", this.currentFaces);
  };
}

// Document ready
// $(document).ready(function() {
  const faceApp = new Faces();
  faceApp.run();
// });
