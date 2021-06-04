/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.provide({
        Buffer: ['buffer', 'Buffer'],
        process: ['process/browser'],
      }),
    ],
    resolve: {
      // fallback: {
      //   assert: require.resolve('assert'),
      //   stream: require.resolve('stream-browserify'),
      //   crypto: require.resolve('crypto-browserify'),
      //   http: require.resolve('stream-http'),
      //   https: require.resolve('https-browserify'),
      //   os: require.resolve('os-browserify'),
      // },
      alias: {
        components: path.resolve(__dirname, 'src/components'),
        scss: path.resolve(__dirname, 'src/scss'),
      },
    },
  })
}
