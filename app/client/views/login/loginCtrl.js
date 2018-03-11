angular.module('reg')
  .controller('LoginCtrl', [
    '$scope',
    '$http',
    '$state',
    'settings',
    'Utils',
    'AuthService',
    function($scope, $http, $state, settings, Utils, AuthService){
      // Is registration open?
      var Settings = settings.data;
      $scope.regIsOpen = Utils.isRegOpen(Settings);

      // Start state for login
      $scope.loginState = 'login';

      function onSuccess() {
        //console.log("Eyyy");
        $state.go('app.dashboard');
      }

      function onError(data){
        $scope.error = data.message;
      }

      function resetError(){
        $scope.error = null;
      }

      $scope.login = function(){
        resetError();
        AuthService.loginWithPassword(
          $scope.email, $scope.password, onSuccess, onError);
      };

      $scope.setLoginState = function(state) {
        if ($scope.loginState !== state) {
          resetError();
        }
        $scope.loginState = state;
      };

      $scope.register = function(){
        // Poor mans form validation
        // That MIT guy was pretty lazy lol
        resetError();
        if ($scope.password === $scope.password_repeat) {
          if ($scope.nickname == null) {
            $scope.error = "Please provide a nickname!"
          } 
          else {
            if($scope.regIsOpen){
              AuthService.register(
                $scope.email, $scope.password, $scope.nickname, onSuccess, onError);
            }
          }
        } else {
          $scope.error = "Passwords don't match."
        }
      };

      $scope.sendResetEmail = function() {
        var email = $scope.email;
        AuthService.sendResetEmail(email);
        sweetAlert({
          title: "Don't Sweat!",
          text: "An email should be sent to you shortly.",
          type: "success",
          confirmButtonColor: "#e76482"
        });
      };

    }
  ]);
function fdIn() {
  $("#login").hide();
  $(document).ready(function () {
    $('#login').fadeIn(1000);
  });
}
