// Define your Spotify API endpoint for search
const spotifySearchEndpoint = 'https://api.spotify.com/v1/search';
const spotifyAlbumEndpoint = 'https://api.spotify.com/v1/albums/';

// Global variables to track playlist and current song index
let albumImageURL = '';
let playlist = [];
let currentSongIndex = 0;
let spotifyCallback = null;
let spotifyIframeAPI = null;
let spotifyEmbedController = null;

//
// Access Token
//

// Function to parse the URL and extract the access_token
function getAccessTokenFromURL() {
  const url = window.location.href;
  const tokenIndex = url.indexOf('#access_token=');
  if (tokenIndex !== -1) {
    // Token found in the URL
    const tokenStart = tokenIndex + 14; // Length of '#access_token='
    const tokenEnd = url.indexOf('&', tokenStart);
    if (tokenEnd !== -1) {
      const accessToken = url.substring(tokenStart, tokenEnd);
      return accessToken;
    }
  }
  return null; // Token not found in the URL
}

// Get the access_token from the URL
const accessToken = getAccessTokenFromURL();

if (accessToken) {
  // The access_token is available, you can use it in your app now
  console.log("Access Token:", accessToken);

  // Now you can use the access token to make requests to the Spotify API
  // Example: Call your searchSpotify function with the access token
  searchSpotify('Your search query', accessToken);
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
      'Authorization': `Bearer ${accessToken}`,
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
      'Authorization': `Bearer ${accessToken}`,
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
  currentSongIndex = 0; // Start from the beginning
  playCurrentSong(); // Play the first song
}

// Function to play the current song
function playCurrentSong() {
  if (currentSongIndex < playlist.length) {
    const currentSong = playlist[currentSongIndex];
    // audioPlayer.src = currentSong.url;
    spotifyEmbedController.loadUri(currentSong.uri);
    
    // Reset the playback position to the beginning of the song
    // audioPlayer.currentTime = 0;
    
    // audioPlayer.play();
    spotifyEmbedController.play();
    console.log(`Playing: ${currentSong.title} by ${currentSong.artist}`);
  } else {
    console.log("End of playlist");
  }
}

// audioPlayer.addEventListener('ended', () => {
//   // Check if the current song has ended (e.g., playback position near the end)
//   if (audioPlayer.currentTime >= audioPlayer.duration - 1) {
//     // Move to the next song in the playlist
//     currentSongIndex++;
//     // Play the next song
//     playCurrentSong();
//   }
// });

//
// Setup Player
//
// We use the Spotify Embed API to play songs in the browser
// Details here: https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api
// and here: https://developer.spotify.com/documentation/embeds/references/iframe-api#methods
//

// Create an Audio element for the player
// const audioPlayer = new Audio();

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  console.log
  const element = document.getElementById('embed-iframe');
  const options = {
      uri: 'spotify:track:574y1r7o2tRA009FW0LE7v',
      // uri: '',
      width: '100%',
      height: '75',
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
  });
};