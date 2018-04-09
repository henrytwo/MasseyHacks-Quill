var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database);

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var shuffleSeed = require('shuffle-seed');
var async = require('async');

User.find({'status.noConfirmation': true}).exec(function (err, data) {
    async.each(data, function (user, callback) {
        console.log("pushing back dis man:" + user.email);
        User.findOneAndUpdate({
                '_id': user._id
            },
            {
                $set: {
                    'status.noConfirmation': false,
                    'status.confirmBy': 1523848557454.0
                }
            },
            {
                new: true
            }, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("User " + user.email + "'s confirmation has been pushed back");
                }

            });

        callback()
    })
});