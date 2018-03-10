angular.module('reg')
  .controller('AdminUsersCtrl',[
    'currentUser',
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    function(currentUser, $scope, $state, $stateParams, UserService){

      $scope.adminUser = currentUser.data;

      $scope.param = 'sname';
      $scope.pages = [];
      $scope.users = [];
      // to know when to filter by date
      $scope.sorted = {'numVotes' : false, 'sname' : false, 'wave' : false, 'lastUpdated' : false};
      $scope.filter = {text:"", hacker: true};

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
      function updatePage(data){
        $scope.users = data.users;
        $scope.currentPage = data.page;
        $scope.pageSize = data.s;

        var p = [];
        for (var i = 0; i < data.totalPages; i++){
          p.push(i);
        }
        $scope.pages = p;
      }

      UserService
        .getPage($stateParams.page, $stateParams.size, $scope.filter, $scope.sorted[$scope.param], $scope.param)
        .success(function(data){
          updatePage(data);
        });

      $scope.sortBy = function(param){
        $scope.param = param;

        var s = !$scope.sorted[param];

        $scope.sorted = {'numVotes' : false, 'sname' : false, 'wave' : false, 'lastUpdated' : false};
        $scope.sorted[param] = s;

        UserService
                  .getPage($stateParams.page, $stateParams.size, $scope.filter, $scope.sorted[param], param)
                  .success(function(data){
                    updatePage(data);
                  });
      };

      $scope.filterUsers = function() {
        UserService
          .getPage($stateParams.page, $stateParams.size, $scope.filter, $scope.sorted[$scope.param], $scope.param)
          .success(function(data){
            updatePage(data);
          });
      }

      $scope.goToPage = function(page){
        $state.go('app.admin.users', {
          page: page,
          size: $stateParams.size || 50
        });
      };

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $state.go('app.admin.user', {
          id: user._id
        });
      };

      $scope.toggleCheckIn = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.checkedIn){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to check in " + user.profile.name + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, check them in.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .checkIn(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Action Performed", user.profile.name + ' has been checked in.', "success");
                });
            }
          );
        } else {
          UserService
            .checkOut(user._id)
            .success(function(user){
              $scope.users[index] = user;
              swal("Action Performed", user.profile.name + ' has been checked out.', "success");
            });
        }
      };

      $scope.toggleActivate = function($event, user, index) {
        $event.stopPropagation();

        if (user.active){
          swal({
              title: "Whoa, wait a minute!",
              text: "You are about to deactivate " + user.profile.name + "!",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, deactivate.",
              closeOnConfirm: false
            },
            function(){
              UserService
                .deactivate(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Action Performed", user.profile.name + ' has been deactivated.', "success");
                }).error(function(err) {
                swal("Access Denied", "You do not have permission to perform this action.", "error")
              });
            }
          );
        } else {
          UserService
            .activate(user._id)
            .success(function(user){
              $scope.users[index] = user;
              swal("Action Performed", user.profile.name + ' has been activated.', "success");
            }).error(function(err) {
            swal("Access Denied", "You do not have permission to perform this action.", "error")
          });
        }
      };

      $scope.toggleReject = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.rejected){
          swal({
            title: "Whoa, wait a minute!\n[FORCE ACTION]",
            text: "You are about to reject " + user.profile.name + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, reject.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .reject(user._id)
                .success(function(user){
                  if(user !== ""){//User cannot be found if user is accepted
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
                    swal("Action Performed", user.profile.name + ' has been rejected.', "success");
                    }
                  else
                    swal("Could not be rejected", 'User cannot be rejected if its not verified or it is admitted', "error");
                })
                .error(function(err) {
                    swal("Access Denied", "You do not have permission to perform this action.", "error")
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
              swal("Action Performed", user.profile.name + ' has been unrejected.', "success");
            })
            .error(function(err) {
                swal("Access Denied", "You do not have permission to perform this action.", "error")
            });
        }
      };

      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "Whoa, wait a minute!\n[FORCE ACTION]",
          text: "You are about to accept " + user.profile.name + "!",
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

                UserService
                  .admitUser(user._id)
                  .success(function(user){
                    if(user != ""){// User cannot be found if user is rejected
                      if(index == null){ //we don't have index because acceptUser has been called in pop-up
                        for(var i = 0; i < $scope.users.length; i++){
                          if($scope.users[i]._id === user._id){
                            $scope.users[i] = user;
                            selectUser(user);
                            }
                          }
                        }
                        else
                          $scope.users[index] = user;
                          swal("Action Performed", user.profile.name + ' has been admitted.', "success");
                    }
                    else
                      swal("Could not be accepted", 'User cannot be accepted if the user is rejected. Please remove rejection.', "error");
                  })
                  .error(function(err) {
                      swal("Access Denied", "You do not have permission to perform this action.", "error")
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
        if (user.volunteer){
          return 'negative';
        }
        if (user.status.confirmed) {
          return 'positive';
        }
        if (user.status.admitted && !user.status.confirmed) {
          return 'warning';
        }
      };

      function selectUser(user){
        $scope.selectedUser = user;
        $scope.selectedUser.sections = generateSections(user);

        $('.long.user.modal').modal('show');
      }

      function getState(status) {
          if (status.checkedIn) {
              return 'checked in';
          }

          if (status.declined) {
              return "declined";
          }

          if (status.rejected) {
              return "rejected";
          }

          if (status.waitlisted) {
              return "waitlisted";
          }

          if (status.confirmed) {
              return "confirmed";
          }

          if (status.admitted) {
              return "admitted";
          }
          if (status.completedProfile) {
              return "submitted";
          }

          return "incomplete";

      }
      
      $scope.exportVoter = function () {
          UserService
              .getAllMaster()
              .success(function(rawData){
                  var reviewers = [];
                  var hackers = {};

                  for (var i = 0; i < rawData.length; i++) {
                      if (rawData[i].reviewer && !rawData[i].developer) {
                          reviewers.push(rawData[i].email);
                      }
                  }

                  for (var x = 0; x < rawData.length; x++) {
                      if (!rawData[x].volunteer) {

                          var hackerName = ((rawData[x].profile.name) ? rawData[x].profile.name : rawData[x].nickname) + "\";\"" + rawData[x].email;

                          hackers[hackerName] = [getState(rawData[x].status).toUpperCase(), rawData[x].status.admittedBy ? rawData[x].status.admittedBy : 'N/A'];

                          for (var m = 0; m < reviewers.length; m++) {
                              hackers[hackerName].push('');
                          }
                          for (var a = 0; a < rawData[x].applicationAdmit.length; a++) {
                              var index = reviewers.indexOf(rawData[x].applicationAdmit[a]);
                              if (index > -1) {
                                  hackers[hackerName][2 + index] = 'ADMIT';
                              }
                          }
                          for (var r = 0; r < rawData[x].applicationReject.length; r++) {
                              var index = reviewers.indexOf(rawData[x].applicationReject[r]);
                              if (index > -1) {
                                  hackers[hackerName][2 + index] = 'REJECT';
                              }
                          }
                      }
                  }

                  var output = "Name;Email;Status;Admitted By (If Applicable);";

                  for(var i = 0; i < reviewers.length; i++){
                      output += "\"" + reviewers[i] + "\";";
                  }
                  output += "\n";

                  for (var key in hackers){
                      var row = hackers[key];
                      output += "\"" + key + "\";";
                      for (var i = 0; i < row.length; i++){
                          if(!row[i]){
                              output += ";";
                              continue;
                          }
                          var field = row[i];
                          try {
                              output += "\"" + field.replace(/(\r\n|\n|\r|\t)/gm," ") + "\";";
                          } catch (err){
                              output += "\"" + field + "\";";
                          }

                      }
                      output += "\n";
                  }

                  var element = document.createElement('a');
                  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
                  element.setAttribute('download', "votes " + new Date().toDateString() + ".csv");
                  element.style.display = 'none';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);

          });
      }

       $scope.exportCSV = function() {
        UserService
        .getPageFull(0, $stateParams.size, $scope.filter, false, 'sname')
        .success(function(rawData){
          var data = rawData['users'];

          console.log(data);

          var output = "";
          var titles = generateSections(data[0]);
           for(var i = 0; i < titles.length; i++){
            for(var j = 0; j < titles[i].fields.length; j++){
              output += "\"" + titles[i].fields[j].name + "\";";
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
                  output += "\"" + field.replace(/(\r\n|\n|\r|\t)/gm," ") + "\";";
                } catch (err){
                  output += "\"" + field + "\";";
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
          text: "You are about to delete " + user.profile.name + "!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete them.",
          closeOnConfirm: false
        }, function(){

          swal({
            title: "ARE YOU SURE YOU WANT TO DELETE " + user.profile.name + "?",
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
                text: "Vote to ADMIT " + user.profile.name + "?\nYou CANNOT undo this decision.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, vote to admit.",
                closeOnConfirm: false
            }, function(){

              UserService
                  .voteAdmitUser(user._id)
                  .success(function(user){
                      if (user != "") {
                          $scope.users[index] = user;
                          swal("Action Performed", "Voted to admit " + user.profile.name, "success");
                      }
                      else {
                          swal("Error", "Action could not be performed.\nYou cannot vote on a user if status is locked!\nAdditionally, you cannot vote more than once!", "error");
                      }
                  })
                  .error(function(err) {
                      swal("Error", "Action could not be performed.", "error")
                  });

            });
        };

        $scope.voteRejectUser = function($event, user, index) {
            $event.stopPropagation();

            swal({
                title: "Confirm Vote [REJECT]",
                text: "Vote to REJECT " + user.profile.name + "?\nYou CANNOT undo this decision.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, vote to reject.",
                closeOnConfirm: false
            }, function(){

                UserService
                    .voteRejectUser(user._id)
                    .success(function(user){
                        if (user != "") {
                            $scope.users[index] = user;
                            swal("Action Performed", "Voted to reject " + user.profile.name, "success");
                        }
                        else {
                            swal("Error", "Action could not be performed.\nYou cannot vote on a user if status is locked!\nAdditionally, you cannot vote more than once!", "error");
                        }
                    })
                    .error(function(err) {
                        swal("Error", "Action could not be performed.", "error")
                    });

            });
        };


        function generateSections(user){
        return [
          {
            name: 'Admission Information',
              fields: [
                  {
                      name: 'Admitted by',
                      value: user.status.admittedBy ? user.status.admittedBy : 'N/A'
                  },
                  {
                    name: 'Voted by',
                    value: user.votedBy
                  },
                  {
                      name: 'Votes',
                      value: user.numVotes + '/5'
                  },
                  {
                      name: 'Wave',
                      value: user.wave
                  }
              ]
          },
          {
            name: 'Basic Info',
            fields: [
              {
                name: 'Created On',
                value: formatTime(user.lastUpdated)
              },{
                name: 'Last Updated',
                value: formatTime(user.lastUpdated)
              },{
                name: 'Confirm By',
                value: formatTime(user.status.confirmBy) || 'N/A'
              },{
                name: 'Status',
                value: user.status.name
              },{
                name: 'Waiver',
                value: user.status.waiver
              },{
                name: 'Checked In',
                value: formatTime(user.status.checkInTime) || 'N/A'
              },{
                name: 'Name',
                value: user.profile.name
              }
              ,{
                name: 'Email',
                value: user.email
              },{
                name: 'Phone',
                value: user.profile.phone
              },{
                name: 'ID',
                value: user.id
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
                name: 'Gender',
                value: user.profile.gender
              },{
                name: 'School',
                value: user.profile.school
              },{
                name: 'Grade',
                value: user.profile.grade
              },{
                name: 'Ethnicity',
                value: user.profile.ethnicity
              },{
                name: 'Dietary Restrictions',
                value: user.profile.diet
              },{
                name: 'Shirt Size',
                value: user.profile.shirt
              },{
                name: 'Hackathon Experience',
                value: user.profile.pasthackathon || 'N/A'
              }
            ]
          },{
        fields: [
            {
                name: 'Website',
                type: 'url',
                value: user.profile.site || 'N/A'
            },
            {
                name: 'Devpost',
                type: 'url',
                value: user.profile.devpost || 'N/A'
            },
            {
                name: 'Github',
                type: 'url',
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
                name: 'Workshops',
                value: user.profile.workshop
            },
              {
                name: 'Free comment',
                value: user.profile.freeComment
              }
              ,{
                name: 'Spaces or Tabs',
                value: user.profile.spacesOrTabs
              },
            ]
          },{
            name: 'Confirmation',
            fields: [
              {
                name: 'Additional notes',
                value: user.confirmation.notes
              },
                {
                    name: 'Waterloo/Toronto Bus',
                    value: user.confirmation.bus
                }
            ]
          }
        ];
      }

      $scope.selectUser = selectUser;

    }]);
