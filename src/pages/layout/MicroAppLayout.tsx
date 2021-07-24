import { MicroApp } from 'umi';
import React from 'react';
import { Spin, Alert } from 'antd';
import { useModel } from 'umi';

function MicroAppLayout(props: any) {
  // console.log("micro props",props)
  const { userInfo, userToken, userPer } = useModel('useAuthModel');

  const match = props?.match?.path.split('/');
  const name = match[match.length - 1];
  const qk = (window as any)?.s_qk;
  const item = qk?.find((b: any) => b?.name === name);
  // console.log('子应用加载', name, item);

  return (
    <MicroApp
      name={name}
      package={{
        userInfo,
        userToken,
        userPer,
      }}
      base={(window as any)?.routerBase + props?.match?.path}
      autoSetLoading // 设置自定义 loading 动画
      loader={(loading) => (
        <Spin
          tip={`${item?.label || name} ${item?.entry}加载中`}
          spinning={loading}
        >
          <div />
        </Spin>
      )}
      // 微应用容器 class
      className="myContainer"
      // wrapper class，仅开启 loading 动画时生效
      wrapperClassName="myWrapper"
    />
  );
}

export default MicroAppLayout;
