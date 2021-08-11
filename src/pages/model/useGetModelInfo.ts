import { useRequest } from 'ahooks';
import Fetch from '@/utils/fetch';
import { useEffect, useState } from 'react';

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
  flat_fields: Array<fieldInfo>;
}

const useGetModelInfo = (modelName: string, getReq: any) => {
  const [modelInfo, setModelInfo] = useState<modelInfo>();
  const [modelFormat, setModelFormat] = useState<any>({});

  // 获取模型信息
  const { run, loading } = useRequest(getReq, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        setModelInfo(resp.data?.info);
        setModelFormat(resp.data?.empty);
      }
    },
  });

  useEffect(() => {
    if (modelName) {
      run(modelName);
    }
  }, [modelName]);

  return {
    modelInfo,
    modelFormat,
    loading,
  };
};

export default useGetModelInfo;
