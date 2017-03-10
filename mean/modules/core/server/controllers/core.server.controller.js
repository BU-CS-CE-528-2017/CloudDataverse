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
    }
    else {
      console.log('A project specific token has been retrived', project_token);
      res.cookie('X-Project-Token', project_token.token, { maxAge: 900000, httpOnly: true });
      var nova = new OSWrap.Nova('https://nova.kaizen.massopencloud.org:8774/v2/' + project_token.project.id, project_token.token);

      nova.listServers(function (error, servers_array) {
        if (error) {
          console.error('an error occured', error);
        }
        else {
          console.log('A list of servers have been retrived', servers_array);
          res.json(servers_array);
        }
      });
    }
  });
};

exports.listQuotas = function (req, res) {
  var OSWrap = require('openstack-wrapper');
  var nova = new OSWrap.Nova('https://nova.kaizen.massopencloud.org:8774/v2/' + req.cookies['Project-Id'], req.cookies['X-Project-Token']);

  var startDate = new Date();
  startDate.setHours(0);
  var endDate = new Date();
  console.log('Start Date' + startDate + " --------- End Date" + endDate);
  nova.getTenantUsage(req.cookies['Project-Id'], startDate, endDate, function (error, resp) {
    if (!error) {
      res.json(resp);
    }
  });
}

exports.listImages = function (req, res) {
  var OSWrap = require('openstack-wrapper');
  var nova = new OSWrap.Glance('https://glance.kaizen.massopencloud.org:9292/v2', req.cookies['X-Project-Token']);

  nova.listImages(function (error, images) {
    if (error) {
        res.send("Could not load images");
    }
    else {
        res.json(images);
    }
  });

}

exports.listFlavors = function (req, res) {
  var OSWrap = require('openstack-wrapper');
  var nova = new OSWrap.Nova('https://nova.kaizen.massopencloud.org:8774/v2/' + req.cookies['Project-Id'], req.cookies['X-Project-Token']);

  nova.listFlavors(function (error, flavors) {
    if (error) {
      res.send("Could not load flavors");
    }
    else {
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
    }
    else {
      // creating cookie for auth token
      res.cookie('X-Subject-Token', token.token, { maxAge: 900000, httpOnly: true });
      res.cookie('Project-Id', token.project.id, { maxAge: 900000, httpOnly: true });
      res.send("User authenticated");
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
