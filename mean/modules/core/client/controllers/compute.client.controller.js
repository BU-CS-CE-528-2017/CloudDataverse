(function () {
    'use strict';
    angular
      .module('core')
      .controller('ComputeController', ComputeController);
    function ComputeController($scope, $http) {
        var vm = this;
        vm.ConfigMode = 0;
        vm.ServerList = {};
        vm.Cluster = {};
        vm.Cluster.NodeCount = 2;

        vm.VerifyClusterCount = function () {
            if (vm.Cluster.InstanceCount < 0) {
                vm.Cluster.InstanceCount = 1;
                vm.Cluster.NodeCount = 0;
            }
            else if (vm.Cluster.InstanceCount === undefined) {
                vm.Cluster.NodeCount = 0;
            }
            else {
                vm.Cluster.NodeCount = vm.Cluster.InstanceCount - 1;
            }

        }

        vm.LaunchCluster = function () {

        }

        $http.get('/api/list/servers')
          .then(function (res) {

              if (res.data == 'error')
                  window.location.href = '/';

              vm.ServerList = res.data;
              var flavors = {};
              var plugins = {};

              $http.get('/api/list/flavors')
                .then(function (res) {
                    flavors = res.data;

                    $http.get('/api/list/plugins')
                        .then(function (res) {
                            var resp = JSON.parse(res.data);
                            plugins = resp.plugins;

                            $http.get('/api/list/keypairs')
                                .then(function (res) {
                                    vm.KeyPairs = res.data;
                                    vm.Cluster.KeyPair = vm.KeyPairs[0].name;

                                    vm.Flavors = flavors;
                                    vm.Plugins = plugins;
                                });
                        });
                });
          });
    }
}());
