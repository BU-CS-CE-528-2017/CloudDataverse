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


            var printAll = function(data){console.log(JSON.stringify(data))};

            // Retrieving Authentication Token
            JSTACK.Keystone.init("http://keystone.kaizen.massopencloud.org:5000/v3/");
            JSTACK.Keystone.authenticate(vm.User.UserName, vm.User.Password, null, "tenant_id", printAll);



        };


    }
}());
