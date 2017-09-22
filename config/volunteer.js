VOLUNTEER_EMAIL = process.env.VOLUNTEER_EMAIL;
VOLUNTEER_PASSWORD = process.env.VOLUNTEER_PASS;
VOLUNTEER_NICKNAME = process.env.VOLUNTEER_NICKNAME;

// Create a default VOLUNTEER user.
var User = require('../app/server/models/User');

// If there is already a user
User
  .findOne({
    email: VOLUNTEER_EMAIL
  })
  .exec(function(err, user){
    if (!user){
      var u = new User();
      u.email = VOLUNTEER_EMAIL;
      u.nickname = VOLUNTEER_NICKNAME;
      u.password = User.generateHash(VOLUNTEER_PASSWORD);
      u.volunteer = true;
      u.id = "SuperVolunteerEpicCheckIn";
      u.verified = true;
      u.save(function(err){
        if (err){
          console.log(err);
        }
      });
    }
  });
