var webpackConfig = require('../webpack.config');

module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: [
      'jasmine',
    ],
    files: [
      require.resolve('es6-shim'),
      'node_modules/jquery/jquery.js',
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'node_modules/jasmine-fixture/dist/jasmine-fixture.js',
      'test/jasmine/main.js',
      'test/jasmine/**/*.js',

      { pattern: 'test/jasmine/fixtures/**/*', included: false },
    ],
    preprocessors: {
      'test/jasmine/**/*.js': ['webpack', 'sourcemap'],
    },
    webpack: webpackConfig,
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: Infinity,
    coverageReporter: {
      reporters: [{
        type: 'text-summary',
      }, {
        type: 'html',
        dir: 'coverage/',
      }],
    },
  });
};
