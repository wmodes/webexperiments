// Define your Spotify API endpoint for search
const spotifySearchEndpoint = 'https://api.spotify.com/v1/search';
const spotifyAlbumEndpoint = 'https://api.spotify.com/v1/albums/';
const spotifyTokenEndpoint = 'https://accounts.spotify.com/api/token';
const redirectUri = 'https://wmodes.github.io/webexperiments/spotify/app.html'; // Your redirect uri
const clientId = '873252498aa44a53a6e33c34d8b391b9'; // Your client id

// Global variables to track playlist and current song index
let albumImageURL = '';
// array of tracks on current albumb playing
let playlist = [];
// array of search results as objects including id, name, artist, and image
let resultsList = [];
// array of last 12 albums as objects including id, name, artist, and image
let recentsList = []; 
// array of 20 albums deleted from the recents list as objects including id, name, artist, and image
let throwbackList = [];
let currentSongIndex = 0;
let spotifyCallback = null;
let spotifyIframeAPI = null;
let spotifyEmbedController = null;
let playbackData = {};
let lastScratchTime = 0;
let crackleIsOn = true;

// Some configuration
const startTime = 2000;
const endTime = 3000;
const scratchLeeway = 5000;
const fadeInOutTime = 3000;
const recentsLen = 12;
const throwbackLen = 20;


const buttonColor = 'hsla(0,0%,100%,.7)';
const buttonColorHighlight = '#ffffff';

let effects = {
  'scratch': [
    {file: 'audio/scratch1.wav', time: 450},
    {file: 'audio/scratch2.wav', time: 180},
    {file: 'audio/scratch3.wav', time: 550},
  ],
  'crackle': [
    {file: 'audio/crackle.wav', time: 0},
  ],
  'lift': [
    {file: 'audio/needle-lift.wav', time: 10},
  ],
  'drop': [
    {file: 'audio/needle-drop.wav', time: 4000},
  ],
}

//
// Access Token
//

// Create a global variable to store the access token info
const accessToken = {
  token: '',
  expires: 0,
  received: 0,
};

// Define the $.urlParam function to extract query parameters
$.urlParam = function(name){
  var results = new RegExp('[\?&#]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null) {
     return null;
  }
  return decodeURI(results[1]) || 0;
}

// Function to parse the URL and extract the access_token
function getAccessTokenFromURL(url) {
  const tokenIndex = url.indexOf('#access_token=');
  if (tokenIndex !== -1) {
    // Token found in the URL
    const tokenStart = tokenIndex + 14; // Length of '#access_token='
    const tokenEnd = url.indexOf('&', tokenStart);
    if (tokenEnd !== -1) {
      accessToken.token = url.substring(tokenStart, tokenEnd);
      accessToken.expires = parseInt($.urlParam('expires_in')); // Parse expiration time
      accessToken.received = new Date().getTime(); // Record the time received
    }
  }
  return accessToken.token; // Return the extracted token
}

// Get the access_token from the URL and record its info
const tokenFromURL = getAccessTokenFromURL(window.location.href);

if (tokenFromURL) {
  // The access_token is available, you can use it in your app now
  console.log("Access Token:", accessToken.token);
  console.log("Expires in:", accessToken.expires, "seconds");
  console.log("Received at:", new Date(accessToken.received).toLocaleString());
} else {
  console.log("Access Token not found in the URL.");
}

// get parameters
$.urlParam = function(name){
    var results = new RegExp('[\?&#]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}

// Function to check if the access token is expired and renew it if needed
function checkAndRenewAccessToken(accessToken) {
  const currentTime = new Date().getTime();
  const tokenReceivedTime = accessToken.received;
  const tokenExpiration = accessToken.expires * 1000; // Convert seconds to milliseconds

  // Check if the current time is greater than the token's received time + expiration time
  if (currentTime > tokenReceivedTime + tokenExpiration) {
    // Access token is expired, renew it
    renewAccessTokenSilently();
    return true; // Token was expired and is being renewed
  }

  return false; // Token is still valid
}

// Add an event listener to receive messages from the iframe when it loads
const silentRefreshIframe = document.getElementById('silent-refresh-iframe');

function renewAccessTokenSilently() {
  // Construct the authorization URL for silent refresh
  const authorizationUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&prompt=none`;

  // Set the iframe's source to the authorization URL
  silentRefreshIframe.src = authorizationUrl;
}

silentRefreshIframe.addEventListener('load', function () {
  // Check the URL of the iframe to determine the response
  // Doesn't work because of CORS
  const iframeUrl = silentRefreshIframe.contentWindow.location.href;

  // // Instead, we use the postMessage API to send a message to the iframe
  // // and receive the response
  // silentRefreshIframe.contentWindow.postMessage('get-url', 'https://wmodes.github.io');

  // Handle the response (e.g., extract tokens and update the session)
  handleSilentRefreshResponse(iframeUrl);
});

// Function to handle the response from the silent refresh iframe
function handleSilentRefreshResponse(iframeUrl) {
  console
  // Parse the access token from the iframe URL and update the existing accessToken object
  const newAccessToken = getAccessTokenFromURL(iframeUrl);
  // Rewrite the iframe URL to the original URL
  // window.location.href = iframeUrl;

  // Check if a new access token was received successfully
  if (newAccessToken) {
    // You can also perform any other necessary actions with the new token here
    // For example, update the user's session or make authenticated requests
  } else {
    // Handle the case where the silent refresh did not result in a new token
    console.log('Silent refresh did not return a new access token.');
  }
}

//
// Search
//

function searchSpotify(query) {

  // Set up the parameters for the search request
  const params = {
    q: query,
    type: 'album,artist', // You can specify 'album', 'artist', or both
  };

  // Make an AJAX request to the Spotify API
  $.ajax({
    url: spotifySearchEndpoint,
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
    },
    data: params,
    success: function (response) {
      // Handle the successful response here
      console.log(response.albums.items);
      resultsList = response.albums.items;
      showResults();
      showResultsPanel();
    },
    error: function (xhr, status, error) {
      // Handle errors here
      console.error('Error:', error);
    }
  });
}

// Usage example:
// searchSpotify('Pink Floyd'); // Replace with the search query of your choice

// Attach a keyup event handler to the search input field
$('.search-field').keyup(function (event) {
  // Check if the Enter key (keyCode 13) is pressed
  if (event.keyCode === 13) {
    // Get the value entered by the user
    const query = $(this).val();
    
    // Call the searchSpotify function with the query
    searchSpotify(query);
  }
});

//
// Display Results
//

function showResults() {
  // Clear existing results
  $("#results-list").empty();

  for (var i = 0; i < resultsList.length; i++) {
    var albumName = resultsList[i].name;
    var albumImageURL = resultsList[i].images[0].url;
    var albumYear = resultsList[i].release_date.slice(0, 4);
    var albumArtist = resultsList[i].artists[0].name;
    var albumId = resultsList[i].id; // Spotify album ID

    var buttonSVG = '<svg role="img" height="24" width="24" viewBox="0 0 24 24" class="Svg-ytk21e-0 eqtHWV"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>';
    var albumHTML =
      "<div class='image'>" +
      "<img src='" + albumImageURL + "'>" +
      "<button class='play-button' data-album-id='" + albumId + 
        "' data-name='" + albumName +
        "' data-artist='" + albumArtist +
        "' data-album-image='" + albumImageURL + "'>" + 
        buttonSVG + "</button>" +
      "</div>" +
      "<div class='name'>" + albumName + "</div>" +
      "<div class='more'>" +
      "<time class='year'>" + albumYear + "</time>" + " • " +
      "<span class='artist'>" + albumArtist + "</span>" +
      "</div>";
    var newAlbum = $("<div class='album'></div>").html(albumHTML);
    $("#results-list").append(newAlbum);
  }

  $("#results-list").on('click', '.album', function () {
    // Get the album id, name, artist, and image from the button's data attributes
    var albumId = $(this).find('.play-button').data('album-id');
    var albumName = $(this).find('.play-button').data('name');
    var albumArtist = $(this).find('.play-button').data('artist');
    var albumImageURL = $(this).find('.play-button').data('album-image');
    // pass the album id, name, artist, and image
    playAlbum(albumId, albumName, albumArtist, albumImageURL);
  });
}


//
// Recents List
//

// get recents from local storage
recentsList = JSON.parse(localStorage.getItem('recents'));
if (recentsList == null) {
  recentsList = [];
}
// display recents
showRecents();
// get throwbacks from local storage
throwbackList = JSON.parse(localStorage.getItem('throwbacks'));
if (throwbackList == null) {
  throwbackList = [];
}
// display hope page along with throwbacks
showHomePanel();

// Save a new album in the recents list
// an array of the last 12 albums as objects including id, name, artist, and image
function saveRecentAlbum(albumId, albumName, albumArtist, albumImageURL) {
  // Before we add an album to the recents list, look it up by albumId and delete it
  // from the recents list if it already exists
  for (var i = 0; i < recentsList.length; i++) {
    if (recentsList[i].id == albumId) {
      recentsList.splice(i, 1);
    }
  }
  // Save it at the top
  recentsList.unshift({
    id: albumId,
    name: albumName,
    artist: albumArtist,
    image: albumImageURL,
  });
  // If the recents list is longer than 12, move any albums beyond 12 to the throwbacks list
  if (recentsList.length > recentsLen) {
    const albumsToMove = recentsList.slice(recentsLen);
    throwbackList = throwbackList.concat(albumsToMove);
    recentsList = recentsList.slice(0, recentsLen);
  }
  // Prune throwbacks to last 20 albums with slice
  throwbackList = throwbackList.slice(0, throwbackLen);

  // Store recents list in local storage
  localStorage.setItem('recents', JSON.stringify(recentsList));
  // Display recents list
  showRecents();
  // Store throwbacks list in local storage
  localStorage.setItem('throwbacks', JSON.stringify(throwbackList));
  // Display throwbacks list
  updateThrowbacks();
}

// Function to display the recents list
// For each of the albums in recents, we will construct an HTML element
// and append it to the recents list
//     <div class="recent-item" data-album-id="" data-name="" data-artist="" data-album-image="">
//       <div class="recent-image"><img src="" alt=""></div>
//       <div class="recent-info">
//         <div class="recent-name">Album Title</div>
//         <div class="recent-artist">Artist</div>
//       </div>
//     </div>
// Adding a click event listener to the recent-item similar to the one in showAlbums 
function showRecents() {
  // Clear existing recents
  $("#recent-list").empty();

  for (var i = 0; i < recentsList.length; i++) {
    var albumName = recentsList[i].name;
    var albumImageURL = recentsList[i].image;
    var albumArtist = recentsList[i].artist;
    var albumId = recentsList[i].id; // Spotify album ID

    // create a new element with the class "recent-item"
    // add the album id, name, artist, and image as data attributes
    // add the html for the album image and info
    // append the new element to the recents list
    var recentItemHTML = `
      <div class="recent-item" 
        data-album-id="${albumId}" 
        data-name="${albumName}" 
        data-artist="${albumArtist}" 
        data-album-image="${albumImageURL}">
        <div class="recent-image"><img src="${albumImageURL}" alt="${albumName} album art"></div>
        <div class="recent-info">
          <div class="recent-name">${albumName}</div>
          <div class="recent-artist">${albumArtist}</div>
        </div>
      </div>`;
    var newRecent = $(recentItemHTML);
    $("#recent-list").append(newRecent);

    // Add a click event listener to the recent item
    $(newRecent).on('click', function () {
      // Get the album id, name, artist, and image from the button's data attributes
      var albumId = $(this).data('album-id');
      var albumName = $(this).data('name');
      var albumArtist = $(this).data('artist');
      var albumImageURL = $(this).data('album-image');
      // pass the album id, name, artist, and image
      playAlbum(albumId, albumName, albumArtist, albumImageURL);
    });
  }
}

// Function to display the throwbacks list
function updateThrowbacks() {

  // if there are no throwbacks, hide the throwbacks panel
  if (throwbackList.length == 0) {
    $("#throwbacks").hide();
    return;
  }

  // otherwise show the throwbacks panel
  $("#throwbacks").show();

  // Clear existing throwbacks
  $("#throwback-list").empty();

  for (var i = 0; i < throwbackList.length; i++) {
    var albumName = throwbackList[i].name;
    var albumImageURL = throwbackList[i].image;
    var albumArtist = throwbackList[i].artist;
    var albumId = throwbackList[i].id; // Spotify album ID

    var buttonSVG = '<svg role="img" height="24" width="24" viewBox="0 0 24 24" class="Svg-ytk21e-0 eqtHWV"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>';
    var albumHTML =
      "<div class='image'>" +
      "<img src='" + albumImageURL + "'>" +
      "<button class='play-button' data-album-id='" + albumId + 
        "' data-name='" + albumName +
        "' data-artist='" + albumArtist +
        "' data-album-image='" + albumImageURL + "'>" + 
        buttonSVG + "</button>" +
      "</div>" +
      "<div class='name'>" + albumName + "</div>" +
      "<div class='more'>" +
      "<span class='artist'>" + albumArtist + "</span>" +
      "</div>";
    var newAlbum = $("<div class='album'></div>").html(albumHTML);
    $("#throwback-list").append(newAlbum);
  }

  // Add a single event listener for all play buttons using event delegation
  $("#throwback-list").on('click', '.album', function () {
    // Get the album id, name, artist, and image from the button's data attributes
    var albumId = $(this).find('.play-button').data('album-id');
    var albumName = $(this).find('.play-button').data('name');
    var albumArtist = $(this).find('.play-button').data('artist');
    var albumImageURL = $(this).find('.play-button').data('album-image');
    // pass the album id, name, artist, and image
    playAlbum(albumId, albumName, albumArtist, albumImageURL);
  });
}

//
// Player
//

// Function to play an album by its Spotify ID
function playAlbum(albumId, albumName, albumArtist, albumImageURL) {
  // Clear the playlist to start with an empty queue
  playlist = [];

  // Save the album in recent albums
  saveRecentAlbum(albumId, albumName, albumArtist, albumImageURL);

  // Use the Spotify API to fetch the album tracks and play them
  var albumTracksUrl = spotifyAlbumEndpoint + albumId + '/tracks';

  // Fetch the album tracks from the Spotify API
  $.ajax({
    url: albumTracksUrl,
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
    },
    success: function (response) {
      // Handle the successful response here and store the album image URL
      console.log("Album Image URL:", albumImageURL);

      // Handle the successful response here and play the tracks
      console.log(response.items);

      // Example: Play the album tracks in your audio player
      // You can create a playlist and add the tracks to it
      for (const track of response.items) {
        playlist.push({
          title: track.name,
          artist: track.artists[0].name,
          uri: track.uri, // Spotify track URL
        });
      }
      playPlaylist();

      // Use your audio player to play the playlist
      // Example: audioPlayer.playPlaylist(playlist);
    },
    error: function (xhr, status, error) {
      // Handle errors here
      console.error('Error:', error);
    }
  });
}

// Function to play the playlist
function playPlaylist() {
  currentSongIndex = 0; 
  queueFirstSong()
  // wait two seconds before starting the playlist
  setTimeout(function() {
    dropLen = playNeedleDrop();
    setTimeout(function() {
      playCurrentSong();
      if (crackleIsOn) {
        playCrackle();
      }
    }, dropLen-500);
  }, startTime);
}

// queue current song, but pause for now
function queueFirstSong() {
  if (currentSongIndex < playlist.length) {
    const currentSong = playlist[currentSongIndex];
    spotifyEmbedController.loadUri(currentSong.uri);
    spotifyEmbedController.pause();
    console.log(`Queuing: ${currentSong.title} by ${currentSong.artist}`);
  } else if (playlist.length > 0) {
    console.log("End of playlist");
  }
}

// Function to play the current song
function playCurrentSong() {
  if (currentSongIndex < playlist.length) {
    const currentSong = playlist[currentSongIndex];
    if (currentSongIndex > 0) {
      spotifyEmbedController.loadUri(currentSong.uri);
    }
    playbackData = {
      position: 0,
      time: new Date().getTime(),
      isPaused: false,
    };
    console.log(`Playing (spotify player): ${currentSong.title} by ${currentSong.artist}`);
    spotifyEmbedController.play();
  } else {
    console.log("End of playlist");
    setTimeout(function() {
      stopCrackle();
      playNeedleLift();
    }, endTime);
  }
}

//
// Setup Player
//
// We use the Spotify Embed API to play songs in the browser
// Details here: https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api
// and here: https://developer.spotify.com/documentation/embeds/references/iframe-api#methods
//

// Create Audio elements for the player
const effectsPlayer = new Audio();
const cracklePlayer = new Audio();
cracklePlayer.src = effects.crackle[0].file;
cracklePlayer.loop = true;

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  const element = document.getElementById('embed-iframe');
  const options = {
      uri: 'spotify:track:5TZZ1FqSZhWpLjUapdpG35',
      // uri: '',
      width: '100%',
      height: '90px',
      autostart: false,
    };
  const callback = (EmbedController) => {
    spotifyEmbedController = EmbedController;
  };
  spotifyCallback = callback;
  IFrameAPI.createController(element, options, callback);
  spotifyIframeAPI = IFrameAPI;

  spotifyEmbedController.addListener('playback_update', e => {
    // document.getElementById('progressTimestamp').innerText = `${parseInt(e.data.position / 1000, 10)} s`;
    // console.log(e);
    // if we haven't started yet, do nothing
    if (e.data.duration == 0) {
      return;
    }
    // if we are at the end of the song, play the next
    if (e.data.position >= e.data.duration - 1) {
      // Move to the next song in the playlist
      currentSongIndex++;
      // Play the next song
      playCurrentSong();
    }
    // if we pause, lift the needle
    else if (e.data.isPaused == true) {
      // play a needle lift sound
      playNeedleLift();
      stopCrackle();
    }
    // TODO: Refine this logic
    // if we are not at the beginning of a song and we haven't scratched within the last second
    else if (e.data.position > scratchLeeway) {
      // check for a careless record scratch
      currentTime = new Date().getTime();
      // if we haven't scratched within the last two second
      if (Math.abs(currentTime - lastScratchTime) > 2000) {
        // get the difference between the current time and the last time we recorded playback data
        timeDelta = Math.abs(currentTime - playbackData.time);
        posDelta = Math.abs(e.data.position - playbackData.position);
        // console.log(e.data.position, playbackData.position, timeDelta, posDelta, Math.abs(timeDelta - posDelta), e.data.isPaused);
        // if the two deltas are outside of a window defined by leeway
        if (Math.abs(timeDelta - posDelta) > 2000) {
          // record time of scratch
          lastScratchTime = currentTime;
          // Randomly play a scratch sound
          var scratchLen = playRandomScratch()
          // Pause the recording
          spotifyEmbedController.togglePlay();
          // Delay before restarting the recording
          setTimeout(function() {
            spotifyEmbedController.togglePlay();
          }, scratchLen);
        }
        // TODO: Should recording playbackData be out of this loop?
        // we record the playback data for the next update
        playbackData = {
          position: e.data.position,
          time: new Date().getTime(),
          isPaused: e.data.isPaused,
        };
      };
    }
  });
};

// play a random scratch sound
function playRandomScratch() {
  const randomScratch = effects.scratch[Math.floor(Math.random() * effects.scratch.length)];
  effectsPlayer.src = randomScratch.file;
  effectsPlayer.currentTime = 0;
  console.log(`Playing (effects player): ${randomScratch.file}`);
  effectsPlayer.play();
  return randomScratch.time;
}

// play a needle lift sound
function playNeedleLift() {
  const randomLift = effects.lift[Math.floor(Math.random() * effects.lift.length)];
  effectsPlayer.src = randomLift.file;
  effectsPlayer.currentTime = 0;
  console.log(`Playing (effects player): ${randomLift.file}`);
  effectsPlayer.play();
}

function playNeedleDrop() {
  const randomDrop = effects.drop[Math.floor(Math.random() * effects.drop.length)];
  effectsPlayer.src = randomDrop.file;
  effectsPlayer.currentTime = 0;
  console.log(`Playing (effects player): ${randomDrop.file}`);
  effectsPlayer.play();
  return randomDrop.time;
}

function playCrackle() {
  console.log(`Playing (crackle player): ${effects.crackle[0].file}`);
  cracklePlayer.play();
}

function stopCrackle() {
  console.log(`Stopping (crackle player): ${effects.crackle[0].file}`);
  cracklePlayer.pause();
}

function fadeInAudio(audioElement, duration) {
  const targetVolume = 1; // Maximum volume (1.0)
  cracklePlayer.volume = 0; // Set initial volume to 0 (mute)
  cracklePlayer.play();
  $(audioElement).animate({ volume: targetVolume }, duration);
}

function fadeOutAudio(audioElement, duration) {
  const targetVolume = 0; // Mute (0.0)
  $(audioElement).animate({ volume: targetVolume }, duration, function () {
    // Callback function to pause the audio after fading out
    audioElement.pause();
  });
}

function fadeInCrackle() {
  console.log(`Fading in (crackle player): ${effects.crackle[0].file}`);
  fadeInAudio(cracklePlayer, fadeInOutTime);
}

function fadeOutCrackle() {
  console.log(`Fading out (crackle player): ${effects.crackle[0].file}`);
  fadeOutAudio(cracklePlayer, fadeInOutTime);
}

//
// Control Buttons
//

// Attach click event listener to all buttons with class "control-button"
$(".control-button").on("click", handleControlButton);

// Function to handle button click
function handleControlButton() {
  // Toggle "active" class on the clicked button
  $(this).toggleClass("active");

  // Get the value of the "data-ctr" attribute
  var dataCtr = $(this).data("ctr");

  // Perform actions based on the value of data-ctr
  switch (dataCtr) {
    case "search":
      // Code for the "search" button
      if ($(this).hasClass("active")) {
        // Focus on the search field
        $(".search-field").focus();
      } else {
        // Remove the focus from the search field
        $(".search-field").blur();
      }
      break;
    case "crackle":
      // Code for the "crackle" button
      // Code for the "crackle" button
      if ($(this).hasClass("active")) {
        crackleIsOn = true;
        // turn on crackle only if song is playing
        if (!playbackData.isPaused) {
          fadeInCrackle();
        }
      } else {
        crackleIsOn = false;
        // turn off crackle
        fadeOutCrackle();
      }
      break;
    case "something":
      // Code for the "something" button
      break;
    default:
      // Default case if data-ctr is not recognized
  }
}

function goToSearch() {
  // Add the "active" class to the "search" button
  $(".control-button[data-ctr='search']").addClass("active");
  // Focus on the search field
  $(".search-field").focus();
}

// Add a blur event listener to the search input field
$(".search-field").blur(function () {
  // Remove the "active" class from the "search" button
  $(".control-button[data-ctr='search']").removeClass("active");
});

//
// Panel Buttons

// Attach click event listener to all buttons with class "control-button"
$(".panel-button").on("click", handlePanelButton);

// Function to handle button click
function handlePanelButton() {
  // These buttons are mutually exclusive,
  // so we remove the "active" class from all panel buttons
  $(".panel-button").removeClass("active");
  // and hide all the panels
  $(".main-panel").hide();
  // Add "active" class on the clicked button
  $(this).addClass("active");

  // Get the value of the "data-ctr" attribute
  var dataCtr = $(this).data("ctr");

  // Perform actions based on the value of data-ctr
  switch (dataCtr) {
    case "home":
      // Show home panel
      $("#home-panel").show();
      break;
    case "albums":
      // Show albums panel
      $("#results-panel").show();
      if (playlist.length == 0) {
        goToSearch();
      }
      break;
    case "turntable":
      // Show turntable panel
      $("#turntable-panel").show();
      break;
    default:
      // Default case if data-ctr is not recognized
  }
}

// We need a special case here since when wwe do a search
// we want to show the albums panel
function showResultsPanel() {
  // Hide all main panels
  $(".main-panel").hide();
  // Remove active class from all panel buttons
  $(".panel-button").removeClass("active");
  // Show albums panel
  $("#results-panel").show();
  // Add active class to albums button
  $(".panel-button[data-ctr='albums']").addClass("active");
}

//
// Home Panel
//

function showHomePanel() {
  // Hide all main panels
  $(".main-panel").hide();
  // Remove active class from all panel buttons
  $(".panel-button").removeClass("active");
  // Show home panel
  $("#home-panel").show();
  // Add active class to home button
  $(".panel-button[data-ctr='home']").addClass("active");

  // Depending on time of day, show a different message in .greeting-title
  var now = new Date();
  var hour = now.getHours();
  var greetingTitle = "";
  if (hour < 12) {
    greetingTitle = "Good morning";
  } else if (hour < 18) {
    greetingTitle = "Good afternoon";
  } else {
    greetingTitle = "Good evening";
  }
  $(".greeting-title").text(greetingTitle);

  // Show old albums 
  updateThrowbacks();

  // display a message if there are no recents, i.e, the user is brand new
  if (recentsList.length == 0) {
    // hide throwbacks
    $("#throwbacks").hide();
    // show #welcome
    $("#welcome").show();
  } else {
    // otherwise, vise versa
    $("#throwbacks").show();
    $("#welcome").hide();
  }
}