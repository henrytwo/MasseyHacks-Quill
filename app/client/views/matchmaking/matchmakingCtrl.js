angular.module('reg')
  .controller('MatchmakingCtrl', [
    '$scope',
    'currentUser',
    'settings',
    'Utils',
    'UserService',
    'TEAM',
    function($scope, currentUser, settings, Utils, UserService, TEAM){

      //icon tooltip popup
      $('.icon')
      .popup({
        on: 'hover'
      });
      // Get the current user's most recent data.
      var Settings = settings.data;

      $scope.regIsOpen = Utils.isRegOpen(Settings);

      $scope.user = currentUser.data;

      $scope.TEAM = TEAM;

      $scope.showIndividualForm = false;
      $scope.showTeamForm = false;
      $scope.showForms = true;


      $scope.setIndividual = function(){
        console.log('Search as individual');
        $scope.showIndividualForm = true;
        $scope.showTeamForm = false;
      };

      $scope.setTeam = function(){
        console.log('Search as a team');
        $scope.showTeamForm = true;
        $scope.showIndividualForm = false;
      };
    }]);
