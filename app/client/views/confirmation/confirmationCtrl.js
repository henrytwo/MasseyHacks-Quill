angular.module('reg')
  .controller('ConfirmationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    'currentUser',
    'Utils',
    'UserService',
    'SettingsService',
    function($scope, $rootScope, $state, currentUser, Utils, UserService, SettingsService){

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;

      $scope.pastConfirmation = Date.now() > user.status.confirmBy;

      $scope.formatTime = Utils.formatTime;

      $scope.classAmount;

      SettingsService
        .getPublicSettings()
        .success(function(settings){
        });
      _setupForm();

      $('.icon')
      .popup({
        on: 'hover'
      });

      // -------------------------------

      function _updateUser(e){
        var confirmation = $scope.user.confirmation;

        UserService
          .updateConfirmation(user._id, confirmation)
          .success(function(data){
            sweetAlert({
              title: "Woo!",
              text: "You're confirmed!",
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
          inline:true,
          fields: {
            shirt: {
              identifier: 'shirt',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please give us a shirt size!'
                }
              ]
            },
            },
            onSuccess: function(event, fields){
            _updateUser();
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
