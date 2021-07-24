import React, { useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Typography, Alert, Form, Input, Button } from 'antd';
import CommForm, { field, formItemLayout } from '@/components/form/commForm';
import AllPerSelect from '@/components/showAllPer';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default () => {
  const [show, setShow] = useState(true);
  const formSuccess = (values: any) => {
    console.log('vakyes', values);
  };

  const fields: Array<field> = [
    {
      types: 'string',
      map_name: 'user_name',
      label: '用户名',
      rules: {
        max: 30,
        message: '请勿超过30个字符',
      },
      required: true,
      placeholder: '推荐英文',
    },
    {
      types: '[]string',
      map_name: 'label',
      slice: 'slice',
    },
    {
      map_name: 'qiankun',
      types: 'object',
      children: [
        {
          types: 'string',
          map_name: 'user_name',
          label: '用户名',
          rules: {
            max: 30,
            message: '请勿超过30个字符',
          },
          required: true,
          placeholder: '推荐英文',
        },
        {
          types: '[]string',
          map_name: 'label',
          slice: 'slice',
        },
      ],
    },
  ];
  return (
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
          <span>欢迎使用后台管理系统,如果未看到任何菜单,请联系管理员!</span>
        </Typography.Text>
        <p>
          <Typography.Text strong>
            <span>请勿进行任何越权操作,每次操作均有记录,no zuo no die!</span>
          </Typography.Text>
        </p>

        <p className={'mt-10'}>
          <Typography.Text>
            <span>模型暂不支持修改创建时间 修改时间</span>
          </Typography.Text>
        </p>
      </Card>
    </PageHeaderWrapper>
  );
};
