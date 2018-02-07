var mongoose = require('mongoose');
var validator = require('validator');

/**
 * Settings Schema!
 *
 * Fields with select: false are not public.
 * These can be retrieved in controller methods.
 *
 * @type {mongoose}
 */
var wave1 = {
    timeOpen: {
        type: Number,
        default: 0
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000 // Add a year from now.
    },
    timeConfirm: {
        type: Number,
        default: 604800000 // Date of confirmation
    }
};

var wave2 = {
    timeOpen: {
        type: Number,
        default: 0
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000 // Add a year from now.
    },
    timeConfirm: {
        type: Number,
        default: 604800000 // Date of confirmation
    }
};

var wave3 = {
    timeOpen: {
        type: Number,
        default: 0
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000 // Add a year from now.
    },
    timeConfirm: {
        type: Number,
        default: 604800000 // Date of confirmation
    }
};

var wave4 = {
    timeOpen: {
        type: Number,
        default: 0
    },
    timeClose: {
        type: Number,
        default: Date.now() + 31104000000 // Add a year from now.
    },
    timeConfirm: {
        type: Number,
        default: 604800000 // Date of confirmation
    }
};

var schema = new mongoose.Schema({
  status: String,
  timeOpen: {
    type: Number,
    default: 0
  },
  timeClose: {
    type: Number,
    default: Date.now() + 31104000000 // Add a year from now.
  },
  timeConfirm: {
    type: Number,
    default: 604800000 // Date of confirmation
  },
  waitlistText: {
    type: String
  },
  acceptanceText: {
    type: String,
  },
  confirmationText: {
    type: String
  },
  schools: {
    type: [String]
  },
  wave1: wave1,
  wave2: wave2,
  wave3: wave3,
  wave4: wave4,
  participants : {
    type: Number,
    default: 300
  }
});

/**
 * Get the list of whitelisted emails.
 * Whitelist emails are by default not included in settings.
 * @param  {Function} callback args(err, emails)
 */
schema.statics.getWhitelistedEmails = function(callback){
  this
    .findOne({})
    .select('whitelistedEmails')
    .exec(function(err, settings){
      return callback(err, settings.whitelistedEmails);
    });
};

schema.statics.getSchools = function(callback){
  this
    .findOne({})
    .exec(function(err, settings){
      return callback(err, settings.schools);
    });
};

/**
 * Get the open and close time for registration.
 * @param  {Function} callback args(err, times : {timeOpen, timeClose, timeConfirm})
 */
schema.statics.getRegistrationTimes = function(callback){
  this
    .findOne({})
    .select('timeOpen timeClose timeConfirm timeTR')
    .exec(function(err, settings){
      callback(err, {
        timeOpen: settings.timeOpen,
        timeClose: settings.timeClose,
        timeConfirm: settings.timeConfirm,
        timeTR: settings.timeTR
      });
    });
};

schema.statics.getPublicSettings = function(callback){
  this
    .findOne({})
    .exec(callback);
};

schema.statics.getCurrentWave = function (callback) {
  this.findOne({})
    .exec(function(err, setting) {
      if (setting.wave1.timeClose >= Date.now()) {
        return callback(false,1);
      } else if (setting.wave2.timeClose >= Date.now()) {
        return callback(false,2);
      } else if (setting.wave3.timeClose >= Date.now()) {
        return callback(false,3);
      } else if (setting.wave4.timeClose >= Date.now()) {
        return callback(false,4);
      } else {
        return callback(false, 'inf');
      }
    });
}

module.exports = mongoose.model('Settings', schema);
