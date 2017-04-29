(function () {
    'use strict';
    angular
      .module('core')
      .controller('ComputeController', ComputeController);

    function ComputeController($scope, $http) {
        var vm = this;

        // Config
        vm.ConfigMode = 0;
        vm.BinaryUrl = '';
        vm.ServerList = {};

        // Cluster Config Init
        vm.Cluster = {};
        vm.Cluster.Name = '';
        vm.Cluster.NodeCount = 2;

        // Cluster (From Template) Config Init
        vm.ClusterFT = {};
        vm.ClusterFT.Name = '';

        var statusUpdater;
        var binaryUrl;

        vm.nextTab = function () {
            $('.compute-pill').trigger('click')
        }

        vm.UploadBinary = function () {

            if (!vm.Cluster.Name.length && !vm.ClusterFT.Name.length) {
                vm.BinaryUrl = 'Upload aborted. No cluster name specified.'
                return;
            }

            // Selecting between 'Cluster from Scratch' or 'Cluster from Template' Name
            var containerName = vm.Cluster.Name.length ? vm.Cluster.Name : vm.ClusterFT.Name;

            var file = $('#upload-input').get(0).files[0];
            vm.BinaryFileName = file.name;

            if (file) {
                var formData = new FormData();
                formData.append('uploads[]', file, containerName + '/' + file.name);

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

        vm.CreateJob = function () {
            var clusterName = '';

            if (!vm.Cluster.Name.length)
                clusterName = vm.ClusterFT.Name;
            else
                clusterName = vm.Cluster.Name;

            var job = {
                'job_type': vm.JobConfig.JobType,
                'container_name': vm.Cluster.Name,
                'cluster_id': vm.ClusterDetails.id,
                'input_sources': vm.SelectedFiles,
                'binary_url': clusterName + '/' + vm.BinaryFileName,
                'swift_username': vm.Swift.Username,
                'swift_password': vm.Swift.Password,
                'main_class': vm.JobConfig.MainClass
            };

            $http.post('/api/create/data_job', job)
              .then(function (res) {
                  //vm.Job = res.data.job_execution;
                  //statusUpdater = setInterval(updateJobStatus, 1000);
                  window.location.href('/jobs');
              });
        };

        vm.VerifyClusterCount = function () {
            if (vm.Cluster.InstanceCount <= 0) {
                vm.Cluster.InstanceCount = 1;
                vm.Cluster.NodeCount = 0;
            } else if (vm.Cluster.InstanceCount === undefined) {
                vm.Cluster.NodeCount = 0;
            } else {
                vm.Cluster.NodeCount = vm.Cluster.InstanceCount - 1;
            }
        };

        vm.LaunchCluster = function () {

            var launchClusterPayload = {
                'plugin_name': vm.Cluster.Plugin,
                'name': vm.Cluster.Name,
                'count': vm.Cluster.InstanceCount - 1,
                'user_keypair_id': vm.Cluster.KeyPair,
                'flavor': vm.Cluster.Flavor,
                'network': vm.Cluster.Network
            };

            $http.post('/api/launch', launchClusterPayload)
              .then(function (res) {
                  if (res.data.error_name !== undefined) {
                      vm.LaunchSuccess = false;
                      vm.ClusterDetails = res.data;
                  } else {
                      vm.LaunchSuccess = true;
                      vm.ClusterDetails = res.data.cluster;
                      vm.SelectedCluster = vm.ClusterDetails.id;
                      statusUpdater = setInterval(updateLaunchStatus, 5000);
                  }
              });
        };

        vm.LaunchFT = function () {
            var launchClusterPayload = {
                'plugin_name': vm.SelectedClusterTemplate.plugin_name,
                'template_id': vm.SelectedClusterTemplate.id,
                'name': vm.ClusterFT.Name,
                'user_keypair_id': vm.ClusterFT.KeyPair,
                'network': vm.ClusterFT.Network
            };

            $http.post('/api/create/cluster_from_template', launchClusterPayload)
              .then(function (res) {
                  if (res.data.error_name !== undefined) {
                      vm.LaunchSuccess = false;
                      vm.ClusterDetails = res.data;
                  } else {
                      vm.LaunchSuccess = true;
                      vm.ClusterDetails = res.data.cluster;
                      vm.SelectedCluster = vm.ClusterDetails.id;
                      statusUpdater = setInterval(updateLaunchStatus, 5000);
                  }
              });
        }

        var updateJobStatus = function () {
            $http.get('/api/status/job/' + vm.Job.id)
                .then(function (res) {
                    var resp = JSON.parse(res.data);
                    vm.Job.info = resp.job_execution.info;

                    if (vm.Job.info.status == 'SUCCEEDED') {
                        clearInterval(statusUpdater);
                        $('#job-progress').removeClass('progress-bar-animated').removeClass('progress-bar-striped');
                    }
                });
        };

        var updateLaunchStatus = function () {
            $http.get('/api/status/cluster/' + vm.ClusterDetails.id)
              .then(function (res) {
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
          .then(function (res) {
              vm.ServerList = res.data;
              var flavors = {};
              var plugins = {};
              var keypairs = {};
              var networks = {};

              $http.get('/api/list/flavors')
                .then(function (res) {
                    vm.Flavors = res.data;

                    $http.get('/api/list/plugins')
                      .then(function (res) {
                          var resp = JSON.parse(res.data);
                          vm.Plugins = resp.plugins;
                      });

                    $http.get('/api/list/keypairs')
                        .then(function (res) {
                            keypairs = res.data;

                            $http.get('/api/list/networks')
                              .then(function (res) {
                                  vm.KeyPairs = keypairs;
                                  vm.Cluster.KeyPair = vm.KeyPairs[0].name;
                                  vm.ClusterFT.KeyPair = vm.KeyPairs[0].name;

                                  vm.Networks = res.data;
                                  vm.Networks = vm.Networks.splice(1, 1);
                                  vm.Cluster.Network = vm.Networks[0].id;
                                  vm.ClusterFT.Network = vm.Networks[0].id;
                              });
                        });

                    $http.get('/api/list/clusters')
                      .then(function (res) {
                          vm.Clusters = JSON.parse(res.data).clusters;

                          if (vm.Clusters.length)
                              vm.Cluster.Name = vm.Clusters[0].name;
                      });

                    $http.get('/api/list/cluster_templates')
                      .then(function (res) {
                          vm.ClusterTemplates = JSON.parse(res.data).cluster_templates;
                      });

                    $http.get('/api/container/list')
                      .then(function (res) {
                          vm.ContainerObjects = res.data;
                      })
                });
          });
    }
}());
