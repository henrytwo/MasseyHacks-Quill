angular.module('reg')
    .controller('OwnerSettingsCtrl', [
        '$scope',
        '$sce',
        'SettingsService',
        'UserService',
        function($scope, $sce, SettingsService, UserService){

            $scope.settings = {};
            SettingsService
                .getPublicSettings()
                .success(function(settings){
                    settings['log'] = [];
                    updateSettings(settings);
                });

            function updateSettings(settings){
                $scope.loading = false;
                // Format the dates in settings.

                settings.timeOpen = new Date(settings.timeOpen);
                settings.timeClose = new Date(settings.timeClose);
                settings.timeConfirm = new Date(settings.timeConfirm);
                settings.timeTR = new Date(settings.timeTR);
                settings.wave1.timeOpen = new Date(settings.wave1.timeOpen);
                settings.wave1.timeClose = new Date(settings.wave1.timeClose);
                settings.wave1.timeConfirm = new Date(settings.wave1.timeConfirm);
                settings.wave1.timeSend = new Date(settings.wave1.timeSend);

                settings.wave2.timeOpen = new Date(settings.wave2.timeOpen);
                settings.wave2.timeClose = new Date(settings.wave2.timeClose);
                settings.wave2.timeConfirm = new Date(settings.wave2.timeConfirm);
                settings.wave2.timeSend = new Date(settings.wave2.timeSend);

                settings.wave3.timeOpen = new Date(settings.wave3.timeOpen);
                settings.wave3.timeClose = new Date(settings.wave3.timeClose);
                settings.wave3.timeConfirm = new Date(settings.wave3.timeConfirm);
                settings.wave3.timeSend = new Date(settings.wave3.timeSend);

                settings.wave4.timeOpen = new Date(settings.wave4.timeOpen);
                settings.wave4.timeClose = new Date(settings.wave4.timeClose);
                settings.wave4.timeConfirm = new Date(settings.wave4.timeConfirm);
                settings.wave4.timeSend = new Date(settings.wave4.timeSend);

                $scope.settings = settings;

                $scope.showEmail = false;

            }


            // Registration Times -----------------------------

            $scope.formatDate = function(date){
                if (!date){
                    return "Invalid Date";
                }

                // Hack for timezone
                return moment(date).format('dddd, MMMM Do YYYY, h:mm a') +
                    " " + date.toTimeString().split(' ')[2];
            };

            // Take a date and remove the seconds.
            function cleanDate(date){
                return new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    date.getHours(),
                    date.getMinutes()
                );
            }

            $scope.getLog = function () {
                SettingsService
                    .getPrivateSettings()
                    .success(function(settings){
                        updateSettings(settings);
                    });
            };

            $scope.updateRegistrationTimes = function(){
                // Clean the dates and turn them to ms.
                var open = cleanDate($scope.settings.timeOpen).getTime();
                var close = cleanDate($scope.settings.timeClose).getTime();

                if (open < 0 || close < 0 || open === undefined || close === undefined){
                    return swal('Oops...', 'You need to enter valid times.', 'error');
                }
                if (open >= close){
                    swal('Oops...', 'Registration cannot open after it closes.', 'error');
                    return;
                }

                SettingsService
                    .updateRegistrationTimes(open, close)
                    .success(function(settings){
                        updateSettings(settings);
                        swal("Looks good!", "Registration Times Updated", "success");
                    });
            };

            // Confirmation Time -----------------------------

            $scope.updateConfirmationTime = function(){
                var confirmBy = cleanDate($scope.settings.timeConfirm).getTime();

                SettingsService
                    .updateConfirmationTime(confirmBy)
                    .success(function(settings){
                        updateSettings(settings);
                        swal("Sounds good!", "Confirmation Date Updated", "success");
                    });
            };

            // TR Closing Time -----------------------

            $scope.updateTRTime = function(){
                var submitTRBy = cleanDate($scope.settings.timeTR).getTime();

                SettingsService
                    .updateTRTime(submitTRBy)
                    .success(function(settings){
                        updateSettings(settings);
                        swal("Sounds good!", "TR Closing Date Updated", "success");
                    });
            };

            // Acceptance / Confirmation Text ----------------

            var converter = new showdown.Converter();

            $scope.markdownPreview = function(text){
                return $sce.trustAsHtml(converter.makeHtml(text));
            };

            $scope.updateWaitlistText = function(){
                var text = $scope.settings.waitlistText;
                SettingsService
                    .updateWaitlistText(text)
                    .success(function(data){
                        swal("Looks good!", "Waitlist Text Updated", "success");
                        updateSettings(data);
                    });
            };

            $scope.updateAcceptanceText = function(){
                var text = $scope.settings.acceptanceText;
                SettingsService
                    .updateAcceptanceText(text)
                    .success(function(data){
                        swal("Looks good!", "Acceptance Text Updated", "success");
                        updateSettings(data);
                    });
            };

            $scope.updateConfirmationText = function(){
                var text = $scope.settings.confirmationText;
                SettingsService
                    .updateConfirmationText(text)
                    .success(function(data){
                        swal("Looks good!", "Confirmation Text Updated", "success");
                        updateSettings(data);
                    });
            };

            $scope.updateReimbClasses = function() {
                var reimbursementClass = $scope.settings.reimbursementClass;
                SettingsService
                    .updateReimbClasses(reimbursementClass)
                    .success(function(data){
                        swal("Looks good!", "Travel reimbursement classes Updated", "success");
                        updateSettings(data);
                    });
            };

            $scope.showRejection = function() {
                SettingsService
                    .showRejection(true)
                    .success(function(data){
                        swal("Looks good!", "Rejection will be shown to the participants", "success");
                        updateSettings(data);
                    });
            };

            $scope.sendConfirmationLaggerEmails = function () {

                swal({
                    title: "Confirm Send CONFIRMATION lagger emails",
                    text: "Send emails to all who haven't confirmed",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, send",
                    closeOnConfirm: false
                }, function(){

                    UserService
                        .sendConfirmationLaggerEmails()
                        .success(function(user){
                            swal("Action Performed", "Emails sent", "success");

                        })
                        .error(function(err) {
                            swal("Error", "Action could not be performed.", "error");
                        });

                });
            }

            $scope.updateParticipantCount = function () {
                SettingsService.updateParticipantCount($scope.settings.participants).success(function (data) {
                    swal("Looks good!", "Updated participant count to " + $scope.settings.participants, "success");
                    updateSettings(data);
                })
            }

            $scope.rejectall = function () {
                swal({
                    title: "Whoa, wait a minute!",
                    text: "You are about to reject EVERYONE that have not been admitted",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, proceed",
                    closeOnConfirm: false
                }, function(){

                    swal({
                        title: "Are you sure?",
                        text: "Your account will be logged as having done this. " +
                        "Remember, this power is a privilege.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, proceed",
                        closeOnConfirm: false
                    }, function(){

                        UserService
                            .sendRejectEmails()
                            .success(function(){
                                swal("Action Performed", 'Users have been rejected', "success");
                            })
                            .error(function(err) {
                                swal("Error", "An error occurred.", "error");
                            });

                    });

                });
            }

            $scope.updateWave = function(num) {
              var timeClose = cleanDate($scope.settings["wave"+num].timeClose).getTime();
              var timeOpen = cleanDate($scope.settings["wave"+num].timeOpen).getTime();
              var timeConfirm = cleanDate($scope.settings["wave"+num].timeConfirm).getTime();
              var timeSend = cleanDate($scope.settings["wave"+num].timeSend).getTime();

              SettingsService
                .updateWave({"timeOpen": timeOpen,
                             "timeClose": timeClose,
                             "timeConfirm": timeConfirm,
                             "timeSend": timeSend}, num)
                .success(function(data) {
                  swal("Looks good!", "Wave " + num + " is updated.", "success");
                  updateSettings(data)
                });

            }

        }]);
