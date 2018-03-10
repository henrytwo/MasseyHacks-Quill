var path = require('path');
var moment = require('moment');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var Settings = require('../models/Settings');

var templatesDir = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');

var ROOT_URL = process.env.ROOT_URL;

var EMAIL_HOST = process.env.EMAIL_HOST;
var EMAIL_USER = process.env.EMAIL_USER;
var EMAIL_PASS = process.env.EMAIL_PASS;
var EMAIL_PORT = process.env.EMAIL_PORT;
var EMAIL_CONTACT = process.env.EMAIL_CONTACT;
var EMAIL_HEADER_IMAGE = process.env.EMAIL_HEADER_IMAGE;

if(EMAIL_HEADER_IMAGE.indexOf("https") == -1){
  EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}

var NODE_ENV = process.env.NODE_ENV;

var options = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
};

var transporter = nodemailer.createTransport(smtpTransport(options));

var controller = {};
var settings = null;

Settings
  .getPublicSettings(function(err, publicSettings){
     if (err){
      throw err;
    }
    settings = publicSettings;
});

controller.transporter = transporter;

function formatTime(time){

    if (!time){
        return "Invalid Date";
    }

    date = new Date(time);
    // Hack for timezone
    return moment(date).format('dddd, MMMM Do YYYY, h:mm a') +
        " " + date.toTimeString().split(' ')[2];

}

function sendOne(templateName, options, data, callback){

  if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  }

  emailTemplates(templatesDir, function(err, template){
    if (err) {
      return callback(err);
    }

    data.emailHeaderImage = EMAIL_HEADER_IMAGE;
    template(templateName, data, function(err, html, text){
      if (err) {
        console.log('error')
        return callback(err);
      }

      transporter.sendMail({
        from: EMAIL_CONTACT,
        to: options.to,
        subject: options.subject,
        html: html,
        text: text
      }, function(err, info){
        if(callback){
          callback(err, info);
        }
      });
    });
  });
}

controller.sendLaggerEmails = function(users, callback) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var options = {
      to: user.email,
      subject: "[MasseyHacks IV] - We are still waiting for your application!"
    };

    var locals = {
      nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
      dashUrl: ROOT_URL
    };

    console.log('Sending lagger email to address ' + user.email);
    sendOne('email-lagger', options, locals, function(err, info){
      if (err){
        console.log(err);
      }
      if (info){
        console.log(info.message);
      }
      if (callback){
        callback(err, info);
      }
    });
  }
}

controller.sendRejectEmails = function(users, callback) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var options = {
      to: user.email,
      subject: "[MasseyHacks IV] - Final decisions for MasseyHacks IV"
    };

    var locals = {
      nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
      dashUrl: ROOT_URL
    };

    console.log('Sending reject email to address ' + user.email);
    sendOne('email-reject', options, locals, function(err, info){
      if (err){
        console.log(err);
      }
      if (info){
        console.log(info.message);
      }
      if (callback){
        callback(err, info);
      }
    });
  }
}

/*controller.sendQREmails = function(users, callback) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var options = {
      to: user.email,
      subject: "[MasseyHacks IV] - Final decisions for MasseyHacks IV!"
    };

    var locals = {
      nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
      dashUrl: ROOT_URL,
      qr: ''
    };

    getQRCode = function(id){
      
      $http.get('/api/qr/' + id)
      .then(function(response){
        locals.qr = response.data;
      });
    }

    getQRCode(user.id);



    console.log('Sending reject email to address ' + user.email);
    sendOne('email-qr', options, locals, function(err, info){
      if (err){
        console.log(err);
      }
      if (info){
        console.log(info.message);
      }
      if (callback){
        callback(err, info);
      }
    });
  }
}*/

controller.sendApplicationEmail = function(user, callback) {
  var options = {
    to: user.email,
    subject: "[MasseyHacks IV] - We have received your application!"
  };

  var locals = {
    nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
    dashUrl: ROOT_URL
  };

  sendOne('email-application', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });
}

/*
* Send a status update email for admittance.
* @param  {[type]}   email    [description]
* @param  {Function} callback [description]
* @return {[type]}            [description]
*/
controller.sendAdmittanceEmail = function(user, callback) {

 var options = {
   to: user.email,
   subject: "[MasseyHacks IV] - You have been admitted!"
 };

 var locals = {
   nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
   dashUrl: ROOT_URL,
   confirmBy: formatTime(user.status.confirmBy)
 };

 sendOne('email-admittance', options, locals, function(err, info){
   if (err){
     console.log(err);
   }
   if (info){
     console.log(info.message);
   }
   if (callback){
     callback(err, info);
   }
 });
};

/**
* Send a status update email for submission.
* @param  {[type]}   email    [description]
* @param  {[type]}   token    [description]
* @param  {Function} callback [description]
* @return {[type]}            [description]
*/
controller.sendConfirmationEmail = function(user, token, callback) {

 var options = {
   to: user.email,
   subject: "[MasseyHacks IV] - You are confirmed!"
 };

 var locals = {
   nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
   userId: user.id,
   dashUrl: ROOT_URL,
 };
 sendOne('email-confirmation', options, locals, function(err, info){
   if (err){
     console.log(err);
   }
   if (info){
     console.log(info.message);
   }
   if (callback){
     callback(err, info);
   }
 });
};

/**
* Send email if user declines invitation
* @param  {[type]}   email    [description]
* @param  {[type]}   token    [description]
* @param  {Function} callback [description]
* @return {[type]}            [description]
*/

// TODO: Change the email
controller.sendDeclinedEmail = function(user, token, callback) {

 var options = {
   to: user.email,
   subject: "[MasseyHacks IV] - You have declined your invitation"
 };

 var locals = {
   nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
 };


 sendOne('email-decline', options, locals, function(err, info){
   if (err){
     console.log(err);
   }
   if (info){
     console.log(info.message);
   }
   if (callback){
     callback(err, info);
   }
 });
};


/**
 * Send a verification email to a user, with a verification token to enter.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
controller.sendVerificationEmail = function(user, token, callback) {

  var options = {
    to: user.email,
    subject: "[MasseyHacks IV] - Verify your email"
  };

  var locals = {
    verifyUrl: ROOT_URL + '/verify/' + token,
    nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname
  };

  console.log(locals.verifyUrl);

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-verify', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });
};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordResetEmail = function(user, token, callback) {

  var options = {
    to: user.email,
    subject: "[MasseyHacks IV] - Password reset requested!"
  };

  var locals = {
    actionUrl: ROOT_URL + '/reset/' + token,
    nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-password-reset', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordChangedEmail = function(user, callback){

  var options = {
    to: user.email,
    subject: "[MasseyHacks IV] - Your password has been changed!"
  };

  var locals = {
    nickname: (user.profile.name != null && user.profile.firstname != null && user.profile.firstname.length > 0 && user.profile.name.length > 0) ? user.profile.firstname : user.nickname,
    dashUrl: ROOT_URL
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-password-changed', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

module.exports = controller;
