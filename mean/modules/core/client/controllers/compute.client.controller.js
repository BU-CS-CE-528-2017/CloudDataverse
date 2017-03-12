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
        vm.Plugins = [{ id: 1, name: 'Hadoop' }, { id: 2, name: 'Storm' }, { id: 3, name: 'Spark' }];

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
              vm.ServerList = res.data;
              $http.get('/api/list/flavors')
                .then(function (res) {
                    vm.Flavors = res.data;

                    if (!vm.Flavors.length)
                        document.location.href = "/";
                    //$http.get('/api/list/images')
                    //  .then(function (res) {
                    //      vm.Images = res.data;
                    //  });
                });
          });
    }
}());
