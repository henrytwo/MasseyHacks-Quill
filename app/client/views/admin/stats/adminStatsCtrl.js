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
        console.log("Send emails");
        UserService
          .sendLaggerEmails()
          .then(function(){
            sweetAlert('Your emails have been sent.');
          });
      };

    }]);