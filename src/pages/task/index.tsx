import React, { useEffect, useRef, useState } from 'react';
import { useDebounceEffect, useMount, useRequest, useUnmount } from 'ahooks';
import Fetch, { C } from '@/utils/fetch';
import useRealLocation from '@/components/useRealLocation';
import useUrlState from '@ahooksjs/use-url-state';
import {
  Button,
  message,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import { uniqBy } from 'lodash';
import { useModel } from '@@/plugin-model/useModel';
import dayjs from 'dayjs';
import { openDataForm } from '@/components/form/open';
import { field } from '@/components/form/dataForm';
import Req from '@/utils/request';
import {
  CheckOutlined,
  RollbackOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import 'dayjs/plugin/relativeTime';
import { actionItem, tabItem, task } from '@/define/exp';
import DrawerSelectUserOne from '@/components/drawerSelectUser';
import { openDrawerTaskContent } from '@/pages/task/drawerShowTaskContent';

const tabs = [
  { id: 'not', label: '待处理', success: false },
  { id: 'off', label: '已处理', success: true },
];

// 任务中心
const v = () => {
  const { userInfo } = useModel('useAuthModel');
  const [data, setData] = useState<Array<task>>([]);
  const [page, setPage] = useState<number>();
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [tab, setTab] = useState<tabItem>(tabs[0]);
  const [show, setShow] = useState<boolean>(false);
  const success = useRef<boolean>(false);
  const cover = useRef<boolean>(false);
  const nowSelect = useRef<task>();

  // 把参数变化保留到url上
  const location = useRealLocation();
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

  useMount(() => {
    const query = location.query;
    if (query?.page) {
      setPage(Number(query?.page));
    } else {
      setPage(1);
    }
  });

  useUnmount(() => {
    setUriState({
      page: undefined,
    });
  });

  useEffect(() => {
    if (page) {
      runFetch();
    }
  }, [page]);

  const runFetch = () => {
    run({
      page: page,
      page_size: pageSize,
      _od: 'update_at',
      to_user: userInfo.id,
      success: success.current,
    });
  };

  const { run, loading } = useRequest(Fetch.task.get, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        if (resp.data?.data?.length >= resp.data?.page_size) {
          setTotal(total + resp.data?.page_size);
        }
        if (resp.response.status === 200) {
          if (cover.current) {
            setData(resp?.data?.data);
            cover.current = false;
          } else {
            const uniqueList = uniqBy(data.concat(resp.data?.data), '_id');
            setData(uniqueList);
          }
          setPage(resp.data?.page);
          setPageSize(resp.data?.page_size);
        }
      }
    },
  });
  const { run: putReq, loading: putLoading } = useRequest(Fetch.task.put, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        message.success('转移成功');
        setShow(false);
        runFetch();
      }
    },
  });

  const { run: changeReq, loading: changeLoading } = useRequest(
    Fetch.changeTaskSuccess,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          message.success('变更完成');
          runRefresh();
        }
      },
    },
  );

  const resetUser = (d: task) => {
    nowSelect.current = d;
    setShow(true);
  };

  // 分配给其他用户
  const resetUserSelectSuccess = (id: string) => {
    putReq(nowSelect.current?.id || nowSelect.current?._id || '', {
      to_user: id,
    });
  };

  // 显示审核内容
  const viewContentClick = (record: task) => {
    if (record?.package?.length) {
      openDrawerTaskContent(record.package);
    } else {
      message.warning('没有参考内容');
    }
  };

  let columns: TableColumnsType<any> | undefined = [
    {
      title: 'id',
      dataIndex: '_id',
      render: (text) => {
        return <div style={{ width: 100 }}>{text}</div>;
      },
    },
    {
      title: '内容',
      render: (_, record: task) => {
        return (
          <div
            style={{ width: 60, color: 'blue' }}
            onClick={() => viewContentClick(record)}
          >
            查看内容
          </div>
        );
      },
    },
    {
      title: '任务',
      dataIndex: 'name',
      render: (text) => {
        return <div style={{ width: 100 }}>{text}</div>;
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      render: (text) => {
        return <div style={{ width: 100 }}>{text}</div>;
      },
    },
    {
      title: '过期时间',
      dataIndex: 'exp_time',
      render: (text: string) => {
        let t = '永不过期';
        // 判断年份超过2020年
        if (dayjs(text).year() > 2000) {
          t = dayjs(text).diff(dayjs(), 'm') + '秒';
        }
        return <div style={{ width: 100 }}>{t}</div>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_at',
      render: (text) => {
        return <div style={{ width: 100 }}>{dayjs(text).fromNow()}</div>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'update_at',
      render: (text) => {
        return <div style={{ width: 100 }}>{dayjs(text).fromNow()}</div>;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (text) => {
        return <div style={{ width: 40 }}>{text}</div>;
      },
    },
    {
      title: '创建用户',
      dataIndex: 'create_user',
      render: (text) => {
        return <div style={{ width: 100 }}>{text}</div>;
      },
    },
    {
      title: '操作',
      fixed: 'right',
      render: (text: string, record: task) => {
        return (
          <div className="px-2">
            <Space size="small">
              {userInfo?.super && !record.success && (
                <UserSwitchOutlined
                  title={'分配给他人'}
                  onClick={() => resetUser(record)}
                />
              )}
              {record?.allow_change_success ? (
                record.success ? (
                  <RollbackOutlined
                    title={'重新处理'}
                    onClick={() => activeChangeSuccess(record, !record.success)}
                  />
                ) : (
                  <CheckOutlined
                    title={'处理完成'}
                    onClick={() => activeChangeSuccess(record, !record.success)}
                  />
                )
              ) : null}

              {!success.current &&
                record.action?.map((d, i) => {
                  return (
                    <Button
                      size={'small'}
                      title={d.name}
                      key={i}
                      onClick={() => activeClick(d, record)}
                    >
                      {d.name}
                    </Button>
                  );
                })}
            </Space>
          </div>
        );
      },
    },
  ];

  const activeClick = (active: actionItem, record: task) => {
    console.log('active点击', active);
    if (active.form_data?.length) {
      const fields: Array<field> = [];
      const initValues = {} as any;
      active.form_data.map((d) => {
        fields.push({
          label: d.label,
          map_name: d.key,
          types: d.type,
          required: d?.required,
          slice: d?.slice ? 'slice' : undefined,
        } as field);
        if (d?.init_value) {
          initValues[d.key] = d.init_value;
        }
      });

      openDataForm({
        fieldsList: fields,
        initValues: initValues,
        onCreate: (values) => activeSuccess(values, active, record),
      });
      return;
    }
    // 进行提交
    activeSubmit(null, active, record);
  };

  const activeSuccess = (values: any, active: actionItem, record: task) => {
    console.log('active form完成', values, active);
    activeSubmit(values, active, record);
  };

  const activeSubmit = async (
    values: any,
    active: actionItem,
    record: task,
  ) => {
    let data = {} as any;
    if (values && Object.keys(values).length) {
      data = { ...data, ...values };
    }
    if (active?.extra?.length) {
      active.extra.map((d) => {
        data[d.key] = d.init_value;
      });
    }
    // 附加用户id以及任务id
    data['sm_task_id'] = record._id;
    data['sm_user_id'] = userInfo.id;
    console.log('进行提交', data, active);
    // 发起请求
    const resp = await Req.post(active.req_uri, {
      data: data,
    });
    if (resp.response.status === 200) {
      message.success('处理成功');
    }
    console.log('resp', resp);
  };

  const activeChangeSuccess = (record: task, success: boolean) => {
    changeReq(record._id, success);
  };

  // 刷新
  const runRefresh = () => {
    cover.current = true;
    runFetch();
  };

  const pageChange = (page: number) => {
    setPage(page);
  };

  const tabChange = (item: any) => {
    setTab(item);
    success.current = item?.success;
    cover.current = true;
    if (page !== 1) {
      setPage(1);
    } else {
      runFetch();
    }
  };

  return (
    <React.Fragment>
      <div className={'flex mb-2'}>
        {tabs.map((d) => {
          return (
            <div
              className={`p-1 px-2 text-md ${
                tab?.id === d.id ? 'border-b-2 border-blue-400' : ''
              } cursor-pointer mr-2`}
              title={d.label}
              key={d.id}
              onClick={() => tabChange(d)}
            >
              {d.label}
            </div>
          );
        })}
      </div>

      <div className={'my-2'}>
        <Space>
          <Button onClick={runRefresh}>刷新</Button>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey={'_id'}
        loading={loading || changeLoading || putLoading}
        pagination={{
          total: total,
          current: page,
          pageSize: pageSize,
          onChange: pageChange,
        }}
        scroll={{ x: true }}
      />

      {userInfo?.super && (
        <DrawerSelectUserOne
          show={show}
          onCancel={setShow}
          onSuccess={resetUserSelectSuccess}
        />
      )}
    </React.Fragment>
  );
};

export default v;
