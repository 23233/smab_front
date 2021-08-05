import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  message,
  Popconfirm,
  Spin,
  DatePicker,
  Space,
} from 'antd';
import ReactJson, { InteractionProps } from 'react-json-view';
import ReactDOM from 'react-dom';
import { CheckCircleOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';

interface p {
  data: any;
  title?: string;
  id?: string;
  reference?: any;
  onSuccess?: Function;
  loading?: boolean;
}

export const openDrawerEditFields = (p: p) => {
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
          data={p.data}
          title={p.title}
          reference={p.reference}
          id={p.id}
          onSuccess={p.onSuccess}
          loading={p.loading}
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
  id,
  onSuccess,
  reference,
  loading = false,
  ...props
}) => {
  const [show, setShow] = useState<boolean>(true);
  const _temp = useRef<any>();
  const [src, setSrc] = useState<any>();
  const [refShow, setRefShow] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      // 过滤掉_id
      const _data = {} as any;
      for (const [key, value] of Object.entries(data)) {
        if (key != '_id' && key != 'id') {
          _data[key] = value;
        }
      }
      _temp.current = { ..._data };
      console.log('_data', _data);
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
      onSuccess && onSuccess(diff, id, data);
      return;
    }
    message.warning('未检测到变更');
  };

  const timeSelectChange = (date: any, dateString: string) => {
    copy(date.utc().format());
    message.info('UTC时间写入剪切板成功');
  };

  return (
    <Drawer
      title={title || '修改数据'}
      visible={show}
      onClose={() => setShow(false)}
      destroyOnClose={true}
      width={'70%'}
    >
      <Spin spinning={loading} className="relative">
        <pre className={'mb-2'}>Ctrl+Click 编辑 Ctrl+Enter 确定</pre>
        <div className={'flex mb-2'}>
          <Space>
            <Popconfirm title={'确认还原吗?'} onConfirm={onReset}>
              <div>
                <Button>还原变更</Button>
              </div>
            </Popconfirm>
            <DatePicker
              showTime
              onChange={timeSelectChange}
              placeholder={'选择UTC时间到剪切板'}
              inputReadOnly
            />
            {!!reference && (
              <Button onClick={() => setRefShow(!refShow)}>
                {refShow ? '关闭' : '查看'}参考
              </Button>
            )}
          </Space>
        </div>

        <ReactJson
          src={src}
          name={null}
          onEdit={editAction}
          onAdd={addAction}
          onDelete={deleteAction}
        />

        {refShow && (
          <div>
            <Button onClick={() => setRefShow(!refShow)}>参考隐藏</Button>
            <pre>{JSON.stringify(reference, null, 2)}</pre>
          </div>
        )}

        <div
          className="flex  justify-center mt-2"
          style={{ position: 'absolute', right: 0, bottom: '70%' }}
        >
          {id ? (
            <Popconfirm title={'确认完成吗?'} onConfirm={success}>
              <CheckCircleOutlined
                style={{ fontSize: 30, color: 'blue' }}
                title={'完成'}
              />
            </Popconfirm>
          ) : (
            <CheckCircleOutlined
              style={{ fontSize: 30, color: 'blue' }}
              title={'完成'}
              onClick={success}
            />
          )}
        </div>
      </Spin>
    </Drawer>
  );
};
export default DrawerEditFields;
