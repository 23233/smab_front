import React, { useState } from 'react';
import CommForm, { field, formItemLayout } from '@/components/form/dataForm';
import { useModel } from '@@/plugin-model/useModel';
import { Form, message } from 'antd';
import AllPerSelect from '@/components/showAllPer';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';

interface p {
  show: boolean;
  setShow: Function;
  onSuccess?: Function;
  userId: string;
}

const EditPermissionsModal: React.FC<p> = ({
  show,
  setShow,
  onSuccess,
  userId,
  ...props
}) => {
  const { run, loading } = useRequest(Fetch.editUserPermission, {
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
      permissions: values.permissions.map((d: string) => {
        const sp = d.split('-');
        return {
          scope: sp[0],
          action: sp[1],
        };
      }),
    };
    console.log('修改用户权限', values, data);
    run(data);
  };

  return (
    <React.Fragment>
      {show && (
        <CommForm
          fieldsList={[]}
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
export default EditPermissionsModal;
