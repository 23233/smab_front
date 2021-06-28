import React, { useEffect, useRef, useState } from 'react';
import { Button, Drawer } from 'antd';
import ReactJson, { InteractionProps } from 'react-json-view';
import ReactDOM from 'react-dom';

interface p {
  data: any;
  title?: string;
  onSuccess?: Function;
}

export const openDrawerEditFields = (
  data: any,
  title?: string,
  onSuccess?: Function,
) => {
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
      ReactDOM.render(
        <DrawerEditFields data={data} title={title} onSuccess={onSuccess} />,
        div,
      );
    });
  }

  render();

  return {
    destroy: close,
  };
};

const DrawerEditFields: React.FC<p> = ({
  data,
  title,
  onSuccess,
  ...props
}) => {
  const [show, setShow] = useState<boolean>(true);
  const _temp = useRef<any>();
  const [src, setSrc] = useState<any>();

  useEffect(() => {
    if (data) {
      _temp.current = { ...data };
      setSrc(data);
    }
  }, [data]);

  const editAction = (p: InteractionProps) => {
    console.log('修改', p);
  };
  const deleteAction = (p: InteractionProps) => {
    console.log('删除', p);
  };
  const addAction = (p: InteractionProps) => {
    console.log('新增', p);
  };

  const onReset = () => {
    setSrc(data);
  };

  const success = () => {
    // 对比一下 找到修改项
  };

  return (
    <Drawer
      title={title || '修改数据'}
      visible={show}
      onClose={() => setShow(false)}
      destroyOnClose={true}
      width={'70%'}
    >
      <ReactJson
        src={src}
        name={null}
        onEdit={editAction}
        onAdd={addAction}
        onDelete={deleteAction}
      />
      <div className="flex justify-center mt-2">
        <Button onClick={success} className={'mr-2'}>
          完成
        </Button>
        <Button onClick={onReset}>重置</Button>
      </div>
    </Drawer>
  );
};
export default DrawerEditFields;
