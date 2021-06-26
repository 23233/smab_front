import React, { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import Fetch, { C } from '@/utils/fetch';
import RestApiGen, { getResultFormat } from '@/utils/restApiGen';
import { uniqBy } from 'lodash';
import { Button, message, Space, Table, TableColumnsType } from 'antd';
import CommForm, { field } from '@/components/form/dataForm';

interface p {
  modelName: string;
}

interface fieldInfo {
  name: string;
  map_name: string;
  full_name: string;
  full_map_name: string;
  kind: string;
  bson: Array<string>;
  types: string;
  index: number;
  is_pk: boolean;
  is_obj_id: boolean;
  is_created: boolean;
  is_updated: boolean;
  is_deleted: boolean;
  is_geo: boolean;
  is_inline: boolean;
  children: Array<fieldInfo>;
  children_kind: boolean;
}

interface modelInfo {
  map_name: string;
  full_path: string;
  alias: string;
  field_list: Array<fieldInfo>;
  flat_fields: Array<fieldInfo>;
}

const ModelTableView: React.FC<p> = ({ modelName, ...props }) => {
  const [data, setData] = useState<Array<any>>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [modelInfo, setModelInfo] = useState<modelInfo>();
  const [show, setShow] = useState<boolean>(false); // 新增

  // 获取模型信息
  const { run: modelInfoReq, loading: modelInfoLoading } = useRequest(
    Fetch.getModelInfo,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          setModelInfo(resp.data);
        }
      },
    },
  );

  // 获取数据内容
  const { run: getData, loading } = useRequest(
    new RestApiGen(C + '/' + modelName).get,
    {
      manual: true,
      onSuccess: (resp) => {
        setHasMore(resp.data?.data?.length >= resp.data?.page_size);
        if (resp.response.status === 200) {
          const uniqueList = uniqBy(data.concat(resp.data?.data), '_id');
          setData(uniqueList);
          setPage(resp.data?.page);
          setPageSize(resp.data?.page_size);
        }
      },
      formatResult: getResultFormat,
    },
  );

  // 新增数据
  const { run: addData, loading: addLoading } = useRequest(
    new RestApiGen(C + '/' + modelName).post,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          message.success('新增成功');
          setShow(false);
          runFetch();
        }
      },
    },
  );

  useEffect(() => {
    if (modelName) {
      setPage(1);
      modelInfoReq(modelName);
      runFetch();
    }
  }, [modelName]);

  const runFetch = () => {
    getData({
      page: page,
      page_size: pageSize,
    });
  };

  let columns: TableColumnsType<any> | undefined = [];
  if (data.length) {
  }

  const addSuccess = (values: any) => {
    const data = {} as any;
    for (const [key, value] of Object.entries(values)) {
      // 新增的时候value不存在则不提交
      if (value) {
        const field = modelInfo?.flat_fields.find((d) => d.map_name === key);
        if (field) {
          data[field.full_map_name || field.map_name] = value;
        } else {
          console.error(`${key}未找到字段信息`);
        }
      }
    }

    if (Object.keys(data).length) {
      addData(data);
    } else {
      message.warning('未获取到可新增的字段信息');
    }
  };

  let addFormFields: Array<field> = [];
  modelInfo?.flat_fields?.map((d) => {
    if (d.is_pk || d.is_created || d.is_updated || d.kind === 'struct') {
    } else {
      addFormFields.push({
        types: d.types,
        label: d.name,
        map_name: d.map_name,
        required: false,
        slice: d.kind,
      } as field);
    }
  });

  return (
    <React.Fragment>
      <div className={'my-2'}>
        <Space>
          <Button onClick={() => setShow(true)}>新增</Button>
          <Button onClick={() => runFetch()}>刷新</Button>
        </Space>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={'_id'}
        loading={loading || modelInfoLoading || addLoading}
        scroll={{ x: true }}
      />

      {show && (
        <CommForm
          fieldsList={addFormFields}
          onCancel={() => setShow(false)}
          onCreate={addSuccess}
        />
      )}
    </React.Fragment>
  );
};
export default ModelTableView;
