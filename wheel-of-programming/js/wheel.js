/*
 * Author: Wes Modes <wmodes@csumb.edu>
 * Created: 3 October
 * License: Public Domain
 */

//
// CONSTANTS
//

var loadingFactor = 3;
var progressLength = 30;
var minStepTime = 100; //milliseconds
var maxStepTime = 1500; //milliseconds
var waitForResults = 1500; //milliseconds
var loadLabels = ["Calculating", "Validating", "Indexing", "Referencing",
    "Cross-referencing", "Searching for breakpoints", "Running assembly linker",
    "Checking for available resources", "Copying", "Tag local sources", 
    "Finding optimal tasks", "Empty task queues", "Expand packed files", 
    "Loading into single property", "Compiling messages", "Run tests", 
    "Converting files", "Import type libraries"];
var databaseFile = "program-database.csv";
var levelDict = {
  0 : ["Beginner", "Easy", ""],
  1 : ["Easy", "Normal", ""],
  2 : ["Normal", "Difficult", ""],
  3 : ["Normal", "Difficult", "Challenging", ""],
  4 : ["Normal", "Difficult", "Challenging", "Wicked", ""]
}

//
// GLOBALS
//
var user = {};        // user data
// When user is populated it will look like:
//    user = {
//      name : "Wes Modes",
//      hometown : "Felton",
//      exp: 4
//    }
var programDb = [];   // program data
var oldPrograms = []; // already seen programs

//
// SETUP
//

function getDatabase() {
  $.ajax({
      type: "GET",
      url: databaseFile,
      dataType: "text",
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        processData(data);
      },
      error: function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText + ", " +
            xhr.responseText + ", " + error;
         $("#committment").html("<div class='.errors'>CRITICAL ERROR: " +
            errorMessage + "</div>");
      }
  })
}

function processData(csv) {
  // console.log("csv:", csv);
  if (csv) {
    programDb = $.csv.toObjects(csv);
  }
}

function getStorage(user) {
  if (localStorage.userData) {
    user = JSON.parse(localStorage.getItem('userData'));
    $("#input-name").val(user.name);
    $("#input-hometown").val(user.hometown);
    $("#input-exp").val(user.exp);
  }
}

function putStorage(user) {
  localStorage.setItem('userData', JSON.stringify(user));
}

//
// EVENT HANDLERS
//

$("#commit-button").click(function(){
  var input = $("#commit-input").val();
  if (input == "I AM COMMITTED" || input == "wm") {
    showIntake();
    $("#commit-input").val("");
  }
});

function showIntake() {
  hideAllBut("#intake");
}

// Submit intake info including validation
//
$("#intake-button").click(function(){
  // clear error on submission
  error("");
  user.name = $("#input-name").val();
  user.hometown = $("#input-hometown").val();
  user.exp = parseInt($("#input-exp").val(), 10);
  // console.log("name:", user.name, "hometown:", user.hometown, 
  //   "exp:", user.exp);
  // input validation
  if (!user.name || !user.hometown || isNaN(user.exp)) {
    error("Please complete <i>all</i> fields.");
  }
  else if (!user.name.includes(" ")) {
    error("Please provide your <i>full</i> name");
  }
  else {
    // clear error on validation
    error("");
    putStorage(user);
    showLoading(loadingFactor * (user.exp + 1));
  }
})

$(window).resize(function() {
  setLoadingFontSize();
});

// Look busy for a while
// more experience means harder work and longer wait
//
function showLoading(sec) {
  hideAllBut("#loading");
  setLoadingFontSize();
  $("#loading-level").html(user.exp);
  var endTime = Date.now() + sec * 1000;
  // console.log("Seconds:", sec, "EndTime:", endTime, "Now:", Date.now());
  newProgressLine(endTime);
  // showResults get called from end of aync chain
}

// Prepare results
//
function showResults() {
  $(".loading-window").html("");
  // get subset of programDb based on user's experience
  var userProgramDb = getProgramSubset(user.exp);
  // compile the user's data into hash string and 
  // use hashstring to generate checksum
  var hash = checksum(user.name + user.hometown + user.exp);
  var index = hash % userProgramDb.length;
  // select program based on checksum modulus
  var myProgram = userProgramDb[index];
  oldPrograms.push(myProgram);
  // extract data from object
  var title = myProgram["Project Title"];
  var desc = myProgram["Big Idea/How It Works"] || "No description";
  var ques = myProgram["Open Questions"] || "No questions, your honor.";
  var diff = myProgram["Difficulty Level"] || "Unknown";
  var currentDate = new Date().toJSON().slice(0,10).replace(/-/g,'/')
  hideAllBut("#results");
  $("#results-name").html(user.name);
  $("#results-id").html(hash);
  $("#results-date").html(currentDate);
  $("#results-title").html(title);
  $("#results-desc").html(htmlSafe(desc));
  $("#results-ques").html(htmlSafe(ques));
  $("#results-level").html(htmlSafe(diff));
}

// given a user's experience, looks through the programDb, 
// and returns an appropriate subset
function getProgramSubset(exp) {
  var newProgramList = [];
  var levelsForUser = levelDict[exp];
  $.each(programDb, function( index, value ) {
    // console.log( index + ": " + value );
    // exclude programs we've already seen
    if (oldPrograms.indexOf(value) == -1) {
      // otherwise, if the program matches the experiece of user
      // add it to our potential program list
      var firstWord = value["Difficulty Level"].replace(/\W.*/,'');
      if (levelsForUser.indexOf(firstWord) > -1) {
        newProgramList.push(value);
      }
    }
  })
  // if we return no results
  if (newProgramList.length == 0) {
    // clear the oldPrograms list
    oldPrograms = [];
    // and rerun
    return(getProgramSubset(exp));
  }
  return newProgramList;
}

// Try again button
//
$("#again-button").click(function(){
  hideAllBut("#doc,#committment");
})

//
// DISPLAY FUNCTIONS
//

function setLoadingFontSize() {
  var width = $(".loading-window").width();
  $(".loading-window").css("font-size", width * 65 / 2400 + "px");
}

// make text with linefeeds display okay in html
function htmlSafe(txt) {
  txt = txt.replace(/\n/g, "</br>\n");
  txt = txt.replace(/\s\s/g, " &nbsp;");
  return(txt);
}

// display intake errors
function error(s) {
  $("#intake-error").html("<label><span></span>" + s + "</label>");
}

// creates new progress line
// recursively called function 
// ends when time has passed
/* inspired by pip's isstall
  Downloading https://files.pythonhosted.org/packages/00/b6/9cfa56b4081ad13874b0c6f96af8ce16cfbc1cb06bedf8e9164ce5551ec1/pip-19.3.1-py2.py3-none-any.whl (1.4MB)
    100% |████████████████████████████████| 1.4MB 3.7MB/s 
*/
function newProgressLine(endTime) {
  // console.log("Now:", Date.now(), "End time:", endTime, "Diff:", endTime - Date.now());
  if (Date.now() < endTime) {
    var label = loadLabels[Math.floor(Math.random()*loadLabels.length)];
    // pick random number between 0-100 to the tenth digit: Math.round(10*x)/10;
    var size =  tenths(Math.random()*100);
    var progressUpdate = 
      `<div class="progress-update"><span>${label} (${size}MB)</span><br>`;
    // progressUpdate += "<span class='progressbar'></span>";
    $(".loading-window").append(progressUpdate);
    var fullStepTime = randNum(minStepTime, maxStepTime);
    updateProgress(fullStepTime, size, 0, endTime);
  }
  else {
    var progressUpdate = 
      "<div class='progress-update'><span>Completed (100%)</span><br>";
    $(".loading-window").append(progressUpdate);
    // scroll to bottom
    $(".loading-window").scrollTop($(".loading-window")[0].scrollHeight);
    // go to results
    setTimeout(showResults, waitForResults);
  }
}

// Update the progress bar 
// Arguments:
//    fullStepTime: time the progress bar should be completed in
//    size: fictional number specifying total size in Mb
//    step: what step we're on
//    endTime: what real time all the steps should end (passed on)
// Side effects:
//    calls itself recursively, as long as we still have steps to go
//    calls the next progress line, if we are done with this one
function updateProgress(fullStepTime, size, step, endTime) {
  if (step <= progressLength) {
    var speed = tenths(size/fullStepTime*1000);
    progressBar = makeProgressBar(step, progressLength, size, speed);
    stepTime = Math.round(fullStepTime / progressLength);
    showProgressBar("&nbsp;&nbsp;&nbsp;&nbsp;" + progressBar);
    setTimeout(function(){
      // call recursively at end of timeout
      updateProgress(fullStepTime, size, step+1, endTime);
    }, stepTime);
  }
  else {
    newProgressLine(endTime);
  }
}

// given a string, displays the progress bar on the last element in the 
// progress box
function showProgressBar(str) {
  $(".loading-window .progress-update:last-child .progressbar").remove();
  progressUpdate = "<span class='progressbar'>" + str + "</span>";
  $(".loading-window .progress-update:last-child").append(progressUpdate);
  // scroll to bottom
  $(".loading-window").scrollTop($(".loading-window")[0].scrollHeight);
}

// construct progress bar
//    given step, length, and a fictional size
function makeProgressBar(step, max, size, speed) {
  var percent = Math.round(step / max * 100);
  var progNum = tenths(step / max * size);
  var progressBar = pad(percent, 3) + '% ';
  var speed = tenths(speed + randNum(-1,1));
  // full block: &#9608; medium block: &#9618; light block: &#9617;
  progressBar += '|' + '#'.repeat(step) + '&nbsp;'.repeat(max-step) + '| ';
  progressBar += progNum + 'MB (' + speed + 'MB/s)';
  return(progressBar);
}

//
// HELPER FUNCTIONS
//

function pad(num, size) {
  str = num.toString();
  return '&nbsp;'.repeat(size-str.length) + str;
}

function randNum(min, max) {
  t = Math.floor(Math.random() * (max - min + 1) ) + min;
  // console.log(t + "ms");
  return(t);
}

function tenths(n) {
  return Math.round(10*n)/10;
}

// delay - an asynchronous sleep routine
// usage:
//  await delay(5000);
// must be called from a async function
const delay = ms => new Promise(res => setTimeout(res, ms));

// hide all but one section
function hideAllBut(selector) {
    $(".hidey").addClass("invisible");
    $(selector).removeClass("invisible");
}

// take a string and return a hashed checksum of the string
function checksum(s) {
  var hash = 0, strlen = s.length, i, c;
  if ( strlen === 0 ) {
    return hash;
  }
  for ( i = 0; i < strlen; i++ ) {
    c = s.charCodeAt( i );
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

getDatabase();
getStorage(user);
