function loadScript(url, callback){

  var script = document.createElement("script")
  script.type = "text/javascript";

  if (script.readyState){  //IE
    script.onreadystatechange = function(){
      if (script.readyState == "loaded" ||
        script.readyState == "complete"){
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {  //Others
    script.onload = function(){
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}

var scanner;
var camNum = 0;
var flipped = true;


angular.module('reg')
    .controller('CheckinCtrl', [
        '$scope',
        '$stateParams',
        'UserService',
        '$state',
        function ($scope, $stateParams, UserService, $state) {

            loadScript("https://rawgit.com/schmich/instascan-builds/master/instascan.min.js", function () {
                scanner = new Instascan.Scanner({video: document.getElementById('preview')});

                scanner.addListener('scan', function (data, image) {
                    //Change the input fields value and send post request to the backend
                    $scope.filterUsers();
                    $('#qrInput').attr("value", data);
                    $scope.filterUsers();
                    console.log(data);
                    UserService
                        .QRcheckIn(data)
                        .success(function (user) {
                            selectUser(user);
                        })
                        .error(function (res) {
                            if (res === "User not confirmed!") {
                                sweetAlert("Hey!", "This user did not confirm they are coming!", "error");
                            }
                            /*else if(res === "User already checked in!"){
                              sweetAlert("Again?", "User already checked in!", "error")
                            }*/
                            else if (res === "User is rejected!") {
                                sweetAlert("Hey!", "This user is rejected!", "error");
                            }
                            else {
                                sweetAlert("Uh oh!", "User does not exist or isn't admitted!", "error");
                            }
                        });
                });

                Instascan.Camera.getCameras().then(function (cameras) {
                    if (cameras.length > 0) {
                        scanner.start(cameras[camNum]);
                    } else {
                        console.error('No cameras found.');
                    }
                }).catch(function (e) {
                    console.error(e);
                });
            });

            $scope.pages = [];
            $scope.users = [];
            $scope.sortDate = true;

            // Semantic-UI moves modal content into a dimmer at the top level.
            // While this is usually nice, it means that with our routing will generate
            // multiple modals if you change state. Kill the top level dimmer node on initial load
            // to prevent this.
            $('.ui.dimmer').remove();
            // Populate the size of the modal for when it appears, with an arbitrary user.
            $scope.selectedUser = {};
            $scope.selectedUser.sections = generateSections({
                status: '',
                confirmation: {
                    notes: []
                }, profile: {
                    occupationalStatus: [],
                    bestTools: [],
                    previousJunction: []
                }, reimbursement: {
                    dateOfBirth: [],
                }
            });

            $scope.switchCam = function () {
                console.log("switch");
                Instascan.Camera.getCameras().then(function (cameras) {
                    if (cameras.length > 0) {
                        if (camNum + 1 < cameras.length) {
                            camNum += 1;
                        } else {
                            camNum = 0;
                        }

                        console.log(camNum);
                        scanner.start(cameras[camNum]);
                    } else {
                        console.error('No cameras found.');
                    }
                }).catch(function (e) {
                    console.error(e);
                });
            }

            $scope.flip = function () {
                console.log("flip");
                var cam = document.getElementById('preview');

                if (flipped) {
                    cam.style.transform = "scaleX(1)";
                } else {
                    cam.style.transform = "scaleX(-1)";
                }

                flipped = !flipped;
            }

            function updatePage(data) {
                $scope.users = data.users.filter(function (user) {
                    return user.status.admitted !== false;
                }).filter(function (user) {
                    return user.status.declined !== true;
                }).filter(function (user) {
                    return user.admin !== true && user.volunteer !== true && user.owner !== true && user.status.confirmed === true;
                });
                $scope.currentPage = data.page;
                $scope.pageSize = data.size;

                var p = [];
                for (var i = 0; i < Math.ceil($scope.users.length / $scope.pageSize); i++) {
                    p.push(i);
                }
                $scope.pages = p;
            }

            $scope.goToPage = function(page) {
                $state.go('app.checkin', {
                    page: page,
                    size: 50
                });
            }

            $scope.filterUsers = function () {
                UserService
                    .getPageFull($stateParams.page, 50, $scope.filter, $scope.sortDate, 'sname')
                    .success(function (data) {
                        updatePage(data);
                    });
            }

            $scope.toggleCheckIn = function ($event, user, index) {
                $event.stopPropagation();

                if (!user.status.checkedIn) {
                    swal({
                            title: "Whoa, wait a minute!",
                            text: "You are about to check in " + user.profile.name + "!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, check them in.",
                            closeOnConfirm: false
                        },
                        function () {
                            UserService
                                .checkIn(user._id)
                                .success(function (user) {
                                    $scope.users[index] = user;
                                    swal("Check!", user.profile.name + ' has been checked in.', "success");
                                    if(!$scope.$$phase) {
                                        $scope.$apply();
                                    }
                                    $('.long.user.modal').modal('hide');
                                });
                        }
                    );
                }
                else {
                    swal({
                            title: "Whoa, wait a minute!",
                            text: "You are about to check out " + user.profile.name + "!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, check them out.",
                            closeOnConfirm: false
                        },
                        function () {
                            swal({
                                title: "Are you ABSOLUTELY SURE?",
                                text: "You are about to CHECK OUT " + user.profile.name + "!",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Yes, CHECK OUT.",
                                closeOnConfirm: false
                            }, function () {
                                UserService
                                    .checkOut(user._id)
                                    .success(function (user) {
                                        $scope.users[index] = user;
                                        swal("Checked out", user.profile.name + ' has been checked out.', "success");
                                        $('.long.user.modal').modal('hide');
                                    })
                            });
                        })
                }


            };

            function selectUser(user) {
                $scope.selectedUser = user;
                $scope.selectedUser.sections = generateSections(user);
                $('.long.user.modal')
                    .modal('show');
            }

            $scope.checkInUser = function ($event, user, index) {
                $event.stopPropagation();


                swal({
                    title: "Whoa, wait a minute!",
                    text: "You are about to check in " + user.profile.name + "!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, CHECK IN!",
                    closeOnConfirm: false
                }, function () {


                    UserService
                        .checkIn(user._id)
                        .success(function (user) {
                            $scope.users[index] = user;
                            swal("Checked in!", user.profile.name + ' has been checked in successfully!.', "success");
                            $('.long.user.modal').modal('hide');
                        })
                        .error(function () {
                            swal("Something went wrong!", "error")
                        });

                });

            };



            $scope.checkInUserFull = function ($event, user, index) {
                $event.stopPropagation();


                swal({
                    title: "Whoa, wait a minute!",
                    text: "You are about to check in " + user.profile.name + "!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, CHECK IN!",
                    closeOnConfirm: false
                }, function () {


                    UserService
                        .checkIn(user._id)
                        .success(function (user) {
                            $scope.users[index] = user;
                            swal({title:"Checked in!", text:user.profile.name + ' has been checked in successfully!.', type:"success"}, function () {
                                location.reload();
                            });
                            $('.long.user.modal').modal('hide');

                        })
                        .error(function () {
                            swal("Something went wrong!", "error")
                        });

                });

            };


            $scope.checkOutUserFull = function ($event, user, index) {
                $event.stopPropagation();

                swal({
                        title: "Whoa, wait a minute!",
                        text: "You are about to check out " + user.profile.name + "!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, check them out.",
                        closeOnConfirm: false
                    },
                    function () {
                        swal({
                            title: "Are you ABSOLUTELY SURE?",
                            text: "You are about to CHECK OUT " + user.profile.name + "!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, CHECK OUT.",
                            closeOnConfirm: false
                        }, function () {
                            UserService
                                .checkOut(user._id)
                                .success(function (user) {
                                    $scope.users[index] = user;
                                    swal({title:"Checked in!", text:user.profile.name + ' has been checked out successfully!.', type:"success"}, function () {
                                        location.reload();
                                    });
                                    $('.long.user.modal').modal('hide');
                                })
                        });
                    })

            };


            UserService
                .getPageFull($stateParams.page, 50, $scope.filter, $scope.sortDate, 'timestamp')
                .success(function (data) {
                    updatePage(data);
                });

            function formatTime(time) {
                if (time) {
                    return moment(time).format('MMMM Do YYYY, h:mm:ss a');
                }
            }

            function generateSections(user) {
                return [
                    {
                        name: 'Basic Info',
                        fields: [
                            {
                                name: 'Checked In',
                                value: user.status.checkedIn,
                                type: 'boolean'
                            }, {
                                name: 'Waiver',
                                value: user.status.waiver,
                                type: 'boolean'
                            }, {
                                name: 'Name',
                                value: user.profile.name
                            }, {
                                name: 'Email',
                                value: user.email
                            }, {
                                name: 'ID',
                                value: user.id
                            }, /*{
                                name: 'Team',
                                value: user.teamCode || 'None'
                            },*/
                            {
                                name: 'Shirt Size',
                                value: user.profile.shirt,
                                type: 'string'
                            }
                        ]
                    }, {
                        name: 'Profile',
                        fields: [
                            {
                                name: 'Grade',
                                value: user.profile.grade
                            }, {
                                name: 'School',
                                value: user.profile.school
                            }, {
                                name: 'Departing from',
                                value: user.profile.departing
                            }, {
                                name: 'Travel reimbursement',
                                value: user.status.travelreimbursement,
                                type: 'boolean'
                            }
                        ]
                    },
                ];
            }

            $scope.selectUser = selectUser;
        }]);