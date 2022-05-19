import { defineConfig } from 'umi';
import { Routes } from './src/router';
// @ts-ignore
import * as pkg from './package.json';

const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

// @ts-ignore
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);

const externalsConfig: any = {
  lodash: {
    name: '_',
    cdn: (version: string) =>
      `https://gw.alipayobjects.com/os/lib/lodash/${version}/lodash.min.js`,
    version: '4.17.21',
  },
  react: {
    name: 'React',
    cdn: (version: string) =>
      `https://gw.alipayobjects.com/os/lib/react/${version}/umd/react.${
        IS_PROD ? 'production.min' : 'development'
      }.js`,
    version: '17.0.2',
  },
  'react-dom': {
    name: 'ReactDOM',
    cdn: (version: string) =>
      `https://gw.alipayobjects.com/os/lib/react-dom/${version}/umd/react-dom.${
        IS_PROD ? 'production.min' : 'development'
      }.js`,
    version: '17.0.2',
  },
};

const externals: any = {};
const scripts: string[] = [];
for (const n in externalsConfig) {
  externals[n] = externalsConfig[n].name;
  let version = '';
  if (n in pkg.dependencies || n in pkg.devDependencies) {
    version =
      (pkg.dependencies as any)?.[n] || (pkg.devDependencies as any)?.[n];
  } else {
    version = externalsConfig[n].version;
  }
  if (version.endsWith('.x')) {
    version = externalsConfig[n].version;
  }
  scripts.push(externalsConfig[n].cdn(version.replace('^', '')));
}

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
  qiankun: {
    master: {},
  },
  title: false,
  // mfsu: {},
  proxy: {
    '/api/': {
      // target: 'http://127.0.0.1:8080',
      target: 'http://127.0.0.1:7780',
      changeOrigin: true,
      pathRewrite: {
        '^/api/': '',
      },
    },
  },
  ignoreMomentLocale: true,
  targets: {
    chrome: 85, // 目前94
    firefox: false, // 目前92
    safari: false, // 目前11
    edge: false, // 老版win10为
    ios: false, // 目前15了
  },
  routes: Routes,
  extraBabelPlugins: [
    // yarn add babel-plugin-transform-remove-console
    IS_PROD ? 'transform-remove-console' : '',
  ],
  // extraPostCSSPlugins: extraPostCss,
  fastRefresh: {},
  headScripts: [
    {
      content: IS_PROD
        ? `window.smab={"prefix":'{{.prefix}}',"name":'{{.name}}',"publicKey":'{{.public_key}}'}`
        : `window.smab={"prefix":'admin',"name":'管理后台',"publicKey":''}`,
    },
  ],
  scripts: scripts,
  externals: externals,
  publicPath: '/smab_static/',
  base: '/admin',
  chainWebpack: function (config, { webpack }) {
    config.plugin('antd-dayjs-webpack-plugin').use(AntdDayjsWebpackPlugin);
  },
});
