angular.module('reg')
  .factory('AuthInterceptor', [
    'Session',
    function(Session){

        function parseJwt (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        };

        return {
          request: function(config){

            var token = Session.getToken();
            if (token){
              if (parseJwt(token).exp <= Date.now() / 1000) {
                  swal({
                      title: 'Session Expired',
                      text: 'Your session has expired, you have been logged out.',
                      type: 'error'
                  });

                  Session.destroy();

                  return false;
              }
              config.headers['x-access-token'] = token;
            }
            return config;
          }
        };
    }]);