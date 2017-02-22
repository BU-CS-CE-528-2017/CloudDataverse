(function () {
    'use strict';

    angular
      .module('core')
      .controller('OpenStackController', OpenStackController);

    function OpenStackController($scope, $http) {
        var vm = this;

        vm.User = {};
        vm.User.UserName = "";
        vm.User.Password = "";

        vm.AuthenticateUser = function () {
           
        };


    }
}());
