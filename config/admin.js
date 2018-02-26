const fs = require('fs');
var admins = JSON.parse(fs.readFileSync('config/data/admin.json', 'utf8'));

// Create a default admin user.
var User = require('../app/server/models/User');
var Mailer = require('../app/server/services/email');

for(var key in admins) {

    admin_email    = admins[key]['email'];
    admin_name     = admins[key]['name'];
    admin_nickname = key + " [ADMIN]";
    admin_password = "pineapple";//"JerrBear37485" + admin_nickname;
    admin_reviewer = admins[key]['reviewer'];
    admin_developer = admins[key]['developer'];


    console.log("Adding: " + admin_email);

    makeadmin(admin_email, admin_name, admin_nickname, admin_password, admin_reviewer, admin_developer);
}

function makeadmin(admin_email, admin_name, admin_nickname, admin_password, admin_reviewer, admin_developer) {
    User
        .findOneByEmail(admin_email)
        .exec(function (err, user) {
            if (!user) {
                var u = new User();
                console.log(u);
                u.email = admin_email;
                u.nickname = admin_nickname;
                u.profile.name = admin_name;
                u.password = User.generateHash(admin_password);
                u.admin = true;
                u.volunteer = true;
                u.reviewer = admin_reviewer;
                u.developer = admin_developer;
                u.id = admin_nickname;
                u.verified = true;
                u.status.admittedBy = "MasseyHacks Account Authority";
                u.profile.submittedApplication = true;
                u.status.admitted = true;
                u.status.confirmed = true;
                u.status.statusReleased = true;

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