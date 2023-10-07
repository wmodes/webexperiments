// Define your Spotify API endpoint for search
const spotifySearchEndpoint = 'https://api.spotify.com/v1/search';
const spotifyAlbumEndpoint = 'https://api.spotify.com/v1/albums/';

// Global variables to track playlist and current song index
let albumImageURL = '';
let playlist = [];
let currentSongIndex = 0;

// Create an Audio element for the player
const audioPlayer = new Audio();

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
      "<button class='play-button' id='" + playButtonId + "' data-album-id='" + albumId + "'>" + buttonSVG + "</button>" +
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
      playAlbum(albumId);
    });
  }
}


// showAlbums(testData);

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
// Player
//

// Function to play an album by its Spotify ID
function playAlbum(albumId) {
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
      albumImageURL = albumData.images[0].url;
      
      // Handle the successful response here and play the tracks
      console.log(response.items);

      // Example: Play the album tracks in your audio player
      // You can create a playlist and add the tracks to it
      for (const track of response.items) {
        playlist.push({
          title: track.name,
          artist: track.artists[0].name,
          url: track.preview_url, // Assuming the Spotify API provides preview URLs
        });
      }
      playPlaylist()

      // Use your audio player to play the playlist
      // Example: audioPlayer.playPlaylist(playlist);
    },
    error: function (xhr, status, error) {
      // Handle errors here
      console.error('Error:', error);
    }
  });
}

// Function to play the current song
function playCurrentSong() {
  if (currentSongIndex < playlist.length) {
    const currentSong = playlist[currentSongIndex];
    audioPlayer.src = currentSong.url;
    audioPlayer.play();
    console.log(`Playing: ${currentSong.title} by ${currentSong.artist}`);
  } else {
    console.log("End of playlist");
  }
}

// Event listener for when a song ends
audioPlayer.addEventListener('ended', () => {
  // Move to the next song in the playlist
  currentSongIndex++;
  // Play the next song
  playCurrentSong();
});

// Function to play the playlist
function playPlaylist() {
  currentSongIndex = 0; // Start from the beginning
  playCurrentSong(); // Play the first song
}
