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
          text: "This will send an email to every user who has not submitted an application. You might really fuck this up.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, send those bitches.",
          closeOnConfirm: false
          }, function(){
            UserService
              .sendLaggerEmails()
              .then(function(){
                sweetAlert('Your emails have been sent.');
            });
          });
      };

    }]);