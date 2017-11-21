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
    $scope.pages = [];
    $scope.users = [];

    //Update table data
    function updateTable(data){
      //filter out the user himself
      $scope.users = data.users.filter(function(user){
        return user[0].id !== $scope.user.id
      });
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
      .getMatchmaking('teams', $stateParams.page, $stateParams.size, $scope.filter)
      .success(function(data){
        updateTable(data);
      })
    }
    $scope.filterMatchmaking = function() {
      UserService
        .getMatchmaking('teams', $stateParams.page, $stateParams.size, $scope.filter)
        .success(function(data){
          updateTable(data);
        });
    }

    getMatchmakingData();

    //User selection

    $scope.selectTeamlead = function(user){
      $scope.selectedUser = user;
      $scope.selectedUser.sections = generateSections(user);
      $('.long.user.modal')
        .modal('show');
    }

    function generateSections(user){
      return [

        {
          name: 'Team Matchmaking',
          fields: [
            {
              name: 'Track',
              value: user.teamMatchmaking.individual.mostInterestingTrack
            },{
              name: 'Role',
              value: user.teamMatchmaking.individual.role
            },{
              name: 'Top Challenges',
              value: user.teamMatchmaking.individual.topChallenges.join(', ')
            },{
              name: 'Description',
              value: user.teamMatchmaking.individual.description
            },
            {
              name: 'Additional',
              value: user.teamMatchmaking.individual.freeText
            }
          ]
        }
      ];
    }


  }]);