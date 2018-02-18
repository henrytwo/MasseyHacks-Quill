angular.module('reg')
  .controller('AdminUserCtrl',[
    '$scope',
    '$http',
    'user',
    'UserService',
    function($scope, $http, User, UserService){
      $scope.selectedUser = User.data;

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


      $scope.updateProfile = function(){
        UserService
          .updateProfile($scope.selectedUser._id, $scope.selectedUser.profile)
          .success(function(data){
            UserService.updateWaiver($scope.selectedUser._id, $scope.selectedUser.status.waiver).success(function (data) {
                $selectedUser = data;

                swal("Updated!", "Profile updated.", "success");

            }).error(function(){
                swal("Oops, you forgot something.");
            });

          })
          .error(function(){
            swal("Oops, you forgot something.");
          });
      };

    }]);