// var mysql = require('mysql');

// // Create a database connection and export it from this file.
// // You will need to connect with the user "root", no password,
// // and to the database "chat".

// exports.link = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'chat'
// });

// ORM refactor
var Sequelize = require('sequelize');
//Create db with name, user, and pass
var db = new Sequelize('chat', 'root', '');

//Define models using js instead of using schema file
var User = db.define('User', {
  username: Sequelize.STRING
});

var Message = db.define('Message', {
  text: Sequelize.STRING,
  roomname: Sequelize.STRING
});

// puts a UserId col on each Message instance and gives us `.setUser`
// after creating a new instance of Message
Message.belongsTo(User);
// enables bi-directional associations between Users and Messages
User.hasMany(Message);

User.sync();
Message.sync();
// creates tables in MySQL if they don't already exist. Pass in {force: true}
// to drop any existing user and message tables and make new ones

exports.User = User;
exports.Message = Message;
