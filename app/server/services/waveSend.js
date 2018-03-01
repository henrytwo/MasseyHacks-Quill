var schedule = require('node-schedule');
var Settings = require('../models/Settings');
var Users = require('../models/User');
var UserController = require('../controllers/UserController');
var mailer = require('../services/email');
var async = require('async');


var ad = function (err, user) {

    if (err) {
        console.log("Error when processing user:" + data.email);
    } else {
        console.log(user.status.admitted);
        if (user.status.admitted) {
            console.log(user.email + "Admitted");
            mailer.sendAdmittanceEmail(user)
        } else {
            console.log(user.email + "Rejected");
            mailer.sendRejectEmails([user])
        }
    }
};

var acceptPart = function (wave) {
    console.log("running Wave "+wave);
    Settings.findOne({}).exec(function(err, setting) {
        Users.find({'wave': wave, $or:[{'status.admitted':true}, {'status.rejected':true}]}).exec(function (err, data) {
            async.each(data, function (user, callback) {
                console.log("running user " + user.email);
                Users.findOneAndUpdate({
                        '_id': user._id
                    },
                    {
                        $set: {
                            'status.statusReleased': true,
                            'status.confirmBy':setting['wave'+wave]['timeConfirm']
                        }
                    },
                    {
                        new: true
                    }, ad);

                callback()
            })
        })
    });

    Users.find({'wave':wave, 'status.admitted':false, 'status.rejected':false}).exec(function (err, users) {
        async.each(users, function (user, callback) {
            console.log("running user " + user.email);
            Users.findOneAndUpdate({
                    '_id': user._id
                },
                {
                    $set: {
                        wave: wave+1
                    }
                },
                {
                    new: true
                }, function (err, user) {
                    console.log("user " + user.email + "has been postponed");
                });

            callback()
        })
    });
};

var notConfirmed = function (wave) {
    Users.find({'wave': wave, 'status.admitted':true, 'status.declined':false, 'status.confirmed': false}).exec(function (err, data) {
        async.each(data, function (user, callback) {
            console.log("running user" + user.email);
            Users.findOneAndUpdate({
                    '_id': user._id
                },
                {
                    $set: {
                        'status.admitted': false
                    }
                },
                {
                    new: true
                }, callback);

            UserController.advanceWaitlist();
        })
    })
}

var waveA = function () {
    acceptPart(1);
};

var waveB = function () {
    acceptPart(2);
};

var waveC = function () {
    acceptPart(3);
};

var waveD = function () {
    acceptPart(4);
};

var confirmA = function () {
    notConfirmed(1);
};

var confirmB = function () {
    notConfirmed(2);
};

var confirmC = function () {
    notConfirmed(3);
};

var confirmD = function () {
    notConfirmed(4);
};

var waveSend = {};

waveSend.engageTimers = function(c) {
  var waveAccept = [waveA, waveB, waveC, waveD];
  var expireConfirm = [confirmA, confirmB, confirmC, confirmD];
  const params = ['1', '2', '3', '4'];

  if (c) {
      params.forEach(function (param, i) {
          console.log(i);
          Settings.findOne({}).exec(function (err, setting) {
              console.log("Setting up timers for wave " + param);

              var accept = schedule.scheduledJobs[param];
              var confirm = schedule.scheduledJobs["c" + param];

              accept.reschedule(new Date(setting['wave' + param].timeClose + 604800000));
              confirm.reschedule(new Date(setting['wave' + param].timeConfirm));

              console.log(accept.nextInvocation());
              console.log(confirm.nextInvocation());
              console.log("Reschedule")
          })
      })
  } else {
      params.forEach(function (param, i) {
          console.log(i);
          Settings.findOne({}).exec(function (err, setting) {
              console.log("Setting up timers for wave " + param);

              console.log(setting['wave' + param].timeClose + " ", Date.now());

              schedule.scheduleJob(param, new Date(setting['wave' + param].timeClose + 604800000), waveAccept[parseInt(param)-1]);
              schedule.scheduleJob("c" + param, new Date(setting['wave' + param].timeConfirm), expireConfirm[parseInt(param)-1]);

              console.log("Schedule")
          })
      })
  }
};

waveSend.engageTimers();

module.exports = waveSend;