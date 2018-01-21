var Settings = require('../app/server/models/Settings');
var fs = require('fs');

Settings
  .findOne({})
  .exec(function(err, settings){
    if (err) {
      throw err;
    }
    if (!settings){
      var settings = new Settings();
      settings.save();
      console.log('Created new settings!');
    }
  });


fs.readFile('./config/schools.txt', 'utf8', function(err, data) {
  if (err) throw err;
  // Process data
  schoolsList = data.split('\n');

  console.log(schoolsList);

  Settings
  .findOneAndUpdate({},{
    $addToSet: { schools: {$each: schoolsList} }
  }, {new: true}, function(err) {
    console.log(err);
  });
});
