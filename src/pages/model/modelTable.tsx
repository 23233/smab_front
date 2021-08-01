import React, { useEffect, useRef, useState } from 'react';
import {
  useDebounceEffect,
  useMount,
  useRequest,
  useUnmount,
  useUpdateEffect,
} from 'ahooks';
import Fetch, { C } from '@/utils/fetch';
import RestApiGen from '@/utils/restApiGen';
import moment from 'moment';
import {
  Button,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  TableColumnsType,
  Input,
  Image,
  Spin,
  Result,
} from 'antd';
import {
  CompressOutlined,
  DeleteOutlined,
  DiffOutlined,
  EditOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { openDrawerFields } from '@/components/drawShowField';
import useRealLocation from '@/components/useRealLocation';
import useUrlState from '@ahooksjs/use-url-state';
import { openDrawerEditFields } from '@/components/drawEditField';
import useModelPer from '@/pages/model/useModelPer';
import SimpleTable from '@/components/simpleTable';
import ModelTableView from '@/pages/model/table';
import useGetModelInfo from '@/pages/model/useGetModelInfo';

const { Option } = Select;

interface p {
  modelName: string;
}

const ModelTable: React.FC<p> = ({ modelName, ...props }) => {
  const { modelInfo, modelFormat, loading } = useGetModelInfo(modelName);

  const per = useModelPer(modelName);
  const [uriState, setUriState] = useUrlState(undefined, {
    navigateMode: 'replace',
  });
  useDebounceEffect(
    () => {
      setUriState({
        model: modelName,
      });
    },
    [modelName],
    {
      wait: 800,
    },
  );
  useUnmount(() => {
    setUriState({
      model: undefined,
    });
  });

  useUpdateEffect(() => {
    if (modelName) {
      setUriState({
        page: undefined,
        page_size: undefined,
      });
    }
  }, [modelName]);

  return (
    <React.Fragment>
      <Spin spinning={loading}>
        {!!modelInfo ? (
          <ModelTableView
            modelName={modelName}
            modelInfo={modelInfo}
            modelFormat={modelFormat}
            fetchUri={C + '/' + modelName}
            permission={per}
          />
        ) : (
          <Result
            status="404"
            title="获取模型信息失败"
            subTitle="请稍后刷新重试或联系管理员"
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                刷新重试
              </Button>
            }
          />
        )}
      </Spin>
    </React.Fragment>
  );
};
export default ModelTable;
