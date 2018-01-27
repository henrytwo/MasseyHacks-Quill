angular.module('reg')
  .controller('ConfirmationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    'currentUser',
    'Utils',
    'UserService',
    'SettingsService',
    function($scope, $rootScope, $state, currentUser, Utils, UserService, SettingsService){

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;

      $scope.pastConfirmation = Date.now() > user.status.confirmBy;

      $scope.formatTime = Utils.formatTime;

      $scope.dropArea = document.getElementById('drop-area');

      $scope.dropArea.addEventListener('dragenter', preventDefaults, false);
      $scope.dropArea.addEventListener('dragover', preventDefaults, false);
      $scope.dropArea.addEventListener('dragleave', preventDefaults, false);
      $scope.dropArea.addEventListener('drop', preventDefaults, false);

      function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation()
      }

      $scope.dropArea.addEventListener('dragenter', highlight, false);
      $scope.dropArea.addEventListener('dragover', highlight, false);
      $scope.dropArea.addEventListener('dragleave', unhighlight, false);
      $scope.dropArea.addEventListener('drop', unhighlight, false);

      function highlight(e) {
        $scope.dropArea.classList.add('highlight');
      }

      function unhighlight(e) {
        $scope.dropArea.classList.remove('highlight');
      }

      $scope.dropArea.addEventListener('drop', handleDrop, false);

      $scope.classAmount;

      SettingsService
        .getPublicSettings()
        .success(function(settings){
          getClassAmount(settings);
        });
      _setupForm();

      $('.icon')
      .popup({
        on: 'hover'
      });

      function handleDrop(e) {
        var dt = e.dataTransfer;
        var files = dt.files;

        $scope.handleFiles(files);

      }

      $scope.handleFiles = function (files) {
        console.log()
        uploadFile(files[0]);
        previewFile(files[0]);
      }

      function uploadFile(file) {
        var url = 'YOUR URL HERE';
        var formData = new FormData();

        formData.append('file', file);

        console.log(formData);

      }

      function previewFile(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function() {
          var img = document.createElement('img');
          img.src = reader.result;
          document.getElementById('gallery').appendChild(img);
        }
      }

      // -------------------------------

      function _updateUser(e){
        var confirmation = $scope.user.confirmation;

        UserService
          .updateConfirmation(user._id, confirmation)
          .success(function(data){
            sweetAlert({
              title: "Woo!",
              text: "You're confirmed!",
              type: "success",
              confirmButtonColor: "#5ABECF"
            }, function(){
              $state.go('app.dashboard');
            });
          })
          .error(function(res){
            sweetAlert("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
          inline:true,
          fields: {
            shirt: {
              identifier: 'shirt',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please give us a shirt size!'
                }
              ]
            },
            },
            onSuccess: function(event, fields){
            _updateUser();
          },
          onFailure: function(formErrors, fields){
            $scope.fieldErrors = formErrors;
            $scope.error = 'There were errors in your application. Please check that you filled all required fields.';

        }
        });
      }

      $scope.submitForm = function(){
         $scope.fieldErrors = null;
        $scope.error = null;
        $('.ui.form').form('validate form');
      };

    }]);
