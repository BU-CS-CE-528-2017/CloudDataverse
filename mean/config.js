/* CloudDataverse - CloudCompute UI Config File */

var config = {};

config.keystone_endpoint = 'https://keystone.kaizen.massopencloud.org:5000/v3';
config.nova_endpoint = 'https://nova.kaizen.massopencloud.org:8774/v2/';
config.sahara_endpoint = 'https://controller-0.kaizen.massopencloud.org:8386/v1.1/';
config.neutron_endpoint = 'https://neutron.kaizen.massopencloud.org:9696/v2.0';
config.glance_endpoint = 'https://glance.kaizen.massopencloud.org:9292/v2';
config.swift_endpoint = 'http://rdgw.kaizen.massopencloud.org/swift/v1/';

module.exports = config;