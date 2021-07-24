import React from 'react';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import { message } from 'antd';
import CommForm from '@/components/form/commForm';
import { Rule } from 'rc-field-form/lib/interface';

interface p {
  userId: string;
  show: boolean;
  setShow: Function;
  onSuccess?: Function;
}

const ChangePasswordModal: React.FC<p> = ({
  userId,
  show,
  setShow,
  onSuccess,
  ...props
}) => {
  const { run, loading } = useRequest(Fetch.changePassword, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        message.success('变更密码成功');
        setShow(false);
        onSuccess && onSuccess();
      }
    },
  });

  const passwordFields = [
    {
      types: 'string',
      map_name: 'password',
      required: true,
      label: '新密码',
      rules: {
        min: 6,
        max: 20,
        message: '密码在6-20个字符之间',
      },
    },
  ];

  const onPasswordChangeCreate = (values: any) => {
    run(userId, values.password);
  };

  return (
    <React.Fragment>
      {show && (
        <CommForm
          fieldsList={passwordFields}
          onCreate={onPasswordChangeCreate}
          onCancel={() => setShow(false)}
        />
      )}
    </React.Fragment>
  );
};
export default ChangePasswordModal;
