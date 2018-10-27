var config = require('./config.js'),
    mongoose = require('mongoose'),
    express = require('./express.js');

module.exports.start = function() {
    var app = express.init();
    app.listen(config.port, function() {
        console.log('App listening on port', config.port);
    });
};
