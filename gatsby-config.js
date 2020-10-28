/* eslint-disable @typescript-eslint/camelcase */

module.exports = {
  siteMetadata: {
    title: 'Otoco Web DAPP',
    description:
      'Welcome to OtoCo - Instantly spin up your real-world LLC here.',
    siteUrl: 'https://otoco.io',
    author: 'Otonomos',
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/tokens/*`] },
    },
    {
      resolve: 'gatsby-plugin-firebase',
      options: {
        credentials: {
          apiKey: process.env.GATSBY_FIREBASE_KEY,
          authDomain: 'otoco-281518.firebaseapp.com',
          databaseURL: 'https://otoco-281518.firebaseio.com',
          storageBucket: 'otoco-281518.appspot.com',
          projectID: 'otoco-281518',
        },
      },
    },
    {
      resolve: `gatsby-plugin-react-redux`,
      options: {
        pathToCreateStoreModule: './src/state/createStore',
        serialize: {
          space: 0,
          isJSON: true,
          unsafe: false,
        },
        cleanupOnClient: true,
        windowKey: '__PRELOADED_STATE__',
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 750,
              linkImagesToOriginal: false,
              wrapperStyle: 'margin-bottom: 1.0725rem;',
            },
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: {
              wrapperStyle: 'margin-bottom: 1.0725rem',
            },
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants',
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Otoco',
        short_name: 'Otoco',
        description: 'Instantly spin up your real-world LLC here.',
        homepage_url: 'https://otoco.io',
        start_url: '/',
        iconPath: '/img/android-chrome-192x192.png',
        background_color: '#0F0F0F',
        theme_color: '#fff',
        display: 'standalone',
        providedBy: { name: 'Otoco', url: 'https://otoco.io' },
        crossOrigin: 'use-credentials',
        icons: [
          {
            src: '/img/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/img/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-netlify',
      options: {
        mergeSecurityHeaders: true,
        mergeLinkHeaders: true,
        mergeCachingHeaders: true,
      },
    },
    {
      resolve: 'gatsby-plugin-netlify-headers',
      options: {
        allPageHeaders: [
          'Access-Control-Allow-Origin: *',
          'Access-Control-Allow-Methods: GET',
          'Access-Control-Allow-Headers: X-Requested-With, content-type, Authorization',
        ],
      },
    },
    // {
    //   resolve: 'gatsby-plugin-graphql-codegen',
    //   options: {
    //     fileName: `types/graphql-types.d.ts`,
    //   },
    // },
    'gatsby-plugin-catch-links',
    'gatsby-plugin-offline',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sass',
    'gatsby-plugin-sharp',
    // 'gatsby-plugin-sitemap',
    'gatsby-plugin-typescript',
    'gatsby-transformer-sharp',
  ],
}
