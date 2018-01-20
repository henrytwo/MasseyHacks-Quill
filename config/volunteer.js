const fs = require('fs');
var volunteers = JSON.parse(fs.readFileSync('config/data/volunteer.json', 'utf8'));

// Create a default volunteer user.
var User = require('../app/server/models/User');
var Mailer = require('../app/server/services/email');

for(var key in volunteers) {

    volunteer_email    = volunteers[key]['email'];
    volunteer_name     = volunteers[key]['name'];
    volunteer_nickname = key + " [VOLUNTEER]";
    volunteer_password = "JerrBear37485" + volunteer_nickname;

    console.log("Adding: " + volunteer_email);

    makevolunteer(volunteer_email, volunteer_name, volunteer_nickname, volunteer_password);
}

function makevolunteer(volunteer_email, volunteer_name, volunteer_nickname, volunteer_password) {
    User
        .findOneByEmail(volunteer_email)
        .exec(function (err, user) {
            if (!user) {
                var u = new User();
                console.log(u);
                u.email = volunteer_email;
                u.nickname = volunteer_nickname;
                u.name = volunteer_name;
                u.password = User.generateHash(volunteer_password);
                u.volunteer = true;
                u.id = volunteer_nickname;
                u.verified = true;
                u.status.admittedBy = "ourLordKeith@keith.com";
                u.submittedApplication = true;
                u.status.admitted = true;
                u.status.confirmed = true;

                var token = u.generateTempAuthToken();
                var callback = '';
                Mailer.sendPasswordResetEmail(u, token, callback);

                console.log(callback);

                u.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
}