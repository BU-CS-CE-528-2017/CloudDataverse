(function() {
  'use strict';
  angular
    .module('core')
    .controller('ClusterController', ClusterController);

  function ClusterController($scope, $http) {
      var vm = this;

      // On page load, run anonymously invoked function
      $(function () {
          $http.get('/api/list/clusters')
              .then(function (res) {
                  // at this point, res.data should contain JSON, put it in the frontend
                  vm.Clusters = JSON.parse(res.data).clusters;
              });
      });
  }
}());
