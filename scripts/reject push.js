var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database);

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var shuffleSeed = require('shuffle-seed');
var async = require('async');

User.find({'wave': 1, 'status.rejected':true, 'status.statusReleased': false}).exec(function (err, data) {
    async.each(data, function (user, callback) {
        console.log("reject/pushback user " + user.email);
        User.findOneAndUpdate({
                '_id': user._id
            },
            {
                $set: {
                    wave: 4,
                    lastUpdated: 31536000000 + user.lastUpdated,
                    'status.rejected': false,
                    numVotes: 0,
                    applicationAdmit:[],
                    applicationReject:[],
                    votedBy:[]
                }
            },
            {
                new: true
            }, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("User " + user.email + " has been pushed back to wave " + user.wave)
                }

            });

        callback()
    })
});