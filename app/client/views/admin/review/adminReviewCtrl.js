angular.module('reg')
  .controller('AdminReviewCtrl',[
    'currentUser',
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    function(currentUser, $scope, $state, $stateParams, UserService){

      var adminUser = currentUser.data;

      $scope.admin = adminUser;
      $scope.pages = [];
      $scope.users = [];
      // to know when to filter by date
      $scope.sortDate = false;
      getWave();

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};/*
      $scope.selectedUser.sections = generateSections({status: '',
      confirmation: {
        dietaryRestrictions: []
      }, profile: {
        occupationalStatus: [],
        bestTools: [],
        previousMasseyHacks: []
      }, reimbursement: {
            dateOfBirth: [],
      }
      });*/

      function getWave() {
        UserService.getWave().success(function(data){
          $scope.wave = data;
          console.log($scope.wave)
        });
      }

      function updatePage(data){
        if (adminUser.reviewer) {
            $scope.users = data.users.filter(function (user) {
                return user.admin !== true && user.volunteer !== true && user.owner !== true && user.status.completedProfile === true && user.status.admitted !== true && user.status.rejected !== true && user.votedBy.indexOf(adminUser.email) === -1 && user.wave === $scope.wave;
            });
            $scope.currentPage = data.page;
            $scope.pageSize = data.size;

            var p = [];
            for (var i = 0; i < Math.ceil($scope.users.length / $scope.pageSize); i++) {
                p.push(i);
            }
            $scope.pages = p;
        }
        else {
            return null;
        }

      }

      if (adminUser.reviewer) {
        UserService
            .getPageFull($stateParams.page, $stateParams.size, $scope.filter, $scope.sortDate, 'timestamp')
            .success(function (data) {
                updatePage(data);
            });
      }

      $scope.sortByDate = function(){
        $scope.sortDate = !$scope.sortDate;
        UserService
                  .getPageFull($stateParams.page, 500, $scope.filter, $scope.sortDate, 'timestamp')
                  .success(function(data){
                    updatePage(data);
                  });
      }

      $scope.filterUsers = function() {
        UserService
          .getPageFull($stateParams.page, $stateParams.size, $scope.filter, $scope.sortDate, 'timestamp')
          .success(function(data){
            updatePage(data);
          });
      }

      $scope.goToPage = function(page){
        $state.go('app.admin.review', {
          page: page,
          size: 150
        });
      };

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $state.go('app.admin.review', {
          id: user._id
        });
      };

      $scope.toggleReject = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.rejected){
          swal({
            title: "Whoa, wait a minute!\n[FORCE ACTION]",
            text: "You are about to reject this user!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, reject.",
            closeOnConfirm: false
            },
            function(){
              $('.long.user.modal').modal('hide');
              UserService
                .reject(user._id)
                .success(function(user){
                  if(user !== ""){//User cannot be found if user is accepted
                        $scope.users.splice(index, 1);
                        swal("Action Performed", 'This user has been rejected.', "success");
                        $('.long.user.modal').modal('show');
                        if ($scope.users.length > 0) {
                           selectUser($scope.users[0]);
                        } else {
                            $('.long.user.modal').modal('hide');
                            swal("Review Complete", "Good job! You've reached the end of the review queue", "success");
                        }
                  }
                  else {
                      swal("Could not be rejected", 'User cannot be rejected if its not verified or it is admitted', "error");
                      $('.long.user.modal').modal('show');
                  }
                })
                .error(function(err) {
                    swal("Access Denied", "You do not have permission to perform this action.", "error");
                    $('.long.user.modal').modal('show');
                });
            }
          );
        } else {
          UserService
            .unReject(user._id)
            .success(function(user){
              if(index == null){ //we don't have index because toggleReject has been called in pop-up
                for(var i = 0; i < $scope.users.length; i++){
                  if($scope.users[i]._id === user._id){
                    $scope.users[i] = user;
                    selectUser(user);
                    }
                  }
                }
                else
                 $scope.users[index] = user;
              swal("Action Performed", 'This user has been unrejected.', "success");
                $('.long.user.modal').modal('show');
            })
            .error(function(err) {
                swal("Access Denied", "You do not have permission to perform this action.", "error");
                $('.long.user.modal').modal('show');
            });
        }
      };

      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "Whoa, wait a minute!\n[FORCE ACTION]",
          text: "You are about to accept this user!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, accept them.",
          closeOnConfirm: false
          }, function(){

            swal({
              title: "Are you sure?",
              text: "Your account will be logged as having accepted this user. " +
                "Remember, this power is a privilege.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, accept this user.",
              closeOnConfirm: false
              }, function(){
                $('.long.user.modal').modal('hide');

                UserService
                  .admitUser(user._id)
                  .success(function(user){
                    if(user != ""){// User cannot be found if user is rejected
                      $scope.users.splice(index, 1);
                      swal("Action Performed", 'This user has been admitted.', "success");
                      if ($scope.users.length > 0) {
                          selectUser($scope.users[0]);
                          $('.long.user.modal').modal('show');
                      }
                      else {
                          $('.long.user.modal').modal('hide');
                          swal("Review Complete", "Good job! You've reached the end of the review queue", "success");
                      }
                    }
                    else
                      swal("Could not be accepted", 'User cannot be accepted if the user is rejected. Please remove rejection.', "error");
                      $('.long.user.modal').modal('show');
                  })
                  .error(function(err) {
                      swal("Access Denied", "You do not have permission to perform this action.", "error");
                      $('.long.user.modal').modal('show');
                  });;

              });

          });

      };

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      $scope.rowClass = function(user) {
        if (user.admin){
          return 'admin';
        }
        if (user.status.confirmed) {
          return 'positive';
        }
        if (user.status.admitted && !user.status.confirmed) {
          return 'warning';
        }
      };

      function selectUserBody(user) {
          selectUser(user);
          $('.long.user.modal').modal('hide');
          swal({
                  title: "Notice",
                  text: "All votes are final and are immediately taken into consideration. The next application will be displayed immediately after the previous is processed.\n\nRemember that this power is a privilege.",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "I accept",
                  closeOnConfirm: true
              },
              function() {
                  $('.long.user.modal').modal('show');
              });

        }

      function selectUser(user){
          if (user != null) {
              $scope.selectedUser = user;
              $scope.selectedUser.sections = generateSections(user);
          }
          else {
              swal("Review Complete", "Good job! You've reached the end of the review queue", "success");
          }
      }

       $scope.exportCSV = function() {
        UserService
        .getAll()
        .success(function(data){

          var output = "";
          var titles = generateSections(data[0]);
           for(var i = 0; i < titles.length; i++){
            for(var j = 0; j < titles[i].fields.length; j++){
              output += titles[i].fields[j].name + ";";
            }
           }
           output += "\n";

          for (var rows = 0; rows < data.length; rows++){
            row = generateSections(data[rows]);
            for (var i = 0; i < row.length; i++){
              for(var j = 0; j < row[i].fields.length;j++){
                if(!row[i].fields[j].value){
                  output += ";";
                  continue;
                }
                var field = row[i].fields[j].value;
                try {
                  output += field.replace(/(\r\n|\n|\r)/gm," ") + ";";
                } catch (err){
                  output += field + ";";
                }
              }
            }
            output += "\n";
          }

          var element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
          element.setAttribute('download', "base " + new Date().toDateString() + ".csv");
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);

          });
      }

      $scope.removeUser = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "STOP, THIS ACTION IS DANGEROUS",
          text: "You are about to delete this user!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete them.",
          closeOnConfirm: false
        }, function(){

          swal({
            title: "[FINAL CHECK]\nARE YOU SURE YOU WANT TO DELETE " + user.profile.name + "?",
            text: "THIS ACTION IS IRREVERSIBLE AND MAY RESULT IN SERIOUS DAMAGE",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete this user.",
            closeOnConfirm: false
            }, function(){

            UserService
              .removeUser(user._id)
              .success(function(user){
                  $scope.users.splice(index, 1);
                  swal("Action Performed", user.profile.name + ' has been removed.', "success");
              })
              .error(function(err) {
                  swal("Access Denied", "You do not have permission to perform this action.", "error")
              });
            });
          });
      };

      $scope.voteAdmitUser = function($event, user, index) {
            $event.stopPropagation();

            swal({
                title: "Confirm Vote [ADMIT]",
                text: "Vote to ADMIT this user?\nYou CANNOT undo this decision.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, vote to admit.",
                closeOnConfirm: false
            }, function(){
              $('.long.user.modal').modal('hide');

              UserService
                  .voteAdmitUser(user._id)
                  .success(function(user){
                      if (user != "") {
                          $scope.users.splice(index, 1);
                          swal("Action Performed", "Voted successfully", "success");
                          if ($scope.users.length > 0) {
                              selectUser($scope.users[0]);
                          }
                          else {
                              $('.long.user.modal').modal('hide');
                              swal("Review Complete", "Good job! You've reached the end of the review queue", "success");
                          }
                      }
                      else {
                          swal("Error", "Action could not be performed.\nYou cannot vote on a user if status is locked!\nAdditionally, you cannot vote more than once!", "error");
                      }
                      $('.long.user.modal').modal('show');
                  })
                  .error(function(err) {
                      swal("Error", "Action could not be performed.", "error");
                      $('.long.user.modal').modal('show');
                  });

            });
        };

        $scope.voteRejectUser = function($event, user, index) {
            $event.stopPropagation();

            swal({
                title: "Confirm Vote [REJECT]",
                text: "Vote to REJECT?\nYou CANNOT undo this decision.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, vote to reject.",
                closeOnConfirm: false
            }, function(){
                $('.long.user.modal').modal('hide');

                UserService
                    .voteRejectUser(user._id)
                    .success(function(user){
                        if (user != "") {
                            $scope.users.splice(index, 1);
                            swal("Action Performed", "Voted to reject", "success");
                            $('.long.user.modal').modal('show');
                            if ($scope.users.length > 0) {
                                selectUser($scope.users[0]);
                            }
                            else {
                                $('.long.user.modal').modal('hide');
                                swal("Review Complete", "Good job! You've reached the end of the review queue", "success");
                            }
                        }
                        else {
                            swal("Error", "Action could not be performed.\nYou cannot vote on a user if status is locked!\nAdditionally, you cannot vote more than once!", "error");
                            $('.long.user.modal').modal('show');
                        }
                    })
                    .error(function(err) {
                        swal("Error", "Action could not be performed.", "error");
                        $('.long.user.modal').modal('show');
                    });

            });
        };


        function generateSections(user){
            return [
                {
                    name: 'Basic Info',
                    fields: [
                        {
                            name: 'Created On',
                            value: formatTime(user.timestamp)
                        },{
                            name: 'Last Updated',
                            value: formatTime(user.lastUpdated)
                        },{
                            name: 'Status',
                            value: user.status.name
                        },{
                            name: 'Team',
                            value: user.teamCode || 'None'
                        },{
                            name: 'Wave',
                            value: user.wave
                        },{
                            name: 'Requested travel reimbursement',
                            value: user.profile.needsReimbursement || 'False'
                        }
                        ,{
                            name: 'Departing from',
                            value: user.profile.departing
                        }
                    ]
                },{
                    name: 'Profile',
                    fields: [
                        {
                            name: 'School',
                            value: user.profile.school
                        },{
                            name: 'Grade',
                            value: user.profile.grade
                        },{
                            name: 'Hackathon Experience',
                            value: user.profile.pasthackathon || 'N/A'
                        }
                    ]
                },{
                    name: 'Additional',
                    fields: [
                        {
                            name: 'Website',
                            value: user.profile.site || 'N/A'
                        },
                        {
                            name: 'Devpost',
                            value: user.profile.devpost || 'N/A'
                        },
                        {
                            name: 'Github',
                            value: user.profile.github || 'N/A'
                        },
                        {
                            name: 'Method of Discovery',
                            value: user.profile.methodofdiscovery
                        },
                        {
                            name: 'Describe a project you\'re most proud of',
                            value: user.profile.essayproject
                        },
                        {
                            name: 'What do you hope to gain from MasseyHacks IV?',
                            value: user.profile.essaygain
                        },
                        {
                            name: 'Free comment',
                            value: user.profile.freeComment || 'N/A'
                        }
                        ,{
                            name: 'Spaces or Tabs',
                            value: user.profile.spacesOrTabs || 'N/A'
                        },
                    ]
                }
            ];
        }

      $scope.exportTRCSV = function() {
        UserService
        .getAll()
        .success(function(data){
          data = data.filter(function(user){
            return user.status.reimbursementApplied;
          })
          var output = "";
          var titles = generateTRSections(data[0]);
           for(var i = 0; i < titles.length; i++){
            for(var j = 0; j < titles[i].fields.length; j++){
              output += titles[i].fields[j].name + ";";
            }
           }
           output += "\n";

          for (var rows = 0; rows < data.length; rows++){
            row = generateTRSections(data[rows]);
            for (var i = 0; i < row.length; i++){
              for(var j = 0; j < row[i].fields.length;j++){
                if(!row[i].fields[j].value){
                  output += ";";
                  continue;
                }
                var field = row[i].fields[j].value;
                try {
                  output += field.replace(/(\r\n|\n|\r)/gm," ") + ";";
                } catch (err){
                  output += field + ";";
                }
              }
            }
            output += "\n";
          }

          var element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
          element.setAttribute('download', "base " + new Date().toDateString() + ".csv");
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);

          });
      }

      $scope.selectUser = selectUser;
      $scope.selectUserBody = selectUserBody;
      $scope.review = review;

      function review(users) {
            selectUser(users.length > 0 ? users[0] : null);
            $('.long.user.modal').modal('hide');
            swal({
                title: "Notice",
                text: "All votes are final and are immediately taken into consideration. The next application will be displayed immediately after the previous is processed.\n\nRemember that this power is a privilege.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "I accept",
                closeOnConfirm: true
            },
            function() {
                if (users.length > 0) {
                    $('.long.user.modal').modal('show');
                }
                else {
                    swal("Review Complete", "Good job! You've reached the end of the review queue", "success");
                }
            });
      }

    }]);
