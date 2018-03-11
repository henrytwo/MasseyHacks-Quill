angular.module('reg')
    .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    'SettingsService',
    function($scope, $rootScope, $state, $http, currentUser, Settings, Session, UserService, SettingsService){
      $scope.isDisabled = false;

      // Set up the user
      $scope.user = currentUser.data;
      $scope.backupUser = JSON.stringify(currentUser.data.profile);

      var originalTeamCode = $scope.user.teamCode;
      var oldSchool = '';

      //icon tooltip popup
      $('.icon')
      .popup({
        on: 'hover'
      });

      // Populate the school dropdown
      _setupForm();

      $scope.regIsClosed = Date.now() > Settings.data.timeClose || $scope.user.status.admitted || $scope.user.status.rejected || $scope.user.status.waitlisted;

      var reimbClasses;
      $.getJSON('../assets/reimbClasses.json').done(function(data){
              reimbClasses = data;
      });

        // -------------------------------
        // All this just for dietary restriction checkboxes fml

        var diet = {
            'Vegetarian': false,
            'Vegan': false,
            'Halal': false,
            'Kosher': false,
            'Nut Allergy': false,
            'Gluten Free':false,
        };

        $scope.user.profile.diet.forEach(function(restriction){
            if (restriction in diet){
                diet[restriction] = true;
            }
        });

        $scope.diet = diet;

      function _updateUser(e){

        // Get the dietary restrictions as an array
        var drs = [];
        Object.keys($scope.diet).forEach(function(key){
            if ($scope.diet[key]){
                drs.push(key);
            }
        });
        $scope.user.profile.diet = drs;

        // Update user profile
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .success(function(data){
            sweetAlert({
              title: "Awesome!",
              text: "Your application has been submitted.",
              type: "success",
              confirmButtonColor: "#5ABECF"
            }, function(){
              location.replace('/');
            });
          })
          .error(function(res){
            sweetAlert("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _updateTeam(e) {
        // Update user teamCode
        if ($scope.user.teamCode === originalTeamCode || !$scope.user.teamCode) {
          return true;
        }

        UserService
          .joinOrCreateTeam($scope.user.teamCode)
          .success(function(user){
            return true;
          })
          .error(function(res){
            return res;
          });
      }

      function _updateSchools(e) {
        if (Settings.data.schools.indexOf($scope.user.profile.school) === -1 && $scope.user.profile.school !== null) {
          SettingsService.addSchool($scope.user.profile.school)
          .success(function(user){
            return;
          })
          .error(function(res){
            //console.log("Failed to add new school");
          });
        }
      }

      function _setupForm() {
          var teamRes = _updateTeam();

          if(teamRes == true) {
            // Semantic-UI form validation
            $('.ui.form').form({
              inline: true,
              fields: {
                  firstname: {
                      identifier: 'firstname',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please enter your first name.'
                          }
                      ]
                  },
                  lastname: {
                      identifier: 'lastname',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please enter your last name.'
                          }
                      ]
                  },
                  grade: {
                      identifier: 'grade',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please enter your grade.'
                          }
                      ]
                  },
                  school: {
                      identifier: 'school',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please enter your school.'
                          }
                      ]
                  },
                  phone: {
                      identifier: 'phone',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please enter your phone number.'
                          }
                      ]
                  },
                  departing: {
                      identifier: 'departing',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please enter your departing location.'
                          }
                      ]
                  },
                  pasthackathon: {
                      identifier: 'pasthackathon',
                      depends: 'hackathonxp',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please enter your past hackathon experience(s).'
                          }
                      ]
                  },
                  gender: {
                      identifier: 'gender',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please select a gender.'
                          }
                      ]
                  },
                  ethnicity: {
                      identifier: 'ethnicity',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please select an ethnicity.'
                          }
                      ]
                  },
                  shirt: {
                      identifier: 'shirt',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please select your shirt size.'
                          }
                      ]
                  },
                  essayproject: {
                      identifier: 'essayproject',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please tell us about your past experience.'
                          }
                      ]
                  },
                  hackathonxp: {
                      identifier: 'hackathonxp',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please tell us about your previous hackathons.'
                          }
                      ]
                  },
                  essaygain: {
                      identifier: 'essaygain',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please tell us about what you hope to gain at MasseyHacks IV.'
                          }
                      ]
                  },
                  methodofdiscovery: {
                      identifier: 'methodofdiscovery',
                      rules: [
                          {
                              type: 'empty',
                              prompt: 'Please tell us about how you learned about MasseyHacks IV.'
                          }
                      ]
                  },
                  termsAndCond: {
                      identifier: 'termsAndCond',
                      rules: [
                          {
                              type: 'checked',
                              prompt: 'You must accept MLH Terms & Conditions, MLH Privacy Policy, and MLH Code of Conduct.'
                          }
                      ]
                  }
              },
              onSuccess: function (event, fields) {

                  var noValidationError = true;

                  if ($scope.user.profile.school == null || $scope.user.profile.school == undefined || ($scope.user.profile.school !== null && ($scope.user.profile.school.toLowerCase().includes('undefined')))) {

                      $scope.error = 'There were errors in your application. Please check that you filled all required fields.';
                      $scope.fieldErrors.push('Hey! You didn\' fill in your school!');
                      noValidationError = false;
                  }

                  if ($scope.user.profile.phone != null && !(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).test($scope.user.profile.phone)) {

                      $scope.error = 'There were errors in your application. Please check that you filled all required fields.';
                      $scope.fieldErrors.push('Hey! Your phone number isn\'t valid!');
                      noValidationError = false;
                  }

                  if (noValidationError) {

                      _updateSchools();

                      if ($scope.user.status.completedProfile) {
                          if (JSON.stringify($scope.user.profile) === $scope.backupUser) {
                              swal({
                                  title: "Warning",
                                  text: "You have not modified your application",
                                  type: "warning",
                              });
                          } else {

                              swal({
                                  title: "Whoa!",
                                  text: "You can edit your application after submitting, but you risk losing your place in queue!",
                                  type: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#DD6B55",
                                  confirmButtonText: "Yes, resubmit",
                                  closeOnConfirm: false
                              }, function () {
                                  _updateUser();
                              });
                          }
                      } else {
                          _updateUser();
                      }
                  }

              },
              onFailure: function (formErrors, fields) {
                  $scope.fieldErrors = formErrors;

                  if ($scope.user.profile.school == null || $scope.user.profile.school == undefined || ($scope.user.profile.school !== null && ($scope.user.profile.school.toLowerCase().includes('undefined')))) {
                      $scope.fieldErrors.push('Hey! You didn\' fill in your school!');
                  }

                  if ($scope.user.profile.phone != null && !(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).test($scope.user.profile.phone)) {
                      $scope.fieldErrors.push('Hey! Your phone number isn\'t valid!');
                  }

                  $scope.error = 'There were errors in your application. Please check that you filled all required fields.';

              }

          });
          }
          else {
              swal(teamRes);
          }

        // Set selected multiselect items
        $("#spacesOrTabs").dropdown('set selected', $scope.user.profile.spacesOrTabs);
        $("#gender").dropdown('set selected', $scope.user.profile.gender);
        $("#grade").dropdown('set selected', $scope.user.profile.grade);
        $("#ethnicity").dropdown('set selected', $scope.user.profile.ethnicity);
        $("#shirt").dropdown('set selected', $scope.user.profile.shirt);
        $("#methodofdiscovery").dropdown('set selected', $scope.user.profile.methodofdiscovery);

        $('.ui.dropdown').dropdown('refresh');

        setTimeout(function () {

          if ($scope.user.profile.school !== null) {
            oldSchool = $scope.user.profile.school;
          }

          $(".ui.search.dropdown").dropdown('set selected', $scope.user.profile.school);

          if ($scope.regIsClosed) {
            $('.ui.dropdown').addClass("disabled");
          }

        }, 1);
      }

      $scope.saveForm = function() {
          if ($scope.user.profile.submittedApplication) {
              swal({title: "Warning",
                  text: "You have already submitted your application, please click submit to update your information",
                  type: "warning"})
          } else {
          swal({title: "Warning",
              text: "Your profile will be saved. It will NOT be submitted",
              type: "warning",
              showCancelButton:true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, save",
              closeOnConfirm: false},
              function() {
                  // Get the dietary restrictions as an array
                  var drs = [];
                  Object.keys($scope.diet).forEach(function(key){
                      if ($scope.diet[key]){
                          drs.push(key);
                      }
                  });
                  $scope.user.profile.diet = drs;

                  if (($scope.user.profile.school == null || $scope.user.profile.school == undefined || ($scope.user.profile.school !== null && ($scope.user.profile.school.toLowerCase().includes('undefined')))) && oldSchool !== null) {
                      $scope.user.profile.school = oldSchool;
                  }

                  // Update user profile
                  UserService
                      .saveProfile(Session.getUserId(), $scope.user.profile)
                      .success(function(data){
                          sweetAlert({
                              title: "Awesome!",
                              text: "Your application has been saved.",
                              type: "success",
                              confirmButtonColor: "#5ABECF"
                          }, function(){
                              location.replace('/');
                          });
                      })
                      .error(function(res){
                          sweetAlert("Uh oh!", "Something went wrong.", "error");
                      });
              })
          }
      }

      $scope.submitForm = function(){

        if (!$scope.user.profile.hackathonxp) {
          $scope.user.profile.pasthackathon = null;
        }
        $scope.fieldErrors = null;
        $scope.error = null;

        // Super jank code to get the school to not appear as null

        if (($scope.user.profile.school == null || $scope.user.profile.school == undefined || ($scope.user.profile.school !== null && ($scope.user.profile.school.toLowerCase().includes('undefined')))) && oldSchool !== null) {
            $scope.user.profile.school = oldSchool;
        }



        $('.ui.form').form('validate form');


      };
}]);
