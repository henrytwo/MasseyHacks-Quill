angular.module('reg')
  .directive('fileInput', ['$parse', function($parse){
    return {
      restrict: 'A',
      link:function(scope,elm,attrs){
        elm.bind('change',function(){
          $parse(attrs.fileInput)
          .assign(scope,elm[0].files)
          scope.$apply()
        })
      }
    }
  }]);


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

      $scope.isSEPA = false;
      $scope.isUS = false;
      $scope.isRUS = false;
      $scope.isINDIA = false;
      $scope.isOther = false;



      $scope.upload = function() {
        var fd = new FormData()
        angular.forEach($scope.files,function(file){
          fd.append('file',file)
        })
        $http.post('/api/upload', fd,
        {
          transformRequest:angular.identity,
          headers:{'Content-Type':undefined}
        })
        .success(function(data) {
          console.log(data);
        })
      }
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
            console.log( "Error loading iban.json" );
        });

      $('#countryOfB').change(function() {

          //When the Country of Bank field gets changed,
          //look through what is the type of the country
          //and set the state of disabled attribute based on that
          if($('#countryOfB').val() != ''){
            checkCountryType();
          }
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
        console.log($scope.user.reimbursement)

        if(countryType == "SEPA" || countryType == "ibanAndBic" || countryType == "onlyIban"){
          //disable the fields that are not needed before they are hidden with ng-show
          $('.ibanField').attr('disabled', disabledToggler);
          $('.accountNumberField').attr('disabled', !disabledToggler);
          $('.addressOfBankField').attr('disabled', !disabledToggler);
          $('.bbanField').attr('disabled', !disabledToggler);
          $('.ccUSA').attr('disabled', !disabledToggler);
          $('.ifscField').attr('disabled', !disabledToggler);
          $('.rcpField').attr('disabled', !disabledToggler);
          $('.clearingCodeField').attr('disabled', !disabledToggler);
          $('.cityOfBankField').attr('disabled', !disabledToggler);
          $('.zipCodeBankField').attr('disabled', !disabledToggler);
          $('.brokerageInfoField').attr('disabled', !disabledToggler);

          $scope.isSEPA = true;
          $scope.isUS = false;
          $scope.isINDIA = false;
          $scope.isRUS = false;
          $scope.isOther = false;
        }

        else if(countryType == "ibanOrOther" || countryType == "NotDefined"){
          $('.ibanField').attr('disabled', !disabledToggler);
          $('.accountNumberField').attr('disabled', disabledToggler);
          $('.addressOfBankField').attr('disabled', disabledToggler);
          $('.bbanField').attr('disabled', !disabledToggler);
          $('.ccUSA').attr('disabled', !disabledToggler);
          $('.ifscField').attr('disabled', !disabledToggler);
          $('.rcpField').attr('disabled', !disabledToggler);
          $('.clearingCodeField').attr('disabled', disabledToggler);
          $('.cityOfBankField').attr('disabled', disabledToggler);
          $('.zipCodeBankField').attr('disabled', disabledToggler);
          $('.brokerageInfoField').attr('disabled', disabledToggler);

          $('.accountNumberLabel').html('IBAN / BBAN / Account number');

          $scope.isSEPA = false;
          $scope.isUS = false;
          $scope.isINDIA = false;
          $scope.isRUS = false;
          $scope.isOther = true;
        }
        else if(countryType == "US"){
          $('.ibanField').attr('disabled', !disabledToggler);
          $('.accountNumberField').attr('disabled', !disabledToggler);
          $('.addressOfBankField').attr('disabled', disabledToggler);
          $('.clearingCodeField').attr('disabled', !disabledToggler);
          $('.bbanField').attr('disabled', disabledToggler);
          $('.ccUSA').attr('disabled', disabledToggler);
          $('.ifscField').attr('disabled', !disabledToggler);
          $('.rcpField').attr('disabled', !disabledToggler);
          $('.cityOfBankField').attr('disabled', disabledToggler);
          $('.zipCodeBankField').attr('disabled', disabledToggler);
          $('.brokerageInfoField').attr('disabled', disabledToggler);

          $scope.isSEPA = false;
          $scope.isUS = true;
          $scope.isINDIA = false;
          $scope.isRUS = false;
          $scope.isOther = false;
        }
        else if(countryType == "IND"){
          $('.ibanField').attr('disabled', !disabledToggler);
          $('.accountNumberField').attr('disabled', !disabledToggler);
          $('.addressOfBankField').attr('disabled', disabledToggler);
          $('.clearingCodeField').attr('disabled', !disabledToggler);
          $('.bbanField').attr('disabled', disabledToggler);
          $('.ccUSA').attr('disabled', !disabledToggler);
          $('.ifscField').attr('disabled', disabledToggler);
          $('.rcpField').attr('disabled', disabledToggler);
          $('.cityOfBankField').attr('disabled', disabledToggler);
          $('.zipCodeBankField').attr('disabled', disabledToggler);
          $('.brokerageInfoField').attr('disabled', disabledToggler);

          $('.accountNumberLabel').innerHTML = 'Account number'

          $scope.isSEPA = false;
          $scope.isUS = false;
          $scope.isINDIA = true;
          $scope.isRUS = false;
          $scope.isOther = false;
        }
        else if(countryType == "RUS"){
          $('.ibanField').attr('disabled', !disabledToggler);
          $('.accountNumberField').attr('disabled', !disabledToggler);
          $('.addressOfBankField').attr('disabled', disabledToggler);
          $('.clearingCodeField').attr('disabled', !disabledToggler);
          $('.bbanField').attr('disabled', disabledToggler);
          $('.ccUSA').attr('disabled', !disabledToggler);
          $('.ifscField').attr('disabled', !disabledToggler);
          $('.rcpField').attr('disabled', !disabledToggler);
          $('.cityOfBankField').attr('disabled', disabledToggler);
          $('.BankField').attr('disabled', disabledToggler);
          $('.brokerageInfoField').attr('disabled', disabledToggler);

          $('.accountNumberLabel').innerHTML = 'Account number'

          $scope.isSEPA = false;
          $scope.isUS = false;
          $scope.isINDIA = false;
          $scope.isRUS = true;
          $scope.isOther = false;
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
              prompt: 'Your IBAN has to be {ruleValue} characters long'
            }
          ]
        };

        var swiftOrBic = {
          identifier: 'swiftOrBic',
          rules: [
            {
              type: 'empty',
              prompt: 'Please enter your SWIFT or BIC.'
            }
          ]
        };

        if(countryType == "ibanOrOther" || countryType == "onlyIban" || countryType == "NotDefined"){

          swiftOrBic.rules = [];

          iban.rules = [
            {
              type: 'maxLength[' + val +']',
              prompt: 'Your IBAN can be max. {ruleValue} characters long'
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
            swiftOrBic: {
              identifier: 'swiftOrBic',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the SWIFT or BIC'
                }
              ]
            },
            clearingCode: {
              identifier: 'clearingCode',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the clearing code.'
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
            bban: {
              identifier: 'bban',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your BBAN.'
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
            cityOfBank: {
              identifier: 'cityOfBank',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the city of your bank.'
                }
              ]
            },
            zipCode: {
              identifier: 'zipCode',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your ZIP Code.'
                }
              ]
            },
            zipCodeBank: {
              identifier: 'zipCodeBank',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter ZIP Code of your bank.'
                }
              ]
            },
            brokerageInfo: {
              identifier: 'brokerageInfo',
              rules: [
                {
                  type: 'maxLength[50]',
                  prompt: 'This field can only be 50 characters long.'
                }
              ]
            },
            cityOfBank: {
              identifier: 'fileUpload',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a file to upload'
                }
              ]
            },
            ifsc: {
              identifier: 'ifscField',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the IFSC.'
                },
                {
                  type: 'exactLength[11]',
                  prompt: 'IFSC must be 11 characters long.'
                }
              ]
            },
            receiptPurposeCode: {
              identifier: 'rcpField',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter the Receipt purpose code.'
                },
                {
                  type: 'exactLength[5]',
                  prompt: 'Receipt purpose code must be 5 characters long.'
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
