(function () {
    'use strict';

    angular
      .module('core')
      .controller('ComputeController', ComputeController);

    function ComputeController($scope, $http) {
        var vm = this;
        vm.ServerList = {};

        $(function () {
            $http.get('/api/list/servers')
                .then(function (res) {
                    vm.ServerList = res.data;
                })
        });


    }
}());
