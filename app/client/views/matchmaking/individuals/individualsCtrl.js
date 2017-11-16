angular.module('reg')
.controller('IndividualsCtrl', [
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
    $scope.pages = [];
    //TABLE UPDATING
    $scope.params = [];
    $scope.users = [];

    function updateTable(data){
      $scope.users = data.users;
      $scope.currentPage = data.page;
      $scope.pageSize = data.size;

      var p = [];
      for (var i = 0; i < data.totalPages; i++){
        p.push(i);
      }
      $scope.pages = p;
    }
    function getMatchmakingData(){
      UserService
      .getMatchmaking('individuals', $stateParams.page, $stateParams.size, $scope.filter)
      .success(function(data){
        updateTable(data);
      })
    }
    $scope.filterMatchmaking = function() {
      UserService
        .getMatchmaking('individuals', $stateParams.page, $stateParams.size, $scope.filter)
        .success(function(data){
          updateTable(data);
        });
    }

    //Check if user's team already submitted the form
    $scope.teamSearching = false;

    getMatchmakingData();


  }]);
