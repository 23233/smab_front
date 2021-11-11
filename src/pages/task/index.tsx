import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRequest } from 'ahooks';
import Fetch, { C, v } from '@/utils/fetch';
import {
  Button,
  Dropdown,
  Modal,
  message,
  Popconfirm,
  Space,
  TableColumnsType,
} from 'antd';
import { useModel } from 'umi';
import 'dayjs/plugin/relativeTime';
import { actionItem, task } from '@/define/exp';
import DrawerSelectUserOne from '@/components/drawerSelectUser';
import ModelTable from '@/pages/model/modelTable';
import dayjs from 'dayjs';
import { UserSwitchOutlined } from '@ant-design/icons';
import { openDrawerMarkdown } from '@/components/drawerShowMarkdown';
import openDrawerSchemeForm from '@/components/drawShowSchemeForm';
import Req from 'umi-request';
import { emit } from 'react-gbus';
import CONFIG from '@/utils/config';

const { confirm, warning } = Modal;

// 任务中心
const TaskPage = () => {
  const { userInfo } = useModel('useAuthModel');
  const [show, setShow] = useState<boolean>(false);

  const nowSelect = useRef<task>();
  const modelInstance = useRef<any>();

  const { run: putReq, loading: putLoading } = useRequest(Fetch.task.put, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        message.success('操作成功');
        setShow(false);
        emit(CONFIG.events.tableRefresh, '');
      }
    },
  });
  const { run: deleteReq } = useRequest(Fetch.task.delete, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        message.success('操作成功');
        emit(CONFIG.events.tableRefresh, '');
      }
    },
  });

  const resetUser = (d: task) => {
    nowSelect.current = d;
    setShow(true);
  };

  // 分配给其他用户
  const resetUserSelectSuccess = (id: string) => {
    setShow(false);
    confirm({
      title: '请再次确认分配任务给他人?',
      onOk: () => {
        putReq(nowSelect.current?.id || nowSelect.current?._id || '', {
          to_user: id,
        });
      },
    });
  };

  const viewContentClick = (record: task) => {
    console.log('预览内容', record);
    openDrawerMarkdown({
      content: record?.content!,
      title: `查看${record._id || record.id}数据内容`,
    });
  };

  let columns: TableColumnsType<any> | undefined = useMemo(() => {
    return [
      {
        title: 'id',
        dataIndex: '_id',
        render: (text: string, record: task) => {
          return (
            <div style={{ width: 100 }}>
              <div style={{ fontSize: 12 }}>{text}</div>
              {!!record?.content && (
                <div
                  style={{ color: 'blue', cursor: 'pointer' }}
                  onClick={() => viewContentClick(record)}
                >
                  查看内容
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '任务',
        dataIndex: 'name',
        render: (text: string) => {
          return <div style={{ width: 100 }}>{text}</div>;
        },
      },
      {
        title: '任务组',
        dataIndex: 'group',
        render: (text: string) => {
          return <div style={{ width: 100 }}>{text}</div>;
        },
      },
      {
        title: '描述',
        dataIndex: 'desc',
        render: (text: string, record: any) => {
          return (
            <div style={{ width: 100 }}>
              <div>{text}</div>
              <div>类型:{record?.type}</div>
            </div>
          );
        },
      },
      {
        title: '时间',
        render: (text: string, record: task) => {
          let t = '永不过期';
          // 判断年份超过2020年
          if (dayjs(record?.exp_time).year() > 2000) {
            t = dayjs(record?.exp_time).diff(dayjs(), 'm') + '秒';
          }
          return (
            <div style={{ width: 130, fontSize: 12 }}>
              <div style={{ color: 'red' }}>过期时间:{t}</div>
              <div>创建时间:{dayjs(record?.create_at).fromNow()}</div>
              <div>更新时间:{dayjs(record?.update_at).fromNow()}</div>
            </div>
          );
        },
      },
      {
        title: '创建用户',
        dataIndex: 'create_user',
        render: (text: string) => {
          return <div style={{ width: 100 }}>{text}</div>;
        },
      },
      {
        title: '处理结果',
        dataIndex: 'msg',
        render: (text: string, record: task) => {
          return (
            <div style={{ width: 100 }}>
              {text ? text : record?.success ? '已处理' : '待处理'}
            </div>
          );
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

                {record.action?.map((d, i) => {
                  if (record?.success) {
                    return (
                      <Popconfirm
                        key={i}
                        title={'已处理完成 确认重新操作吗?'}
                        onConfirm={() => activeClick(d, record)}
                      >
                        <Button size={'small'} title={d.name} key={i}>
                          {d.name}
                        </Button>
                      </Popconfirm>
                    );
                  }
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
  }, [userInfo]);

  const activeSend = async (
    formData: any,
    active: actionItem,
    record: task,
  ) => {
    let body = {
      sm_task_id: record._id || record.id,
      sm_user_id: userInfo.id,
    } as any;
    if (active.built) {
      let built;
      try {
        built = JSON.parse(active.built);
      } catch (e) {
        console.error('built json解析失败', e);
        warning({
          title: `${active.name}解析built json失败`,
        });
        return;
      }
      body.built = built;
    }
    if (active.scheme) {
      body.form = formData;
    }
    // 发起请求
    const resp = await Req.post(active.req_uri, {
      data: body,
      getResponse: true,
      errorHandler: (error: any) => {
        return error;
      },
    });
    if (resp?.response?.status === 200) {
      message.success('任务处理成功');
      modelInstance.current?.destroy();
      emit(CONFIG.events.tableRefresh, '');
    }
    console.log('resp', resp);
  };

  const activeClick = (active: actionItem, record: task) => {
    console.log('active点击', active);
    if (active.scheme) {
      let scheme;
      try {
        scheme = JSON.parse(active.scheme);
      } catch (e) {
        console.error('动作解析 scheme失败', e);
        warning({
          title: `${active.name}解析scheme json失败`,
        });
        return;
      }
      modelInstance.current = openDrawerSchemeForm({
        title: `执行 ${record?.id || record._id} 任务为 ${active.name}`,
        scheme: scheme,
        onSuccess: (formData) => {
          console.log('action form 提交', formData);
          activeSend(formData, active, record);
        },
      });
      return;
    }
    activeSend('', active, record);
  };

  const renderContent = useMemo(() => {
    return (
      <ModelTable
        modelName={'sm_task'}
        urlPrefix={v + '/'}
        getModalInfoReq={Fetch.getNormalModelInfo}
        extraQuery={{
          _od: 'update_at',
          to_user: userInfo.id,
        }}
        permission={{
          delete: false,
          put: false,
          post: false,
        }}
        customColumns={columns}
      />
    );
  }, [userInfo, columns]);

  return (
    <React.Fragment>
      {renderContent}

      {userInfo?.super && (
        <DrawerSelectUserOne
          title={'分配任务给他人'}
          show={show}
          onCancel={setShow}
          onSuccess={resetUserSelectSuccess}
        />
      )}
    </React.Fragment>
  );
};

export default TaskPage;
