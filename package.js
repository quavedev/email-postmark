/* global Package Npm */

Package.describe({
  name: 'quave:email-postmark',
  summary: 'Postmark support',
  version: '1.2.3',
});

Npm.depends({
  postmark: '3.1.2',
});

Package.onUse(api => {
  api.versionsFrom('2.13.3');

  api.use(['email@2.0.0||3.0.0||3.0.0-alpha300.17'], ['server']);

  api.use('ecmascript');
  api.use('quave:settings@1.0.0');

  api.mainModule('server.js', 'server');
});
