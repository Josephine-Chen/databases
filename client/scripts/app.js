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

    //app.fetch(false);

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
    console.log('message', message);
    $.ajax({
      type: 'POST',
      url: app.server,
      dataType: 'json',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data) {
        console.log('data in chatterbox client', data);
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
        console.log('data in get', data);
        //Don't do anything if no messages
        if (!data || !data.length) { return; }

        //Store messages for caching later
        app.messages = data;

        var mostRecentMessage = data[data.length - 1];
        //Only update DOM if there are new messages
        if (mostRecentMessage.id !== app.lastMessageId) {
          //Update UI with fetched rooms
          app.renderRoomList(data);
          //Update UI with fetched messages
          app.renderMessages(data, animate);
          //Store ID of most recent message
          app.lastMessageId = mostRecentMessage.id;

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
    console.log('message in renderMessage', message);
    //Default roomname
    if (!message.roomname) {
      message.roomname = 'lobby';
    }
    //Create div to hold message
    var $chat = $('<div class="chat"/>');
    //Add in the message data and store user in element's data attr
    var $username = $('<span class="username"/>');
    console.log('User.username', message.User.username);
    $username
      .text(message.User.username + ': ')
      .attr('data-username', message.User.username)
      .appendTo($chat);

    //Add friend class
    if (app.friends[message.User.username] === true) {
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
      message: app.$message.val(),
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
