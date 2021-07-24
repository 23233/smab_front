import React, { useState } from 'react';
import { useModel, history, Link } from 'umi';
import { Menu, Dropdown, Avatar, message, Popover } from 'antd';
import Router from '../../router';
import { LogoutOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

import BasicLayout from '@ant-design/pro-layout';

import ChangePasswordModal from '../../components/changePassword';

export default function (props) {
  // console.log('layout props', props);
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
    if (menuItemProps?.microApp) {
      // console.log('微前端', menuItemProps);
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
        <Menu.Item key="Id">
          <UserOutlined />
          <Popover
            content={userInfo?.id}
            title={'用户ID'}
            trigger={['click']}
            placement={'rightTop'}
          >
            用户ID
          </Popover>
        </Menu.Item>
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

  const postMenus = (menus) => {
    return menus;
  };

  return (
    <BasicLayout
      title={window?.smab?.name}
      {...props}
      breadcrumbRender={(routers = []) => [
        {
          path: window?.routerBase || '/',
          breadcrumbName: '首页',
        },
        ...routers,
      ]}
      postMenuData={postMenus}
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
