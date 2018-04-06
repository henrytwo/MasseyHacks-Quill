var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database);

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var shuffleSeed = require('shuffle-seed');
var async = require('async');

User.find({'wave': 4}).exec(function (err, data) {
    async.each(data, function (user, callback) {
        console.log("moving to wave 3 " + user.email);
        User.findOneAndUpdate({
                '_id': user._id
            },
            {
                $set: {
                    wave: 3
                }
            },
            {
                new: true
            }, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("User " + user.email + " has been pushed back to wave 3");
                }

            });

        callback()
    })
});