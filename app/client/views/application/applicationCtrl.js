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
      $scope.schools = Settings.data.schools;
      console.log($scope.schools);
      console.log('Lol');

      // Populate the school dropdown
      _setupForm();

      $scope.regIsClosed = Date.now() > Settings.data.timeClose;

      // Set selected multiselect items
      $("#spacesOrTabs").dropdown('set selected', $scope.user.profile.spacesOrTabs);
      $("#operatingSystem").dropdown('set selected', $scope.user.profile.operatingSystem);
      $("#jobOpportunities").dropdown('set selected', $scope.user.profile.jobOpportunities);
      $("#description").dropdown('set selected', $scope.user.profile.description);
      $("#howManyHackathons").dropdown('set selected', $scope.user.profile.howManyHackathons);
      $("#codingExperience").dropdown('set selected', $scope.user.profile.codingExperience);
      $("#mostInterestingTrack").dropdown('set selected', $scope.user.profile.mostInterestingTrack);
      $("#gender").dropdown('set selected', $scope.user.profile.gender);
      $("#homeCountry").dropdown('set selected', $scope.user.profile.homeCountry);
      $("#travelFromCountry").dropdown('set selected', $scope.user.profile.travelFromCountry);
      $("#occupationalStatus").dropdown('set selected', $scope.user.profile.occupationalStatus);
      //$("#occupationalStatus").dropdown({maxSelections: "2"});

      $("#bestTools").dropdown('set selected', $scope.user.profile.bestTools);
      $("#previousJunction").dropdown('set selected', $scope.user.profile.previousJunction);


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
        if ($scope.user.teamCode === currentUser.data.teamCode || !$scope.user.teamCode) {
          return;
        }
        UserService
          .joinOrCreateTeam($scope.user.teamCode)
          .success(function(user){
            console.log('Successfully updated teamCode')
          })
          .error(function(res){
            console.log("Failed to update teamCode");
          });
      }

      function _updateSchools(e) {
        if ($.inArray($scope.user.profile.school, $scope.schools) == -1) {
          SettingsService.addSchool($scope.user.profile.school)
          .success(function(user){
            console.log('Successfully added new school')
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
            name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your name.'
                }
              ]
            },
            age: {
              identifier: 'age',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your age.'
                },
                {
                  type: 'integer[13..120]',
                  prompt: 'You must be at least 13 to attend.'
                }
              ]
            },
            travelFromCountry: {
              identifier: 'travelFromCountry',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select the country you are travelling from.'
                }
              ]
            },
            travelFromCity: {
              identifier: 'travelFromCity',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select the city you are travelling from.'
                }
              ]
            },
            homeCountry: {
              identifier: 'homeCountry',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your home country.'
                }
              ]
            },
            mostInterestingTrack: {
              identifier: 'mostInterestingTrack',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select the most interesting track for you.'
                }
              ]
            },
            occupationalStatus: {
              identifier: 'occupationalStatus',
              rules: [
                {
                  type: 'maxCount[2]',
                  prompt: 'Please select at most 2.'
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
                  prompt: 'You must accept Junction Terms & Conditions.'
                }
              ]
            }
          },
          onSuccess: function(event, fields){
            _updateUser();
            _updateTeam();
            _updateSchools();

          },
          onFailure: function(formErrors, fields){
            $scope.fieldErrors = formErrors;
            $scope.error = 'There were errors in your application. Please check that you filled all required fields.';
          }
        });
      }

      $scope.submitForm = function(){
        $scope.fieldErrors = null;
        $scope.error = null;
        $('.ui.form').form('validate form');
      };
}]);
