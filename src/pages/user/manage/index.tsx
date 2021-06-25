import React, { useEffect, useRef, useState } from 'react';
import { Table, Space, Button, Popconfirm, message } from 'antd';
import { useModel } from 'umi';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import AddUser from '@/components/addUser';
import ChangePasswordModal from '@/components/changePassword';
import EditUserBaseModal from '@/components/editUserBase';
import EditPermissionsModal from '@/components/editPermissions';

const v = () => {
  const { userInfo, allPer, userPer } = useModel('useAuthModel');
  const [userList, setUserList] = useState<Array<object>>([]);
  const [show, setShow] = useState<boolean>(false);
  const [pShow, setPShow] = useState(false);
  const [editShow, setEditShow] = useState<boolean>(false);
  const [editPerShow, setEditPerShow] = useState<boolean>(false);
  const nowSelect = useRef<any>();

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
    if (userInfo?.super) {
      run();
    }
  }, []);

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '简介',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '创建者',
      dataIndex: 'create_id',
      key: 'create_id',
    },
  ] as any;

  if (userInfo?.super) {
    columns.push({
      title: '管理员',
      dataIndex: 'super_user',
      key: 'super_user',
      render: (text: boolean, record: any) => {
        return text ? '是' : '否';
      },
    });
  }

  columns.push({
    title: '操作',
    render: (text: string, record: any) => {
      return (
        <Space size="middle">
          <a onClick={() => passwordShow(record)}>变更密码</a>
          <a onClick={() => changeInfoShow(record)}>变更信息</a>
          <a onClick={() => changePerShow(record)}>变更权限</a>
          <Popconfirm
            title={'确认删除用户吗?'}
            onConfirm={() => runDeleteUser(record)}
          >
            <a>删除用户</a>
          </Popconfirm>
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
      <div>
        <Space>
          <Button onClick={() => setShow(true)}>新增用户</Button>
          <Button onClick={() => run()}>刷新</Button>
        </Space>
      </div>
      <Table
        dataSource={userList}
        rowKey={'id'}
        columns={columns}
        loading={loading}
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
