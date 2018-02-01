angular.module('reg')
  .controller('AdminUserCtrl',[
    '$scope',
    '$http',
    'user',
    'UserService',
    function($scope, $http, User, UserService){
      $scope.selectedUser = User.data;

      // Populate the school dropdown
      populateSchools();

      /**
       * TODO: JANK WARNING
       */

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

        if ($scope.selectedUser.profile.diet){
            $scope.selectedUser.profile.diet.forEach(function(restriction){
                if (restriction in diet){
                    diet[restriction] = true;
                }
            });
        }

        $scope.diet = diet;

        // Set selected multiselect items
        $("#spacesOrTabs").dropdown('set selected', $scope.selectedUser.profile.spacesOrTabs);
        $("#gender").dropdown('set selected', $scope.selectedUser.profile.gender);
        $("#grade").dropdown('set selected', $scope.selectedUser.profile.grade);
        $("#ethnicity").dropdown('set selected', $scope.selectedUser.profile.ethnicity);
        $("#shirt").dropdown('set selected', $scope.selectedUser.profile.shirt);
        $("#methodofdiscovery").dropdown('set selected', $scope.selectedUser.profile.methodofdiscovery);

        $('.ui.dropdown').dropdown('refresh');

        function populateSchools(){

        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.selectedUser.email.split('@')[1];

            if (schools[email]){
              $scope.selectedUser.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }

          });
      }

      $scope.updateProfile = function(){
        UserService
          .updateProfile($scope.selectedUser._id, $scope.selectedUser.profile)
          .success(function(data){
            $selectedUser = data;

            swal("Updated!", "Profile updated.", "success");

            /*
            UserService
            .updateConfirmation($scope.selectedUser._id, $scope.selectedUser.confirmation)
            .success(function(data){
                  $selectedUser = data;
                  swal("Updated!", "Profile updated.", "success");
            })
            .error(function(){
                  swal("Oops, you forgot something.");
            });*/
          })
          .error(function(){
            swal("Oops, you forgot something.");
          });
      };

    }]);