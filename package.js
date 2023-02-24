/* global Package Npm */

Package.describe({
  name: 'quave:email-postmark',
  summary: 'Postmark support',
  version: '1.0.4',
});

Npm.depends({
  postmark: '2.7.7',
});

Package.onUse(api => {
  api.versionsFrom('2.4');

  api.use(['email'], ['server']);

  api.use('ecmascript');
  api.use('quave:settings@1.0.0');

  api.mainModule('server.js', 'server');
});
