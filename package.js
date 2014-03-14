Package.describe({
  summary: "detect user sleep mode for meteor "
});

Package.on_use(function(api, where) {
  api.use(['underscore', 'handlebars','templating'], 'client');
  api.export('SleepMode', ['client']);

  api.add_files([
    'lib/client/ev.js',
    'lib/client/track.js',
    'lib/client/sleepmode.html'
  ], 'client');

});