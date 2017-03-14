'use strict';

var validator = require('validator'),
  path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
    var safeUserObject = null;
    if (req.user) {
        safeUserObject = {
            displayName: validator.escape(req.user.displayName),
            provider: validator.escape(req.user.provider),
            username: validator.escape(req.user.username),
            created: req.user.created.toString(),
            roles: req.user.roles,
            profileImageURL: req.user.profileImageURL,
            email: validator.escape(req.user.email),
            lastName: validator.escape(req.user.lastName),
            firstName: validator.escape(req.user.firstName),
            additionalProvidersData: req.user.additionalProvidersData
        };
    }

    res.render('modules/core/server/views/index', {
        user: JSON.stringify(safeUserObject),
        sharedConfig: JSON.stringify(config.shared)
    });
};

/**
 * Render the compute page
 */
exports.renderCompute = function (req, res) {
    res.render('modules/core/server/views/compute', {
        sharedConfig: JSON.stringify(config.shared)
    });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
    res.status(500).render('modules/core/server/views/500', {
        error: 'Oops! Something went wrong...'
    });
};

exports.listServers = function (req, res) {
    var OSWrap = require('openstack-wrapper');
    var keystone = new OSWrap.Keystone('https://keystone.kaizen.massopencloud.org:5000/v3');

    keystone.getProjectToken(req.cookies['X-Subject-Token'], req.cookies['Project-Id'], function (error, project_token) {
        if (error) {
            console.error('an error occured', error);
            res.send('error');
        } else {
            console.log('A project specific token has been retrived', project_token);
            res.cookie('X-Project-Token', project_token.token, { maxAge: 900000, httpOnly: true });
            var nova = new OSWrap.Nova('https://nova.kaizen.massopencloud.org:8774/v2/' + project_token.project.id, project_token.token);

            nova.listServers(function (error, servers_array) {
                if (error) {
                    console.error('an error occured', error);
                    res.send('error');
                } else {
                    console.log('A list of servers have been retrived', servers_array);
                    res.json(servers_array);
                }
            });
        }
    });
};

exports.launchInstance = function (req, res) {
    var request = require('request');

    var masterTemplate = {
        'plugin_name': req.body.plugin_name,
        'hadoop_version': '2.7.1',
        'node_processes': [
          'namenode',
          'resourcemanager',
          'oozie',
          'historyserver'
        ],
        'name': req.body.name + 'MASTER',
        'flavor_id': req.body.flavor,
        'use_autoconfig': true,
        'auto_security_group': true,
        'availability_zone': 'nova'
    };

    var workerTemplate = {
        'plugin_name': req.body.plugin_name,
        'hadoop_version': '2.7.1',
        'node_processes': [
          'datanode',
          'nodemanager'
        ],
        'name': req.body.name + 'WORKER',
        'flavor_id': req.body.flavor,
        'use_autoconfig': true,
        'auto_security_group': true,
        'availability_zone': 'nova'
    };

    var clusterTemplate = {
        'plugin_name': req.body.plugin_name,
        'hadoop_version': '2.7.1',
        'node_groups': [{
            'name': 'master',
            'count': 1,
            'node_group_template_id': ''
        }, {
            'name': 'worker',
            'count': req.body.count,
            'node_group_template_id': ''
        }],
        'name': req.body.name
    };

    var launchTemplate = {
        'plugin_name': req.body.plugin_name,
        'hadoop_version': '2.7.1',
        'cluster_template_id': '',
        'default_image_id': '64599610-2952-4a1f-9291-2711c966905c',
        'user_keypair_id': req.body.user_keypair_id,
        'name': req.body.name + 'CLUSTER',
        'neutron_management_network': req.body.network
    };

    /* REST ENDPOINT AND HEADER OBJECT */
    var createNodeEndpoint = 'https://controller-0.kaizen.massopencloud.org:8386/v1.1/' + req.cookies['Project-Id'] + '/node-group-templates';
    var headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': req.cookies['X-Project-Token']
    };

    var genMasterTemplate = function () {
        var promise = new Promise(function (resolve, reject) {
            request({
                url: createNodeEndpoint,
                method: 'POST',
                headers: headers,
                json: masterTemplate
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(body);
                    clusterTemplate.node_groups[0].node_group_template_id = body.node_group_template.id;
                    resolve('Master Template Created');
                }
            });
        });
        return promise;
    };

    var genWorkerTemplate = function () {
        var promise = new Promise(function (resolve, reject) {
            request({
                url: createNodeEndpoint,
                method: 'POST',
                headers: headers,
                json: workerTemplate
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                } else {
                    clusterTemplate.node_groups[1].node_group_template_id = body.node_group_template.id;
                    resolve('Worker Template Created');
                }
            });
        });
        return promise;
    };

    var genClusterTemplate = function () {
        var promise = new Promise(function (resolve, reject) {

            var createClusterEndpoint = 'https://controller-0.kaizen.massopencloud.org:8386/v1.1/' + req.cookies['Project-Id'] + '/cluster-templates';

            request({
                url: createClusterEndpoint,
                method: 'POST',
                headers: headers,
                json: clusterTemplate
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(response.statusCode, body);
                    launchTemplate.cluster_template_id = body.cluster_template.id;
                    resolve('Cluster template created successfully.')
                }
            });
        });
        return promise;
    };

    var launchCluster = function () {
        var launchClusterEndpoint = 'https://controller-0.kaizen.massopencloud.org:8386/v1.1/' + req.cookies['Project-Id'] + '/clusters';
        request({
            url: launchClusterEndpoint,
            method: 'POST',
            headers: headers,
            json: launchTemplate
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                console.log(response.statusCode, body);
                res.json(body);
            }
        });
    };

    // Begin executing chain
    genMasterTemplate()
		.then(genWorkerTemplate)
        .then(genClusterTemplate)
        .then(launchCluster);

};

exports.listKeyPairs = function (req, res) {
    var OSWrap = require('openstack-wrapper');
    var nova = new OSWrap.Nova('https://nova.kaizen.massopencloud.org:8774/v2/' + req.cookies['Project-Id'], req.cookies['X-Project-Token']);

    nova.listKeyPairs(function (error, resp) {
        if (!error) {
            res.json(resp);
        } else {
            console.error('Could not retrieve key pairs');
        }
    });
};

exports.listNetworks = function (req, res) {
    var OSWrap = require('openstack-wrapper');
    var neutron = new OSWrap.Neutron('https://neutron.kaizen.massopencloud.org:9696/v2.0', req.cookies['X-Project-Token']);

    neutron.listNetworks(function (error, resp) {
        res.json(resp);
    });
};

exports.listPlugins = function (req, res) {
    var request = require('request');
    var sahara = 'https://controller-0.kaizen.massopencloud.org:8386/v1.1/' + req.cookies['Project-Id'] + '/plugins';
    console.log('Sahara URL: ' + sahara);
    var headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': req.cookies['X-Project-Token']
    };

    var options = {
        url: sahara,
        headers: headers
    };

    function listPlugins(error, response, body) {
        res.json(body);
    }

    request.get(options, listPlugins);
};

exports.listQuotas = function (req, res) {
    var OSWrap = require('openstack-wrapper');
    var nova = new OSWrap.Nova('https://nova.kaizen.massopencloud.org:8774/v2/' + req.cookies['Project-Id'], req.cookies['X-Project-Token']);

    var startDate = new Date();
    startDate.setHours(0);
    var endDate = new Date();
    console.log('Start Date' + startDate + '--------- End Date' + endDate);
    nova.getTenantUsage(req.cookies['Project-Id'], startDate, endDate, function (error, resp) {
        if (!error) {
            res.json(resp);
        }
    });
};

exports.listImages = function (req, res) {
    var OSWrap = require('openstack-wrapper');
    var nova = new OSWrap.Glance('https://glance.kaizen.massopencloud.org:9292/v2', req.cookies['X-Project-Token']);

    nova.listImages(function (error, images) {
        if (error) {
            res.send('Could not load images');
        } else {
            res.json(images);
        }
    });

};

exports.listFlavors = function (req, res) {
    var OSWrap = require('openstack-wrapper');
    var nova = new OSWrap.Nova('https://nova.kaizen.massopencloud.org:8774/v2/' + req.cookies['Project-Id'], req.cookies['X-Project-Token']);

    nova.listFlavors(function (error, flavors) {
        if (error) {
            res.send('Could not load flavors');
        } else {
            res.json(flavors);
        }
    });

};

exports.openStackAuth = function (req, res) {
    var OSWrap = require('openstack-wrapper');
    var keystone = new OSWrap.Keystone('https://keystone.kaizen.massopencloud.org:5000/v3');

    keystone.getToken(req.body.user, req.body.password, function (error, token) {
        if (error) {
            res.status(400);
            res.send('Error while authenticating.');
            console.error('An error occurred while authenticating the user with Open Stack.');
        } else {
            // creating cookie for auth token
            res.cookie('X-Subject-Token', token.token, { maxAge: 900000, httpOnly: true });
            res.cookie('Project-Id', token.project.id, { maxAge: 900000, httpOnly: true });
            res.send('User authenticated');
        }
    });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {
    res.status(404).format({
        'text/html': function () {
            res.render('modules/core/server/views/404', {
                url: req.originalUrl
            });
        },
        'application/json': function () {
            res.json({
                error: 'Path not found'
            });
        },
        'default': function () {
            res.send('Path not found');
        }
    });
};
