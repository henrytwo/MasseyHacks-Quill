angular.module('reg')
  .controller('AdminCtrl', [
    '$scope',
    'UserService',
    function($scope, UserService){
      $scope.loading = true;
      $('#reader').html5_qrcode(function(data){
            //Change the input fields value and send post request to the backend
            $('#qrInput').attr("value", data);
            UserService.QRcheckIn(data);
          },
        function(error){
        }, function(videoError){
          //the video stream could be opened
        }
      );
    }]);