import React, { useState } from 'react';
import { Button, Drawer } from 'antd';
import ReactDOM from 'react-dom';
import SchemeForm from '@/components/custom/formRender';
import { Error, useForm } from 'form-render';

interface p {
  title?: string;
  scheme: object;
  onSuccess?: (formData: any, error: Error[]) => void;
}

export const openDrawerSchemeForm = (p: p) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  function close() {
    destroy();
  }

  function render() {
    setTimeout(() => {
      ReactDOM.render(<DrawerShowSchemeForm {...p} />, div);
    });
  }

  render();

  return {
    destroy: close,
  };
};

const DrawerShowSchemeForm: React.FC<p> = ({
  title,
  scheme,
  onSuccess,
  ...props
}) => {
  const [show, setShow] = useState<boolean>(true);
  const form = useForm();

  const finish = (formData: any, error: Error[]) => {
    if (error?.length) {
      return;
    }
    onSuccess && onSuccess(formData, error);
  };

  return (
    <Drawer
      title={title || '数据管理'}
      visible={show}
      onClose={() => setShow(false)}
      destroyOnClose={true}
      width={'75%'}
    >
      <SchemeForm form={form} schema={scheme} onFinish={finish} />
      <Button type="primary" onClick={form.submit} block size={'large'}>
        提交
      </Button>
    </Drawer>
  );
};
export default openDrawerSchemeForm;
