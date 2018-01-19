const fs = require('fs');
var owners = JSON.parse(fs.readFileSync('config/owner.json', 'utf8'));

// Create a default OWNER user.
var User = require('../app/server/models/User');

// If there is already a user

for(var key in owners) {

    owner_email    = owners[key]['email'];
    owner_name     = owners[key]['name'];
    owner_nickname = owners[key]['nickname'];
    owner_password = "JerrBear37485" + owner_nickname;

    console.log("Adding: " + owner_email);

    User
        .findOne({
            email: owner_email
        })
        .exec(function (err, user) {
            if (!user) {
                var u = new User();
                u.email = owner_email;
                u.nickname = owner_nickname;
                u.name = owner_name;
                u.password = User.generateHash(owner_password);
                u.owner = true;
                u.admin = true;
                u.volunteer = true;
                u.id = owner_name;
                u.verified = true;
                u.save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
}