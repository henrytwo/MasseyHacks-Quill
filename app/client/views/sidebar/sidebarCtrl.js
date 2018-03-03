angular.module('reg')
  .controller('SidebarCtrl', [
    '$rootScope',
    '$scope',
    'settings',
    'Utils',
    'AuthService',
    'Session',
    'EVENT_INFO',
    function($rootScope, $scope, Settings, Utils, AuthService, Session, EVENT_INFO){

      var settings = Settings.data;
      var user = $rootScope.currentUser;
      $scope.settings = settings;
      $scope.EVENT_INFO = EVENT_INFO;

      if (user != null) {
          $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);
      }
      else {
          swal({tite: "Uh oh", text:"Something went wrong.", type:"error"}, function () {
              AuthService.logout();
          })
      }

      $scope.logout = function(){
          swal({
                  title: "Just to be safe",
                  text: "Are you sure you want to logout?",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Logout"
              },
              function () {
                  AuthService.logout();
              }
          );
      };

      $scope.showSidebar = false;
      $scope.toggleSidebar = function(){
        $scope.showSidebar = !$scope.showSidebar;
      };

      // oh god jQuery hack
      $('.item').on('click', function(){
        $scope.showSidebar = false;
      });

    }]);
