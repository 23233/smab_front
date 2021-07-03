import React, { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import { Button, Checkbox, Divider, Drawer, Spin } from 'antd';

const CheckboxGroup = Checkbox.Group;

interface p {
  id: string;
  initCheck?: Array<string>;
  onSuccess?: Function;
  show: boolean;
  onCancel: Function;
}

const DrawerSelectUser: React.FC<p> = ({
  id,
  initCheck = [],
  show,
  onCancel,
  onSuccess,
  ...props
}) => {
  const [userList, setUserList] = useState<Array<any>>([]);
  const [checkedList, setCheckedList] =
    React.useState<Array<string>>(initCheck);
  const [indeterminate, setIndeterminate] = React.useState<boolean>(true);
  const [checkAll, setCheckAll] = React.useState<boolean>(false);

  // 获取所有用户
  const { run: getUserList, loading: getUserLoading } = useRequest(
    Fetch.getUserList,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          setUserList(resp.data?.data);
        }
      },
    },
  );

  useEffect(() => {
    getUserList();
  }, []);

  useEffect(() => {}, [id, initCheck]);

  const onChange = (list: Array<any>) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < userList.length);
    setCheckAll(list.length === userList.length);
  };

  const onCheckAllChange = (e: any) => {
    setCheckedList(e.target.checked ? userList.map((d) => d.id) : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const success = () => {
    onSuccess && onSuccess(id, checkedList);
  };

  return (
    <React.Fragment>
      <Drawer
        visible={show}
        title={'分享给用户'}
        width={'70%'}
        onClose={() => onCancel(false)}
      >
        <Spin spinning={getUserLoading}>
          {!!userList?.length && (
            <React.Fragment>
              <Checkbox
                indeterminate={indeterminate}
                onChange={onCheckAllChange}
                checked={checkAll}
              >
                选择全部
              </Checkbox>
              <Divider />
              <CheckboxGroup
                options={userList.map((d) => {
                  return {
                    label: d.name,
                    value: d.id,
                  };
                })}
                value={checkedList}
                onChange={onChange}
              />
            </React.Fragment>
          )}
        </Spin>
        <div className={'mt-10 text-center'}>
          <Button title={'完成'} type={'primary'} onClick={success}>
            完成
          </Button>
        </div>
      </Drawer>
    </React.Fragment>
  );
};
export default DrawerSelectUser;
