(function() {
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

    vm.VerifyClusterCount = function() {
      if (vm.Cluster.InstanceCount <= 0) {
        vm.Cluster.InstanceCount = 1;
        vm.Cluster.NodeCount = 0;
      } else if (vm.Cluster.InstanceCount === undefined) {
        vm.Cluster.NodeCount = 0;
      } else {
        vm.Cluster.NodeCount = vm.Cluster.InstanceCount - 1;
      }

    };

    vm.LaunchCluster = function() {

      var launchClusterPayload = {
        'plugin_name': vm.Cluster.Plugin,
        'name': vm.Cluster.Name,
        'count': vm.Cluster.InstanceCount - 1,
        'user_keypair_id': vm.Cluster.KeyPair
      };

      $http.post('/api/launch', launchClusterPayload)
        .then(function(res) {

        });

    };

    $http.get('/api/list/servers')
      .then(function(res) {

        if (res.data === 'error')
          window.location.href = '/';

        vm.ServerList = res.data;
        var flavors = {};
        var plugins = {};
        var keypairs = {};
        var networks = {};

        $http.get('/api/list/flavors')
          .then(function(res) {
            flavors = res.data;

            $http.get('/api/list/plugins')
              .then(function(res) {
                var resp = JSON.parse(res.data);
                plugins = resp.plugins;

                $http.get('/api/list/keypairs')
                  .then(function(res) {
                    keypairs = res.data;

                    $http.get('/api/list/networks')
                      .then(function(res) {
                        vm.KeyPairs = keypairs;
                        vm.Cluster.KeyPair = vm.KeyPairs[0].name;

                        vm.Networks = res.data;
                        vm.Networks = vm.Networks.splice(1, 1);
                        vm.Cluster.Network = vm.Networks[0].id;

                        vm.Flavors = flavors;
                        vm.Plugins = plugins;
                      });

                  });
              });
          });
      });
  }
}());
