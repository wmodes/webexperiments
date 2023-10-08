// Define your Spotify API endpoint for search
const spotifySearchEndpoint = 'https://api.spotify.com/v1/search';
const spotifyAlbumEndpoint = 'https://api.spotify.com/v1/albums/';
const spotifyTokenEndpoint = 'https://accounts.spotify.com/api/token';
const redirectUri = 'https://wmodes.github.io/webexperiments/spotify/app.html'; // Your redirect uri
const clientId = '873252498aa44a53a6e33c34d8b391b9'; // Your client id

// Global variables to track playlist and current song index
let albumImageURL = '';
let playlist = [];
let currentSongIndex = 0;
let spotifyCallback = null;
let spotifyIframeAPI = null;
let spotifyEmbedController = null;
let playbackData = {};
let lastScratchTime = 0;

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
  // Parse the access token from the iframe URL and update the existing accessToken object
  const newAccessToken = getAccessTokenFromURL(iframeUrl);

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
      console.log(response.albums);
      showAlbums(response.albums);
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
// Display Albums
//

function showAlbums(data) {
  // Clear existing albums
  $("#album-list").empty();

  var albumList = data.items;
  for (var i = 0; i < albumList.length; i++) {
    var albumName = albumList[i].name;
    var albumImageURL = albumList[i].images[0].url;
    var albumYear = albumList[i].release_date.slice(0, 4);
    var albumArtist = albumList[i].artists[0].name;
    var albumId = albumList[i].id; // Spotify album ID

    // Create a unique ID for the play button
    var playButtonId = 'play-button-' + i;

    var buttonSVG = '<svg role="img" height="24" width="24" viewBox="0 0 24 24" class="Svg-ytk21e-0 eqtHWV"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>';
    var albumHTML =
      "<div class='image'>" +
      "<img src='" + albumImageURL + "'>" +
      "<button class='play-button' id='" + playButtonId + 
        "' data-album-id='" + albumId + 
        "' data-album-image='" + albumImageURL + "'>" + 
        buttonSVG + "</button>" +
      "</div>" +
      "<div class='name'>" + albumName + "</div>" +
      "<div class='more'>" +
      "<time class='year'>" + albumYear + "</time>" + " • " +
      "<span class='artist'>" + albumArtist + "</span>" +
      "</div>";
    var newAlbum = $("<div class='album'></div>").html(albumHTML);
    $("#album-list").append(newAlbum);

    // Add a click event listener to the play button
    $("#" + playButtonId).on('click', function () {
      var albumId = $(this).data('album-id');
      var albumImageURL = $(this).data('album-image');
      playAlbum(albumId, albumImageURL);
    });
  }
}

//
// Player
//

// Function to play an album by its Spotify ID
function playAlbum(albumId, albumImageURL) {
  // Clear the playlist to start with an empty queue
  playlist = [];

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
      playCrackle();
    }, dropLen-500);
  }, 2000);
}

// queue current song, but pause for now
function queueFirstSong() {
  if (currentSongIndex < playlist.length) {
    const currentSong = playlist[currentSongIndex];
    spotifyEmbedController.loadUri(currentSong.uri);
    spotifyEmbedController.pause();
    console.log(`Queuing: ${currentSong.title} by ${currentSong.artist}`);
  } else {
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
      time: new Date().getTime()
    };
    console.log(`Playing (spotify player): ${currentSong.title} by ${currentSong.artist}`);
    spotifyEmbedController.play();
  } else {
    console.log("End of playlist");
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
  console.log
  const element = document.getElementById('embed-iframe');
  const options = {
      uri: 'spotify:track:574y1r7o2tRA009FW0LE7v',
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
    if (e.data.position >= e.data.duration - 1) {
      // Move to the next song in the playlist
      currentSongIndex++;
      // Play the next song
      playCurrentSong();
    }
    else if (e.data.isPaused == true) {
      // play a needle lift sound
      // playNeedleLift();
      stopCrackle();
    }
    // if we are not at the beginning of a song and we haven't scratched within the last second
    else if (e.data.position > 2000) {
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
        // we record the playback data for the next update
        playbackData = {
          position: e.data.position,
          time: new Date().getTime()
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

// play a crackle sound
function playCrackle() {
  console.log(`Playing (crackle player): ${effects.crackle[0].file}`);
  cracklePlayer.play();
}

function stopCrackle() {
  cracklePlayer.pause();
}
