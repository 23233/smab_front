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

const { Option } = Select;

interface p {
  modelName: string;
}

export interface fieldInfo {
  name: string;
  map_name: string;
  full_name: string;
  full_map_name: string;
  params_key: string;
  comment: string;
  level: string;
  kind: string;
  bson: Array<string>;
  types: string;
  index: number;
  is_pk: boolean;
  is_obj_id: boolean;
  is_created: boolean;
  is_updated: boolean;
  is_deleted: boolean;
  is_default_wrap: boolean;
  is_time: boolean;
  is_geo: boolean;
  is_mab_inline: boolean;
  is_inline: boolean;
  children: Array<fieldInfo>;
  children_kind: string;
  custom_tag: string;
}

interface modelInfo {
  map_name: string;
  full_path: string;
  alias: string;
  field_list: Array<fieldInfo>;
}

const ModelTable: React.FC<p> = ({ modelName, ...props }) => {
  const [modelInfo, setModelInfo] = useState<modelInfo>();
  const [modelFormat, setModelFormat] = useState<any>({});
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

  // 获取模型信息
  const { run: modelInfoReq, loading: modelInfoLoading } = useRequest(
    Fetch.getModelInfo,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          setModelInfo(resp.data?.info);
          setModelFormat(resp.data?.empty);
        }
      },
    },
  );
  useUpdateEffect(() => {
    if (modelName) {
      setUriState({
        page: undefined,
        page_size: undefined,
      });
    }
  }, [modelName]);

  useEffect(() => {
    if (modelName) {
      modelInfoReq(modelName);
    }
  }, [modelName]);

  return (
    <React.Fragment>
      <Spin spinning={modelInfoLoading}>
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
