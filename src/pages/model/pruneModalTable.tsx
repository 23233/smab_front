import React, { useState } from 'react';
import { Button, Spin, Result } from 'antd';
import ModelTableView from '@/pages/model/table';
import useGetModelInfo from '@/pages/model/useGetModelInfo';
import Fetch from '@/utils/fetch';

interface p {
  modelName: string;
  urlPrefix: string;
  permission?: permission;
  extraOp?: Array<any>; // 额外操作
  beforeOp?: Array<any>; // 前置操作
}

const PruneModalTable: React.FC<p> = ({
  modelName,
  urlPrefix,
  permission,
  extraOp = [],
  beforeOp = [],
  ...props
}) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { modelInfo, modelFormat, loading } = useGetModelInfo(
    modelName,
    Fetch.getModelInfo,
  );

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
            beforeOp={beforeOp}
            extraOp={extraOp}
            page={page}
            pageChange={setPage}
            pageSize={pageSize}
            pageSizeChange={setPageSize}
          />
        ) : (
          <Result
            status="404"
            title="获取模型信息失败"
            subTitle="请稍后刷新重试或联系管理员"
          />
        )}
      </Spin>
    </React.Fragment>
  );
};
export default PruneModalTable;
