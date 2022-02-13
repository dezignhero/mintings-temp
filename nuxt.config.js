require('dotenv').config()
const join = require('path').join
const tailwindJS = join(__dirname, 'tailwind.config.js')

// API
const BASE_URL = process.env.BASE_URL || 'https://superlocal.com'
const API_URL = process.env.API_URL || 'https://superlocal.tools/api'
// SEO
const OG_IMAGE = `${BASE_URL}/images/og-default.png`
const APP_URL = process.env.APP_URL || 'https://link.superlocal.com/A0B4DevAYkb'

export default {
  env: {
    baseUrl: BASE_URL,
    apiUrl: API_URL,
    appUrl: APP_URL,
    wcBridge: process.env.WC_BRIDGE || 'https://bridge.walletconnect.org',
    provider: process.env.PROVIDER || 'https://rinkeby-light.eth.linkpool.io/',
    infuraId: process.env.INFURAID,
    moduleAddress: process.env.MODULEADDRESS,
    modulePrivate: process.env.MODULEPRIVATE
  },

  /*
   ** Headers of the page
   */
  head: {
    title: 'Superlocal',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'msapplication-TileColor', content: '#da532c' },
      { name: 'theme-color', content: '#ffffff' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Superlocal is the #1 app for local community and local news. Find your city and connect to your neighorhood today.'
      },
      {
        hid: 'og:image',
        property: 'og:image',
        content: OG_IMAGE
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'website'
      },
      {
        hid: 'twitter:image',
        name: 'twitter:image',
        content: OG_IMAGE
      },
      {
        hid: 'twitter:card',
        name: 'twitter:card',
        content: 'summary_large_image'
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png'
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png'
      },
      { rel: 'manifest', href: '/site.webmanifest' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:400,500,600,700,800,900&display=swap'
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: ['~/assets/css/tailwind.css'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [{ src: '~plugins/helpers' }, { src: '~plugins/vue-moment' }],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    '@nuxtjs/device',
    ['@nuxtjs/dotenv', { systemvars: true }],
    'vue-social-sharing/nuxt'
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    // baseURL: API_DOMAIN,
    proxy: true
  },

  proxy: {
    '/api/': {
      target: API_URL,
      pathRewrite: { '^/api/': '/' },
      changeOrigin: true
      // proxyHeaders: true
    }
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {
    //   // Run ESLint on save
    //   if (ctx.isDev && ctx.isClient) {
    //     config.module.rules.push({
    //       enforce: 'pre',
    //       test: /\.(js|vue)$/,
    //       loader: 'eslint-loader',
    //       exclude: /(node_modules)/
    //     })
    //   }
    // }
    postcss: {
      plugins: [
        require('tailwindcss')(tailwindJS),
        require('postcss-nested'),
        require('autoprefixer')
      ]
    }
  }
}
