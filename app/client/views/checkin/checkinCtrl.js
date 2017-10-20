angular.module('reg')
.controller('CheckinCtrl', [
  '$scope',
  '$stateParams',
  'UserService',
  function($scope, $stateParams, UserService){
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
              $scope.filterUsers();
            })
            .error(function(res){
              sweetAlert("Uh oh!", "User not admitted/confirmed or not valid!", "error");
            });
        },
      function(error){
      }, function(videoError){
        //the video stream could be opened
      }
    );
    $scope.pages = [];
    $scope.users = [];

    // Semantic-UI moves modal content into a dimmer at the top level.
    // While this is usually nice, it means that with our routing will generate
    // multiple modals if you change state. Kill the top level dimmer node on initial load
    // to prevent this.
    $('.ui.dimmer').remove();
    // Populate the size of the modal for when it appears, with an arbitrary user.
    $scope.selectedUser = {};
    $scope.selectedUser.sections = generateSections({status: '',
    confirmation: {
      dietaryRestrictions: []
    }, profile: {
      occupationalStatus: [],
      bestTools: [],
      previousJunction: []
    }, reimbursement: {
          dateOfBirth: [],
    }
    });

    function updatePage(data){
      console.log(data.users)
      $scope.users = data.users.filter(function(user){
        return user.status.admitted !== false;
      }).filter(function(user){
        return user.status.declined !== true;
      });
      $scope.currentPage = data.page;
      $scope.pageSize = data.size;

      var p = [];
      for (var i = 0; i < data.totalPages; i++){
        p.push(i);
      }
      $scope.pages = p;
    }
    $scope.filterUsers = function() {
      UserService
        .getPage($stateParams.page, $stateParams.size, $scope.filter)
        .success(function(data){
          updatePage(data);
        });
    }

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
                swal("Accepted", user.profile.name + ' has been checked in.', "success");
              });
          }
        );
      } else {
        UserService
          .checkOut(user._id)
          .success(function(user){
            $scope.users[index] = user;
            swal("Accepted", user.profile.name + ' has been checked out.', "success");
          });
      }
    };

    UserService
      .getPage($stateParams.page, $stateParams.size, $stateParams.query, $scope.filter)
      .success(function(data){
        updatePage(data);
      });

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

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
                name: 'Confirm By',
                value: formatTime(user.status.confirmBy) || 'N/A'
              },{
                name: 'Status',
                value: user.status.name
              },{
                name: 'Rejected',
                value: user.status.rejected
              },{
                name: 'Checked In',
                value: formatTime(user.status.checkInTime) || 'N/A'
              },{
                name: 'Name',
                value: user.profile.name
              },{
                name: 'Email',
                value: user.email
              },{
                name: 'ID',
                value: user.id
              },{
                name: 'Team',
                value: user.teamCode || 'None'
              },{
                name: 'Requested travel reimbursement class',
                value: user.profile.needsReimbursement && user.profile.AppliedreimbursementClass || 'None'
              },{
                name: 'Accepted travel reimbursement',
                value: user.profile.AcceptedreimbursementClass || 'None'
              }
            ]
          },{
            name: 'Profile',
            fields: [
              {
                name: 'Age',
                value: user.profile.age
              },{
                name: 'Gender',
                value: user.profile.gender
              },{
                name: 'Phone',
                value: user.confirmation.phone
              },{
                name: 'School',
                value: user.profile.school
              },{
                name: 'Graduation Year',
                value: user.profile.graduationYear
              },{
                name: 'Major',
                value: user.profile.major
              },{
                name: 'Degree',
                value: user.profile.degree
              },{
                name: 'Travels from Country',
                value: user.profile.travelFromCountry
              },{
                name: 'Travels from City',
                value: user.profile.travelFromCity
              },{
                name: 'Home Country',
                value: user.profile.homeCountry
              },{
                name: 'Team role',
                value: user.profile.description
              },{
                name: 'Needs Travel Reimbursement',
                value: user.profile.needsReimbursement,
                type: 'boolean'
              },{
                name: 'Needs Accommodation',
                value: user.profile.applyAccommodation,
                type: 'boolean'
              },{
                name: 'Most interesting track',
                value: user.profile.mostInterestingTrack
              },{
                name: 'Occupational status',
                value: user.profile.occupationalStatus.join(', ')
              },{
                name: 'Top level tools',
                value: user.profile.topLevelTools
              },{
                name: 'Great level tools',
                value: user.profile.greatLevelTools
              },{
                name: 'Good level tools',
                value: user.profile.goodLevelTools
              },{
                name: 'Beginner level tools',
                value: user.profile.beginnerLevelTools
              },{
                name: 'Coding experience',
                value: user.profile.codingExperience
              },{
                name: 'Hackathons visited',
                value: user.profile.howManyHackathons
              },{
                name: 'Motivation',
                value: user.profile.essay
              },
            ]
          },{
            name: 'Additional',
            fields: [
              {
                name: 'Portfolio',
                value: user.profile.portfolio
              },
              {
                name: 'Linkedin',
                value: user.profile.linkedin
              },
              {
                name: 'Github',
                value: user.profile.github
              },{
                name: 'Interest in job opportunities',
                value: user.profile.jobOpportunities
              },{
                name: 'Special Needs',
                value: user.confirmation.specialNeeds || 'None'
              },{
                name: 'Previous Junctions',
                value: user.profile.previousJunction.join(', ')
              },{
                name: 'Secret code',
                value: user.profile.secret
              },{
                name: 'Free comment',
                value: user.profile.freeComment
              },{
                name: 'OS',
                value: user.profile.operatingSystem
              },{
                name: 'Spaces or Tabs',
                value: user.profile.spacesOrTabs
              },
            ]
          },{
            name: 'Confirmation',
            fields: [
              {
                name: 'Dietary Restrictions',
                value: user.confirmation.dietaryRestrictions.join(', ')
              },{
                name: 'Shirt Size',
                value: user.confirmation.shirtSize
              },{
                name: 'Needs Hardware',
                value: user.confirmation.needsHardware,
                type: 'boolean'
              },{
                name: 'Hardware Requested',
                value: user.confirmation.hardware
              },{
                name: 'Additional notes',
                value: user.confirmation.notes
              }
            ]
          },{
            name: 'Reimbursement',
            fields: [
              {
                name: 'Date of birth',
                value: formatTime(user.reimbursement.dateOfBirth)
              },{
                name: 'AddressLine 1',
                value: user.reimbursement.addressLine1
              },{
                name: 'AddressLine 2',
                value: user.reimbursement.addressLine2
              },{
                name: 'State/Province/Region',
                value: user.reimbursement.stateProvinceRegion
              },{
                name: 'A country Of Bank',
                value: user.reimbursement.countryOfBank
              },{
                name: 'Name Of the Bank',
                value: user.reimbursement.nameOfBank
              },{
                name: 'Address Of the Bank',
                value: user.reimbursement.addressOfBank
              },{
                name: 'Iban',
                value: user.reimbursement.iban
              },{
                name: 'Account Number',
                value: user.reimbursement.accountNumber
              },{
                name: 'swiftOrBicOrClearingCode',
                value: user.reimbursement.swiftOrBicOrClearingCode
              },{
                name: 'Brokerage Info',
                value: user.reimbursement.brokerageInfo
              },{
                name: 'Additional',
                value: user.reimbursement.additional
              },
            ]
          },
        ];
      }
  }]);