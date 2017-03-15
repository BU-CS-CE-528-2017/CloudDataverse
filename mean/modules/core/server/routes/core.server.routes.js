'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);
  app.post('/api/auth', core.openStackAuth);
  app.get('/api/list/servers', core.listServers);
  app.get('/api/list/quotas', core.listQuotas);
  app.get('/api/list/images', core.listImages);
  app.get('/api/list/flavors', core.listFlavors);
  app.get('/api/list/keypairs', core.listKeyPairs);
  app.get('/api/list/plugins', core.listPlugins);
  app.get('/api/list/networks', core.listNetworks);
  app.post('/api/launch', core.launchInstance);
  app.get('/api/status/cluster/:id', core.getClusterStatus);
  app.route('/compute').get(core.renderCompute);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);
};
