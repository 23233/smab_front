import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  message,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Space,
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import Fetch from '@/utils/fetch';
import { groupBy, uniqBy } from 'lodash';
import { useModel } from 'umi';
import { action, task } from '@/define/exp';
import useRealLocation from '@/components/useRealLocation';
import useUrlState from '@ahooksjs/use-url-state';
import { useDebounceEffect, useMount, useUnmount, useRequest } from 'ahooks';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import openDrawerSchemeForm from '@/components/drawShowSchemeForm';
import copy from 'copy-to-clipboard';
import useGetAction from '@/pages/model/useGetAction';
import DrawerSelectUserOne from '@/components/drawerSelectUser';
import dayjs from 'dayjs';

const { Option, OptGroup } = Select;

const { confirm } = Modal;

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
    user_id: userInfo.id,
  });

  const [selectModel, setSelectModel] = useState<string>();
  const [show, setShow] = useState<boolean>(false);

  const modelInstance = useRef<any>();
  const selectRecord = useRef<any>(); // 当前选择行

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
              '<a href="https://x-render.gitee.io/playground" target="_blank">在线配置</a>',
          },
        },
        displayType: 'row',
      },
      onSuccess: (formData) => {
        formData.scheme = JSON.stringify(JSON.parse(formData.scheme));
        formData.scope = selectModel;
        formData.user_id = userInfo.id;
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
            group: b?.group || '',
          });
        });
      }
    });
    return r;
  }, [userPer]);

  const groupModel = useMemo(() => {
    return groupBy(allModel, 'group');
  }, [allModel]);

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
          return (
            <div style={{ width: 100, fontSize: 12 }}>
              <Popover
                title={'时间周期'}
                content={
                  <React.Fragment>
                    <div style={{ fontSize: 12 }}>
                      更新于:{dayjs(record?.update_at).fromNow()}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      创建于:{dayjs(record?.create_at).fromNow()}
                    </div>
                  </React.Fragment>
                }
                placement={'bottomLeft'}
                trigger={['click']}
              >
                {text}
              </Popover>
            </div>
          );
        },
      },
      {
        title: '作用范围',
        dataIndex: 'scope',
        render: (text) => {
          const item = allModel.find((b) => b.value === text);
          return (
            <div style={{ width: 100, fontSize: 12 }}>
              {!!item && <div style={{ fontSize: 14 }}>{item.key}</div>}
              {text}
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
                <CopyOutlined
                  title={'复制给他人'}
                  onClick={() => onCopyToOther(record)}
                />
              </Space>
            </div>
          );
        },
      },
    ];
  }, [allModel]);

  const onCopyToOther = (record: any) => {
    selectRecord.current = record;
    setShow(true);
  };

  const copyToOtherUser = (id: string) => {
    setShow(false);
    if (!selectRecord.current) {
      message.warning('未选择行');
      setShow(false);
      return;
    }
    confirm({
      title: '确认复制任务给他人吗?',
      onOk: () => {
        const f = { ...selectRecord.current } as any;
        f.user_id = id;
        delete f?.['_id'];
        delete f?.['id'];
        delete f?.['update_at'];
        delete f?.['create_at'];
        console.log('复制任务', f);
        addReq(f);
      },
    });
  };

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
              {Object.keys(groupModel)?.map((d: any) => {
                const items = groupModel[d];
                return (
                  <OptGroup key={d}>
                    {items?.map((b, i) => {
                      return (
                        <Option
                          key={`${b.key}_${i}`}
                          value={b.value}
                          title={b.key}
                        >
                          {b.key}
                        </Option>
                      );
                    })}
                  </OptGroup>
                );
              })}
            </Select>
            <Button onClick={runAdd}>新增</Button>
          </Space>
          <Button
            type={'link'}
            href={'https://x-render.gitee.io/playground'}
            target={'_blank'}
          >
            在线设计表单
          </Button>
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

      <DrawerSelectUserOne
        title={'复制动作给其他人'}
        show={show}
        onCancel={setShow}
        onSuccess={copyToOtherUser}
      />
    </React.Fragment>
  );
};
export default CustomActionPage;
