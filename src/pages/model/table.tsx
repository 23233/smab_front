import React, { useEffect, useRef, useState } from 'react';
import { useDebounceEffect, useMount, useRequest, useUnmount } from 'ahooks';
import Fetch, { C } from '@/utils/fetch';
import RestApiGen, { getResultFormat } from '@/utils/restApiGen';
import { uniqBy } from 'lodash';
import {
  Button,
  message,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
  Tag,
} from 'antd';
import CommForm, { field } from '@/components/form/dataForm';
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
import { objectToData } from '@/utils/tools';
import useModelPer from '@/pages/model/useModelPer';

interface p {
  modelName: string;
}

interface fieldInfo {
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
  is_geo: boolean;
  is_mab_inline: boolean;
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
  const [page, setPage] = useState<number>();
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [modelInfo, setModelInfo] = useState<modelInfo>();
  const [show, setShow] = useState<boolean>(false); // 新增
  const cover = useRef<boolean>(false);
  const per = useModelPer(modelName);

  // 把参数变化保留到url上
  const location = useRealLocation();
  const [uriState, setUriState] = useUrlState(undefined, {
    navigateMode: 'replace',
  });

  useDebounceEffect(
    () => {
      setUriState({
        model: modelName,
        page: page,
      });
    },
    [modelName, page],
    {
      wait: 800,
    },
  );

  useMount(() => {
    const query = location.query;
    if (query?.page) {
      setPage(Number(query?.page));
    } else {
      setPage(1);
    }
  });

  useUnmount(() => {
    setUriState({
      model: undefined,
      page: undefined,
    });
  });

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
        if (resp.data?.data?.length >= resp.data?.page_size) {
          setTotal(total + resp.data?.page_size);
        }
        if (resp.response.status === 200) {
          if (cover.current) {
            setData(resp?.data?.data);
            cover.current = false;
          } else {
            const uniqueList = uniqBy(data.concat(resp.data?.data), '_id');
            setData(uniqueList);
          }
          setPage(resp.data?.page);
          setPageSize(resp.data?.page_size);
        }
      },
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
          runRefresh();
        }
      },
    },
  );

  // 修改数据
  const { run: updateData, loading: updateLoading } = useRequest(
    new RestApiGen(C + '/' + modelName).put,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          message.success('修改成功');
          runRefresh();
        }
      },
    },
  );

  // 删除数据
  const { run: deleteData, loading: deleteLoading } = useRequest(
    new RestApiGen(C + '/' + modelName).delete,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          setData(data.filter((d) => d._id !== resp?.data?.id));
        }
      },
    },
  );

  useEffect(() => {
    if (modelName) {
      modelInfoReq(modelName);
    }
  }, [modelName]);

  useEffect(() => {
    if (modelInfo) {
      if (page === 1) {
        runFetch();
      } else {
        setPage(1);
      }
      setData([]);
    }
  }, [modelInfo]);

  useEffect(() => {
    if (page) {
      runFetch();
    }
  }, [page]);

  const runFetch = () => {
    getData({
      page: page,
      page_size: pageSize,
    });
  };

  let columns: TableColumnsType<any> | undefined = [];

  const renderArray = (text: any, record: any) => {
    return (
      <div style={{ width: 200, wordBreak: 'break-all' }}>
        {Array.isArray(text)
          ? text?.map((vv: string, i: number) => {
              return (
                <div
                  key={i}
                  style={{
                    border: '1px solid #eee',
                    padding: '2px 5px',
                    fontSize: 12,
                    color: 'black',
                    background: '#f1f1f1',
                    borderRadius: 5,
                    marginBottom: 5,
                  }}
                >
                  {vv}
                </div>
              );
            })
          : text}
      </div>
    );
  };

  if (data.length && modelInfo?.field_list?.length) {
    modelInfo?.field_list.map((d) => {
      if (d?.children?.length) {
        if (!d.is_inline) {
          columns?.push({
            title: d.comment || d.name,
            render: (_, record) => {
              return (
                <div style={{ width: 100 }}>
                  <div
                    onClick={() =>
                      showStruct(record[d.map_name], d.name + '字段信息')
                    }
                  >
                    {d.children.length} 个字段
                  </div>
                </div>
              );
            },
          });
          return;
        }
        d.children.map((b) => {
          return columns?.push({
            title: b.comment || b.name,
            dataIndex: b.map_name,
            render: renderArray,
          });
        });
        return;
      }

      if (d.is_inline) {
        return columns?.push({
          title: d.comment || d.name,
          dataIndex: d.map_name,
          render: (text) => {
            return <div style={{ width: 200 }}>{text}</div>;
          },
        });
      }

      return columns?.push({
        title: d.comment || d.name,
        dataIndex: d.map_name,
        render: renderArray,
      });
    });
  }

  if (!columns.some((b: any) => b?.dataIndex == '_id')) {
    columns.unshift({
      title: 'Id',
      dataIndex: '_id',
    });
  }

  columns.push({
    title: '操作',
    fixed: 'right',
    render: (text: string, record: any) => {
      return (
        <div className="px-2">
          <Space size="middle">
            {per.delete && (
              <Popconfirm
                title={'确认删除这条数据吗?'}
                onConfirm={() => runDelete(record)}
              >
                <DeleteOutlined title={'删除'} />
              </Popconfirm>
            )}

            <CompressOutlined
              title={'展开全部'}
              onClick={() => showStruct(record, '全部字段信息')}
            />
            {per.put && (
              <EditOutlined
                title={'编辑'}
                onClick={() => editRecordBefore(record)}
              />
            )}
          </Space>
        </div>
      );
    },
  });

  // 删除
  const runDelete = (record: any) => {
    deleteData(record._id);
  };

  // 新增
  const addBefore = (values: any) => {
    const data = {} as any;
    for (const [key, value] of Object.entries(values)) {
      // 新增的时候value不存在则不提交
      if (value) {
        const field = modelInfo?.flat_fields.find((d) => d.map_name === key);
        if (field) {
          data[field.params_key] = value;
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

  // 修改完成
  const editSuccess = (diff: any, mid: string, _data: any) => {
    console.log('修改完成', diff, mid);
    let data = {} as any;
    modelInfo?.field_list?.map((d) => {
      if (d.is_pk) return;

      if (d.is_inline && d.is_mab_inline) {
        d.children.map((b) => {
          if (diff.hasOwnProperty(b.map_name)) {
            data[b.map_name] = diff[b.map_name];
          }
        });
        return;
      }
      if (d.is_inline) {
        const _c = {} as any;
        let has = d.children.some((b) => diff.hasOwnProperty(b.map_name));
        // 遍历
        d.children.map((b) => {
          if (diff.hasOwnProperty(b.map_name)) {
            _c[b.map_name] = diff[b.map_name];
          } else {
            if (has) {
              _c[b.map_name] = _data[b.map_name];
            }
          }
        });
        if (has) {
          delete _c['_id'];
          data = { ...data, ...objectToData(_c, d.map_name) };
        }

        return;
      }
      if (d.is_mab_inline) {
        if (diff.hasOwnProperty(d.map_name)) {
          data = {
            ...data,
            ...objectToData(diff?.[d.map_name] || {}, d.map_name),
          };
        }
      } else {
        if (diff.hasOwnProperty(d.map_name)) {
          if (d?.children && d?.children?.length) {
            data = {
              ...data,
              ...objectToData(diff?.[d.map_name] || {}, d.map_name),
            };
            return;
          }
          data[d.map_name] = diff[d.map_name];
        }
      }
    });

    console.log('修改参数', data);

    updateData(mid, data);
  };

  // 修改
  const editRecordBefore = (record: any) => {
    openDrawerEditFields(record, `修改${record['_id']}`, editSuccess);
  };

  const runAddBefore = () => {
    setShow(true);
  };

  // 刷新
  const runRefresh = () => {
    cover.current = true;
    runFetch();
  };

  // 显示
  const showStruct = (content: any, title?: string) => {
    openDrawerFields(content, title);
  };

  const pageChange = (page: number) => {
    setPage(page);
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
        initKey: d.params_key,
      } as field);
    }
  });

  return (
    <React.Fragment>
      <div className={'my-2'}>
        <Space>
          {per.post && <Button onClick={runAddBefore}>新增</Button>}

          <Button onClick={runRefresh}>刷新</Button>
        </Space>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={'_id'}
        loading={
          loading ||
          modelInfoLoading ||
          addLoading ||
          deleteLoading ||
          updateLoading
        }
        pagination={{
          total: total,
          current: page,
          pageSize: pageSize,
          onChange: pageChange,
        }}
        scroll={{ x: true }}
      />

      {show && (
        <CommForm
          fieldsList={addFormFields}
          onCancel={() => setShow(false)}
          onCreate={addBefore}
        />
      )}
    </React.Fragment>
  );
};
export default ModelTableView;
