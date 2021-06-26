import React, { useState } from 'react';
import CommForm, { field } from '@/components/form/dataForm';
import { useModel } from '@@/plugin-model/useModel';
import { Form, message } from 'antd';
import AllPerSelect from '@/components/showAllPer';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';

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
        />
      )}
    </React.Fragment>
  );
};
export default EditUserBaseModal;
