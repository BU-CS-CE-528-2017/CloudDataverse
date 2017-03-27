(function() {
  'use strict';
  angular
    .module('core')
    .controller('ComputeController', ComputeController);

  function ComputeController($scope, $http) {
    var vm = this;
    vm.ConfigMode = 0;
    var binaryUrl;
    vm.BinaryUrl = '';
    vm.ServerList = {};
    vm.Cluster = {};
    vm.Cluster.NodeCount = 2;
    var statusUpdater;
    vm.InputFiles = [
        {
            SwiftObjectUrl: '',
            SwiftObjectName: 'Word Count 1'
        },
        {
            SwiftObjectUrl: '',
            SwiftObjectName: 'Word Count 45'
        },
        {
            SwiftObjectUrl: '',
            SwiftObjectName: 'Word Sample Data'
        },
        {
            SwiftObjectUrl: '',
            SwiftObjectName: 'Swift Word File'
        },
        {
            SwiftObjectUrl: '',
            SwiftObjectName: 'Word Count 84'
        },
    ];

    vm.UploadBinary = function () {
        var file = $('#upload-input').get(0).files[0];

        if (file) {
            var formData = new FormData();
            formData.append('uploads[]', file, vm.Cluster.Name + '/' + file.name);

            $.ajax({
                url: '/api/upload/binary',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    vm.BinaryUrl = data;
                    $scope.$apply();
                }
            });
        }
    };

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
        'user_keypair_id': vm.Cluster.KeyPair,
        'flavor': vm.Cluster.Flavor,
        'network': vm.Cluster.Network
      };

      $http.post('/api/launch', launchClusterPayload)
        .then(function(res) {
          if (res.data.error_name !== undefined) {
            vm.LaunchSuccess = false;
            vm.ClusterDetails = res.data;
          } else {
            vm.LaunchSuccess = true;
            vm.ClusterDetails = res.data.cluster;

            statusUpdater = setInterval(updateLaunchStatus, 1000);
          }
        });
    };

    var updateLaunchStatus = function() {
      $http.get('/api/status/cluster/' + vm.ClusterDetails.id)
        .then(function(res) {
          var cluster = JSON.parse(res.data);
          cluster = cluster.cluster;
          vm.ClusterDetails.status = cluster.status;

          if (vm.ClusterDetails.status === 'Active') {
            clearInterval(statusUpdater);
            $('#cluster-progress').removeClass('progress-bar-animated').removeClass('progress-bar-striped');
          }
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
