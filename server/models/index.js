var db = require('../db').link;


module.exports = {
  messages: {
    get: function (callback) {
      db.query('SELECT * from messages;', (err, rows, fields)=> {
        if (err) { throw err; }
        console.log('rows', rows, 'fields', fields);
        callback(rows);
      })
    }, // a function which produces all the messages
    post: function (message, callback) { // a function which can be used to insert a message into the database
      //console.log(`INSERT INTO messages (text) values ("${message.message}");`, 'query');
      db.query(`INSERT INTO messages (text, roomname, username) values ("${message.message}", "${message.roomname}", "${message.username}");`, (err, rows, fields)=> {
        if (err) { throw err; }
        console.log('rows', rows, 'fields', fields);
        callback();
      });
    }
  },

  users: {
    // Ditto as above.
    get: function (user, callback) {
      db.query('SELECT username from users', (err, rows, fields) => {
        if(err) { throw err; }
        callback(rows);
      });
    },
    post: function (user, callback) {
      db.query('INSERT INTO users (username) values ("' + user.username + '");', (err, rows, fields) => {
        if (err) {throw err;}
        callback();
      });
    }
  }
};
