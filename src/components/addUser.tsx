import React, { useState } from 'react';
import CommForm, { field, formItemLayout } from '@/components/form/commForm';
import { useModel } from '@@/plugin-model/useModel';
import { Button, Form, Input, Space } from 'antd';
import AllPerSelect from '@/components/showAllPer';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { objectToData } from '@/utils/tools';

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
    let data = {
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
    } as any;
    if (values?.qiankun?.length) {
      data['qian_kun'] = values?.qiankun;
    }
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

          <Form.List name="qiankun">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key}>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用英文名"
                      name={[name, 'name']}
                      fieldKey={[fieldKey, 'name']}
                      rules={[{ required: true, message: '请输入英文名' }]}
                    >
                      <Input maxLength={20} placeholder={'请输入英文名'} />
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用中文名"
                      name={[name, 'label']}
                      fieldKey={[fieldKey, 'label']}
                      rules={[{ required: true, message: '请输入中文名' }]}
                    >
                      <Input maxLength={200} placeholder={'请输入中文名'} />
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用访问地址"
                      name={[name, 'entry']}
                      fieldKey={[fieldKey, 'entry']}
                      rules={[{ required: true, message: '请输入访问地址' }]}
                    >
                      <Input
                        maxLength={200}
                        placeholder={'请输入入口访问地址'}
                      />
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用路径"
                      name={[name, 'path']}
                      fieldKey={[fieldKey, 'path']}
                      rules={[{ required: true, message: '请输入子应用路径' }]}
                    >
                      <Input
                        maxLength={200}
                        placeholder={'/开头的url路径 匹配则显示'}
                      />
                    </Form.Item>

                    <Form.Item {...formItemLayout} label={'操作'}>
                      <Button
                        icon={<MinusCircleOutlined />}
                        type="dashed"
                        block
                        onClick={() => remove(name)}
                      >
                        删除子应用配置
                      </Button>
                    </Form.Item>
                  </div>
                ))}
                <Form.Item label={'子应用'} {...formItemLayout}>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    新增子应用
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </CommForm>
      )}
    </React.Fragment>
  );
};
export default AddUser;
