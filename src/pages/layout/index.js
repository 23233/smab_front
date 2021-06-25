import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './index.less';
import { useModel, Helmet } from 'umi';


export default (props) => {

  return (
    <ConfigProvider locale={zhCN}>
      <Helmet encodeSpecialCharacters={false}>
        <title>{window.smab?.name || '后台管理'}</title>
      </Helmet>
      {props.children}
    </ConfigProvider>
  );
}
