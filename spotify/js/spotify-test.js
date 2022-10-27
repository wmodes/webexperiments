

// get parameters
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

var accessToken = getUrlParameter('access_token');
console.log("Access token:", accessToken);

var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken('accessToken');
spotifyApi.setPromiseImplementation(Q);

spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE', function (err, data) {
  if (err) console.error(err);
  else console.log('Artist albums', data);
});

// get Elvis' albums, using Promises through Promise, Q or when
spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
  function (data) {
    console.log('Artist albums', data);
  },
  function (err) {
    console.error(err);
  }
);
