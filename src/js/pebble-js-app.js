// This will be an array of dicts to send to Pebble
var messages = [];

// Function to send a message to the Pebble using AppMessage API
function sendMessage() {
  if (messages.length === 0) {
    return;
  }
  var message = messages.shift();
  Pebble.sendAppMessage(message, ack, nack);

  // If Pebble receives the message, send the next one
  function ack() {
    sendMessage();
  }

  // If Pebble doesn't receive the message, send it again
  function nack() {
    messages.unshift(message);
    sendMessage();
  }
}

function getFollowedStreams(offset) {
  // Send at most 10 items for first request and at most 5 items for subsequent requests
  var limit = 5;
  if (offset === 0) {
    limit = 10;
  }

  // Fetch request for user's followed streams
  var req = new XMLHttpRequest();
  req.open('GET', 'https://api.twitch.tv/kraken/streams/followed?limit=' + limit + '&oauth_token=' + localStorage.getItem('oauth token') + '&offset=' + offset, false);
  req.send(null);
  var response = JSON.parse(req.responseText);

  // Number of messages to send
  var total = Math.min(response._total - offset, limit);
  for (var i = 0; i < total; i++) {
    var streamer = response.streams[i].channel.display_name;
    var game = response.streams[i].game;
    var viewers = response.streams[i].viewers + ' Viewers';
    game += '\n' + viewers;
    // Add items to array in preparation to send
    var message = {
      TITLE_KEY: streamer,
      SUBTITLE_KEY: game
    };
    messages.push(message);
  }
  sendMessage();
}

function getTopStreams(offset) {
  // Send at most 10 items for first request and at most 5 items for subsequent requests
  var limit = 5;
  if (offset === 0) {
    limit = 10;
  }

  // Fetch request for current top streams
  var req = new XMLHttpRequest();
  req.open('GET', 'https://api.twitch.tv/kraken/streams?limit=' + limit + '&offset=' + offset, false);
  req.send(null);
  var response = JSON.parse(req.responseText);

  // Number of messages to send
  var total = Math.min(response._total - offset, limit);
  for (var i = 0; i < total; i++) {
    var streamer = response.streams[i].channel.display_name;
    var game = response.streams[i].game;
    var viewers = response.streams[i].viewers + ' Viewers';
    game += '\n' + viewers;
    // Add items to array in preparation to send
    var message = {
      TITLE_KEY: streamer,
      SUBTITLE_KEY: game
    };
    messages.push(message);
  }

  sendMessage();
}

function getFeaturedStreams(offset) {
  // Send at most 10 items for first request and at most 5 items for subsequent requests
  var limit = 5;
  if (offset === 0) {
    limit = 10;
  }

  // Fetch request for current featured streams
  var req = new XMLHttpRequest();
  req.open('GET', 'https://api.twitch.tv/kraken/streams/featured?limit= ' + limit + '&offset=' + offset, false);
  req.send(null);
  var response = JSON.parse(req.responseText);

  // Number of messages to send
  var total = response.featured.length;
  for (var i = 0; i < total; i++) {
    var streamer = response.featured[i].stream.channel.name;
    var game = response.featured[i].stream.channel.game;
    var viewers = response.featured[i].stream.viewers + ' Viewers';
    // ADd items to array in preparation to send
    var message = {
      TITLE_KEY: streamer,
      SUBTITLE_KEY: game
    };
    messages.push(message);
  }

  sendMessage();
}

/* Deletes token from local storage.
 * At the watch end, this should result in
 * the user getting logged out.*/
function removeToken() {
    if(localStorage.getItem('oauth token')) {
        localStorage.removeItem('oauth token');
        var message = {
            TOKEN_REMOVE_KEY: "Removed token"
        };
    }
    else {
        var message = {
            TOKEN_REMOVE_KEY: "Token already deleted"
        };
    }
    send_message();
}

/*Retrieves user name from token
 * still need to handle error cases. */
function getUserName() {
  var req = new XMLHttpRequest();
  req.open('GET', 'https://api.twitch.tv/kraken?oauth_token=0z7aboxelw2npt53h9ax0vxcwutrox', false);

  req.send(null);
  var response = JSON.parse(req.responseText);
  var userName = response.token.user_name;

  var message = {
    USERNAME_KEY: userName
  };
  messages.push(message);

  sendMessage();
}

// Configuration window
Pebble.addEventListener("showConfiguration", function(e) {
  Pebble.openURL('https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&client_id=kqxn6nov00how5uom46vlxb7p32xvf6&redirect_uri=pebblejs://close&scope=user_read');
});

// Called when the configuration window is closed
Pebble.addEventListener("webviewclosed", function(e) {});

// Called when Pebble first starts
Pebble.addEventListener("ready", function(e) {
  // Store a sample oauth token into local storage for now
  var oauth_token = '0z7aboxelw2npt53h9ax0vxcwutrox';
  localStorage.setItem('oauth token', oauth_token);
});

// Called when incoming message from the Pebble is received
Pebble.addEventListener("appmessage", function(e) {
  switch (e.payload.QUERY_KEY) {
    case 0:
      getTopStreams(e.payload.OFFSET_KEY);
      break;
    case 1:
      getFeaturedStreams(e.payload.OFFSET_KEY);
      break;
    case 2:
      getFollowedStreams(e.payload.OFFSET_KEY);
      break;
    case 3:
      removeToken();
      break;
    case 4:
      getUserName();
      break;
  }
});