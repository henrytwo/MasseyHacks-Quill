var _ = require('underscore');
var async = require('async');
var User = require('../models/User');
var Settings = require('../models/Settings')


function removeUnverifiedUser(){
    var now = Date.now()

    User.find({"admin": false,"owner":false,"volunteer":false,"verified":false})
        .exec(function(err, users) {
            if (err || !users) {
                throw err;
            }

            async.each(users, function (user, callback) {
                if (now - user.timestamp > 100){
                    console.log("Removing " + user.email);
                    User.findOneAndRemove({"email":user.email});
                }
            })
        })
}

setInterval(function() {
    removeUnverifiedUser();
}, 6000000);

module.exports = removeUnverifiedUser;
