import React, { useMemo, useState } from 'react';
import CommForm, { field, formItemLayout } from '@/components/form/commForm';
import { useModel } from '@@/plugin-model/useModel';
import { Button, Divider, Form, Input, message, Select } from 'antd';
import AllPerSelect from '@/components/showAllPer';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import useGetModelInfo from '@/pages/model/useGetModelInfo';

interface p {
  show: boolean;
  setShow: Function;
  onSuccess?: Function;
  initValues?: any;
  recordId: string;
}
const { Option } = Select;

const EditUserBaseModal: React.FC<p> = ({
  show,
  setShow,
  onSuccess,
  recordId,
  initValues,
  ...props
}) => {
  const { userPer, userInfo } = useModel('useAuthModel');
  const [selectModel, setSelectModel] = useState<string>('');
  const { modelInfo, loading: getModelInfoLoading } = useGetModelInfo(
    selectModel,
    Fetch.getModelInfo,
  );

  const modelSelect = useMemo(() => {
    let r = [] as Array<any>;
    userPer.map((d: any) => {
      if (d.key === 'model_i') {
        d?.children?.map((b: any) => {
          r.push({
            key: b?.alias,
            value: b?.title,
          });
        });
      }
    });
    return r;
  }, [userPer]);

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
      id: String(recordId),
      desc: values.desc,
      phone: values.phone,
      super_user: values.super_user,
      qian_kun: values?.qiankun,
      filter_data: values?.filter_data,
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
        >
          <Form.List name="qiankun" initialValue={initValues?.qian_kun}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key}>
                    <Divider>子应用</Divider>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用英文名"
                      name={[name, 'name']}
                      fieldKey={[fieldKey, 'name']}
                      rules={[{ required: true, message: '请输入英文名' }]}
                    >
                      <Input maxLength={20} placeholder={'请输入英文名'} />
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用中文名"
                      name={[name, 'label']}
                      fieldKey={[fieldKey, 'label']}
                      rules={[{ required: true, message: '请输入中文名' }]}
                    >
                      <Input maxLength={200} placeholder={'请输入中文名'} />
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用访问地址"
                      name={[name, 'entry']}
                      fieldKey={[fieldKey, 'entry']}
                      rules={[{ required: true, message: '请输入访问地址' }]}
                    >
                      <Input
                        maxLength={200}
                        placeholder={'请输入入口访问地址'}
                      />
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="子应用路径"
                      name={[name, 'path']}
                      fieldKey={[fieldKey, 'path']}
                      rules={[{ required: true, message: '请输入子应用路径' }]}
                    >
                      <Input
                        maxLength={200}
                        placeholder={'/开头的url路径 匹配则显示'}
                      />
                    </Form.Item>

                    <Form.Item {...formItemLayout} label={'操作'}>
                      <Button
                        icon={<MinusCircleOutlined />}
                        type="dashed"
                        block
                        onClick={() => remove(name)}
                      >
                        删除子应用配置
                      </Button>
                    </Form.Item>
                  </div>
                ))}
                {fields.length < 1 && (
                  <Form.Item label={'子应用'} {...formItemLayout}>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      新增子应用
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>

          <Form.List name="filter_data" initialValue={initValues?.filter_data}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key}>
                    <Divider>数据过滤</Divider>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="模型"
                      name={[name, 'model_name']}
                      fieldKey={[fieldKey, 'model_name']}
                      rules={[{ required: true, message: '请选择模型' }]}
                    >
                      <Select
                        onSelect={(v) => setSelectModel(v as string)}
                        placeholder={'请选择模型'}
                      >
                        {modelSelect.map((d, i) => {
                          return (
                            <Option key={i} value={d.value} title={d.key}>
                              {d.key}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="字段"
                      name={[name, 'key']}
                      fieldKey={[fieldKey, 'key']}
                      rules={[{ required: true, message: '请输入字段名' }]}
                    >
                      <Select mode={'tags'} placeholder={'请输入字段名'}>
                        {modelInfo &&
                          modelInfo?.flat_fields?.map((d, i) => {
                            return (
                              <Option
                                key={i}
                                value={d.params_key}
                                title={d.params_key}
                              >
                                {d.params_key}
                              </Option>
                            );
                          })}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      {...restField}
                      label="内容"
                      name={[name, 'value']}
                      fieldKey={[fieldKey, 'value']}
                      rules={[{ required: true, message: '请输入内容' }]}
                    >
                      <Input maxLength={200} placeholder={'请输入内容'} />
                    </Form.Item>

                    <Form.Item {...formItemLayout} label={'操作'}>
                      <Button
                        icon={<MinusCircleOutlined />}
                        type="dashed"
                        block
                        onClick={() => remove(name)}
                      >
                        删除数据过滤管道
                      </Button>
                    </Form.Item>
                  </div>
                ))}
                <Form.Item label={'数据过滤管道'} {...formItemLayout}>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    新增数据过滤
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </CommForm>
      )}
    </React.Fragment>
  );
};
export default EditUserBaseModal;
