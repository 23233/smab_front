import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { Helmet } from 'umi';
import './global.less';

export default (props: any) => {
  return (
    <ConfigProvider locale={zhCN}>
      <Helmet encodeSpecialCharacters={false}>
        <title>{(window as any)?.smab?.name || '后台管理'}</title>
      </Helmet>
      {props.children}
    </ConfigProvider>
  );
};
