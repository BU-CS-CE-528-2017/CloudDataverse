'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/angular-ui-notification/dist/angular-ui-notification.min.css',
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.js',
        'public/jstack/JSTACK.js',
        'public/jstack/JSTACK.Aiakos.js',
        'public/jstack/JSTACK.Cinder.js',
        'public/jstack/JSTACK.Comm.js',
        'public/jstack/JSTACK.Glance.js',
        'public/jstack/JSTACK.Keystone.js',
        'public/jstack/JSTACK.Murano.js',
        'public/jstack/JSTACK.Neutron.js',
        'public/jstack/JSTACK.Nova.js',
        'public/jstack/JSTACK.Swift.js',
        'public/jstack/JSTACK.Utils.js',
        'public/lib/angular/angular.min.js',
	'public/lib/angular/checklist-model.js',
        'public/lib/bootstrap/dist/js/bootstrap.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-mocks/angular-mocks.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/ng-file-upload/ng-file-upload.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        // endbower
      ]
    },
    css: 'public/dist/application*.min.css',
    js: 'public/dist/application*.min.js'
  }
};
