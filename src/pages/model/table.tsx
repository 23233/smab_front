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
  Popover,
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
import { customTagParse } from '@/utils/tools';
import SimpleTable from '@/components/simpleTable';

const { Option } = Select;

interface p {
  modelName: string;
  modelInfo: modelInfo;
  modelFormat: object;
  fetchUri: string;
  permission?: {
    delete?: boolean;
    put?: boolean;
    post?: boolean;
  };
  extraOp?: Array<any>; // 额外操作
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

const ModelTableView: React.FC<p> = ({
  modelName,
  modelInfo = {},
  modelFormat = {},
  fetchUri,
  permission,
  extraOp = [],
  ...props
}) => {
  const [data, setData] = useState<Array<any>>([]);
  const [page, setPage] = useState<number>();
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(10);
  const [filter, setFilter] = useState<Array<any>>([]);
  const [docTotal, setDocTotal] = useState<number>();
  const [search, setSearch] = useState<string>();
  const [sortMode, setSortMode] = useState<'_o' | '_od'>('_o');
  const [sortField, setSortField] = useState<string>();
  const cover = useRef<boolean>(false);
  const modelInstance = useRef<any>();

  // 把参数变化保留到url上
  const location = useRealLocation();
  const [uriState, setUriState] = useUrlState(undefined, {
    navigateMode: 'replace',
  });

  useDebounceEffect(
    () => {
      setUriState({
        page: page,
        page_size: pageSize,
      });
    },
    [page, pageSize],
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
      page: undefined,
      page_size: undefined,
    });
  });

  // 获取数据内容
  const { run: getData, loading } = useRequest(new RestApiGen(fetchUri).get, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        setData(resp?.data?.data);
        setPage(resp.data?.page);
        setPageSize(resp.data?.page_size);
        setTotal(resp?.data?.count);
        setDocTotal(resp?.data?.doc_count);
        setFilter(resp?.data?.filter);
      }
    },
  });

  // 新增数据
  const { run: addData, loading: addLoading } = useRequest(
    new RestApiGen(fetchUri).post,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          message.success('新增成功');
          modelInstance?.current?.destroy();
          runRefresh();
        }
      },
    },
  );

  // 修改数据
  const { run: updateData, loading: updateLoading } = useRequest(
    new RestApiGen(fetchUri).put,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          message.success('修改成功');
          modelInstance.current?.destroy();
          runRefresh();
        }
      },
    },
  );

  // 删除数据
  const { run: deleteData, loading: deleteLoading } = useRequest(
    new RestApiGen(fetchUri).delete,
    {
      manual: true,
      onSuccess: (resp) => {
        if (resp.response.status === 200) {
          setData(data.filter((d) => d._id !== resp?.data?.id));
        }
      },
    },
  );

  useUpdateEffect(() => {
    if (modelInfo) {
      if (page === 1) {
        runFetch();
      } else {
        setPage(1);
      }
      setData([]);
    }
  }, [modelInfo]);

  useUpdateEffect(() => {
    if (page) {
      runFetch();
    }
  }, [page, pageSize, sortField, sortMode]);

  const runFetch = (search?: string) => {
    if (loading) return;
    const p = {
      page: page,
      page_size: pageSize,
    } as any;
    if (sortField) {
      p[sortMode] = sortField;
    }
    if (search !== undefined) {
      p['_s'] = '__' + search + '__';
    }
    getData(p);
  };

  const extraColumns = [
    {
      title: '操作',
      fixed: 'right',
      render: (text: string, record: any) => {
        return (
          <div className="px-2">
            <Space size="middle">
              {permission?.delete && (
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
              {permission?.put && (
                <EditOutlined
                  title={'编辑'}
                  onClick={() => editRecordBefore(record)}
                />
              )}
            </Space>
          </div>
        );
      },
    },
    ...extraOp,
  ];

  // 删除
  const runDelete = (record: any) => {
    deleteData(record._id);
  };

  // 修改完成
  const editSuccess = (diff: any, mid: string, _data: any) => {
    console.log('修改完成', diff, mid);
    if (diff && Object.keys(diff).length) {
      updateData(mid, diff);
    }
  };

  // 修改
  const editRecordBefore = (record: any) => {
    console.log('edit record', record);
    const tmp = modelParseToJson(
      modelInfo?.field_list as Array<fieldInfo>,
      true,
    );
    const newRecord = inlineReset(
      record,
      modelInfo?.field_list as Array<fieldInfo>,
    );
    console.log('new record', newRecord);
    const j = compassArray(tmp, newRecord);
    console.log('com', j);
    const id = newRecord['id'] || newRecord['_id'];
    const refer = modelParseToJson(
      modelInfo?.field_list as Array<fieldInfo>,
      true,
      true,
    );
    console.log('refer', refer);
    modelInstance.current = openDrawerEditFields({
      data: j,
      title: `修改${id}`,
      id: id,
      reference: refer,
      onSuccess: editSuccess,
    });
  };

  const inlineReset = (record: any, fields: Array<fieldInfo>) => {
    let obj = { ...record } as any;
    fields.map((d) => {
      if (!d.is_default_wrap) {
        if (d.is_inline) {
          const v = {} as any;
          d.children.map((b) => {
            v[b.map_name] = obj[b.map_name];
            delete obj[b.map_name];
          });
          obj = { ...obj, ...v };
        }
      }
    });
    return obj;
  };

  const compassArray = (tmp: any, record: any) => {
    let obj = {} as any;
    for (const [key, value] of Object.entries(tmp)) {
      obj[key] = record?.[key] || value;
    }
    return obj;
  };

  const modelSortFields = (fields: Array<fieldInfo>) => {
    let t = [] as Array<fieldInfo>;
    for (const d of fields) {
      if (d.is_inline && d.children?.length) {
        t = [...t, ...modelSortFields(d.children)];
      } else if ((d.kind !== 'slice' && d.kind !== 'struct') || d.is_time) {
        t.push(d);
      }
    }
    return t;
  };

  // 新增完成
  const addSuccess = (diff: object) => {
    console.log('新增完成', diff);
    if (diff && Object.keys(diff).length) {
      addData(diff);
    }
  };

  // 模型转换为json
  const modelParseToJson = (
    fields: Array<fieldInfo>,
    edit?: boolean,
    real?: boolean,
  ) => {
    let obj = {} as any;

    for (const d of fields) {
      let value = '' as any;
      if (d.is_pk) {
        continue;
      }
      if (!edit) {
        if (d.is_created || d.is_updated) {
          continue;
        }
      }
      if (d.is_default_wrap || d.is_inline) {
        obj = { ...obj, ...modelParseToJson(d.children, edit, real) };
        continue;
      } else if (d.is_time) {
        value = '';
      } else if (d.kind === 'slice') {
        if (d.children) {
          value = [modelParseToJson(d.children, edit, real)];
        } else {
          if (d.children_kind.startsWith('int')) {
            value = real ? [d.children_kind] : [];
          } else if (d.children_kind.startsWith('uint')) {
            value = real ? [d.children_kind] : [];
          } else if (d.children_kind.startsWith('float')) {
            value = real ? [d.children_kind] : [];
          } else {
            value = real ? ['string'] : [];
          }
        }
      } else if (d.kind === 'struct') {
        value = modelParseToJson(d.children, edit, real);
      } else {
        if (
          d.kind.startsWith('int') ||
          d.kind.startsWith('uint') ||
          d.kind.startsWith('float')
        ) {
          value = 0;
        }
      }
      obj[d.map_name] = value;
    }
    return obj;
  };

  const runAddBefore = () => {
    console.log('新增', modelFormat);
    // 删掉id
    if (modelInfo?.field_list?.length) {
      const tmp = modelParseToJson(modelInfo?.field_list);
      console.log('新增的fields', tmp);
      modelInstance.current = openDrawerEditFields({
        data: tmp,
        title: `新增${modelInfo?.alias}`,
        onSuccess: addSuccess,
      });
    } else {
      message.error('获取模型格式失败');
    }
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

  const pageSizeChange = (current: number, size: number) => {
    setPageSize(size);
  };

  const runSearch = (value: string) => {
    console.log('search', value);
    if (value) {
      runFetch(value);
      return;
    }
    runFetch();
  };

  return (
    <React.Fragment>
      <div className={'my-2'}>
        <Space>
          {`模型共:${docTotal || 0}条`}
          <div>
            <Select value={sortMode} onChange={setSortMode}>
              <Option value={'_o'}>升序</Option>
              <Option value={'_od'}>降序</Option>
            </Select>
            <Select
              value={sortField}
              onChange={setSortField}
              style={{ width: 150 }}
            >
              {modelSortFields(modelInfo?.field_list || [])?.map((d) => {
                return (
                  <Option value={d.map_name} key={d.map_name}>
                    {d.comment || d.map_name}
                  </Option>
                );
              })}
            </Select>
          </div>
          {permission?.post && <Button onClick={runAddBefore}>新增</Button>}
          <Button onClick={runRefresh}>刷新</Button>

          <div>
            <Input.Search
              placeholder={'请输入关键词搜索'}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={runSearch}
            />
          </div>
          {!!filter && (
            <Popover
              trigger={['click']}
              title={'筛选'}
              content={
                <div>
                  {filter?.map((d, i) => {
                    return (
                      <p key={i}>
                        {d?.Key}:{d?.Value}
                      </p>
                    );
                  })}
                </div>
              }
            >
              <span className={'text-gray-400'}>筛选</span>
            </Popover>
          )}
        </Space>
      </div>
      <SimpleTable
        data={data}
        field_list={modelInfo?.field_list || []}
        extraColumns={extraColumns}
        loading={loading || addLoading || deleteLoading || updateLoading}
        pagination={{
          total: total,
          current: page,
          pageSize: pageSize,
          showSizeChanger: true,
          onShowSizeChange: pageSizeChange,
          onChange: pageChange,
        }}
      />
    </React.Fragment>
  );
};
export default ModelTableView;
