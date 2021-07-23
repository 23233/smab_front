import React from 'react';
import './app.less';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import ZhCh from 'dayjs/locale/zh-cn';
import Req from '@/utils/request';
import Fetch from '@/utils/fetch';

// 引入dayjs 中文包 相对时间插件
require('dayjs/locale/zh-cn');
dayjs.locale(ZhCh);
dayjs.extend(relativeTime);
dayjs.extend(utc);

// 从接口中获取子应用配置，export 出的 qiankun 变量是一个 promise
export const qiankun = Fetch.getQiankunConfig()
  .then((resp) => {
    if (resp.response.status === 200) {
      (window as any).s_qk = resp?.data;
      return resp.data;
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
      // 路由注册 运行时注册的路由会自动关联到你配置的根路由下面
      routes:
        apps?.map((d: any) => {
          return {
            microApp: d?.name,
            path: d?.path,
          };
        }) || [],
    };
  });
