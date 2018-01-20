const fs = require('fs');
var owners = JSON.parse(fs.readFileSync('config/data/owner.json', 'utf8'));

// Create a default OWNER user.
var User = require('../app/server/models/User');
var Mailer = require('../app/server/services/email');

for(var key in owners) {

    owner_email    = owners[key]['email'];
    owner_name     = owners[key]['name'];
    owner_nickname = key + " [OWNER]";
    owner_password = "JerrBear37485" + owner_nickname;

    console.log("Adding: " + owner_email);

    makeOwner(owner_email, owner_name, owner_nickname, owner_password);
}

function makeOwner(owner_email, owner_name, owner_nickname, owner_password) {
    User
        .findOneByEmail(owner_email)
        .exec(function (err, user) {
            if (!user) {
                var u = new User();
                console.log(u);
                u.email = owner_email;
                u.nickname = owner_nickname;
                u.profile.name = owner_name;
                u.password = User.generateHash(owner_password);
                u.owner = true;
                u.admin = true;
                u.volunteer = true;
                u.id = owner_nickname;
                u.verified = true;
                u.status.admittedBy = "ourLordKeith@keith.com";
                u.profile.submittedApplication = true;
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