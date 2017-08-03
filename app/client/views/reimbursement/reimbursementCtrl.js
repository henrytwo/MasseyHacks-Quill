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
    'angularFileUpload',
    function($scope, $rootScope, $state, $http, currentUser, Settings, Session, UserService, FileUploader){

      $scope.isDisabled = false;
      var uploader = $scope.uploader = new FileUploader();
      // Set up the user
      $scope.user = currentUser.data;
      $scope.user.reimbursement.dateOfBirth = new Date($scope.user.reimbursement.dateOfBirth);

      //var ibanCountries;
      $.getJSON('../assets/iban.json')
        .done(function(data){
            $scope.ibanCountries = data;
            checkCountryType();
            _setupForm();
        })
        .fail(function(data){
            console.log( "Error loading ibans.json" );
        });

      $('#countryOfB').change(function() {

          //When the Country of Bank field gets changed,
          //look through what is the type of the country
          //and set the state of disabled attribute based on that

          checkCountryType();
      });


      /**
       * TODO: JANK WARNING
       */


      function _updateUser(e){
        // Update user profile
        UserService
          .updateReimbursement(Session.getUserId(), $scope.user.reimbursement)
          .success(function(data){
            sweetAlert({
              title: "Awesome!",
              text: "Your travel reimbursement has been saved.",
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

        //here we get the length for the iban field validation

        if($scope.ibanCountries == undefined){
          if(country != undefined){
            return 10;
          }
          return 100;
        }
        else{
          var result = $scope.ibanCountries.filter(function(obj) {
            return obj.country == country;
          });

          if(result.length > 0){
            return result[0].ibanLength
          }

          return 25;
        }

      }
      function checkCountryType(){

        var disabledToggler = false;

        var filteredCountry = $scope.ibanCountries.filter(function(obj) {
          return obj.country == $('#countryOfB').val();
        });
        //filteredCountry is an array of one so we take the first element and check the type
        var countryType = "NotDefined"
        if(filteredCountry[0] != undefined){
          countryType = filteredCountry[0].countryType;
        }

        console.log(countryType);

        if(countryType == "SEPA" || countryType == "ibanAndBic"){
          $('.ibanField').attr('disabled', disabledToggler);
          $('.accountNumberField').attr('disabled', !disabledToggler);
          $('.addressOfBankField').attr('disabled', !disabledToggler);
          $('.zipCodeField').attr('disabled', !disabledToggler);
          $('.brokerageInfoField').attr('disabled', !disabledToggler);
        }
        else if(countryType == "ibanOrOther"){
          $('.ibanField').attr('disabled', disabledToggler);
          $('.accountNumberField').attr('disabled', disabledToggler);
          $('.addressOfBankField').attr('disabled', disabledToggler);
          $('.zipCodeField').attr('disabled', disabledToggler);
          $('.brokerageInfoField').attr('disabled', disabledToggler);
        }
        else if(countryType == "onlyIban" || countryType == "NotDefined"){
          $('.ibanField').attr('disabled', disabledToggler);
          $('.accountNumberField').attr('disabled', disabledToggler);
          $('.addressOfBankField').attr('disabled', disabledToggler);
          $('.zipCodeField').attr('disabled', disabledToggler);
          $('.brokerageInfoField').attr('disabled', disabledToggler);
        }

        //here the form gets destroed and set up again so that it can be validated again

        $('.ui.form').form('destroy');

        _setupForm(countryType);
      }

      function _setupForm(countryType){
        // Semantic-UI form validation
        var val = getIBANLength();
        var iban = {
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
        };
        if(countryType == "ibanOrOther"){
          iban.rules = [
            {
              type: 'exactLength[' + val +']',
              prompt: 'Your IBAN can be max. {ruleValue} long'
            }
          ]
        }
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
            iban: iban,
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
            brokerageInfo: {
              identifier: 'brokerageInfo',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter brokerage information.'
                }
              ]
            },
            correctInfo: {
              identifier: 'correctInfo',
              rules: [
                {
                  type: 'checked',
                  prompt: "Please indicate that you've double checked your information!"
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

    }]);
