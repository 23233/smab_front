import { defineConfig } from 'umi';
import { Routes } from './src/router';

// @ts-ignore
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);

const loadTailwindCss = [
  require('tailwindcss'),
  require('postcss-nested'),
  require('tailwind-one')({
    platform: 'h5',
    rule: { h5: [] },
    // threshold: {
    //   h5: 20,
    // },
  }),
  require('autoprefixer'),
];

if (IS_PROD) {
  loadTailwindCss.push(
    require('@fullhuman/postcss-purgecss')({ content: ['./src/**/*.tsx'] }),
  );
}
const extraPostCss = [...loadTailwindCss];

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  analyze: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    // generate stats file while ANALYZE_DUMP exist
    generateStatsFile: false,
    statsFilename: 'stats.json',
    logLevel: 'info',
    defaultSizes: 'parsed', // stat  // gzip
  },
  title: false,
  proxy: {
    '/api/': {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api/': '',
      },
    },
  },
  routes: Routes,
  extraBabelPlugins: [
    // yarn add babel-plugin-transform-remove-console
    IS_PROD ? 'transform-remove-console' : '',
  ],
  extraPostCSSPlugins: extraPostCss,
  fastRefresh: {},
  headScripts: [
    {
      content: IS_PROD
        ? `window.smab={"prefix":'{{.prefix}}',"name":'{{.name}}'}`
        : `window.smab={"prefix":'admin',"name":'管理后台'}`,
    },
  ],
  publicPath: '/smab_static/',
  base: '/admin',
});
