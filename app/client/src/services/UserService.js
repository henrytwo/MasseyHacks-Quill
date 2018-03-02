angular.module('reg')
  .factory('UserService', [
  '$http',
  'Session',
  function($http, Session){

    var users = '/api/users';
    var base = users + '/';

    return {

      // ----------------------
      // Basic Actions
      // ----------------------
      getCurrentUser: function(){
        return $http.get(base + Session.getUserId());
      },

      get: function(id){
        return $http.get(base + id);
      },

      getAll: function(){
        return $http.get(base);
      },

      getAllMaster: function () {
          return $http.get('/api/usersMaster');
      },

      getPage: function(page, size, filter, sort, sortBy){

        return $http.get(users + '?' + $.param(
          {
            filter: filter,
            page: page ? page : 0,
            size: size ? size : 50,
            sort: sort,
            sortBy: sortBy
          })
        );
      },

      getPageFull: function(page, size, filter, sort, sortBy){
          return $http.get(users + '?' + $.param(
              {
                  filter: filter,
                  page: page ? page : 0,
                  size: 500,
                  sort: sort,
                  sortBy: sortBy
              })
          );
      },

      getMatchmaking: function(type, page, size, filter) {
        return $http.get('/api/matchmaking/data/' + '?' + $.param(
          {
            filter: filter,
            type: type,
            page: page ? page: 0,
            size: size ? size : 50
          })
        )
      },

      exitSearch: function() {
        return $http.put('/api/matchmaking/exitSearch')
      },

      getTeamSearching: function() {
        return $http.get('/api/matchmaking/teamInSearch')
      },

      inviteToSlack: function(id){
          return $http.get('/api/slack/' + id);
      },

      updateProfile: function(id, profile){
        return $http.put(base + id + '/profile', {
          profile: profile
        });
      },

      saveProfile: function(id, profile){
        return $http.put(base + id + '/saveprofile', {
          profile: profile
        });
      },

      updateWaiver: function(id, waiver){
        return $http.put(base + id + '/waiver', {
            waiver: waiver
        });
      },

      updateMatchmakingProfile: function(id, profile){
        return $http.put(base + id + '/matchmaking', {
          profile: profile
        });
      },

      updateConfirmation: function(id, confirmation){
        return $http.put(base + id + '/confirm', {
          confirmation: confirmation
        });
      },

      updateReimbursement: function(id, reimbursement) {
        return $http.put(base + id + '/reimbursement', {
          reimbursement: reimbursement
        });
      },

      declineAdmission: function(id){
        return $http.post(base + id + '/decline');
      },

      // ------------------------
      // Team
      // ------------------------
      joinOrCreateTeam: function(code){
        return $http.put(base + Session.getUserId() + '/team', {
          code: code
        });
      },

      leaveTeam: function(){
        return $http.delete(base + Session.getUserId() + '/team');
      },

      getMyTeammates: function(){
        return $http.get(base + Session.getUserId() + '/team');
      },

      // -------------------------
      // Admin Only
      // -------------------------

      getWave: function() {
        return $http.get(base + Session.getUserId() + '/wave');
      },

      getStats: function(){
        return $http.get(base + 'stats');
      },

      admitUser: function(id){
        return $http.post(base + id + '/admit');
      },

      removeUser: function (id) {
        return $http.post(base + id + '/remove');
      },

      deactivate: function(id){
        return $http.post(base + id + '/deactivate');
      },

      activate: function(id){
        return $http.post(base + id + '/activate');
      },

      voteAdmitUser: function (id) {
          return $http.post(base + id + '/voteAdmitUser');
      },

      voteRejectUser: function (id) {
          return $http.post(base + id + '/voteRejectUser');
      },

      reject: function(id){
        return $http.post(base + id + '/reject');
      },

      unReject: function(id){
        return $http.post(base + id + '/unreject');
      },

      checkIn: function(id){
        return $http.post(base + id + '/checkin');
      },

      QRcheckIn: function(id){
        return $http.post(base + id + '/qrcheck');
      },

      checkOut: function(id){
        return $http.post(base + id + '/checkout');
      },

      sendLaggerEmails: function() {
        return $http.post(base + 'sendlagemails');
      },

      sendRejectEmails: function() {
        return $http.post(base + 'sendRejectEmails');
      },
      /*sendQREmails: function() {
        return $http.post(base + 'sendQREmails');
      },*/

    };
  }
  ]);
