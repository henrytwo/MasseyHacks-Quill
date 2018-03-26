require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database);

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var shuffleSeed = require('shuffle-seed');
var programmingLanguages = shuffleSeed.shuffle(require('../app/server/assets/programming_languages.json'), process.env.JWT_SECRET);

function generateID(i){
    //var l = programmingLanguages.length;

    var l = 1000000;
    //100^3 and this v number don't share any common determinators, so the modulo will produce same results only every million participants
    var num = i * 85766121 % l; //7^6 * 3^6
    return programmingLanguages[Math.floor(num / 10000) % 100] + "-" +
        programmingLanguages[Math.floor(num / 100) % 100] + "-" +
        programmingLanguages[num % 100];
}

User.find().exec(function (err, users) {
    for (var i = 0; i < users.length; i++) {
        (function() {
            var usr = users[i];

            if (usr.id.split(" ").length === 1) {
                Settings.findOneAndUpdate({}, {$inc: {accumulator: -1}}, function (err, settings) {
                    User.findOneAndUpdate({
                            email: usr.email
                        },
                        {
                            $set: {
                                id: generateID(settings.accumulator)
                            }
                        },
                        {
                            new: true
                        },
                        function (a, b) {
                            if(a) {
                                console.log(a);
                            }
                            console.log("Updated user " + b.email + " with " + b.id)
                        });
                })
            }
        }) ();
    }
});
