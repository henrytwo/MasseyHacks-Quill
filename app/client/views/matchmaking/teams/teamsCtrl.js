angular.module('reg')
.controller('TeamsCtrl', [
  '$scope',
  '$stateParams',
  'currentUser',
  'settings',
  'Utils',
  'UserService',
  'TEAM',
  'Session',
  function($scope, $stateParams, currentUser, settings, Utils, UserService, TEAM, Session){

    //icon tooltip popup
    $('.icon')
    .popup({
      on: 'hover'
    });
    // Get the current user's most recent data.
    var Settings = settings.data;

    $scope.user = currentUser.data;

    //TABLE UPDATING
    $scope.params = [];
    $scope.users = [];

    function updateTable(data){
      $scope.users = data;
    }
    function getMatchMaking(){
      UserService
      .getMatchmaking('teams')
      .success(function(data){
        updateTable(data);
      })
    }

    //Check if user's team already submitted the form
    $scope.teamSearching = false;

    getMatchMaking();


  }]);