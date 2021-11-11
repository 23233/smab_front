import React, { useState } from 'react';
import {
  useDebounceEffect,
  useMount,
  useUnmount,
  useUpdateEffect,
} from 'ahooks';
import { Button, Spin, Result } from 'antd';

import useUrlState from '@ahooksjs/use-url-state';
import ModelTableView from '@/pages/model/table';
import useGetModelInfo from '@/pages/model/useGetModelInfo';
import useRealLocation from '@/components/useRealLocation';
import { RequestResponse } from 'umi-request';
import { permission } from '@/define/exp';

interface p {
  modelName: string;
  urlPrefix: string;
  permission?: permission;
  extraOp?: Array<any>; // 额外操作
  getModalInfoReq: (params: any) => Promise<RequestResponse<any>>;
  extraQuery?: {}; // 请求的额外参数
  customColumns?: Array<any>;
}

const ModelTable: React.FC<p> = ({
  modelName,
  getModalInfoReq,
  urlPrefix,
  permission,
  extraOp = [],
  extraQuery = {},
  customColumns,
  ...props
}) => {
  const [page, setPage] = useState<number>();
  const [pageSize, setPageSize] = useState<number>(10);
  const { modelInfo, modelFormat, loading } = useGetModelInfo(
    modelName,
    getModalInfoReq,
  );
  const location = useRealLocation();

  const [uriState, setUriState] = useUrlState(undefined, {
    navigateMode: 'replace',
  });

  useDebounceEffect(
    () => {
      setUriState({
        model: modelName,
        page: page,
        page_size: pageSize,
      });
    },
    [modelName, page, pageSize],
    {
      wait: 800,
    },
  );

  useUnmount(() => {
    setUriState({
      model: undefined,
      page: undefined,
      page_size: undefined,
    });
  });

  useMount(() => {
    const query = location.query;
    if (query?.page) {
      setPage(Number(query?.page));
    } else {
      setPage(1);
    }
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
            fetchUri={urlPrefix + modelName}
            permission={permission}
            extraOp={extraOp}
            page={page}
            pageChange={setPage}
            customColumns={customColumns}
            pageSize={pageSize}
            pageSizeChange={setPageSize}
            extraQuery={extraQuery}
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
