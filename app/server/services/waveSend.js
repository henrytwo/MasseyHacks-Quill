var schedule = require('node-schedule');
var Settings = require('../models/Settings');
var Users = require('../models/User');
var UserController = require('../controllers/UserController');
var mailer = require('email')


var ad = function (err, user) {
    if (err) {
      console.log("Error when processing user:" + data.email);
    } else {
      if (user.admitted) {
        mailer.sendAdmittanceEmail([user])
      } else {
        mailer.sendRejectEmails([user])
      }
    }
};

var acceptPart = function (wave) {
  Users.find({'wave':wave}).exec(function(err, data) {
    async.each(data, function (user, callback) {
      User.findOneAndUpdate({
          '_id': user._id
        },
        {
          $set: {
              'status.statusReleased': true
          }
        },
        {
          new: true
        }, ad);

      callback()
    })
  })
};

var notConfirmed = function(wave) {
  Users.find({'wave':wave}).exec(function(err, data) {
    async.each(data, function (user, callback) {
      if (!user.confirmed) {
        User.findOneAndUpdate({
            '_id': user._id
          },
          {
            $set: {
                'status.admitted': false
            }
          },
          {
            new: true
          }, callback)

        UserController.advanceWaitlist();
      }
    })
  })
}

var waveA = schedule.scheduleJob(date, function(){
  console.log('The world is going to end today.');
});