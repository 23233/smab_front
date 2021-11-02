import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  message,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import Fetch from '@/utils/fetch';
import { uniqBy } from 'lodash';
import { useModel } from 'umi';
import { action, task } from '@/define/exp';
import useRealLocation from '@/components/useRealLocation';
import useUrlState from '@ahooksjs/use-url-state';
import { useDebounceEffect, useMount, useUnmount, useRequest } from 'ahooks';
import { DeleteOutlined } from '@ant-design/icons';
import openDrawerSchemeForm from '@/components/drawShowSchemeForm';
import copy from 'copy-to-clipboard';
import useGetAction from '@/pages/model/useGetAction';

const { Option } = Select;

interface p {}

const CustomActionPage: React.FC<p> = ({ ...props }) => {
  const { userInfo, userPer } = useModel('useAuthModel');

  // 把参数变化保留到url上
  const location = useRealLocation();

  const {
    page,
    pageSize,
    loading,
    total,
    data,
    runRefresh,
    pageChange,
    runFetch,
  } = useGetAction(Number(location.query?.page) || 1, '', {
    create_user_id: userInfo.id,
  });

  const [selectModel, setSelectModel] = useState<string>();

  const modelInstance = useRef<any>();

  const { run: deleteReq, loading: deleteLoading } = useRequest(
    Fetch.action.delete,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          runFetch();
        }
      },
    },
  );

  const { run: addReq, loading: addLoading } = useRequest(Fetch.action.post, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        modelInstance?.current?.destroy();
        runFetch();
      }
    },
  });

  const [uriState, setUriState] = useUrlState(undefined, {
    navigateMode: 'replace',
  });

  useDebounceEffect(
    () => {
      setUriState({
        page: page,
      });
    },
    [page],
    {
      wait: 800,
    },
  );

  const runAdd = () => {
    if (!selectModel) {
      message.warning('请选择一个模型后重试');
      return;
    }
    modelInstance.current = openDrawerSchemeForm({
      title: '新增动作',
      scheme: {
        type: 'object',
        properties: {
          name: {
            title: '操作名称',
            type: 'string',
            required: true,
            placeholder: '请输入操作名称',
            max: 20,
          },
          post_url: {
            title: '请求地址',
            type: 'string',
            format: 'url',
            required: true,
            placeholder: '请输入请求地址',
          },
          scheme: {
            title: '表单配置',
            type: 'string',
            widget: 'textarea',
            required: true,
            props: {
              autoSize: { minRows: 15, maxRows: 100 },
            },
            description: '一定为json格式且符合调用规范',
            placeholder: '请输入表单配置',
            extra:
              '<a href="https://x-render.gitee.io/tools/generator/playground" target="_blank">在线配置</a>',
          },
        },
        displayType: 'row',
      },
      onSuccess: (formData) => {
        formData.scheme = JSON.stringify(JSON.parse(formData.scheme));
        formData.scope = selectModel;
        formData.create_user_id = userInfo.id;
        console.log('新增内容', formData);
        addReq(formData);
      },
    });
  };

  let allModel = useMemo(() => {
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

  const previewForm = (scheme: string) => {
    openDrawerSchemeForm({
      title: '预览动作',
      scheme: JSON.parse(scheme),
      onSuccess: (formData) => {
        console.log('动作完成', formData);
      },
    });
  };

  let columns: TableColumnsType<any> | undefined = useMemo(() => {
    return [
      {
        title: 'id',
        dataIndex: '_id',
        render: (text, record) => {
          return <div style={{ width: 100, fontSize: 12 }}>{text}</div>;
        },
      },
      {
        title: '作用范围',
        dataIndex: 'scope',
        render: (text) => {
          const item = allModel.find((b) => b.value === text);
          return (
            <div style={{ width: 100 }}>
              {text}
              {!!item && <div>{item.key}</div>}
            </div>
          );
        },
      },
      {
        title: '名称',
        dataIndex: 'name',
        render: (text, record) => {
          return (
            <div style={{ width: 100 }}>
              <div>{text}</div>
            </div>
          );
        },
      },
      {
        title: '表单内容',
        dataIndex: 'scheme',
        render: (text, record) => {
          return (
            <div style={{ width: 100, fontSize: 12 }}>
              <Button onClick={() => previewForm(text)} size={'small'}>
                预览
              </Button>
              <Button
                size={'small'}
                type={'link'}
                onClick={() => copy(text) && message.success('复制成功')}
              >
                复制
              </Button>
            </div>
          );
        },
      },
      {
        title: '请求地址',
        dataIndex: 'post_url',
        render: (text, record) => {
          return (
            <div style={{ width: 100 }}>
              <div>{text}</div>
            </div>
          );
        },
      },
      {
        title: '操作',
        fixed: 'right',
        render: (text, record) => {
          return (
            <div className="px-2">
              <Space size="middle">
                <Popconfirm
                  title={'确认删除这条数据吗?'}
                  onConfirm={() => deleteReq(record._id)}
                >
                  <DeleteOutlined title={'删除'} />
                </Popconfirm>
              </Space>
            </div>
          );
        },
      },
    ];
  }, [allModel]);

  return (
    <React.Fragment>
      <div className={'my-2'}>
        <Space>
          <Button onClick={runRefresh}>刷新</Button>
          <Space>
            <Select
              onSelect={(v) => setSelectModel(v as string)}
              style={{ width: 200 }}
              allowClear
              placeholder={'请选择模型'}
            >
              {allModel.map((d, i) => {
                return (
                  <Option key={i} value={d.value} title={d.key}>
                    {d.key}
                  </Option>
                );
              })}
            </Select>
            <Button onClick={runAdd}>新增</Button>
          </Space>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey={'_id'}
        loading={loading || deleteLoading || addLoading}
        pagination={{
          total: total,
          current: page,
          pageSize: pageSize,
          onChange: pageChange,
        }}
        scroll={{ x: true }}
      />
    </React.Fragment>
  );
};
export default CustomActionPage;
