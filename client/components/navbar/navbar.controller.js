'use strict';

angular.module('baseApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, $http) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.hasRole = Auth.hasRole;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.isVerified =  function () {
      return $scope.getCurrentUser().emailConfirmed && $scope.isLoggedIn();
    };

    $scope.resendVerification = function (){
      $http.get('/api/users/resendVerification/'+$scope.getCurrentUser()._id)
        .success((function(data){
          if (data === 'OK') {
            $scope.verificationSent = true;
          }
        }))
    }
  });
