angular.module('reg')
  .controller('ReimbursementCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, currentUser, Settings, Session, UserService){

      $scope.isDisabled = false;

      // Set up the user
      $scope.user = currentUser.data;
      // Populate the school dropdown

      _setupForm();
      checkSepa();


      /**
       * TODO: JANK WARNING
       */


      function _updateUser(e){
        // Update user teamCode
        if ($scope.user.teamCode) {
          UserService
            .joinOrCreateTeam($scope.user.teamCode)
            .success(function(user){
              console.log('Successfully updated teamCode')
            })
            .error(function(res){
              console.log("Failed to update teamCode");
            });
          }


        // Update user profile
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .success(function(data){
            sweetAlert({
              title: "Awesome!",
              text: "Your application has been saved.",
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

      function getIBANLength(){
        var country = $('#countryOfB').val();


        var ibanCountries = [
          {
            'country': 'Austria',
            'ibanLength': '20'
          },
          {
            'country': 'Belgium',
            'ibanLength': '16'
          },
          {
            'country': 'Bulgaria',
            'ibanLength': '22'
          },
          {
            'country': 'Croatia',
            'ibanLength': '21'
          },
          {
            'country': 'Cyprus',
            'ibanLength': '28'
          },
          {
            'country': 'Czech Republic',
            'ibanLength': '24'
          },
          {
            'country': 'Denmark',
            'ibanLength': '18'
          },
          {
            'country': 'Estonia',
            'ibanLength': '20'
          },
          {
            'country': 'Finland',
            'ibanLength': '18'
          },
          {
            'country': 'France',
            'ibanLength': '27'
          },
          {
            'country': 'Germany',
            'ibanLength': '22'
          },
          {
            'country': 'Gibraltar',
            'ibanLength': '23'
          },
          {
            'country': 'Greece',
            'ibanLength': '27'
          },
          {
            'country': 'Hungary',
            'ibanLength': '28'
          },
          {
            'country': 'Iceland',
            'ibanLength': '26'
          },
          {
            'country': 'Ireland',
            'ibanLength': '22'
          },
          {
            'country': 'Italy',
            'ibanLength': '27'
          },
          {
            'country': 'Latvia',
            'ibanLength': '21'
          },
          {
            'country': 'Liechtenstein',
            'ibanLength': '21'
          },
          {
            'country': 'Lithuania',
            'ibanLength': '20'
          },
          {
            'country': 'Luxembourg',
            'ibanLength': '20'
          },
          {
            'country': 'Malta',
            'ibanLength': '31'
          },
          {
            'country': 'Monaco',
            'ibanLength': '27'
          },
          {
            'country': 'Netherlands',
            'ibanLength': '18'
          },
          {
            'country': 'Norway',
            'ibanLength': '15'
          },
          {
            'country': 'Poland',
            'ibanLength': '28'
          },
          {
            'country': 'Portugal',
            'ibanLength': '25'
          },
          {
            'country': 'Romania',
            'ibanLength': '24'
          },
          {
            'country': 'San Marino',
            'ibanLength': '27'
          },
          {
            'country': 'Slovakia',
            'ibanLength': '24'
          },
          {
            'country': 'Slovenia',
            'ibanLength': '19'
          },
          {
            'country': 'Spain',
            'ibanLength': '24'
          },
          {
            'country': 'Sweden',
            'ibanLength': '24'
          },
          {
            'country': 'Switzerland',
            'ibanLength': '21'
          },
          {
            'country': 'United Kingdom',
            'ibanLength': '22'
          },
        ]


        var result = ibanCountries.filter(function(obj) {
          return obj.country == country;
        });

        if(result.length > 0){
          return result[0].ibanLength
        }
        return 30;

      }

      function _setupForm(){
        // Semantic-UI form validation
        var val = getIBANLength();
        $('.ui.form').form({
          inline:true,
          fields: {
            fullName: {
              identifier: 'fullName',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your full name.'
                }
              ]
            },
            dateOfBirth: {
              identifier: 'dateOfBirth',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your date of birth.'
                }
              ]
            },
            addressLine1: {
              identifier: 'addressLine1',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your street address.'
                }
              ]
            },
            addressLine2: {
              identifier: 'addressLine2',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter information about your apartment.'
                }
              ]
            },

            countryOfBank: {
              identifier: 'countryOfBank',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select the country of your bank.'
                }
              ]
            },
            nameOfBank: {
              identifier: 'nameOfBank',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the name of your bank.'
                }
              ]
            },
            swiftOrBicOrClearingCode: {
              identifier: 'swiftOrBicOrClearingCode',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the SWIFT, BIC or Clearing code.'
                }
              ]
            },
            iban: {
              identifier: 'iban',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your IBAN.'
                },
                {
                  type: 'exactLength[' + val + ']',
                  prompt: 'Your IBAN has to be {ruleValue} long'
                }
              ]
            },
            accountNumber: {
              identifier: 'accountNumber',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your Account number.'
                }
              ]
            },
            addressOfBank: {
              identifier: 'addressOfBank',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the address of your bank.'
                }
              ]
            },
            zipCode: {
              identifier: 'zipCode',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter ZIP Code.'
                }
              ]
            },
            correspondentBank: {
              identifier: 'correspondentBank',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter Correspondent Bank.'
                }
              ]
            }
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

      function checkSepa(){
        var SEPA = [
          "Netherlands",
          "Belgium",
          "Bulgaria",
          "Estonia",
          "Spain",
          "Ireland",
          "Great Britain",
          "Italy",
          "Austria",
          "Greece",
          "Croatia",
          "Cypros",
          "Latvia",
          "Lithuania",
          "Luxembourg",
          "Malta",
          "Portugal",
          "Poland",
          "France",
          "Romania",
          "Sweden",
          "Germany",
          "Slovakia",
          "Slovenia",
          "Finland",
          "Denmark",
          "Czech Republic",
          "Hungary",
          "Iceland",
          "Liechtenstein",
          "Norway",
          "Switzerland",
        ]
        $('#countryOfB').change(function() {
            var check_sepa = SEPA.includes($('#countryOfB').val());
            $('.notSepa').attr('disabled', check_sepa);
            $('.sepa').attr('disabled', !check_sepa);

            $('.ui.form').form('destroy');
            _setupForm();
        });
      }

    }]);
