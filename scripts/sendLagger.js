require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database);

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var shuffleSeed = require('shuffle-seed');
var mailer = require('../app/server/services/email');
var async = require('async');

User.find({'verified':true, 'status.completedProfile': false}).exec(function (err, data) {
    mailer.sendLaggerEmails(data, null);
});