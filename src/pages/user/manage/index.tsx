import React, { useEffect, useState } from 'react';
import { Table, Space, Button } from 'antd';
import { useModel } from 'umi';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import AllPerSelect from '@/components/showAllPer';


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
  {
    title: '管理员',
    dataIndex: 'super_user',
    key: 'super_user',
  },
  {
    title: '操作',
    render: (text: string) => {
      return <Space size='middle'>
        <a>禁止登录</a>
        <a>变更密码</a>
      </Space>;
    },

  },
];


const v = () => {
  const { userInfo, allPer, userPer } = useModel('useAuthModel');
  const [userList, setUserList] = useState<Array<object>>([]);
  const { run, loading } = useRequest(Fetch.getUserList, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        setUserList(resp.data?.data);
      }
    },
  });


  useEffect(() => {
    if (userInfo?.super) {
      run();
    }
  }, []);

  return (
    <div>
      <div>
        <Button>新增用户</Button>
      </div>
      <Table dataSource={userList} columns={columns} />

      <AllPerSelect />

    </div>
  );
};

export default v;
