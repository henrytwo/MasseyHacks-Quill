angular.module('reg')
  .factory('UserService', [
  '$http',
  'Session',
  '$state',
  function($http, Session, $state){

    var users = '/api/users';
    var base = users + '/';

    function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };

    function tokenActive() {
        var token = Session.getToken();

        if (token) {
            if (parseJwt(token).exp <= Date.now() / 1000) {
                swal({
                    title: 'Session Expired',
                    text: 'Your session has expired, you have been logged out.',
                    type: 'error'
                });

                Session.destroy();

                $state.go('login');
            }

        }

    }

    return {

      // ----------------------
      // Basic Actions
      // ----------------------
      getCurrentUser: function(){
        tokenActive();
        return $http.get(base + Session.getUserId());
      },

      get: function(id){
        tokenActive();
        return $http.get(base + id);
      },

      getAll: function(){
          tokenActive();
        return $http.get(base);
      },

      getAllMaster: function () {
          tokenActive();
          return $http.get('/api/usersMaster');
      },

      getPage: function(page, size, filter, sort, sortBy){
          tokenActive();
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
          tokenActive();
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
          tokenActive();
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
          tokenActive();
        return $http.put('/api/matchmaking/exitSearch')
      },

      getTeamSearching: function() {
          tokenActive();
        return $http.get('/api/matchmaking/teamInSearch')
      },

      inviteToSlack: function(id){
          tokenActive();
          return $http.get('/api/slack/' + id);
      },

      updateProfile: function(id, profile){
          tokenActive();
        return $http.put(base + id + '/profile', {
          profile: profile
        });
      },

      saveProfile: function(id, profile){
          tokenActive();
        return $http.put(base + id + '/saveprofile', {
          profile: profile
        });
      },

      updateWaiver: function(id, waiver){
          tokenActive();
        return $http.put(base + id + '/waiver', {
            waiver: waiver
        });
      },

      updateMatchmakingProfile: function(id, profile){
          tokenActive();
        return $http.put(base + id + '/matchmaking', {
          profile: profile
        });
      },

      updateConfirmation: function(id, confirmation){
          tokenActive();
        return $http.put(base + id + '/confirm', {
          confirmation: confirmation
        });
      },

      updateReimbursement: function(id, reimbursement) {
          tokenActive();
        return $http.put(base + id + '/reimbursement', {
          reimbursement: reimbursement
        });
      },

      declineAdmission: function(id){
          tokenActive();
        return $http.post(base + id + '/decline');
      },

      // ------------------------
      // Team
      // ------------------------
        /*
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
      },*/

      // -------------------------
      // Admin Only
      // -------------------------

      getWave: function() {
          tokenActive();
        return $http.get(base + Session.getUserId() + '/wave');
      },

      getStats: function(){
          tokenActive();
        return $http.get(base + 'stats');
      },

      admitUser: function(id){
          tokenActive();
        return $http.post(base + id + '/admit');
      },

      removeUser: function (id) {
          tokenActive();
        return $http.post(base + id + '/remove');
      },

      deactivate: function(id){
          tokenActive();
        return $http.post(base + id + '/deactivate');
      },

      activate: function(id){
          tokenActive();
        return $http.post(base + id + '/activate');
      },

      voteAdmitUser: function (id) {
          tokenActive();
          return $http.post(base + id + '/voteAdmitUser');
      },

      voteRejectUser: function (id) {
          tokenActive();
          return $http.post(base + id + '/voteRejectUser');
      },

      reject: function(id){
          tokenActive();
        return $http.post(base + id + '/reject');
      },

      unReject: function(id){
          tokenActive();
        return $http.post(base + id + '/unreject');
      },

      checkIn: function(id){
          tokenActive();
        return $http.post(base + id + '/checkin');
      },

      QRcheckIn: function(id){
          tokenActive();
        return $http.post(base + id + '/qrcheck');
      },

      checkOut: function(id){
          tokenActive();
        return $http.post(base + id + '/checkout');
      },

      sendLaggerEmails: function() {
          tokenActive();
        return $http.post(base + 'sendlagemails');
      },

      sendRejectEmails: function() {
          tokenActive();
        return $http.post(base + 'sendRejectEmails');
      },
      /*sendQREmails: function() {
        return $http.post(base + 'sendQREmails');
      },*/

    };
  }
  ]);

