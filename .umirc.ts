import { defineConfig } from 'umi';
import { Routes } from './src/router';

// @ts-ignore
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);

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
  fastRefresh: {},
  headScripts: [
    {
      content: IS_PROD ? `window.smab={"prefix":'{{.prefix}}',"name":'{{.name}}'}` : `window.smab={"prefix":'admin',"name":'管理后台'}`,
    },
  ],
  publicPath: '/smab_static/',
});
