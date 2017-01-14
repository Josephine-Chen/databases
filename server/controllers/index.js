var models = require('../models');

module.exports = {
  messages: {
    get: function (req, res) {
    	console.log('controller here');
      models.messages.get(function(data){
      	res.json(data);
      });
    }, // a function which handles a get request for all messages

    post: function (req, res) {
    	var message = req.body;
      console.log('body', message);
    	models.messages.post(message, function() {
    		res.send('success');
    	});
    } // a function which handles posting a message to the database
  },

  users: {
    // Ditto as above
    get: function (req, res) {},
    post: function (req, res) {
      var user = req.body;
      models.users.post(user, function() {
        res.send('success');
      });
    }
  }
};