import React, { useState } from 'react';
import { useModel, history, Link } from 'umi';
import { Menu, Dropdown, Avatar, message } from 'antd';
import Router from '../../router';
import { LogoutOutlined, LockOutlined } from '@ant-design/icons';
import CommForm from '../../components/dataForm';

import BasicLayout from '@ant-design/pro-layout';
import { useRequest } from 'ahooks';
import Fetch from '../../utils/fetch';
import ChangePasswordModal from '../../components/changePassword';

export default function (props) {
  const { userToken, userInfo, signout } = useModel('useAuthModel');
  const [pShow, setPShow] = useState(false);

  if (!userToken) {
    history.push({
      pathname: Router.login,
      query: {
        // todo 可选新增参数传递
        redirect: props.location?.pathname,
      },
    });
  }

  const menuDataRender = (menuList) => {
    return menuList.map((item) => {
      return {
        ...item,
        children: item.children ? menuDataRender(item.children) : [],
      };
    });
  };

  const menuItemRender = (menuItemProps, defaultDom) => {
    if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
      return defaultDom;
    }
    return <Link to={menuItemProps.path}>{defaultDom}</Link>;
  };

  const rightMenusClick = (event) => {
    const { key } = event;
    if (key === 'logout') {
      signout();
    } else if (key === 'changePassword') {
      setPShow(true);
    }
  };

  const rightContentRender = (HeaderViewProps) => {
    const menuHeaderDropdown = (
      <Menu selectedKeys={[]} onClick={rightMenusClick}>
        <Menu.Item key="changePassword">
          <LockOutlined />
          变更密码
        </Menu.Item>
        <Menu.Item key="logout">
          <LogoutOutlined />
          退出登录
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menuHeaderDropdown}>
        <span style={{ paddingRight: 30 }}>
          <span>{userInfo?.name}</span>
        </span>
      </Dropdown>
    );
  };

  return (
    <BasicLayout
      title={window?.smab?.name}
      {...props}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: '首页',
        },
        ...routers,
      ]}
      menuDataRender={menuDataRender}
      menuItemRender={menuItemRender}
      rightContentRender={rightContentRender}
    >
      {props.children}

      <ChangePasswordModal
        userId={userInfo?.id}
        setShow={setPShow}
        show={pShow}
      />
    </BasicLayout>
  );
}
