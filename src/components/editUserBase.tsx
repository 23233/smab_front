import React, { useState } from 'react';
import CommForm, { field, formItemLayout } from '@/components/form/dataForm';
import { useModel } from '@@/plugin-model/useModel';
import { Button, Form, Input, message } from 'antd';
import AllPerSelect from '@/components/showAllPer';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

interface p {
  show: boolean;
  setShow: Function;
  onSuccess?: Function;
  initValues?: any;
  userId: string;
}

const EditUserBaseModal: React.FC<p> = ({
  show,
  setShow,
  onSuccess,
  userId,
  initValues,
  ...props
}) => {
  const { userInfo } = useModel('useAuthModel');
  const fieldsList: Array<field> = [
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

  const { run, loading } = useRequest(Fetch.editUserBase, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        message.success('修改成功');
        onSuccess && onSuccess();
      }
    },
  });

  const formSuccess = (values: any) => {
    const data = {
      id: String(userId),
      desc: values.desc,
      phone: values.phone,
      super_user: values.super_user,
      qian_kun: values?.qiankun,
    };
    console.log('修改user', values, data);
    run(data);
  };

  return (
    <React.Fragment>
      {show && (
        <CommForm
          fieldsList={fieldsList}
          onCreate={formSuccess}
          initValues={initValues}
          loading={loading}
          onCancel={() => setShow(false)}
        >
          <Form.List name="qiankun" initialValue={initValues?.qian_kun}>
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
                {fields.length < 1 && (
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
                )}
              </>
            )}
          </Form.List>
        </CommForm>
      )}
    </React.Fragment>
  );
};
export default EditUserBaseModal;
