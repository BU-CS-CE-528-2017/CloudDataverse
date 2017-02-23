(function () {
    'use strict';

    angular
      .module('core')
      .controller('ComputeController', ComputeController);

    function ComputeController($scope, $http) {
        var vm = this;
        vm.ServerList = {};

        $http.get('/api/list/servers')
            .then(function (res) {
                vm.ServerList = res.data;

                $http.get('/api/list/flavors')
                    .then(function (res) {
                        vm.Flavors = res.data;

                        $http.get('/api/list/images')
                            .then(function (res) {
                                vm.Images = res.data;
                            })
                    })
            })

    }
}());
