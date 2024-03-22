// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const path = require('path');
const webpack = require('webpack');

module.exports = function (ctx) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      'register.js'
    ],

    css: [
      'app.sass'
    ],

    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',

      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    framework: {
      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      config: {},

      // Quasar plugins
      plugins: []
    },

    // animations: 'all', // --- includes all animations
    animations: [],

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      vueRouterMode: 'history',

      chainWebpack(chain) {
        chain.resolve.alias.merge({
          '@': path.resolve(__dirname, '../dev/src'),
          ui: path.resolve(__dirname, `../src/index.esm.js`)
        });

        chain.plugin('define-ui')
          .use(webpack.DefinePlugin, [{
            __UI_VERSION__: `'${require('../package.json').version}'`
          }]);

        // enable ts support
        chain.resolve.extensions.add('.ts');
        chain.module.rule('typescript')
          .test(/\.ts$/)
          .use('ts-loader')
          .loader('ts-loader')
          .end();
      }
    },

    devServer: {
      // port: 8080,
      open: true // opens browser window automatically
    },

    ssr: {
      middlewares: [
        ctx.prod ? 'compression' : '',
        'render' // keep this as last one
      ]
    }
  };
};
