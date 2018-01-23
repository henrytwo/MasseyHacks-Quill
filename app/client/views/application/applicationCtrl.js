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

      if ($scope.user.profile.school == null) {
        $scope.schoolChecked = false;
      } else {
        $scope.schoolChecked = true;
      }
      var originalTeamCode = $scope.user.teamCode;

      //icon tooltip popup
      $('.icon')
      .popup({
        on: 'hover'
      });

      // Populate the school dropdown
      _setupForm();

      $scope.regIsClosed = Date.now() > Settings.data.timeClose || $scope.user.status.admitted;

      var reimbClasses;
      $.getJSON('../assets/reimbClasses.json').done(function(data){
              reimbClasses = data;
      });

      function _updateUser(e){
        // Update user profile
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .success(function(data){
            sweetAlert({
              title: "Awesome!",
              text: "Your application has been saved.",
              type: "success",
              confirmButtonColor: "#5ABECF"
            }, function(){
              $state.go('app.dashboard');
            });
          })
          .error(function(res){
            sweetAlert("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _updateTeam(e) {
        // Update user teamCode
        if ($scope.user.teamCode === originalTeamCode || !$scope.user.teamCode) {
          return;
        }

        UserService
          .joinOrCreateTeam($scope.user.teamCode)
          .success(function(user){
            return;
          })
          .error(function(res){
            return;
          });
      }

      function _updateSchools(e) {
        if (Settings.data.schools.indexOf($scope.user.profile.school) === -1 && $scope.user.profile.school !== null) {
          SettingsService.addSchool($scope.user.profile.school)
          .success(function(user){
            return;
          })
          .error(function(res){
            console.log("Failed to add new school");
          });
        }
      }

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
          inline:true,
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
            methodofdiscovery: {
              identifier: 'methodofdiscovery',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please tell us about how you learned about MasseyHacks IV.'
                }
              ]
            },
            conduct: {
              identifier: 'conduct',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must accept MLH code of conduct to continue.'
                }
              ]
            },
            termsAndCond: {
              identifier: 'termsAndCond',
              rules: [
                {
                  type: 'checked',
                  prompt: 'You must accept MLH Terms & Conditions.'
                }
              ]
            }
          },
          onSuccess: function(event, fields){
            _updateTeam();
            _updateSchools();
            _updateUser();

          },
          onFailure: function(formErrors, fields){
            $scope.fieldErrors = formErrors;
            $scope.error = 'There were errors in your application. Please check that you filled all required fields.';
          }
        });

        // Set selected multiselect items
        $("#spacesOrTabs").dropdown('set selected', $scope.user.profile.spacesOrTabs);
        $("#gender").dropdown('set selected', $scope.user.profile.gender);
        $("#grade").dropdown('set selected', $scope.user.profile.grade);
        $("#ethnicity").dropdown('set selected', $scope.user.profile.ethnicity);
        $("#shirt").dropdown('set selected', $scope.user.profile.shirt);
        $("#methodofdiscovery").dropdown('set selected', $scope.user.profile.methodofdiscovery);

        $('.ui.dropdown').dropdown('refresh');

        setTimeout(function () {
          $(".ui.search.dropdown").dropdown('set selected', $scope.user.profile.school);

          if ($scope.regIsClosed) {
            $('.ui.dropdown').addClass("disabled");
          }

        }, 1);
      }

      $scope.submitForm = function(){
        if (!$scope.user.profile.hackathonxp) {
          $scope.user.profile.pasthackathon = null;
        }
        $scope.fieldErrors = null;
        $scope.error = null;
        $scope.user.profile.name = $scope.user.profile.firstname + " " + $scope.user.profile.lastname;
        $('.ui.form').form('validate form');
      };
}]);