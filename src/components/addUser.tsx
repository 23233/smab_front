import React, { useState } from 'react';
import CommForm, { field, formItemLayout } from '@/components/form/dataForm';
import { useModel } from '@@/plugin-model/useModel';
import { Form } from 'antd';
import AllPerSelect from '@/components/showAllPer';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';

interface p {
  show: boolean;
  setShow: Function;
  onSuccess?: Function;
}

const AddUser: React.FC<p> = ({ show, setShow, onSuccess, ...props }) => {
  const { userInfo } = useModel('useAuthModel');
  const fieldsList: Array<field> = [
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
      types: 'string',
      map_name: 'password',
      label: '密码',
      rules: {
        min: 6,
        max: 20,
        message: '请输入6-20个字符之间',
      },
      required: true,
      placeholder: '请输入密码',
    },
    {
      types: 'string',
      map_name: 'desc',
      label: '简介',
      rules: {
        max: 30,
        message: '请勿超过30个字符',
      },
      placeholder: 'xxx开发小组',
    },
    {
      types: 'string',
      map_name: 'phone',
      label: '手机号',
      rules: {
        max: 11,
        message: '请勿超过11个字符',
      },
    },
  ];
  if (userInfo?.super) {
    fieldsList.push({
      types: 'bool',
      map_name: 'super_user',
      label: '管理员',
      required: false,
    });
  }

  const { run, loading } = useRequest(Fetch.addUser, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        onSuccess && onSuccess();
      }
    },
  });

  const formSuccess = (values: any) => {
    const data = {
      name: values.user_name,
      password: values.password,
      desc: values.desc,
      phone: values.phone,
      super_user: values.super_user,
      permissions: values.permissions.map((d: string) => {
        const sp = d.split('-');
        return {
          scope: sp[0],
          action: sp[1],
        };
      }),
    };
    console.log('新增user', values, data);
    run(data);
  };

  return (
    <React.Fragment>
      {show && (
        <CommForm
          fieldsList={fieldsList}
          onCreate={formSuccess}
          loading={loading}
          onCancel={() => setShow(false)}
        >
          <Form.Item
            {...formItemLayout}
            name={'permissions'}
            label={'权限'}
            rules={[
              {
                required: true,
                message: '请选择权限',
              },
            ]}
          >
            <AllPerSelect />
          </Form.Item>
        </CommForm>
      )}
    </React.Fragment>
  );
};
export default AddUser;
