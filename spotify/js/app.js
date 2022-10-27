

// get parameters
$.urlParam = function(name){
    var results = new RegExp('[\?&#]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
       return null;
    }
    return decodeURI(results[1]) || 0;
}

var accessToken = $.urlParam('access_token');
console.log("Access token:", accessToken);

var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(accessToken);
// spotifyApi.setPromiseImplementation(Q);

// get Elvis' albums, using Promises through Promise, Q or when
spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
  function (data) {
    console.log('Artist albums:', data);
    showAlbums(data);
  },
  function (err) {
    console.error(err);
  }
);

function showAlbums(data) {
  // console.log("array:", data.items);
  var albumList = data.items;
  // console.log("albumList:", albumList)
  // $("#albums").html("Album data: <pre>", JSON.stringify(albumList, null, '\t'), "</pre>");
  for (i=0;i<albumList.length;i++) {
    var albumName = albumList[i].name;
    var albumImageURL = albumList[i].iamges[0];
    var albumHTML =
      "<img src='" + albumImageURL + "'>" +
      "<h3>" + albumName + "</h3>"
    var newAlbum = $("<div></div>").html();
  }
}
