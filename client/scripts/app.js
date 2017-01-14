/*
1. Set up selector for chatroom (need a default room or be able to create a room)
2. Get which chatroom message objects needs
3. Pull username and put into message object
4. Pull message and put into message object
5. 2-4 are inside send (message)
6. RenderMessage inside renderRoom, fetch new messages every x seconds
7. Create a button to clear messages

*/
var app = {
  server: 'http://127.0.0.1:3000/classes/messages',
  username: 'anonymous',
  roomname: 'lobby',
  messages: [],
  lastMessageId: 0,
  friends: {},

  init: function() {
    //Get username
    app.username = window.location.search.substr(10);

    //Cache jQuery selectors
    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$roomSelect = $('#roomSelect');
    app.$send = $('#send');

    //Add listeners
    app.$send.on('submit', app.handleSubmit);
    app.$roomSelect.on('change', app.handleRoomChange);
    app.$chats.on('click', '.username', app.handleUsernameClick);

    app.startSpinner();
    app.fetch(false);

    //Look for new messages!
    setInterval(function() {
      app.fetch();
    }, 3000);

    // $('#main .username').on('click', function() {
    //   app.handleUsernameClick();
    // });
    // $('#send').on('submit',  function() {
    //   var newMessage = $('#send').serializeArray()[0];
    //   app.handleSubmit(newMessage.value);
  },

  send: function(message) {
    app.startSpinner();
    $.ajax({
      type: 'POST',
      url: app.server,
      data: JSON.stringify(message),
      success: function(data) {
        //Clear message input
        app.$message.val('');

        //Fetch more messages
        app.fetch();
      },
      error: function(error) {
        console.log('there is an error D:', error);
      }
    });
  },
  fetch: function(animate) {
    $.ajax({
      type: 'GET',
      url: app.server,
      data: { order: '-createdAt' },
      //dataType: 'json',
      success: function(data) {
        //send the data.results to another function
        //send it to the render messsage function

        // app.renderRoom(data.results);
        // app.renderMessage(data.results);

        //Don't do anything if no messages
        if (!data.results || !data.results.length) { return; }

        //Store messages for caching later
        app.messages = data.results;

        var mostRecentMessage = data.results[data.results.length - 1];
        //Only update DOM if there are new messages
        if (mostRecentMessage.objectId !== app.lastMessageId) {
          //Update UI with fetched rooms
          app.renderRoomList(data.results);
          //Update UI with fetched messages
          app.renderMessages(data.results, animate);
          //Store ID of most recent message
          app.lastMessageId = mostRecentMessage.objectID;

        }
      },
      error: function(error) { console.log(error); },
      //contentType: 'application/json'
    });
  },
  clearMessages: function() {
    app.$chats.html('');
  },
  renderMessages: function(messages, animate) {
    //Clear old messages
    app.clearMessages();
    app.stopSpinner();

    if (Array.isArray(messages)) {
      // Add all fetched messages that are in our current room
      messages
        .filter(function(message) {
          return message.roomname === app.roomname ||
                 app.roomname === 'lobby' && !message.roomname;
        })
        .forEach(app.renderMessage); //Render each message
    }

    // Make it scroll to the top
    if (animate) {
      $('body').animate({scrollTop: '0px'}, 'fast');
    }

  },

  renderMessage: function(message) {
    // for (var i = 0; i < message.length; i++) {
    //   $('#chats').append('<div id = "messages"><text class = "username">' + message[i].username + ':</text><br></br>' + message[i].text + '</div>');
    // }
    //Default roomname
    if (!message.roomname) {
      message.roomname = 'lobby';
    }
    //Create div to hold message
    var $chat = $('<div class="chat"/>');
    //Add in the message data and store user in element's data attr
    var $username = $('<span class="username"/>');
    $username
      .text(message.username + ': ')
      .attr('data-username', message.username)
      .appendTo($chat);

    //Add friend class
    if (app.friends[message.username] === true) {
      $username.addClass('friend');
    }

    var $message = $('<br><span/>');
    $message.text(message.text).appendTo($chat);

    //Add message to UI
    app.$chats.append($chat);
  },

  renderRoomList: function(messages) {
    app.$roomSelect.html('<option value="__newRoom">New room...</option>');

    if (messages) {
      var rooms = {};
      messages.forEach(function(message) {
        var roomname = message.roomname;
        if (roomname && !rooms[roomname]) {
          app.renderRoom(roomname);

          //Store that we've already added this room
          rooms[roomname] = true;
        }
      });
    }
    //Select the menu option
    app.$roomSelect.val(app.roomname);
  },
  renderRoom: function(roomname) {
    // $('#roomSelect').append('<div>' + room + '</div>');
    // var roomList = [];
    // for (var i = 0; i < room.length; i++) {
    //   if (roomList.indexOf(room[i].roomname) === -1) {
    //     roomList.push(room[i].roomname);
    //     $('#myDropdown').append('<div id = '+room[i].roomname +' class = "roomSelect">' + room[i].roomname + '</div>');
    //   }
    // }
    //app.fetch();
    //ESCAPE! Prevent XSS by escaping with DOM methods
    var $option = $('<option/>').val(roomname).text(roomname);

    //Add to select
    app.$roomSelect.append($option);
  },

  handleRoomChange: function(event) {
    var selectIndex = app.$roomSelect.prop('selectedIndex');
    //New room is first option
    if (selectIndex === 0) {
      //create a new room
      var roomname = prompt('Enter a room name');

      if (roomname) {
        //Set as current room
        app.roomname = roomname;
        //Add the room to menu
        app.renderRoom(roomname);
        //Select menu option
        app.$roomSelect.val(roomname);
      }
    } else {
      app.startSpinner();
      //change to existing room
      app.roomname = app.$roomSelect.val();
    }
    //Rerender messages
    app.renderMessage(app.messages);
  },

  handleUsernameClick: function(event) {
    //Get username from data attribute
    var username = $(event.target).data('username');

    if (username !== undefined) {
      //Toggle friend
      app.friends[username] = !app.friends[username];
      //Escape username in case it contains a quote
      var selector = '[data-username="' + username.replace(/"/g, '\\\"' + '"]');
      //Add 'friend' CSS class to all of that user's messages
      var $usernames = $(selector).toggleClass('friend');
    }
  },

  handleSubmit: function(event) {
    // console.log('button pressed');
    // var PLACEHOLDER = 'bloop';
    // var submission = {
    //   username: PLACEHOLDER,
    //   text: newMessage,
    //   roomname: PLACEHOLDER,
    // };
    // //console.log(JSON.stringify(submission));
    // app.send(submission);
    var message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby',
    };
    app.send(message);
    //Stop form from submitting
    event.preventDefault();
  },

  startSpinner: function() {
    $('.spinner img').show();
    $('form input[type=submit]').attr('disabled', true);
  },

  stopSpinner: function() {
    $('.spinner img').fadeOut('fast');
    $('form input[type=submit]').attr('disabled', null);
  },

  // findUser: function() {
  //   console.log(window.location.search);
  //   return window.location.search.split('=')[2];},
};

// (function() {
//   $(document).ready(function() {
//     app.fetch();
//     $('#main .username').on('click', function() {
//       app.handleUsernameClick();
//     });
//     $('#send').on('submit',  function() {
//       var newMessage = $('#send').serializeArray()[0];
//       app.handleSubmit(newMessage.value);


//     });
//   }
//   )}())