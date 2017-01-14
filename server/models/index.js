var db = require('../db').link;


module.exports = {
  messages: {
    get: function (callback) {
      // a function which produces all the messages
      db.query('SELECT m.id, m.text, username, createdAt, roomname FROM messages m JOIN users ON m.username_id=users.id JOIN rooms ON m.roomname_id=rooms.id;', (err, rows, fields)=> {
        if (err) { throw err; }
        callback(rows);
      });
    },
    post: function (message, callback) {
    // a function which can be used to insert a message into the database
      module.exports.users.post(message);
      module.exports.rooms.post(message);
      db.query(`INSERT INTO messages (text, username_id, roomname_id) values ("${message.message}", (select id from users u where u.username="${message.username}"), (select id from rooms r where r.roomname="${message.roomname}"));`, (err, rows, fields)=> {
        if (err) { throw err; }
        callback();
      });
    }
  },

  users: {
    // Ditto as above.
    get: function (user, callback) {
      db.query('SELECT id FROM users WHERE users.username="' + user.username + '";', (err, rows, fields) => {
        if (err) { throw err; }
        callback(rows);
      });
    },
    post: function (user, callback) {
      db.query('SELECT * from users WHERE username=?', [user.username], (err, rows, fields) => {
        if (err) { throw err; }
        if (!rows.length) {
          db.query(`INSERT INTO users (username) values ("${user.username}");`, (err, result) => {
            if (err) { throw err; }
            console.log('successful user post');
          });
        }
      });
      if (callback) {
        callback();
      }
    }
  },

  rooms: {
    post: function (room, callback) {
      db.query('SELECT * FROM rooms WHERE roomname=?', [room.roomname], (err, rows, fields) => {
        if (err) { throw err; }
        if (!rows.length) {
          db.query(`INSERT INTO rooms (roomname) values ("${room.roomname}");`, (err, result) => {
            if (err) { throw err; }
            console.log('successful room post');
          });
        }
      });
      if (callback) {
        callback();
      }
    }
  }
};
