'use strict';

module.exports = function (app) {
    var core = require('../controllers/core.server.controller');

    // Routes for Rendering HTML Pages
    app.route('/compute').get(core.renderCompute);
    app.route('/server-error').get(core.renderServerError);

    // HTTP POST API Routes
    app.post('/dvinput/container', core.captureContainers); // capture Swift container(s) sent from Dataverse
    app.post('/api/auth', core.openStackAuth); // authenticate with OpenStack
    app.post('/api/launch', core.launchInstance); // create data processing VM from specified plugin
    app.post('/api/upload/binary', core.uploadBinary); // upload job binary for data processing
    app.post('/api/create/cluster_from_template', core.createClusterFromTemplate) // create cluster from template
    app.post('/api/create/data_job', core.createJob); // create job(s) on selected cluster

    // HTTP GET API Routes
    app.get('/dvinput/:container', core.captureContainer); // deprecated route for retrieving single container
    app.get('/api/list/servers', core.listServers); // list instances from Kaizen project
    app.get('/api/list/quotas', core.listQuotas); // list Kaizen project quotas
    app.get('/api/list/images', core.listImages); // list VM images
    app.get('/api/list/flavors', core.listFlavors); // list VM flavors
    app.get('/api/list/keypairs', core.listKeyPairs); // list key pairs from Kaizen project
    app.get('/api/list/plugins', core.listPlugins); // list data processing plugins
    app.get('/api/list/networks', core.listNetworks); // list all networks from Kaizen project
    app.get('/api/list/cluster_templates', core.listClusterTemplates) // list all cluster templates from Kaizen project
    app.get('/api/list/clusters', core.listClusters); // list all clusters from Kaizen project
    app.get('/api/list/jobs', core.listJobs); // list all jobs from Kaizen project
    app.get('/api/container/list', core.listContainerObjects) // list objects from Swift container
    app.get('/api/status/cluster/:id', core.getClusterStatus); // retrieve status of specific cluster given id
    app.get('/api/status/job/:id', core.getJobStatus); // retrieve status of specific job given id

    // Return a 404 for all undefined api, module or lib routes
    app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

    // Root Index Route
    app.route('/*').get(core.renderIndex);
};
