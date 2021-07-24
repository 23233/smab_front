import { Form, Input, Button, Row, Col, Typography, message } from 'antd';
import { useModel, history } from 'umi';
import React from 'react';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import Style from './index.less';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import useRealLocation from '@/components/useRealLocation';
import ROUTERS from '@/router';

const { Title } = Typography;

export default (props: any) => {
  const { signin } = useModel('useAuthModel');

  const location = useRealLocation();

  const { run, loading } = useRequest(Fetch.accountLogin, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        message.success(`登录成功`);
        signin(resp?.data?.token, resp?.data?.user);
        // @ts-ignore
        window.location.href = location?.query?.redirect || ROUTERS.task;
      }
    },
  });

  const onFinish = (values: any) => {
    run(values);
  };

  return (
    <div className={Style.bg}>
      <Row align="middle" justify="center">
        <Col>
          <div className={Style.w}>
            <Title level={1} className={Style.title}>
              {(window as any)?.smab?.name}
            </Title>
            <Form
              autoComplete={'off'}
              name="basic"
              size={'large'}
              onFinish={onFinish}
            >
              <Form.Item
                name="user_name"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder={'请输入用户名'} />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder={'请输入密码'}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  loading={loading}
                  htmlType="submit"
                  block
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};
