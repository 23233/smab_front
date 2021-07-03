import React, { useState } from 'react';
import { Button, Col, Input, message, Row, InputNumber } from 'antd';
import ReactJson from 'react-json-view';

const { TextArea } = Input;

interface p {
  selectChat: any;
  onBack: Function;
  onSuccess: (
    data: any,
    value: string,
    refresh_second: number,
    name: string,
  ) => void;
}

const ChatConfig: React.FC<p> = ({
  selectChat,
  onSuccess,
  onBack,
  ...props
}) => {
  const [json, setJson] = useState<any>({});
  const [fast, setFast] = useState<string>();
  const [value, setValue] = useState<string>();
  const [count, setCount] = useState<number>(0);
  const [name, setName] = useState<string>('新图表');

  const onChange = (item: any) => {
    setJson(item.updated_src);
  };

  const success = () => {
    if (!value) {
      message.error('请填写数据获取地址');
      return;
    }
    if (Object.keys(json).length) {
      onSuccess(json, value, count, name);
    } else {
      message.error('请填写配置文件');
    }
  };

  const isJSON = (val: any) => {
    if (typeof val == 'string') {
      try {
        let obj = eval('(' + val + ')');
        return typeof obj == 'object';
      } catch (e) {
        return false;
      }
    }
  };

  const fastBlur = () => {
    if (fast) {
      if (isJSON(fast)) {
        setJson(eval('(' + fast + ')'));
        setFast(undefined);
      } else {
        message.warning('不符合json规范,请检查');
      }
    }
  };

  return (
    <React.Fragment>
      <Row style={{ padding: '20px 0' }}>
        <Col xs={24} sm={12} md={4}>
          {selectChat?.name}配置
        </Col>
        <Col xs={24} sm={24} md={18}>
          <ReactJson
            src={json}
            onAdd={onChange}
            onDelete={onChange}
            onEdit={onChange}
            name={'config'}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          快捷操作
        </Col>
        <Col xs={24} sm={24} md={18}>
          <TextArea
            autoSize={{ minRows: 8 }}
            value={fast}
            onChange={(e) => setFast(e.target.value)}
            placeholder={'配置json粘贴在这里'}
          />
          <div style={{ margin: '10px 0' }}>
            <Button onClick={fastBlur}>生成配置</Button>
          </div>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <a
            href={selectChat?.href}
            target={'_blank'}
            className={'text-blue-700'}
          >
            配置文件参考地址
          </a>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <p style={{ margin: 0 }}>快捷配置格式参考</p>
          <code style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify({ xField: 'sales', yField: 'type' }, null, 2)}
          </code>
        </Col>
      </Row>

      <div className={'mt-10'}>
        <div>
          数据获取地址:
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={'数据获取地址'}
            maxLength={255}
          />
        </div>
        <div className={'mt-2'}>
          数据刷新时间:{' '}
          <InputNumber value={count} onChange={(v) => setCount(v)} /> 秒
          (0为不刷新)
        </div>
        <div className={'mt-2'}>
          图表名称:{' '}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'图表名称'}
            maxLength={255}
          />
        </div>
      </div>

      <div className={'text-center mt-10'}>
        <Button onClick={() => onBack()}>上一步</Button>
        <Button type={'primary'} onClick={success}>
          完成
        </Button>
      </div>
    </React.Fragment>
  );
};
export default ChatConfig;
