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
    function($scope, $rootScope, $state, $http, currentUser, Settings, Session, UserService){

      $scope.isDisabled = false;

      // Set up the user
      $scope.user = currentUser.data;
      // Populate the school dropdown
      populateSchools();
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
      $("#bestTools").dropdown('set selected', $scope.user.profile.bestTools);
      $("#previousJunction").dropdown('set selected', $scope.user.profile.previousJunction);

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){

        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if (schools[email]){
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });
      }

      function _updateUser(e){
        // Update user teamCode
        UserService
          .joinOrCreateTeam($scope.user.teamCode)
          .success(function(user){
            console.log('Successfully updated teamCode')
          })
          .error(function(res){
            console.log("Failed to update teamCode");
          });


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

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
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
          }
        });
      }



      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        }
      };

    }]);
