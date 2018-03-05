angular.module('reg')
  .factory('SettingsService', [
  '$http',
  '$state',
  'Session',
  function($http, $state, Session){

    var base = '/api/settings/';


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
      getPublicSettings: function(){
          tokenActive();
        return $http.get(base);
      },
      getPrivateSettings: function(){
          tokenActive();
          return $http.get('/api/settingsPrivate/');
      },
      updateRegistrationTimes: function(open, close){
          tokenActive();
        return $http.put(base + 'times', {
          timeOpen: open,
          timeClose: close,
        });
      },
      updateConfirmationTime: function(time){
          tokenActive();
        return $http.put(base + 'confirm-by', {
          time: time
        });
      },
      updateTRTime: function(time){
          tokenActive();
        return $http.put(base + 'tr-by', {
          time: time
        });
      },
      getWhitelistedEmails: function(){
          tokenActive();
        return $http.get(base + 'whitelist');
      },
      updateWhitelistedEmails: function(emails){
          tokenActive();
        return $http.put(base + 'whitelist', {
          emails: emails
        });
      },
      updateWaitlistText: function(text){
          tokenActive();
        return $http.put(base + 'waitlist', {
          text: text
        });
      },
      updateAcceptanceText: function(text){
          tokenActive();
        return $http.put(base + 'acceptance', {
          text: text
        });
      },
      updateParticipantCount: function(participants){
          tokenActive();
        return $http.put(base + 'participants', {
          participants: participants
        })
      },
      addSchool: function(text){
          tokenActive();
        return $http.put(base + 'addschool', {
          school: text
        });
      },
      updateConfirmationText: function(text){
          tokenActive();
        return $http.put(base + 'confirmation', {
          text: text
        });
      },
      updateReimbClasses: function(reimbClasses){
          tokenActive();
        return $http.put(base + 'reimbClasses', {
          reimbClasses: reimbClasses
        });
      },
      updateWave: function(data, num) {
          tokenActive();
        return $http.put(base + 'updateWave', {
          waveNum: num,
          data: data
        });
      }
    };

  }
  ]);
