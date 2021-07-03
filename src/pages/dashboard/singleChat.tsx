import React, { useEffect, useState } from 'react';
import { useMount, useRequest, useSize, useUpdateEffect } from 'ahooks';
import Chart from '@ant-design/charts';
import ChartList from './chatType.json';
import { Skeleton, Modal, Empty } from 'antd';
import {
  DeleteOutlined,
  ConsoleSqlOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import './singleChart.less';
import { Rnd } from 'react-rnd';
import Fetch from '../../utils/fetch';
import { dashboard } from '@/pages/dashboard/index';
import { objectToData } from '@/utils/tools';
import { useModel } from 'umi';

const { confirm } = Modal;

interface p {
  data: dashboard;
  freePosition?: boolean;
  onDelete?: (chartId: string) => void;
}

const SingleChat: React.FC<p> = ({
  data,
  freePosition = true,
  onDelete,
  ...props
}) => {
  const { userInfo } = useModel('useAuthModel');

  const defaultSize = 200;
  const [showData, setShowData] = useState<any>();
  const [previewShow, setPreviewShow] = useState(false);
  const [width, setWidth] = useState(data?.extra?.width || defaultSize);
  const [height, setHeight] = useState(data?.extra?.height || defaultSize);
  const [x, setX] = useState(data?.extra?.x || 0);
  const [y, setY] = useState(data?.extra.y || 0);

  // 获取数据内容
  const { run: getData, loading: getDataLoading } = useRequest(
    Fetch.dashboardGetData,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          setShowData(resp.data);
        }
      },
      [data.refresh_second ? 'pollingInterval' : '']:
        data?.refresh_second * 1000,
      pollingWhenHidden: false,
    },
  );

  // 更新位置
  const { run: updatePositionReq } = useRequest(Fetch.dashboard.put, {
    manual: true,
    debounceInterval: 200,
  });

  useEffect(() => {
    runFetchData();
  }, []);

  const runFetchData = () => {
    getData(data?.data_uri, {
      chart_id: data?._id,
      user_id: userInfo?.id,
      screen_id: data?.screen_id,
      chart_type: data?.chat_type,
    });
  };

  // 删除图例
  const deleteFunc = () => {
    confirm({
      title: '确定删除图表吗?',
      content: '此操作不可逆,请谨慎!',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        onDelete && onDelete(data._id);
      },
    });
  };

  const showPreview = () => {
    setPreviewShow(true);
  };

  const opList = [
    {
      name: '删除',
      icon: <DeleteOutlined />,
      func: () => deleteFunc(),
    },
    {
      name: '刷新',
      icon: <ReloadOutlined />,
      func: () => runFetchData(),
    },
    {
      name: '预览配置',
      icon: <ConsoleSqlOutlined />,
      func: () => showPreview(),
    },
  ];

  useUpdateEffect(() => {
    runUpdatePosition();
  }, [x, y, width, height]);

  const runUpdatePosition = () => {
    const d = {
      x,
      y,
      width,
      height,
    };
    updatePositionReq(data._id, {
      ...objectToData(d, 'extra'),
    });
  };

  // 类型判断
  const renders = () => {
    let c = {
      ...JSON.parse(data.config),
    } as any;
    if (showData) {
      c = { ...c, ...showData };
    }
    // @ts-ignore
    const Tag = Chart?.[data.chat_type];
    if (showData) {
      return (
        <Tag
          {...c}
          loading={getDataLoading}
          errorTemplate={(error: any) => {
            return <Empty description={`渲染出现错误 ${error}`} />;
          }}
        />
      );
    }
    return <Empty description={'未获取到数据,请检查数据获取方式'} />;
  };

  const content = () => {
    return (
      <div className="chart_wrap">
        <h4 title={data.name}>{data.name}</h4>
        <div
          style={{ height: freePosition ? 'calc(100% - 30px)' : defaultSize }}
        >
          {renders()}
        </div>
        <div className="op-wrap">
          {opList.map((d, i) => {
            return (
              <div
                className="icons"
                key={`chart_op_${i}`}
                title={d.name}
                onClick={d.func}
              >
                {d.icon}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      {freePosition ? (
        <Rnd
          size={{ width, height }}
          position={{ x, y }}
          bounds={'#canvas-wrap'}
          onDragStop={(e, d) => {
            setX(d.x);
            setY(d.y);
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            setWidth(Number(ref.style.width));
            setHeight(Number(ref.style.height));
            setX(position.x);
            setY(position.y);
          }}
        >
          {content()}
        </Rnd>
      ) : (
        content()
      )}

      <Modal
        title={'预览配置'}
        visible={previewShow}
        onOk={() => setPreviewShow(false)}
        onCancel={() => setPreviewShow(false)}
        okText={'确定'}
        cancelText={'取消'}
      >
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <code style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(
              {
                ...data,
                config: JSON.parse(data.config),
              },
              null,
              2,
            )}
          </code>
        </div>
      </Modal>
    </React.Fragment>
  );
};
export default SingleChat;
