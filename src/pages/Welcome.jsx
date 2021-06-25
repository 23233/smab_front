import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Typography, Alert } from 'antd';


export default () => (
  <PageHeaderWrapper>
    <Card>
      <Alert
        message="后台管理系统正式发布了 "
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <Typography.Text strong>
        <span>
             欢迎使用后台管理系统,如果未看到任何菜单,请联系管理员!
        </span>
      </Typography.Text>
      <p>
        <Typography.Text strong>
        <span>
             请勿进行任何越权操作,每次操作均有记录,no zuo no die!
        </span>
        </Typography.Text>
      </p>

    </Card>

  </PageHeaderWrapper>
);
