import React, { useState } from 'react';
import Moment from 'moment';
import _ from 'lodash';
import {
  Button,
  Modal,
  Form,
  Input,
  Radio,
  InputNumber,
  Drawer,
  Switch,
  TimePicker,
  DatePicker,
  Select,
  Spin,
  Space,
  Divider,
} from 'antd';
import { Rule } from 'rc-field-form/lib/interface';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import './form.less';

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
  slice?: string;
  initKey?: string; // 修改时比对用
  children?: Array<field>;
}

interface kv {
  [k: string]: any;
}

export interface formParams {
  onCreate?: (values: any) => void;
  onCancel?: Function;
  fieldsList: Array<field>;
  initValues?: kv;
  loading?: boolean;
  isAction?: boolean;
  children?: React.ReactNode;
}

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
export const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

const formItemAddBtnWithOutLabel = {
  wrapperCol: {
    xs: { span: 16, offset: 0 },
    sm: { span: 16, offset: 4 },
  },
};

const CommForm: React.FC<formParams> = ({
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
  const [show, setShow] = useState<boolean>(true);

  const flattenKeys: (obj: any, path?: any[]) => { [p: string]: any } = (
    obj: any,
    path = [],
  ) =>
    !_.isObject(obj)
      ? { [path.join('.')]: obj }
      : _.reduce(
          obj,
          (cum, next, key) => _.merge(cum, flattenKeys(next, [...path, key])),
          {},
        );

  let initialValues = {} as any;
  if (!isAction && !!initValues) {
    initialValues = flattenKeys(initValues);

    fieldsList.map((d, i) => {
      // 判断是否存在

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
          'number',
          'time.Duration',
        ].includes(d.types)
      ) {
        initialValues[d.map_name] = initValues[d.map_name] || 0;
      }
    });
  }

  // console.log('initialValues', initialValues, fieldsList);

  const typeGetElement = (types: string, placeholder?: string) => {
    let ele;
    switch (types) {
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
      case 'number':
      case 'time.Duration':
        ele = (
          <InputNumber
            style={{ width: '100%' }}
            placeholder={placeholder || '请输入内容'}
          />
        );
        break;
      case 'time':
      case 'time.Time':
        ele = <DatePicker showTime placeholder={placeholder || '请选择时间'} />;
        break;
      case 'bool':
        ele = <Switch />;
        break;
      default:
        ele = <Input placeholder={placeholder || '请输入内容'} />;
        break;
    }
    return ele;
  };

  // 单个
  const TypeToElement = (k: field, name?: number, fieldKey?: number) => {
    // console.log('type to element', k, name, fieldKey);
    let required = !!k?.required;
    const t = k.types;
    const valueProp = t === 'bool' ? 'checked' : 'value';
    let ele = typeGetElement(t, k.placeholder);

    const rules = [
      {
        required: required,
        message: '请填写数据内容',
      },
    ] as Rule[];
    if (!!k?.rules) {
      rules.push(k.rules);
    }
    const params = {
      name: k.map_name,
      label: k?.label || k.map_name,
      valuePropName: valueProp,
      rules: rules,
    } as any;
    if (name) {
      params.name = [name, k.map_name];
    }
    if (fieldKey) {
      params.fieldKey = [fieldKey, k.map_name];
    }

    return (
      <Form.Item {...formItemLayout} {...params} key={params.name.toString()}>
        {ele}
      </Form.Item>
    );
  };

  // 群组
  const SliceToElement = (k: field, name?: number, fieldKey?: number) => {
    let required = !!k?.required;
    const t = k.types.replaceAll('[', '').replaceAll(']', '');
    let ele = typeGetElement(t, k.placeholder);

    const rules = [
      {
        required: required,
        message: '请填写数据内容',
      },
    ] as Rule[];
    if (!!k?.rules) {
      rules.push(k.rules);
    }

    const params = {
      name: k.map_name,
      rules: rules,
    } as any;
    if (name) {
      params.name = [name, k.map_name];
    }
    if (fieldKey) {
      params.fieldKey = [fieldKey, k.map_name];
    }

    return (
      <Form.List {...params}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                label={index === 0 ? k?.label || k.map_name : ''}
                required={required}
                key={field.key}
              >
                <div className={'flex'}>
                  <div>
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={rules}
                      noStyle
                    >
                      {ele}
                    </Form.Item>
                  </div>
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(field.name)}
                  />
                </div>
              </Form.Item>
            ))}
            <Form.Item {...formItemAddBtnWithOutLabel}>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                新增{k?.label || k?.map_name}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    );
  };

  const MomentToFormat = (values: any) => {
    Object.keys(values).map((k, i) => {
      const v = values[k];
      const t = fieldsList.find((d) => d.map_name === k);
      if (t) {
        if (t?.slice === 'slice') {
          const tt = t.types.replaceAll('[', '').replaceAll(']', '');
          if (tt === 'time.Time' || tt === 'time') {
            let r = [] as any;
            v?.map((d: any) => {
              if (typeof d === 'object' && d._isAMomentObject) {
                r.push(v.utc().format());
              }
            });
            values[k] = r;
          }
        } else {
          if (typeof v === 'object' && v._isAMomentObject) {
            values[k] = v.utc().format();
          }
        }
      }
    });
  };

  const ValuesTypeChange = (values: any) => {
    Object.keys(values).map((k, i) => {
      const v = values[k];
      const t = fieldsList.find((d) => d.map_name === k);
      if (t) {
        if (t?.slice === 'slice') {
          const tt = t.types.replaceAll('[', '').replaceAll(']', '');
          let r: Array<any> = [];
          v?.map((d: any) => {
            if (tt === 'bool') {
              r.push(!!d);
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
                'float32',
                'float64',
              ].includes(tt)
            ) {
              r.push(Number(v));
            }
          });

          values[k] = r?.length || v;
        } else {
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
        }
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

  const onClose = () => {
    onCancel && onCancel(false);
    setShow(false);
  };

  const renderChildren = (field: field) => {
    return (
      <React.Fragment>
        <Divider>{field?.label || field.map_name}</Divider>
        <Form.List name={field.map_name} key={field.map_name}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }, i) => (
                <div key={`${field.map_name}_${key}_${i}`}>
                  {field.children?.map((b) => {
                    if (b?.children) {
                      return renderChildren(b);
                    }
                    if (!!b?.slice && b?.slice === 'slice') {
                      return SliceToElement(b, name, fieldKey);
                    }
                    return TypeToElement(b, name, fieldKey);
                  })}
                  <Form.Item {...formItemAddBtnWithOutLabel}>
                    <Button
                      icon={<MinusCircleOutlined />}
                      type="dashed"
                      block
                      onClick={() => remove(name)}
                    >
                      删除{field?.label || field.map_name}
                    </Button>
                  </Form.Item>
                </div>
              ))}
              <Form.Item {...formItemAddBtnWithOutLabel}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  新增{field.label || field.map_name}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </React.Fragment>
    );
  };

  const renderContent = () => {
    return fieldsList.map((k, i) => {
      return (
        <React.Fragment key={i}>
          {k?.children?.length
            ? renderChildren(k)
            : !!k?.slice && k?.slice === 'slice'
            ? SliceToElement(k)
            : TypeToElement(k)}
        </React.Fragment>
      );
    });
  };

  return (
    <Drawer
      visible={show}
      title="数据交互页"
      placement={'right'}
      width={'80%'}
      bodyStyle={{ padding: 10 }}
      headerStyle={{ padding: 10 }}
      closable={false}
      onClose={onClose}
    >
      <div className={'mt-4'}>
        <Form
          form={form}
          name="form_in_modal"
          layout={'horizontal'}
          onFinish={runCreate}
          initialValues={initialValues}
        >
          {renderContent()}
          {children}
          <Form.Item {...formItemLayoutWithOutLabel}>
            <Button type="primary" htmlType="submit" className={'mr-2'}>
              提交
            </Button>
            <Button htmlType="button" onClick={() => form.resetFields()}>
              重置
            </Button>
            <Button
              type="link"
              htmlType="button"
              onClick={() => onCancel && onCancel(false)}
            >
              关闭
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Drawer>
  );
};

export default CommForm;
