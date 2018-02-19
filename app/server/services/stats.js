var _ = require('underscore');
var async = require('async');
var User = require('../models/User');
var Settings = require('../models/Settings')

// In memory stats.
var stats = {};
function calculateStats(settings){
  console.log('Calculating stats...');
  var newStats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        M: 0,
        F: 0,
        O: 0,
        N: 0
      },
      tracks: {
        'HealthTech': 0,
        'Logistics': 0,
        'Entertainment': 0,
        'Mobility': 0,
        'Intelligent Buildings': 0,
        'Game Jam': 0,
        'FinTech': 0,
        'Industrial Internet': 0,
        'Artificial Intelligence': 0,
        'Big Data': 0
      },
      schools: {},
      grade: {
        '<=8': 0,
        '9': 0,
        '10': 0,
        '11': 0,
        '12': 0,
      }
    },

    teams: {},
    verified: 0,
    submitted: 0,
    admitted: 0,
    confirmed: 0,
    declined: 0,

    confirmedFemale: 0,
    confirmedMale: 0,
    confirmedOther: 0,
    confirmedNone: 0,

    shirtSizes: {
      'S': 0,
      'M': 0,
      'L': 0
    },

    dietaryRestrictions: {},

    checkedIn: 0
  };



  User
    .find({"admin": false,"owner":false,"volunteer":false})
    .exec(function(err, users){
      if (err || !users){
        throw err;
      }

      newStats.total = users.length;

      async.each(users, function(user, callback){

        // Grab the email extension
        var email = user.email.split('@')[1];

        // Add to the gender
        newStats.demo.gender[user.profile.gender] += 1;

        // Count verified
        newStats.verified += user.verified ? 1 : 0;

        // Count submitted
        newStats.submitted += user.status.completedProfile ? 1 : 0;

        // Count accepted
        newStats.admitted += user.status.admitted ? 1 : 0;

        // Count confirmed
        newStats.confirmed += user.status.confirmed ? 1 : 0;

        newStats.confirmedFemale += user.status.confirmed && user.profile.gender == "F" ? 1 : 0;
        newStats.confirmedMale += user.status.confirmed && user.profile.gender == "M" ? 1 : 0;
        newStats.confirmedOther += user.status.confirmed && user.profile.gender == "O" ? 1 : 0;
        newStats.confirmedNone += user.status.confirmed && user.profile.gender == "N" ? 1 : 0;

        // Count declined
        newStats.declined += user.status.declined ? 1 : 0;

        if (user.profile.grade){
          newStats.demo.grade[user.profile.grade] += 1;
        }

        // Grab the team name if there is one
        // if (user.teamCode && user.teamCode.length > 0){
        //   if (!newStats.teams[user.teamCode]){
        //     newStats.teams[user.teamCode] = [];
        //   }
        //   newStats.teams[user.teamCode].push(user.profile.name);
        // }

        // Count shirt sizes
        if (user.confirmation.shirtSize in newStats.shirtSizes){
          newStats.shirtSizes[user.confirmation.shirtSize] += 1;
        }

        // Dietary restrictions
        if (user.confirmation.dietaryRestrictions){
          user.confirmation.dietaryRestrictions.forEach(function(restriction){
            if (!newStats.dietaryRestrictions[restriction]){
              newStats.dietaryRestrictions[restriction] = 0;
            }
            newStats.dietaryRestrictions[restriction] += 1;
          });
        }

        // Count checked in
        newStats.checkedIn += user.status.checkedIn ? 1 : 0;

        callback(); // let async know we've finished
      }, function() {
        // Transform dietary restrictions into a series of objects
        var restrictions = [];
        _.keys(newStats.dietaryRestrictions)
          .forEach(function(key){
            restrictions.push({
              name: key,
              count: newStats.dietaryRestrictions[key],
            });
          });
        newStats.dietaryRestrictions = restrictions;

        // Transform schools into an array of objects
        var schools = [];
        _.keys(newStats.demo.schools)
          .forEach(function(key){
            schools.push({
              email: key,
              count: newStats.demo.schools[key].submitted,
              stats: newStats.demo.schools[key]
            });
          });
        newStats.demo.schools = schools;

        // Likewise, transform the teams into an array of objects
        // var teams = [];
        // _.keys(newStats.teams)
        //   .forEach(function(key){
        //     teams.push({
        //       name: key,
        //       users: newStats.teams[key]
        //     });
        //   });
        // newStats.teams = teams;

        console.log('Stats updated!');
        newStats.lastUpdated = new Date();
        stats = newStats;
      });
    });

}

setInterval(function() {
  Settings
    .getPublicSettings(function(err, settings){
       if (err || !settings){
        throw err;
      }
      calculateStats(settings);
  });
}, 600000);


var Stats = {};

Stats.getUserStats = function(){
  return stats;
};

module.exports = Stats;
