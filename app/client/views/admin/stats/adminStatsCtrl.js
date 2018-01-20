angular.module('reg')
  .controller('AdminStatsCtrl',[
    '$scope',
    'UserService',
    function($scope, UserService){

      UserService
        .getStats()
        .success(function(stats){
          $scope.stats = stats;
          $scope.loading = false;
        });

      $scope.fromNow = function(date){
        return moment(date).fromNow();
      };

      $scope.sendLaggerEmails = function(){
        swal({
          title: "Are you sure?",
          text: "This will send an email to every user who has not submitted an application. Are you sure?.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, send.",
          closeOnConfirm: false
          }, function(){
            UserService
              .sendLaggerEmails()
              .success(function(){
                sweetAlert('Your emails have been sent.');
            }).error(function(err) {
                swal("Access Denied", "You do not have permission to perform this action.", "error")
            });
          });
      };

      $scope.sendRejectEmails = function(){
        swal({
          title: "Are you sure?",
          text: "This will send an email to every user who has been rejected. Are you sure?.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, send.",
          closeOnConfirm: false
          }, function(){
            UserService
              .sendRejectEmails()
              .success(function(){
                sweetAlert('Your emails have been sent.');
            }).error(function(err) {
                swal("Access Denied", "You do not have permission to perform this action.", "error")
            });
          });
      };

      /*$scope.sendQREmails = function(){
        swal({
          title: "Are you sure?",
          text: "This will send an email to every user who is confirmed, includes QR-code. Are you sure?.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, send.",
          closeOnConfirm: false
          }, function(){
            UserService
              .sendQREmails()
              .then(function(){
                sweetAlert('Your emails have been sent.');
            });
          });
      };*/


    }]);
