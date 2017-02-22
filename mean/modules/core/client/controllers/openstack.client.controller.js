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
            // Keystone Request Object
            var request = {
                auth: {
                    identity: {
                        methods: "password",
                        password: {
                            user: {
                                domain: {
                                    name: "Default"
                                },
                                name: vm.User.UserName,
                                password: vm.User.Password
                            }
                        }
                    }
                }
            };

            $http.post("https://keystone.kaizen.massopencloud.org:5000/v3/auth/tokens", request)
                .then(function successCallback(response) {
                    var config = {
                        headers: {
                            'X-Auth-Token': response.headers('X-Auth-Token')
                        }
                    };

                    $http.get("https://nova.kaizen.massopencloud.org:8774/v2/d329686636634edc847baf2684a8d7a7/servers", config)
                        .then(function successCallback(response) {

                        }, function errorCallback(response) {

                        });

                }, function errorCallback(response) {

                });
            



        };


    }
}());
