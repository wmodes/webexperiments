/*
  faces.js - javascript for faces

  author: Wes Modes, Shelby Decker
  date: 2023
*/

$(document).ready(function() {

  // useful globals
  const videoEl = document.getElementById('input-video');
  const canvasEl = document.getElementById('canvas');
  const displayWidth = $("#canvas").width();
  const displayHeight = $("#canvas").height();
  const displaySize = { width: displayWidth, height: displayHeight };

  // starting things up
  //
  // get a canvas context
  const ctx = canvasEl.getContext('2d');

    
  async function run() {
    // load the models
    // await faceapi.loadMtcnnModel('https://wmodes.github.io/webexperiments/faces/models/')
    // await faceapi.loadFaceRecognitionModel('https://wmodes.github.io/webexperiments/faces/models/')
    // await faceapi.nets.ssdMobilenetv1.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/')
    // await faceapi.nets.faceLandmark68Net.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/')
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/')
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://wmodes.github.io/webexperiments/faces/models/')
    
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

    const displayWidth = $("#canvas").width();
    const displayHeight = $("#canvas").height();
    const displaySize = { width: displayWidth, height: displayHeight };
    // console.log("displaySize:", displaySize);

    // resize the canvas canvas to the input dimensions
    faceapi.matchDimensions(canvasEl, displaySize, true)

    /* Detect faces and landmarks */
    useTinyModel = true
    const detections = await faceapi.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions());
    // .withFaceLandmarks(useTinyModel);

    if (detections.length) {
      // resize the detected boxes in case your displayed image has a different size than the original
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      // Clear the entire canvas before drawing the new bounding box
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // draw detections into the canvas
      // faceapi.draw.drawDetections(canvasEl, resizedDetections)
      drawFaces(canvasEl, resizedDetections);
      // draw the landmarks into the canvas
      // faceapi.draw.drawFaceLandmarks(canvasEl, resizedDetections)
    }

    setTimeout(() => onPlay(videoEl));
  }

  function drawFaces(canvasEl, detections) {
    // get the canvas context
    const ctx = canvasEl.getContext('2d');
    // Set properties for the rectangle
    ctx.lineWidth = 2; // Set the border width
    ctx.strokeStyle = 'white'; // Set the border color
    // go through each detection and draw corresponding bounding box 
    // Here's the fields of the detection that are used when drawing a box:
    //     var isBbox = [box.left, box.top, box.right, box.bottom].every(isValidNumber);
    //     var isRect = [box.x, box.y, box.width, box.height].every(isValidNumber);
    var detectionsArray = Array.isArray(detections) ? detections : [detections];
    detectionsArray.forEach(function (det) {
      console.log("detection:", det);
      // get the width of the canvas
      const canvasWidth = $("#canvas").width();
      // get the box coordinates
      var box = det.box;
      var x = canvasWidth - box.x - box.width;
      var y = box.y;
      var w = box.width;
      var h = box.height;
      // Calculate Bindi X and Y
      var bindiX = x + w / 2; // Halfway across the width of the box
      var bindiY = y + h / 4; // A quarter way down the height of the box

      // Draw a + over the bindiRadius
      plusSize=h/16;
      // Draw horizontal line
      ctx.beginPath(); // Start a new path
      ctx.moveTo(bindiX - plusSize / 2, bindiY); // Move to the start point of the horizontal line
      ctx.lineTo(bindiX + plusSize / 2, bindiY); // Draw the line to the end point
      ctx.stroke(); // Render the line
      // Draw vertical line
      ctx.moveTo(bindiX, bindiY - plusSize / 2); // Move to the start point of the vertical line
      ctx.lineTo(bindiX, bindiY + plusSize / 2); // Draw the line to the end point
      ctx.stroke(); // Render the line

      // Draw an unfilled rectangle (x, y, width, height)
      // ctx.strokeRect(x, y, w, h);

      // check if we have landmarks
      if (det.hasOwnProperty('landmarks')) {
        // Here's the points that make up the left and right eyes:
        //     FaceLandmarks68.prototype.getLeftEye = function () {
        //       return this.positions.slice(36, 42);
        //     };
        //     FaceLandmarks68.prototype.getRightEye = function () {
        //         return this.positions.slice(42, 48);
        //     };
        // get the landmarks
        var positions = det.landmarks.positions;
        var leftEye1 = mirror(positions[36]);
        var leftEye2 = mirror(positions[39]);
        var rightEye1 = mirror(positions[42]);
        var rightEye2 = mirror(positions[45]);
        // console.log("leftEye1:", leftEye1, "leftEye2:", leftEye2, "rightEye1:", rightEye1, "rightEye2:", rightEye2)

        // Calculate center point coordinates for left eye
        var leftCenterX = (leftEye1.x + leftEye2.x) / 2;
        var leftCenterY = (leftEye1.y + leftEye2.y) / 2;
        // Calculate the distance between two points to determine the radius of the circle
        var leftRadius = Math.sqrt(Math.pow(leftEye1.x - leftEye2.x, 2) + Math.pow(leftEye1.y - leftEye2.y, 2)) / 2;

        // Calculate center point coordinates for left eye
        var rightCenterX = (rightEye1.x + rightEye2.x) / 2;
        var rightCenterY = (rightEye1.y + rightEye2.y) / 2;
        // Calculate the distance between two points to determine the radius of the circle
        var rightRadius = Math.sqrt(Math.pow(rightEye1.x - rightEye2.x, 2) + Math.pow(rightEye1.y - rightEye2.y, 2)) / 2;

        // Calculate bindi
        var bindiX = (leftCenterX + rightCenterX) / 2;
        var bindiY = (leftCenterY + rightCenterY) / 2;
        // bindi radius is the average of the left and right eye radius
        var bindiRadius = (leftRadius + rightRadius) / 2;

        // Draw the left eye
        ctx.beginPath();
        ctx.arc(leftCenterX, leftCenterY, leftRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the right eye
        ctx.beginPath();
        ctx.arc(rightCenterX, rightCenterY, rightRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the bindi 
        ctx.beginPath();
        ctx.arc(bindiX, bindiY, bindiRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }

  function mirror(p) {
    // get the canvas width
    const canvasWidth = $("#canvas").width();
    // if p is an object, flip the x coordinate
    // console.log("original p:", p);
    if (typeof p === 'object') {
      p._x = canvasWidth - p._x;
      // console.log("flipped p:", p);
      return p;
    }
  }

  function resizeVideoAndCanvas() {
    console.log("resizing video and canvas");
    var $wrapper = $('.wrapper');
    var $video = $('#input-video');
    var $canvas = $('#canvas');

    var videoWidth = $video.width();
    var videoHeight = $video.height();
    var wrapperWidth = $wrapper.width();
    var wrapperHeight = $wrapper.height();

    var videoAspectRatio = videoWidth / videoHeight;
    var wrapperAspectRatio = wrapperWidth / wrapperHeight;

    if (videoAspectRatio < wrapperAspectRatio) {
        // Video is wider than the wrapper
        var videoHeightNew = wrapperWidth / videoAspectRatio;
        $video.css({
          'width': 'auto',
          'height': videoHeightNew + 'px'
      });
        $canvas.css({
          'width': '100%',
          'height': videoHeightNew + 'px'
      });
    } else {
        // Video is narrower than the wrapper
        var videoWidthNew = wrapperHeight * videoAspectRatio;
        $video.css({
          'width': videoWidthNew + 'px',
          'height': 'auto'
      });
        $canvas.css({
          'width': videoWidthNew + 'px',
          'height': '100%'
      });
    }
  }

  // Attach event listener for window resize - don't need this
  // $(window).on('resize', function() {
  //   resizeVideoAndCanvas(); // Call the function on window resize
  // });

  // let's get this party started
  //
  // run the app
  run()
  $('#input-video').on('play', function() {
    // Call the onPlay function when the video starts playing
    onPlay(this);
  });

  // Attach event listener for window resize
  $(window).on('resize', function() {
      resizeVideoAndCanvas(); // Call the function on window resize
  });

})