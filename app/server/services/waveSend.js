var schedule = require('node-schedule');
var Settings = require('../models/Settings');
var Users = require('../models/User');
var UserController = require('../controllers/UserController');
var mailer = require('../services/email');
var async = require('async');

setInterval(function() {
    confirmationCheck();
}, 86400000);

var confirmationCheck = function() {
    Users.find({'status.admitted': true, 'status.declined':false, 'status.confirmed':false, 'status.noConfirmation':false}).exec(function(err, users){

        console.log(users);
        for (var i = 0; i < users.length; i++) {
            if (users[i].status.confirmBy < Date.now()) {
                Users.findOneAndUpdate({
                        '_id': users[i]._id
                    },
                    {
                        $set: {
                            'status.noConfirmation':true
                        }
                    }, {
                        new: true
                    },
                    function(err, user) {
                        console.log("Rejecting user " + user.email + " due to expired confirmation");
                    });
            }
        }
        UserController.advanceWaitlist();
    });
};

confirmationCheck();

var ad = function (err, user) {
    if (err) {
        console.log("Error when processing user:" + user.email);
    } else {
        console.log(user.status.admitted);
        console.log(user.email + "Admitted");
        mailer.sendAdmittanceEmail(user)
    }
};

var acceptPart = function (wave) {
    console.log("running Wave "+wave);
    Settings.findOne({}).exec(function(err, setting) {
        Users.find({'wave': wave, 'status.admitted':true, 'status.statusReleased': false}).exec(function (err, data) {
            async.each(data, function (user, callback) {
                console.log("admitting user " + user.email);
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

    if (wave !== 4) {
        Users.find({'wave': wave, 'status.rejected':true, 'status.statusReleased': false}).exec(function (err, data) {
            async.each(data, function (user, callback) {
                console.log("reject/pushback user " + user.email);
                Users.findOneAndUpdate({
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

        Users.find({'status.completedProfile': false}).exec(function (err, usrs) {

            if (wave !== 4) {
                mailer.sendLaggerEmails(usrs);
            }

            Users.find({
                'wave': wave,
                'status.admitted': false,
                'status.rejected': false,
                'status.waitlisted': false
            }).exec(function (err, users) {
                async.each(users, function (user, callback) {
                    console.log("running user " + user.email);
                    Users.findOneAndUpdate({
                            '_id': user._id
                        },
                        {
                            $set: {
                                wave: wave + 1
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
        });
    }
};

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

var waveSend = {};

waveSend.engageTimers = function(c) {
  var waveAccept = [waveA, waveB, waveC, waveD];
  const params = ['1', '2', '3', '4'];

  if (c) {
      params.forEach(function (param, i) {
          console.log(i);
          Settings.findOne({}).exec(function (err, setting) {
              console.log("Setting up timers for wave " + param);

              var accept = schedule.scheduledJobs[param];

              console.log(setting['wave' + param].timeSend);

              accept.reschedule(new Date(setting['wave' + param].timeSend));

              console.log(accept.nextInvocation());
              console.log("Reschedule")
          })
      })
  } else {
      params.forEach(function (param, i) {
          console.log(i);
          Settings.findOne({}).exec(function (err, setting) {
              console.log("Setting up timers for wave " + param);

              console.log(setting['wave' + param].timeClose + " ", Date.now());

              schedule.scheduleJob(param, new Date(setting['wave' + param].timeSend), waveAccept[parseInt(param)-1]);

              console.log("Schedule");
          })
      })
  }
};

waveSend.engageTimers();

module.exports = waveSend;
