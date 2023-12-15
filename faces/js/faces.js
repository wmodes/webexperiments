/*
  faces.js - javascript for faces

  author: Wes Modes, Shelby Decker
  date: 2023
*/

$(document).ready(function() {

  // useful globals
  const videoEl = document.getElementById('inputVideo');
  const canvasEl = document.getElementById('overlay');
  const videoWidth = $(videoEl).width();
  const videoHeight = $(videoEl).height();
  const displaySize = { width: videoWidth, height: videoHeight };

  // starting things up
  //
  // resize the overlay canvas to the input dimensions
  faceapi.matchDimensions(canvasEl, displaySize)
  // get a canvas context
  const ctx = canvasEl.getContext('2d');
    
  async function run() {
    // load the models
    // await faceapi.loadMtcnnModel('https://wmodes.github.io/webexperiments/faces/models/')
    // await faceapi.loadFaceRecognitionModel('https://wmodes.github.io/webexperiments/faces/models/')
    await faceapi.nets.ssdMobilenetv1.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/')
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/')
    
    // try to access users webcam and stream the images
    // to the video element
    navigator.getUserMedia(
      { video: {} },
      stream => videoEl.srcObject = stream,
      err => console.error(err)
    )  

  }

  async function onPlay(videoEl) {
    // run face detection & recognition
    // ...
    // console.log("onPlay Loop");

    // const mtcnnResults = await faceapi.mtcnn(document.getElementById('inputVideo'), mtcnnForwardParams)
    // Detect faces from https://github.com/justadudewhohacks/face-api.js/

    // Clear the entire canvas before drawing the new bounding box
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    /* Display face landmarks */
    const detections = await faceapi.detectAllFaces(videoEl) //.withFaceLandmarks();

    if (detections.length) {
      // resize the detected boxes in case your displayed image has a different size than the original
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      // draw detections into the canvas
      faceapi.draw.drawDetections(canvasEl, resizedDetections)
      // // draw the landmarks into the canvas
      // faceapi.draw.drawFaceLandmarks(canvasEl, resizedDetections)
    }

    setTimeout(() => onPlay(videoEl));
  }

  // let's get this party started
  //
  // get canvas dimensions
  // const displaySize = { width: videoEl.videoWidth, height: videoEl.videoHeight };
  // const displaySize = { width: 800, height: 600 };
  run()
  $('#inputVideo').on('play', function() {
    // Call the onPlay function when the video starts playing
    onPlay(this);
  });

})