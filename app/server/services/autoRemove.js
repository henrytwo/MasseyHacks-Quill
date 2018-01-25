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
                if (now - user.timestamp > 172800000){
                    console.log("Removing " + user.email);
                    User.findOneAndRemove({"id":user.id}, callback);
                }
            })
        })
}

setInterval(function() {
    removeUnverifiedUser();
}, 3600000);

module.exports = removeUnverifiedUser;
