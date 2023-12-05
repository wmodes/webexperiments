/*
  faces.js - javascript for faces

  author: Wes Modes, Shelby Decker
  date: 2023
*/

$(document).ready(function() {
  run()
})
    
async function run() {
  // load the models
  await faceapi.loadMtcnnModel('models/')
  await faceapi.loadFaceRecognitionModel('models/')
  
  // try to access users webcam and stream the images
  // to the video element
  const videoEl = document.getElementById('inputVideo')
  navigator.getUserMedia(
    { video: {} },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
  )
}

const mtcnnForwardParams = {
  // number of scaled versions of the input image passed through the CNN
  // of the first stage, lower numbers will result in lower inference time,
  // but will also be less accurate
  maxNumScales: 10,
  // scale factor used to calculate the scale steps of the image
  // pyramid used in stage 1
  scaleFactor: 0.709,
  // the score threshold values used to filter the bounding
  // boxes of stage 1, 2 and 3
  scoreThresholds: [0.6, 0.7, 0.7],
  // mininum face size to expect, the higher the faster processing will be,
  // but smaller faces won't be detected
  minFaceSize: 200
}

// const mtcnnResults = await faceapi.mtcnn(document.getElementById('inputVideo'), mtcnnForwardParams)

// This should be in some loop?????
// faceapi.drawDetection('overlay', mtcnnResults.map(res => res.faceDetection), { withScore: false })
// faceapi.drawLandmarks('overlay', mtcnnResults.map(res => res.faceLandmarks), { lineWidth: 4, color: 'red' })

async function onPlay(videoEl) {
  // run face detection & recognition
  // ...
  console.log("onPlay Loop");

  setTimeout(() => onPlay(videoEl));
}