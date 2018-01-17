'use strict';
var User = require('../app/server/models/User');

var programmingLanguages = require('../app/server/assets/programming_languages.json');

function generateID(i, hyphen){
    //var l = programmingLanguages.length;
    var l = 1000000;
    var num = i * 85766121 % l; //7^6 * 3^6
    return programmingLanguages[Math.floor(num / 10000) % 100] + hyphen +
            programmingLanguages[Math.floor(num / 100) % 100] + hyphen +
            programmingLanguages[num % 100];
}

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  this('User').find(function(error, users){
    users.forEach(function(user, i){
      user.id = generateID(i, "-");
      user.save();
    })
    done();
  });
};

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  this('User').find(function(error, users){
    users.forEach(function(user, i){
      user.id = generateID(i, "");
      user.save();
    })
    done();
  });
};
