// var models = require('../models');

// module.exports = {
//   messages: {
//     get: function (req, res) {
//       models.messages.get(function(data) {
//         res.json(data);
//       });
//     }, // a function which handles a get request for all messages

//     post: function (req, res) {
//       var message = req.body;
//       console.log('body', req.body);
//       models.messages.post(message, function() {
//         res.json(message);
//       });
//     } // a function which handles posting a message to the database
//   },

//   users: {
//     // Ditto as above
//     get: function (req, res) {},
//     post: function (req, res) {
//       var user = req.body;
//       models.users.post(user, function() {
//         res.send('success');
//       });
//     }
//   }
// };

// ORM Refactor

var db = require('../db');

module.exports = {
  messages: {
    get: function (req, res) {
      db.Message.findAll({include: [db.User]})
        .then(function(messages) {
          res.json(messages);
        });
    },
    post: function (req, res) {
      db.User.findOrCreate({where: {username: req.body.username}})
        // findOrCreate returns multiple results in an array
        // use spread to assign the array to function arguments
        .spread(function(user, created) {
          db.Message.create({
            UserId: user.get('id'),
            text: req.body.message,
            roomname: req.body.roomname
          }).then(function(message) {
            res.sendStatus(201);
          });
        });
    }
  },

  users: {
    get: function (req, res) {
      db.User.findAll()
        .then(function(users) {
          res.json(users);
        });
    },
    post: function (req, res) {
      db.User.findOrCreate({where: {username: req.body.username}})
        // findOrCreate returns multiple results in an array
        // use spread to assign the array to function arguments
        .spread(function(user, created) {
          res.sendStatus(created ? 201 : 200);
        });
    }
  }
};
