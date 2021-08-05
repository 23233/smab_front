import React, { useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Card, Typography, Alert, Form, Input, Button } from 'antd';
import CommForm, { field, formItemLayout } from '@/components/form/commForm';
import AllPerSelect from '@/components/showAllPer';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

export default () => {
  const { welCome } = useModel('useAuthModel');

  return (
    <PageHeaderWrapper>
      <Card>
        <Alert
          message={welCome?.title || '后台管理系统正式发布了'}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />
        {welCome?.main_text ? (
          welCome.main_text?.map((d: string, i: number) => {
            return (
              <Typography.Text key={i} strong>
                <span>{d}</span>
              </Typography.Text>
            );
          })
        ) : (
          <Typography.Text strong>
            <span>欢迎使用后台管理系统,如果未看到任何菜单,请联系管理员!</span>
          </Typography.Text>
        )}

        {welCome?.desc ? (
          welCome.desc?.map((d: string, i: number) => {
            return (
              <p className={'mt-10'} key={i}>
                <Typography.Text>
                  <span>{d}</span>
                </Typography.Text>
              </p>
            );
          })
        ) : (
          <p className={'mt-10'}>
            <Typography.Text>
              <span>模型暂不支持修改创建时间 修改时间</span>
            </Typography.Text>
          </p>
        )}
      </Card>
    </PageHeaderWrapper>
  );
};
