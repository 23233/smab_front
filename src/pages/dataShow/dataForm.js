import React, { useState } from 'react';
import Moment from 'moment';
import {
  Button,
  Modal,
  Form,
  Input,
  Radio,
  InputNumber,
  Row, Col,
  Switch,
  TimePicker,
  DatePicker,
  Select,
  Spin,
} from 'antd';
import { useMount, useRequest } from 'ahooks';
import Fetch from '../../utils/fetch';

const { Option } = Select;

const CollectionCreateForm = ({
                                onCreate,
                                onCancel,
                                fieldsList,
                                initValues,
                                loading,
                                isAction,
                              }) => {
  const [form] = Form.useForm();

  const {
    run: searchText,
    data: searchData,
    loading: searchLoading,
  } = useRequest(Fetch.searchRouterData, {
    manual: true,
    debounceInterval: 500,
  });

  let initialValues = {};
  if (!isAction) {
    initialValues = JSON.parse(JSON.stringify(initValues));
    fieldsList.fields.map((d, i) => {
      if (['time.Time', 'time'].includes(d.types)) {
        initialValues[d.map_name] = Moment(initValues[d.map_name]);
      } else if (['bool'].includes(d.types)) {
        initialValues[d.map_name] = !!parseInt(initValues[d.map_name] || false);
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
      // 再判断类型
      if (d?.sp_tags_list?.length) {
        // 先判断是否有外键
        let fk = d?.sp_tags_list?.find(e => e.key === 'fk');
        let multiple = d?.sp_tags_list?.find(e => e.key === 'multiple');
        if (fk && multiple) {
          initialValues[d.map_name] = initValues[d.map_name]?.split(',') || [];
        }
      }
    });
  } else {
    if (initValues) {
      // 标签解析
      fieldsList.fields.map((d, i) => {
        if (d?.sp_tags_list?.length) {
          // 解析出数据
          d?.sp_tags_list?.map(t => {
            switch (t.key) {
              // 数据关联
              case 'lineTo':
                initialValues[d.map_name] = initValues[t.value];
                break;
              case 'fk':
                let multiple = d?.sp_tags_list?.find(e => e.key === 'multiple');
                if (multiple) {
                  initialValues[d.map_name] = initValues[t.value].split(',');
                }
                break;
              default:
                break;
            }
          });
        }
      });
    }
  }

  // console.log('initialValues', initialValues, fieldsList);



  const TypeToElement = k => {
    // console.log('type to element', k);
    let required = false;
    if (
      k.xorm_tags.split(' ').includes('notnull') ||
      k.xorm_tags.split(' ').includes('not null')
    ) {
      required = true;
    }
    const valueProp = ['bool'].includes(k.types) ? 'checked' : 'value';
    const t = k.types;
    // 先匹配类型
    if (k?.sp_tags_list?.length) {
      // 先判断是否有外键
      let fk = k?.sp_tags_list?.find(e => e.key === 'fk');
      let multiple = k?.sp_tags_list?.find(e => e.key === 'multiple');
      if (fk) {
        return (
          <Form.Item label={k?.comment_tags || k.map_name}>
            <Row>
              <Col span={8}>
                <Select style={{ width: '100%' }}
                        mode="multiple"
                        onChange={(value) => k.searchCols = value}
                        placeholder="请选择搜索列">
                  {
                    k.routerInfo.map((d, i) => {
                      return (
                        <Option key={`cols_modal_${i}`} value={d.map_name}>{d.comment_tags || d.name}</Option>
                      );
                    })
                  }
                </Select>
              </Col>
              <Col span={16}>
                <Form.Item
                  name={k.map_name}
                  valuePropName={valueProp}
                  rules={[
                    {
                      required: required,
                      message: 'please input data',
                    },
                  ]}
                >
                  <Select
                    style={{ width: '100%' }}
                    showSearch
                    mode={multiple && 'multiple'}
                    showArrow={false}
                    filterOption={false}
                    defaultActiveFirstOption={false}
                    onSearch={value => k.searchCols && searchText(fk.value, value, k.searchCols)}
                    notFoundContent={searchLoading ? <Spin size="small"/> : null}
                    placeholder="请输入筛选条件"
                    optionLabelProp={'id'}
                    allowClear
                  >
                    {
                      searchData?.map((d, i) => {
                        return (
                          <Option key={d.id} value={d.id}>
                            {JSON.stringify(d)}
                          </Option>
                        );
                      })}
                  </Select>
                </Form.Item>

              </Col>
            </Row>
          </Form.Item>

        );
      }
    }
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
        ele = <InputNumber
          style={{ width: '100%' }}
          placeholder={'please input value'}
        />;
        break;
      case 'time':
      case 'time.Time':
        ele = <DatePicker showTime/>;
        break;
      case 'bool':
        ele = <Switch/>;
        break;
      default:
        ele = <Input placeholder={'请输入内容'}/>;
        break;
    }

    return (
      <Form.Item
        name={k.map_name}
        label={k?.comment_tags || k.map_name}
        valuePropName={valueProp}
        rules={[
          {
            required: required,
            message: '请填写数据内容',
          },
        ]}
      >
        {ele}
      </Form.Item>
    );
  };

  const MomentToFormat = values => {
    Object.keys(values).map((k, i) => {
      const v = values[k];
      if (typeof v === 'object' && v._isAMomentObject) {
        values[k] = v.format('YYYY-MM-DD HH:mm:ss');
      }
    });
  };

  const ValuesTypeChange = values => {
    Object.keys(values).map((k, i) => {
      const v = values[k];
      const t = fieldsList.fields.find(d => d.map_name === k);
      if (['bool'].includes(t.types)) {
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
      .then(values => {
        // form.resetFields();
        // 把所有时间转换格式
        MomentToFormat(values);
        // 格式转换
        ValuesTypeChange(values);
        onCreate(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      visible={true}
      title="数据交互页"
      okText="提交"
      cancelText="取消"
      onCancel={onCancel}
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
        {fieldsList.fields.map((k, i) => {
          return (
            <React.Fragment key={i}>
              {TypeToElement(k)}
            </React.Fragment>
          );
        })}
      </Form>
    </Modal>
  );
};

export default CollectionCreateForm;
