import React, { useEffect, useRef, useState } from 'react';
import { Table, Space, Button, Popconfirm, message, Popover, Tag } from 'antd';
import { useModel } from 'umi';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import AddUser from '@/components/addUser';
import ChangePasswordModal from '@/components/changePassword';
import EditUserBaseModal from '@/components/editUserBase';
import EditPermissionsModal from '@/components/editPermissions';
import {
  DeleteOutlined,
  DiffOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import useUserPer from '@/pages/user/useUserPer';

const v = () => {
  const { userInfo } = useModel('useAuthModel');
  const [userList, setUserList] = useState<Array<object>>([]);
  const [show, setShow] = useState<boolean>(false);
  const [pShow, setPShow] = useState(false);
  const [editShow, setEditShow] = useState<boolean>(false);
  const [editPerShow, setEditPerShow] = useState<boolean>(false);
  const nowSelect = useRef<any>();
  const per = useUserPer();

  const { run, loading } = useRequest(Fetch.getUserList, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        setUserList(resp.data?.data);
      }
    },
  });

  const { run: deleteReq, loading: deleteLoading } = useRequest(
    Fetch.removeUser,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          message.success('删除成功');
          run();
        }
      },
    },
  );

  useEffect(() => {
    if (per.get) {
      run();
    }
  }, []);

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: any) => {
        return (
          <div style={{ width: 100 }}>
            {text}
            {!!record?.create_id && (
              <Popover
                content={record?.create_id}
                title={'账户创建者Id'}
                trigger={['click']}
              >
                <div className={'text-gray-400'}>创建者ID</div>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        return (
          <div style={{ width: 100 }}>
            {text}
            {!!record?.super_user && (
              <div>
                <Tag>管理员</Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      render: (text: string, record: any) => {
        return (
          <div style={{ width: 100 }}>
            <div>{text}</div>
            <div>{record?.phone}</div>
          </div>
        );
      },
    },
    {
      title: '子应用',
      render: (record: any) => {
        return (
          <div style={{ width: 200 }}>
            {!!record?.qian_kun?.length &&
              record?.qian_kun?.map((b: any, i: number) => {
                return (
                  <Space key={i}>
                    <Popover
                      content={
                        <div>
                          <div>
                            <span className={'text-gray-400'}>应用英文名:</span>
                            {b?.name}
                          </div>
                          <div>
                            <span className={'text-gray-400'}>应用中文名:</span>
                            {b?.label}
                          </div>
                          <div>
                            <span className={'text-gray-400'}>应用路径:</span>
                            {b?.path}
                          </div>
                          <div>
                            <span className={'text-gray-400'}>应用地址:</span>
                            {b?.entry}
                          </div>
                        </div>
                      }
                      title={'应用信息'}
                      trigger={['click']}
                    >
                      <Tag>{b?.label}</Tag>
                    </Popover>
                  </Space>
                );
              })}
          </div>
        );
      },
    },
  ] as any;

  columns.push({
    title: '操作',
    fixed: 'right',
    render: (text: string, record: any) => {
      return (
        <Space size="middle">
          {per.put && (
            <React.Fragment>
              <UnlockOutlined
                title={'变更密码'}
                onClick={() => passwordShow(record)}
              />
              <EditOutlined
                onClick={() => changeInfoShow(record)}
                title={'变更信息'}
              />
              <DiffOutlined
                onClick={() => changePerShow(record)}
                title={'重设权限'}
              />
            </React.Fragment>
          )}
          {per.delete && (
            <Popconfirm
              title={'确认删除用户吗?'}
              onConfirm={() => runDeleteUser(record)}
            >
              <DeleteOutlined title={'删除用户'} />
            </Popconfirm>
          )}
        </Space>
      );
    },
  });

  const addUserSuccess = () => {
    setShow(false);
    run();
  };

  const passwordShow = (record: any) => {
    nowSelect.current = record;
    setPShow(true);
  };

  // 变更信息
  const changeInfoShow = (record: any) => {
    nowSelect.current = record;
    setEditShow(true);
  };

  const changeInfoSuccess = () => {
    setEditShow(false);
    run();
  };

  const changePerShow = (record: any) => {
    nowSelect.current = record;
    setEditPerShow(true);
  };

  const changePerSuccess = () => {
    setEditPerShow(false);
    run();
  };

  const runDeleteUser = (record: any) => {
    deleteReq(String(record.id));
  };

  return (
    <div>
      <div className={'mb-2'}>
        <Space>
          {per.post && <Button onClick={() => setShow(true)}>新增用户</Button>}

          <Button onClick={() => run()}>刷新</Button>
        </Space>
      </div>
      <Table
        dataSource={userList}
        rowKey={'id'}
        columns={columns}
        loading={loading}
        scroll={{ x: true }}
      />

      <AddUser show={show} setShow={setShow} onSuccess={addUserSuccess} />

      <ChangePasswordModal
        userId={nowSelect.current?.id}
        setShow={setPShow}
        show={pShow}
      />

      {/*修改信息*/}
      <EditUserBaseModal
        show={editShow}
        setShow={setEditShow}
        userId={nowSelect.current?.id}
        initValues={{
          desc: nowSelect.current?.desc,
          phone: nowSelect.current?.phone,
          super_user: nowSelect.current?.super_user,
          qian_kun: nowSelect.current?.qian_kun,
        }}
        onSuccess={changeInfoSuccess}
      />

      {/*修改权限*/}
      <EditPermissionsModal
        userId={nowSelect.current?.id}
        show={editPerShow}
        setShow={setEditPerShow}
        onSuccess={changePerSuccess}
      />
    </div>
  );
};

export default v;
