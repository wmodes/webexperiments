
// get parameters
$.urlParam = function(name){
    var results = new RegExp('[\?&#]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}


// var accessToken = $.urlParam('access_token');
// console.log("Access token:", accessToken);
//
// var spotifyApi = new SpotifyWebApi();
// spotifyApi.setAccessToken(accessToken);
// // spotifyApi.setPromiseImplementation(Q);
//
// // get Elvis' albums, using Promises through Promise, Q or when
// spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
//   function (data) {
//     console.log('data:', JSON.stringify(data, null, '\t'));
//     showAlbums(data);
//   },
//   function (err) {
//     console.error(err);
//   }
// );

function showAlbums(data) {
  // console.log("array:", data.items);
  var albumList = data.items;
  // console.log("albumList:", JSON.stringify(albumList, null, '\t'))
  // $("#albums").html("Album data: <pre>", JSON.stringify(albumList, null, '\t'), "</pre>");
  for (i=0;i<albumList.length;i++) {
    var albumName = albumList[i].name;
    var albumImageURL = albumList[i].images[0].url;
    var albumYear = albumList[i].release_date.slice(0,4);
    var albumArtist = albumList[i].artists[0].name;
    var buttonSVG = '<svg role="img" height="24" width="24" viewBox="0 0 24 24" class="Svg-ytk21e-0 eqtHWV"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>';
    var albumHTML =
      "<div class='image'>" +
        "<img src='" + albumImageURL + "'>" +
        "<button class='play-button'>" + buttonSVG + "</button>" +
      "</div>" +
      "<div class='name'>" + albumName + "</div>" +
      "<div class='more'>" +
        "<time class='year'>" + albumYear + "</time>" + " • " +
        "<span class='artist'>" + albumArtist + "</span>" +
      "</div>";
    var newAlbum = $("<div class='album'></div>").html(albumHTML);
    $("#album-list").append(newAlbum);
    var newAlbum = $("<div class='album'></div>").html(albumHTML);
    $("#album-list").append(newAlbum);
  }
}

showAlbums(testData);
