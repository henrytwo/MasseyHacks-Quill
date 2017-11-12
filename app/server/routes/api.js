var UserController = require('../controllers/UserController');
var SettingsController = require('../controllers/SettingsController');

var aws = require('aws-sdk');
var request = require('request');
var multer = require('multer');
var multerS3 = require('multer-s3');
var sanitize = require('mongo-sanitize');

var s3 = new aws.S3();
/*
var storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})*/
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'junction-2017-tr-receipts',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function(req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function(req,file,cb) {
      cb(null, file.originalname)
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      req.fileValidationError = 'File not pdf';
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2000000 }

 }).single('file');

module.exports = function(router) {

  function getToken(req){
    return req.headers['x-access-token'];
  }

  /**
   * Using the access token provided, check to make sure that
   * you are, indeed, an admin.
   */
  function isAdmin(req, res, next){

    var token = getToken(req);

    UserController.getByToken(token, function(err, user){

      if (err) {
        return res.status(500).send(err);
      }

      if (user && user.admin){
        req.user = user;
        return next();
      }

      return res.status(401).send({
        message: 'Get outta here, punk!'
      });

    });
  }

  /**
   * [Users API Only]
   *
   * Check that the id param matches the id encoded in the
   * access token provided.
   *
   * That, or you're the admin, so you can do whatever you
   * want I suppose!
   */
  function isOwnerOrAdmin(req, res, next){
    var token = getToken(req);
    var userId = req.params.id;

    UserController.getByToken(token, function(err, user){

      if (err || !user) {
        return res.status(500).send(err);
      }

      if (user._id == userId || user.admin){
        return next();
      }
      return res.status(400).send({
        message: 'Token does not match user id.'
      });
    });
  }

  /**
   * Default response to send an error and the data.
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  function defaultResponse(req, res){
    return function(err, data){
      if (err){
        // SLACK ALERT!
        if (process.env.NODE_ENV === 'production'){
          request
            .post(process.env.SLACK_HOOK,
              {
                form: {
                  payload: JSON.stringify({
                    "text":
                    "``` \n" +
                    "Request: \n " +
                    req.method + ' ' + req.url +
                    "\n ------------------------------------ \n" +
                    "Body: \n " +
                    JSON.stringify(req.body, null, 2) +
                    "\n ------------------------------------ \n" +
                    "\nError:\n" +
                    JSON.stringify(err, null, 2) +
                    "``` \n"
                  })
                }
              },
              function (error, response, body) {
                return res.status(500).send({
                  message: "Your error has been recorded, we'll get right on it!"
                });
              }
            );
        } else {
          return res.status(500).send(err);
        }
      } else {
        return res.json(data);
      }
    };
  }

  /**
   *  API!
   */

   /**
   * FILE UPLOAD
   */
   router.post('/upload', function(req, res) {
     var token = getToken(req);
     
     UserController.getByToken(token, function(err, user){

       if (err) {
         return res.sendStatus(500);
       }

       if (user){

        if(!user.status.confirmed || !user.profile.needsReimbursement || (user.profile.AcceptedReimbursementClass === 'Rejected')){
          return res.sendStatus(403);
        }

        upload(req, res, function(err) {
          console.log("UPLOADING!")
          if(req.fileValidationError){
            return res.sendStatus(400, "The file format is not pdf.");
          }
          if(err){
            if(err.code === 'LIMIT_FILE_SIZE'){
              return res.sendStatus(413);
            }
            return res.sendStatus(400);
          }
          return res.sendStatus(200);
        });
      }
     });

   });


   router.get('/search/school/', function(req, res) {
     var results = [];
     results.push({
       "name": 'Type in your school',
       "id": 'Undefined school'
     });
     var response = {
       'results': results
     };
     return res.json(response);
   });


   // School search
   router.get('/search/school/:query', function(req, res) {
     var params = sanitize(req.params);
     var query = params.query;
     query = query.replace(/[!@#$<>%^*()]/g, "");
     SettingsController.getSchools(function(err, schools) {
       if (err) {
         res.sendStatus(500);
       }
       var results = [];
       var i = 0;
       while (i < schools.length) {
         var school = schools[i];
         if (school.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
           results.push({
             "name": school,
             "id": school
           });
         }
         if (results.length > 50) {
           break;
         }
         i++;
       }
       if (results.length === 0) {
         results.push({
           "name": query,
           "id": query
         });
       }

       var data = {
         "results": results
       };

       return res.json(data);
     });
   });


  // ---------------------------------------------
  // Users
  // ---------------------------------------------

  /**
   * [ADMIN ONLY]
   *
   * GET - Get all users, or a page at a time.
   * ex. Paginate with ?page=0&size=100
   */
  router.get('/users', isAdmin, function(req, res){
    var query = req.query;

    if (query.page && query.size && query.sort){

      UserController.getPage(query, defaultResponse(req, res));

    } else {

      UserController.getAll(defaultResponse(req, res));

    }
  });

  /**
   * [ADMIN ONLY]
   */
  router.get('/users/stats', isAdmin, function(req, res){
    UserController.getStats(defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * GET - Get a specific user.
   */
  router.get('/users/:id', isOwnerOrAdmin, function(req, res){
    UserController.getById(req.params.id, defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's profile.
   */

  router.put('/users/:id/profile', isOwnerOrAdmin, function(req, res){
    var profile = sanitize(req.body.profile);
    var id = req.params.id;

    UserController.updateProfileById(id, profile , defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's matchmaking profile.
   */
  router.put('/users/:id/matchmaking', isOwnerOrAdmin, function(req, res){
    var profile = sanitize(req.body.profile);
    var id = req.params.id;

    UserController.updateMatchmakingProfileById(id, profile , defaultResponse(req, res));
  });

  /* GET - Update enrolled teams table for enrolled individual */

  router.get('/matchmaking/data', function(req, res){
    var token = getToken(req);

    UserController.getByToken(token, function(err, user){

      if (err) {
        return res.status(500).send(err);
      }

      if (user){
        
        return UserController.getMatchmaking(user, defaultResponse(req, res));
        
      }

      return res.status(401).send({
        message: 'Get outta here, punk!'
      });

    });
  })

  /* PUT - Exit matchmaking search as team / individual */

  router.put('/matchmaking/exitSearch', function(req, res){
    var token = getToken(req);
    UserController.getByToken(token, function(err, user){
      
            if (err) {
              return res.status(500).send(err);
            }
      
            if (user){
              if(user.teamMatchmaking.enrolled){
                return UserController.exitSearch(user, defaultResponse(req, res));
              }
            }
      
            return res.status(401).send({
              message: 'Get outta here, punk!'
            });
      
          });
  })

  /* GET - Get user's team status */

  router.get('/matchmaking/teamInSearch', function(req, res){
    var token = getToken(req);
    UserController.getByToken(token, function(err, user){
      
            if (err) {
              return res.status(500).send(err);
            }
      
            if (user){

              return UserController.teamInSearch(user, defaultResponse(req, res));
              
            }
      
            return res.status(401).send({
              message: 'Get outta here, punk!'
            });
      
          });
  })

  /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's confirmation information.
   */
  router.put('/users/:id/confirm', isOwnerOrAdmin, function(req, res){
    var confirmation = sanitize(req.body.confirmation);
    var id = req.params.id;

    UserController.updateConfirmationById(id, confirmation, defaultResponse(req, res));
  });

  router.put('/users/:id/reimbursement', isOwnerOrAdmin, function(req, res){
    var reimbursement = sanitize(req.body.reimbursement);
    var id = req.params.id;

    UserController.updateReimbursementById(id, reimbursement, defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * POST - Decline an acceptance.
   */
  router.post('/users/:id/decline', isOwnerOrAdmin, function(req, res){
    var confirmation = req.body.confirmation;
    var id = req.params.id;

    UserController.declineById(id, defaultResponse(req, res));
  });

  /**
   * Get a user's team member's names. Uses the code associated
   * with the user making the request.
   */
  router.get('/users/:id/team', isOwnerOrAdmin, function(req, res){
    var id = req.params.id;
    UserController.getTeammates(id, defaultResponse(req, res));
  });

  /**
   * Update a teamcode. Join/Create a team here.
   * {
   *   code: STRING
   * }
   */
  router.put('/users/:id/team', isOwnerOrAdmin, function(req, res){
    var code = sanitize(req.body.code);
    var id = req.params.id;

    UserController.createOrJoinTeam(id, code, defaultResponse(req, res));

  });

  /**
   * Remove a user from a team.
   */
  router.delete('/users/:id/team', isOwnerOrAdmin, function(req, res){
    var id = req.params.id;

    UserController.leaveTeam(id, defaultResponse(req, res));
  });

  /**
   * Update a user's password.
   * {
   *   oldPassword: STRING,
   *   newPassword: STRING
   * }
   */
  router.put('/users/:id/password', isOwnerOrAdmin, function(req, res){
    return res.status(304).send();
    // Currently disable.
    // var id = req.params.id;
    // var old = req.body.oldPassword;
    // var pass = req.body.newPassword;

    // UserController.changePassword(id, old, pass, function(err, user){
    //   if (err || !user){
    //     return res.status(400).send(err);
    //   }
    //   return res.json(user);
    // });
  });

  /**
   * Admit a user. ADMIN ONLY, DUH
   *
   * Also attaches the user who did the admitting, for liabaility.
   */
  router.post('/users/:id/admit', isAdmin, function(req, res){
    // Accept the hacker. Admin only
    var id = req.params.id;
    var reimbClass = req.body.reimbClass;
    var user = req.user;
    UserController.admitUser(id, user, reimbClass, defaultResponse(req, res));
  });

  /**
   * [ADMIN]
   *
   * POST - Reject participant.
   */
  router.post('/users/:id/reject', isAdmin, function(req, res){
    var confirmation = req.body.confirmation;
    var id = req.params.id;

    UserController.rejectById(id, defaultResponse(req, res));
  });

   /**
   * [ADMIN]
   *
   * POST - Unreject participant.
   */
  router.post('/users/:id/unreject', isAdmin, function(req, res){
    var confirmation = req.body.confirmation;
    var id = req.params.id;

    UserController.unRejectById(id, defaultResponse(req, res));
  });

  /**
   * Check in a user. ADMIN ONLY, DUH
   */
  router.post('/users/:id/checkin', isAdmin, function(req, res){
    var id = req.params.id;
    var user = req.user;
    UserController.checkInById(id, user, defaultResponse(req, res));
  });

  /**
   * Check in a user. ADMIN ONLY, DUH
   */
  router.post('/users/:id/checkout', isAdmin, function(req, res){
    var id = req.params.id;
    var user = req.user;
    UserController.checkOutById(id, user, defaultResponse(req, res));
  });


  // ---------------------------------------------
  // Settings [ADMIN ONLY!]
  // ---------------------------------------------

  /**
   * Get the public settings.
   * res: {
   *   timeOpen: Number,
   *   timeClose: Number,
   *   timeToConfirm: Number,
   *   acceptanceText: String,
   *   confirmationText: String
   * }
   */
  router.get('/settings', function(req, res){
    SettingsController.getPublicSettings(defaultResponse(req, res));
  });

  /**
   * Update the acceptance text.
   * body: {
   *   text: String
   * }
   */
  router.put('/settings/waitlist', isAdmin, function(req, res){
    var text = req.body.text;
    SettingsController.updateField('waitlistText', text, defaultResponse(req, res));
  });

  /**
   * Update the acceptance text.
   * body: {
   *   text: String
   * }
   */
  router.put('/settings/acceptance', isAdmin, function(req, res){
    var text = req.body.text;
    SettingsController.updateField('acceptanceText', text, defaultResponse(req, res));
  });

  router.put('/settings/addschool', function(req, res){
    var body = sanitize(req.body);
    var school = body.school;
    if (!school) {
      res.sendStatus(400, "School is null");
    }
    school = school.replace(/[!@#$<>%^*()]/g, "");
    SettingsController.addSchool(school, defaultResponse(req, res));
  });

  /**
   * Update the confirmation text.
   * body: {
   *   text: String
   * }
   */
  router.put('/settings/confirmation', isAdmin, function(req, res){
    var text = req.body.text;
    SettingsController.updateField('confirmationText', text, defaultResponse(req, res));
  });

  /**
   * Update the confirmation date.
   * body: {
   *   time: Number
   * }
   */
  router.put('/settings/confirm-by', isAdmin, function(req, res){
    var time = req.body.time;
    SettingsController.updateField('timeConfirm', time, defaultResponse(req, res));
  });

  /**
   * Set the registration open and close times.
   * body : {
   *   timeOpen: Number,
   *   timeClose: Number
   * }
   */
  router.put('/settings/times', isAdmin, function(req, res){
    var open = req.body.timeOpen;
    var close = req.body.timeClose;
    SettingsController.updateRegistrationTimes(open, close, defaultResponse(req, res));
  });

  /**
   * Get the whitelisted emails.
   *
   * res: {
   *   emails: [String]
   * }
   */
  router.get('/settings/whitelist', isAdmin, function(req, res){
    SettingsController.getWhitelistedEmails(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   emails: [String]
   * }
   * res: Settings
   *
   */
  router.put('/settings/whitelist', isAdmin, function(req, res){
    var emails = req.body.emails;
    SettingsController.updateWhitelistedEmails(emails, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   reimbClasses: Object
   * }
   * res: Settings
   *
   */
  router.put('/settings/reimbClasses', isAdmin, function(req, res){
    var reimbClasses = req.body.reimbClasses;
    SettingsController.updateReimbClasses(reimbClasses, defaultResponse(req, res));
  });
};
