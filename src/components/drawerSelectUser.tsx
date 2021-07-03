import React, { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import { Button, Checkbox, Divider, Drawer, Spin, Radio } from 'antd';

const CheckboxGroup = Checkbox.Group;

interface p {
  onSuccess?: Function;
  show: boolean;
  onCancel: Function;
}

const DrawerSelectUserOne: React.FC<p> = ({
  show,
  onCancel,
  onSuccess,
  ...props
}) => {
  const [userList, setUserList] = useState<Array<any>>([]);

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

  const select = (id: string) => {
    onSuccess && onSuccess(id);
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
              <Radio.Group
                buttonStyle="solid"
                onChange={(v) => select(v.target.value)}
              >
                {userList.map((d) => {
                  return (
                    <Radio.Button key={d.id} value={d.id}>
                      {d.name}
                    </Radio.Button>
                  );
                })}
              </Radio.Group>
              <Divider />
            </React.Fragment>
          )}
        </Spin>
      </Drawer>
    </React.Fragment>
  );
};
export default DrawerSelectUserOne;
