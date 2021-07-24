import React from 'react';
import './app.less';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import ZhCh from 'dayjs/locale/zh-cn';
import { v } from '@/utils/fetch';
import CONFIG from '@/utils/config';
import { dynamic } from 'umi';

// 引入dayjs 中文包 相对时间插件
require('dayjs/locale/zh-cn');
dayjs.locale(ZhCh);
dayjs.extend(relativeTime);
dayjs.extend(utc);

let token = sessionStorage.getItem(CONFIG.save.token);
if (token) {
  if (token.startsWith('"')) {
    token = JSON.parse(token);
  }
}

let extraRoutes: object[] = [];

const qkGet = fetch(`${v}/qiankun`, {
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  },
});

// 从接口中获取子应用配置，export 出的 qiankun 变量是一个 promise
export const qiankun = qkGet
  .then(async (resp) => {
    if (resp.status === 200) {
      const body = await resp?.json();
      (window as any).s_qk = body;
      return body;
    }
  })
  .then((apps) => {
    console.log('乾坤加载', apps);
    return {
      apps:
        apps?.map((d: any) => {
          return {
            name: d?.name,
            entry: d?.entry,
          };
        }) || [],
      // 是否预加载
      prefetch: false,
    };
  });

export function patchRoutes(p: any) {
  const routers = p?.routes;
  console.log('动态routers', routers?.[0].routes?.[2]?.routes);
  const qk = (window as any)?.s_qk;
  if (qk) {
    qk.map((b: any) => {
      routers?.[0].routes?.[2]?.routes.push({
        path: routers?.[0].routes?.[2].path + b.path,
        microApp: b.name,
        exact: true,
        name: b.label,
        component: dynamic({
          loader: () =>
            import(
              /* webpackChunkName: 'layouts__MicroAppLayout' */ './pages/layout/MicroAppLayout'
            ),
        }),
      });
    });
  }
}
