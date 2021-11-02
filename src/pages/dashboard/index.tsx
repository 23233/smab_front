import React, { useState, useEffect } from 'react';
import {
  Card,
  message,
  Button,
  Tabs,
  Typography,
  Popover,
  Input,
  Spin,
  Row,
  Col,
  Space,
} from 'antd';
import { useRequest, useResponsive } from 'ahooks';
import { EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useModel, Link } from 'umi';
import SingleChart from './singleChat';
import Fetch from '../../utils/fetch';
import SelectChatType from '@/pages/dashboard/selectChatType';

const { TabPane } = Tabs;
const { Paragraph } = Typography;

const { Search } = Input;

interface defaultField {
  _id: string;
  id: string;
  update_at: string;
  create_at: string;
}

interface screen extends defaultField {
  priority: number;
  name: string;
  is_default: boolean;
  create_user_id: string;
  view_user_id: Array<string>;
}

export interface screenFk extends screen {
  dash_board?: Array<dashboard>;
  view_users?: Array<any>;
}

interface extra {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface dashboard extends defaultField {
  screen_id: string;
  name: string;
  chat_type: string;
  data_uri: string;
  extra: extra;
  config: string;
  refresh_second: number;
  create_user_id: string;
}

export default function () {
  const responsive = useResponsive();
  console.log('responsive', responsive);
  const { userInfo } = useModel('useAuthModel');

  const [selectScreen, setSelectScreen] = useState<screenFk>();
  const [chatList, setChatList] = useState<Array<dashboard>>([]);
  const [screen, setScreen] = useState<Array<screenFk>>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);

  // 获取屏幕
  const { loading: getScreenLoading, run: getScreen } = useRequest(
    Fetch.dashboard_screen.get,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.data?.data?.length >= resp.data?.page_size) {
          setHasMore(true);
        }
        if (resp.response.status === 200) {
          const d = resp.data?.data.find((d: screenFk) => d.is_default);
          setSelectScreen(d || resp.data?.data?.[0]);
          setScreen(resp.data?.data);
        }
      },
    },
  );

  // 新增
  const { run: addReq, loading: addLoading } = useRequest(
    Fetch.dashboard_screen.post,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          runGetScreen();
        }
      },
    },
  );

  // 修改
  const { run: editReq, loading: editLoading } = useRequest(
    Fetch.dashboard_screen.put,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          runGetScreen();
        }
      },
    },
  );

  // 删除
  const { run: deleteReq, loading: deleteLoading } = useRequest(
    Fetch.dashboard_screen.delete,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          runGetScreen();
        }
      },
    },
  );

  // 新增图表
  const { run: addChart, loading: addChartLoading } = useRequest(
    Fetch.dashboard.post,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          setShow(false);
          runGetScreen();
        }
      },
    },
  );

  // 删除图表
  const { run: deleteChart, loading: deleteChartLoading } = useRequest(
    Fetch.dashboard.delete,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          runGetScreen();
        }
      },
    },
  );

  useEffect(() => {
    runGetScreen();
  }, []);

  useEffect(() => {
    if (selectScreen) {
      setChatList(selectScreen?.dash_board || []);
    }
  }, [selectScreen]);

  const runGetScreen = () => {
    getScreen({
      page_size: 20,
      create_user_id: userInfo?.id,
    });
  };

  // 屏幕当前选中变更
  const screenChange = (value: string) => {
    console.log('屏幕变更', value);
    setSelectScreen(screen.find((d) => d._id === value));
  };

  // 刷新数据
  const flushData = () => {
    runGetScreen();
  };

  // 屏幕操作
  const screenEdit = (targetKey: any, action: any) => {
    if (action === 'add') {
      // 发起请求
      addReq({ name: '新屏幕', create_user_id: userInfo.id });
    } else {
      deleteReq(targetKey);
    }
  };

  // 屏幕名称编辑
  const screenNameEdit = (id: string, value: string) => {
    if (!value) {
      message.error('请输入新名称后重试');
      return false;
    }
    editReq(id, { name: value });
  };

  // 图表删除
  const chartDelete = (id: string) => {
    console.log('删除图表', id);
    deleteChart(id);
  };

  // 新增图表
  const addChartBefore = (
    select: any,
    uri: string,
    json: any,
    refresh_second: number,
    name: string,
  ) => {
    const data = {
      screen_id: selectScreen?._id,
      name: name,
      chat_type: select.types,
      data_uri: uri,
      config: JSON.stringify(json),
      refresh_second: refresh_second,
      create_user_id: userInfo.id,
    };
    console.log('新增', data);
    addChart(data);
  };

  return (
    <Card>
      <Spin
        spinning={
          getScreenLoading ||
          editLoading ||
          addLoading ||
          deleteLoading ||
          addChartLoading
        }
      >
        <Tabs
          type="editable-card"
          onChange={screenChange}
          activeKey={selectScreen?._id}
          onEdit={screenEdit}
          tabBarExtraContent={
            screen && selectScreen ? (
              <Space>
                <Button onClick={flushData}>刷新</Button>
                <Button
                  type={'primary'}
                  title={'新增图表'}
                  onClick={() => setShow(true)}
                >
                  新增图表
                </Button>
              </Space>
            ) : null
          }
        >
          {screen && screen?.length
            ? screen.map((item, index) => (
                <TabPane
                  tab={
                    <React.Fragment>
                      <span>{item.name}</span>

                      <React.Fragment>
                        <Popover
                          title={'变更名称'}
                          trigger={'click'}
                          content={
                            <Search
                              placeholder={'请输入新名称'}
                              enterButton={'确定'}
                              maxLength={20}
                              allowClear
                              onSearch={(value) =>
                                screenNameEdit(item._id, value)
                              }
                            />
                          }
                        >
                          <EditOutlined
                            title={'修改名称'}
                            style={{ margin: '0 0 0 10px' }}
                          />
                        </Popover>
                      </React.Fragment>
                    </React.Fragment>
                  }
                  key={item._id}
                  closable={index >= 1}
                />
              ))
            : null}
        </Tabs>
      </Spin>
      <div style={{ minHeight: window.innerHeight - 350 }} id="canvas-wrap">
        {responsive['xl'] ? (
          chatList.map((d, i) => {
            return <SingleChart key={d._id} onDelete={chartDelete} data={d} />;
          })
        ) : (
          <Row>
            {chatList.map((d, i) => {
              return (
                <Col key={d._id} xs={24} sm={12} md={8} xl={6}>
                  <SingleChart
                    onDelete={chartDelete}
                    data={d}
                    freePosition={false}
                  />
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      <SelectChatType
        show={show}
        onCancel={() => setShow(false)}
        onSuccess={addChartBefore}
      />
    </Card>
  );
}
