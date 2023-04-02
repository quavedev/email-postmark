/* global Package Npm */

Package.describe({
  name: 'quave:email-postmark',
  summary: 'Postmark support',
  version: '1.1.1',
});

Npm.depends({
  postmark: '3.0.15',
});

Package.onUse(api => {
  api.versionsFrom('2.4');

  api.use(['email'], ['server']);

  api.use('ecmascript');
  api.use('quave:settings@1.0.0');

  api.mainModule('server.js', 'server');
});
