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
  await faceapi.loadMtcnnModel('https://wmodes.github.io/webexperiments/faces/models/')
  await faceapi.loadFaceRecognitionModel('https://wmodes.github.io/webexperiments/faces/models/')
  
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
  // limiting the search space to larger faces for webcam detection
  minFaceSize: 200
}

const mtcnnResults = await faceapi.mtcnn(document.getElementById('inputVideo'), mtcnnForwardParams)
