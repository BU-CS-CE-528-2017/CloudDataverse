(function() {
  'use strict';
  angular
    .module('core')
    .controller('JobController', JobController);

  function JobController($scope, $http) {

      var vm = this;

      // On page load, run anonymously invoked function
      $(function () {
          $http.get('/api/list/jobs')
              .then(function (res) {
                  // at this point, res.data should contain JSON, put it in the frontend
                  vm.Jobs = JSON.parse(res.data).job_executions;
                  for (var i = 0; i < vm.Jobs.length; i++){
                      var start = new Date(vm.Jobs[i].start_time);
                      var end = new Date(vm.Jobs[i].end_time);
                      var create = new Date(vm.Jobs[i].created_at);
                      var now = Date.now();
                      if (vm.Jobs[i].end_time == null && vm.Jobs[i].start_time == null) {
                          vm.Jobs[i].duration = now - create;
                      } else {
                          vm.Jobs[i].duration = end - start;
                      }

                  }
              });
      });
  }
}());
