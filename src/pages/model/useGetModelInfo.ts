import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { modelInfo } from '@/define/exp';

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
