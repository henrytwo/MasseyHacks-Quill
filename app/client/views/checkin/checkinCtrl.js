angular.module('reg')
.controller('CheckinCtrl', [
  '$scope',
  'UserService',
  function($scope, UserService){
    $('#reader').html5_qrcode(function(data){
          //Change the input fields value and send post request to the backend
          $('#qrInput').attr("value", data);
          UserService
            .QRcheckIn(data)
            .success(function(data){
              sweetAlert({
                title: "Awesome!",
                text:  "User checked in successfully!",
                type: "success",
                confirmButtonColor: "#5ABECF"
              });
            })
            .error(function(res){
              sweetAlert("Uh oh!", "Something went wrong.", "error");
            });
        },
      function(error){
      }, function(videoError){
        //the video stream could be opened
      }
    );
  }]);