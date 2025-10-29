// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'], // 👈 ya no se pone '@angular/build/karma'
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
      // ❌ NO pongas require('@angular/...') aquí
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],

    // 🦁 Usa Brave Headless
    browsers: ['BraveHeadless'],
    customLaunchers: {
      BraveHeadless: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--remote-debugging-port=9223',
        ],
        executablePath: '/usr/bin/brave',
      },
    },

    restartOnFileChange: true,
    singleRun: false,
  });
};
