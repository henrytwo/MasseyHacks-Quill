const fs = require('fs');
var humans = JSON.parse(fs.readFileSync('config/data/human.json', 'utf8'));

// Create a default human user.
var User = require('../app/server/models/User');
var Mailer = require('../app/server/services/email');

for(var i = 1; i < 400; i++) {

    human_email    = i.toString() + '@rastera.xyz';
    human_name     = 'User ' + i.toString();
    human_nickname = 'User ' + i.toString();
    human_password = "pineapple";

    console.log("Adding: " + human_email);

    if (i <= 100) {
        wave = 1;
    }

    else if (i <= 200) {
        wave = 2;
    }

    else if (i <= 300) {
        wave = 3;
    }

    else {
        wave = 4;
    }



    makehuman(human_email, human_name, human_nickname, human_password, wave);
}

function makehuman(human_email, human_name, human_nickname, human_password, wave) {
    User
        .findOneByEmail(human_email)
        .exec(function (err, user) {
            if (!user) {
                var u = new User();
                console.log(u);
                u.email = human_email;
                u.nickname = human_nickname;
                u.profile.name = human_name;
                u.password = User.generateHash(human_password);
                u.id = human_nickname;
                u.verified = true;
                //u.status.admittedBy = "MasseyHacks Account Authority";
                u.profile.submittedApplication = true;
                u.status.completedProfile = true;
                //u.status.statusReleased = true;
                u.wave = wave;

                var token = u.generateTempAuthToken();
                var callback = '';
                //Mailer.sendPasswordResetEmail(u, token, callback);

                console.log(callback);

                u.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
}