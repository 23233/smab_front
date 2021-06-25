import React, { useState } from 'react';
import Moment from 'moment';
import {
  Button,
  Modal,
  Form,
  Input,
  Radio,
  InputNumber,
  Row,
  Col,
  Switch,
  TimePicker,
  DatePicker,
  Select,
  Spin,
} from 'antd';
import { Rule } from 'rc-field-form/lib/interface';

const { Option } = Select;

// fieldsList 格式
//[{
//       types: 'string',
//       map_name: 'password',
//       required:false,
//       label:"密码",
//       rules:{}
//     }]

export interface field {
  types: string;
  map_name: string;
  required?: boolean;
  label?: string;
  rules?: Rule;
  placeholder?: string;
}

interface kv {
  [k: string]: any;
}

interface p {
  onCreate?: (values: any) => void;
  onCancel?: Function;
  fieldsList: Array<field>;
  initValues?: kv;
  loading?: boolean;
  isAction?: boolean;
  children?: React.ReactNode;
}

const CommForm: React.FC<p> = ({
  onCreate,
  onCancel,
  fieldsList,
  initValues,
  loading,
  isAction,
  children,
  ...props
}) => {
  const [form] = Form.useForm();

  let initialValues = {} as any;
  if (!isAction && !!initValues) {
    initialValues = initValues;
    fieldsList.map((d, i) => {
      if (['time.Time', 'time'].includes(d.types)) {
        initialValues[d.map_name] = Moment(initValues[d.map_name]);
      } else if (['bool'].includes(d.types)) {
        if (typeof initValues[d.map_name] !== 'boolean') {
          initialValues[d.map_name] = !!parseInt(
            initValues[d.map_name] || false,
          );
        }
      } else if (
        [
          'uint',
          'uint8',
          'uint16',
          'uint32',
          'uint64',
          'int',
          'int8',
          'int16',
          'int32',
          'int64',
          'float32',
          'float64',
          'time.Duration',
        ].includes(d.types)
      ) {
        initialValues[d.map_name] = initValues[d.map_name] || 0;
      }
    });
  }

  // console.log('initialValues', initialValues, fieldsList);

  const TypeToElement = (k: field) => {
    // console.log('type to element', k);
    let required = !!k?.required;
    const t = k.types;
    const valueProp = t === 'bool' ? 'checked' : 'value';
    let ele;
    switch (t) {
      case 'float32':
      case 'float64':
      case 'int':
      case 'int8':
      case 'int16':
      case 'int32':
      case 'int64':
      case 'uint':
      case 'uint8':
      case 'uint16':
      case 'uint32':
      case 'uint64':
      case 'time.Duration':
        ele = (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={k?.placeholder || '请输入内容'}
          />
        );
        break;
      case 'time':
      case 'time.Time':
        ele = (
          <DatePicker showTime placeholder={k?.placeholder || '请选择时间'} />
        );
        break;
      case 'bool':
        ele = <Switch />;
        break;
      default:
        ele = <Input placeholder={k?.placeholder || '请输入内容'} />;
        break;
    }

    const rules = [
      {
        required: required,
        message: '请填写数据内容',
      },
    ] as Rule[];
    if (!!k?.rules) {
      rules.push(k.rules);
    }

    return (
      <Form.Item
        name={k.map_name}
        label={k?.label || k.map_name}
        valuePropName={valueProp}
        rules={rules}
      >
        {ele}
      </Form.Item>
    );
  };

  const MomentToFormat = (values: any) => {
    Object.keys(values).map((k, i) => {
      const v = values[k];
      if (typeof v === 'object' && v._isAMomentObject) {
        values[k] = v.format('YYYY-MM-DD HH:mm:ss');
      }
    });
  };

  const ValuesTypeChange = (values: any) => {
    Object.keys(values).map((k, i) => {
      const v = values[k];
      const t = fieldsList.find((d) => d.map_name === k);
      if (!t) {
        return;
      }
      if (t?.types === 'bool') {
        values[k] = !!v;
      } else if (
        [
          'uint',
          'uint8',
          'uint16',
          'uint32',
          'uint64',
          'int',
          'int8',
          'int16',
          'int32',
          'int64',
          'time.Duration',
        ].includes(t.types)
      ) {
        values[k] = Number(v);
      } else if (['float32', 'float64'].includes(t.types)) {
        values[k] = Number(v);
      }
    });
  };

  const runCreate = () => {
    form
      .validateFields()
      .then((values) => {
        // form.resetFields();
        // 把所有时间转换格式
        MomentToFormat(values);
        // 格式转换
        ValuesTypeChange(values);
        onCreate && onCreate(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      visible={true}
      title="数据交互页"
      okText="提交"
      cancelText="取消"
      onCancel={() => onCancel && onCancel()}
      bodyStyle={{ maxHeight: '60vh', overflow: 'hidden auto' }}
      confirmLoading={loading}
      onOk={runCreate}
    >
      <Form
        form={form}
        name="form_in_modal"
        layout={'horizontal'}
        initialValues={initialValues}
      >
        {fieldsList.map((k, i) => {
          return <React.Fragment key={i}>{TypeToElement(k)}</React.Fragment>;
        })}
        {children}
      </Form>
    </Modal>
  );
};

export default CommForm;
