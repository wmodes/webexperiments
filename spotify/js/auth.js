var spotifyMeEndpoint = 'https://api.spotify.com/v1/me';
var spotifyAuthEndpoint = 'https://accounts.spotify.com/authorize';
var clientId = '873252498aa44a53a6e33c34d8b391b9'; // Your client id
var redirectUri = 'https://wmodes.github.io/webexperiments/spotify/app.html'; // Your redirect uri

$(document).ready(function() {

  var stateKey = 'spotifyAuthState';

  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  var userProfileSource = $('#user-profile-template').html(),
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = $('#user-profile');

  var oauthSource = $('#oauth-template').html(),
      oauthTemplate = Handlebars.compile(oauthSource),
      oauthPlaceholder = $('#oauth');

  var params = getHashParams();

  var accessToken = params.access_token,
      state = params.state,
      storedState = localStorage.getItem(stateKey);

  if (accessToken && (state == null || state !== storedState)) {
    alert('There was an error during the authentication');
  } else {
    localStorage.removeItem(stateKey);
    if (accessToken) {
      $.ajax({
          url: spotifyAuthEndpoint,
          headers: {
            'Authorization': 'Bearer ' + accessToken
          },
          success: function(response) {
            userProfilePlaceholder.html(userProfileTemplate(response));

            $('#login').hide();
            $('#loggedin').show();
          }
      });
    } else {
        $('#login').show();
        $('#loggedin').hide();
    }

    $('#loginButton').on('click', function() {

      var state = generateRandomString(16);

      localStorage.setItem(stateKey, state);
      var scope = 'user-read-private user-read-email';

      var url = spotifyAuthEndpoint;
      url += '?response_type=token';
      url += '&client_id=' + encodeURIComponent(clientId);
      url += '&scope=' + encodeURIComponent(scope);
      url += '&redirect_uri=' + encodeURIComponent(redirectUri);
      url += '&state=' + encodeURIComponent(state);

      window.location = url;
    });
  }
});
