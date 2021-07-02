import React, { useEffect, useRef, useState } from 'react';
import { Button, Drawer, message, Spin } from 'antd';
import ReactJson, { InteractionProps } from 'react-json-view';
import ReactDOM from 'react-dom';

interface p {
  data: any;
  title?: string;
  onSuccess?: Function;
  loading?: boolean;
}

export const openDrawerEditFields = (
  data: any,
  title?: string,
  onSuccess?: Function,
  loading?: boolean,
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
        <DrawerEditFields
          data={data}
          title={title}
          onSuccess={onSuccess}
          loading={loading}
        />,
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
  loading = false,
  ...props
}) => {
  const [show, setShow] = useState<boolean>(true);
  const _temp = useRef<any>();
  const [src, setSrc] = useState<any>();

  useEffect(() => {
    if (data) {
      // 过滤掉_id
      const _data = {} as any;
      for (const [key, value] of Object.entries(data)) {
        if (key != '_id') {
          _data[key] = value;
        }
      }
      _temp.current = { ..._data };
      setSrc(_data);
    }
  }, [data]);

  const editAction = (p: InteractionProps) => {
    console.log('修改', p);
    setSrc(p.updated_src);
  };
  const deleteAction = (p: InteractionProps) => {
    console.log('删除', p);
    setSrc(p.updated_src);
  };
  const addAction = (p: InteractionProps) => {
    console.log('新增', p);
    setSrc(p.updated_src);
  };

  // 找到变更项目 仅对比一级即可
  const findDiff = (): object => {
    const diff = {} as any;
    for (const [key, value] of Object.entries(src)) {
      if (JSON.stringify(_temp.current[key]) != JSON.stringify(value)) {
        diff[key] = value;
      }
    }

    return diff;
  };

  const onReset = () => {
    setSrc(data);
  };

  const success = () => {
    // 对比一下 找到修改项
    const diff = findDiff();
    if (Object.keys(diff).length) {
      onSuccess && onSuccess(diff, data['_id'], data);
      return;
    }
    message.warning('未检测到变更');
  };

  return (
    <Drawer
      title={title || '修改数据'}
      visible={show}
      onClose={() => setShow(false)}
      destroyOnClose={true}
      width={'70%'}
    >
      <Spin spinning={loading}>
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
          <Button onClick={onReset}>还原</Button>
        </div>
      </Spin>
    </Drawer>
  );
};
export default DrawerEditFields;
