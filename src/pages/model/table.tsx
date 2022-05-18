import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useDebounceEffect,
  useMount,
  useRequest,
  useUnmount,
  useUpdateEffect,
} from 'ahooks';
import RestApiGen from '@/utils/restApiGen';
import Req from 'umi-request';
import {
  Button,
  message,
  Popconfirm,
  Select,
  Space,
  Dropdown,
  Table,
  TableColumnsType,
  Input,
  Image,
  Popover,
  Menu,
  Col,
  Row,
  Modal,
  notification,
} from 'antd';
import {
  CompressOutlined,
  DeleteOutlined,
  DiffOutlined,
  EditOutlined,
  MoreOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { openDrawerFields } from '@/components/drawShowField';
import SimpleTable from '@/components/simpleTable';
import openDrawerSchemeForm from '@/components/drawShowSchemeForm';
import {
  flatKeyMatch,
  modelToFrScheme,
  schemeGetJson,
  sliceToObject,
  sortScheme,
} from '@/pages/model/tools';
import useGetAction from '@/pages/model/useGetAction';
import { action, fieldInfo, modelInfo } from '@/define/exp';
import dayjs from 'dayjs';
import { permission } from '@/define/exp';
import { useListener } from 'react-gbus';
import CONFIG from '@/utils/config';
import { jsonDiff } from '@/utils/tools';

const { Option, OptGroup } = Select;
const { confirm } = Modal;

interface p {
  modelName: string;
  modelInfo: modelInfo;
  modelFormat: object;
  fetchUri: string;
  permission?: permission;
  page?: number;
  pageChange?: (newPage: number) => void;
  pageSize?: number;
  pageSizeChange?: (newSize: number) => void;
  extraOp?: Array<any>; // 额外操作
  beforeOp?: Array<any>; // 前置操作
  extraQuery?: Record<string, any>; // 请求的额外参数
  customColumns?: Array<any>;
}

const ModelTableView: React.FC<p> = ({
  modelName,
  modelInfo = {},
  modelFormat = {},
  fetchUri,
  permission,
  beforeOp = [],
  extraOp = [],
  extraQuery = {},
  page = 1,
  pageChange,
  pageSize = 10,
  pageSizeChange,
  customColumns,
  ...props
}) => {
  const [data, setData] = useState<Array<any>>([]);
  const [total, setTotal] = useState<number>(10);
  const [filter, setFilter] = useState<Array<any>>([]);
  const [docTotal, setDocTotal] = useState<number>();
  const [search, setSearch] = useState<string>();
  const [sortMode, setSortMode] = useState<'_o' | '_od'>('_o');
  const [sortField, setSortField] = useState<string>();
  const [selectField, setSelectField] = useState<string>();
  const [fieldValue, setFieldValue] = useState<string>('');
  const cover = useRef<boolean>(false);
  const modelInstance = useRef<any>();

  const currentSelect = useRef<any>();

  // 订阅事件
  useListener(() => {
    runRefresh();
  }, [CONFIG.events.tableRefresh]);

  const { data: actionList } = useGetAction(1, modelName, {
    user_id: (window as any)?.c_userInfo?.id,
  });

  // 获取数据内容
  const { run: getData, loading } = useRequest(new RestApiGen(fetchUri).get, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        setData(resp?.data?.data);
        pageChange && pageChange(resp.data?.page);
        pageSizeChange && pageSizeChange(resp.data?.page_size);
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
        pageChange && pageChange(1);
      }
      setData([]);
      setFieldValue('');
      setSelectField(undefined);
      setSearch('');
    }
  }, [modelInfo]);

  useEffect(() => {
    if (page) {
      runFetch();
    }
  }, [page, pageSize, sortField, sortMode]);

  const runFetch = (search?: string) => {
    if (loading) return;
    const p = {
      page: page,
      page_size: pageSize,
      ...extraQuery,
    } as any;
    if (sortField) {
      p[sortMode] = sortField.replace('__', '.');
    }
    if (search !== undefined) {
      p['_s'] = '__' + search + '__';
    }
    if (selectField) {
      if (fieldValue) {
        p[selectField] = fieldValue;
      }
    }
    getData(p);
  };

  const actionSend = async (formData: any, record: any, action: action) => {
    let r = {
      record: record,
      action: action.name,
      t: dayjs().unix(),
      table: modelName,
    } as any;

    if (!!formData) {
      r.form = formData;
    }

    const resp = await Req.post(action.post_url, {
      data: r,
      getResponse: true,
      errorHandler: (error: any) => {
        return error;
      },
    });
    console.log('action 发起请求结果', resp);

    if (resp) {
      if (resp?.response?.status < 10) {
        message.error('发起请求失败');
        return;
      }

      if (resp?.response?.status !== 200) {
        message.error('请求响应非200');
        return;
      }

      if (resp?.response?.status === 200) {
        modelInstance.current?.destroy();
        message.success('发送成功');
      }

      return;
    }
    message.error('发起请求失败');
  };

  const actionClick = async (d: action) => {
    console.log('动作点击', d, currentSelect.current);

    if (d.scheme) {
      let scheme;
      try {
        scheme = JSON.parse(d.scheme);
      } catch (e) {
        console.error('动作解析 scheme失败', e);
        return;
      }
      modelInstance.current = openDrawerSchemeForm({
        title: d.name,
        scheme: scheme,
        onSuccess: (formData) => {
          console.log('action form 提交', formData);
          actionSend(formData, currentSelect.current, d);
        },
      });
      return;
    }

    actionSend('', currentSelect.current, d);
  };

  const actionMenus = useMemo(() => {
    if (actionList?.length) {
      return (
        <Menu>
          {actionList.map((d, i) => {
            return (
              <Menu.Item key={d._id} onClick={() => actionClick(d)}>
                {d.name}
              </Menu.Item>
            );
          })}
        </Menu>
      );
    }
    return <div />;
  }, [actionList]);

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

              {!!actionList?.length && (
                <Dropdown overlay={actionMenus} trigger={['click']}>
                  <MoreOutlined
                    title={'动作'}
                    onClick={() => (currentSelect.current = record)}
                  />
                </Dropdown>
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
  const editSuccess = (diff: any, mid: string) => {
    console.log('修改完成', diff, mid);
    if (diff && Object.keys(diff).length) {
      updateData(mid, diff);
    } else {
      confirm({
        title: '检测到空内容',
        content: '确认提交吗?',
        type: 'warning',
        onOk: () => {
          updateData(mid, diff);
        },
      });
    }
  };

  // 修改
  const editRecordBefore = (record: any) => {
    console.log('edit record', record);
    const parseRecord = sliceToObject(record);
    console.log('转换后的行数据', parseRecord);
    const scheme = modelToFrScheme(
      modelInfo?.field_list,
      true,
      '',
      parseRecord,
    );
    const id = record?.['id'] || record?.['_id'];

    const schemeInitJson = schemeGetJson(scheme);

    console.log('修改数据', scheme);
    modelInstance.current = openDrawerSchemeForm({
      title: `在${modelInfo?.alias || modelName}修改${id}行数据`,
      scheme: scheme,
      onSuccess: (formData) => {
        const r = flatKeyMatch(formData);
        // 先进行内链元素的整理

        const diff = jsonDiff(schemeInitJson, r, modelInfo?.flat_fields!);
        console.log('修改后的数据', r);
        console.log('原始数据', schemeInitJson);
        console.log('diff', diff);

        editSuccess(diff, id);
      },
    });
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
    } else {
      confirm({
        title: '检测到空内容',
        content: '确认提交吗?',
        type: 'warning',
        onOk: () => {
          addData(diff);
        },
      });
    }
  };

  const runAddBefore = () => {
    console.log('新增', modelFormat);

    // 解析成fr的scheme
    const scheme = modelToFrScheme(modelInfo?.field_list!);

    console.log('解析的scheme', scheme);
    modelInstance.current = openDrawerSchemeForm({
      title: `新增` + modelInfo?.alias || modelName + '数据',
      scheme: scheme,
      onSuccess: (formData) => {
        const r = flatKeyMatch(formData);
        console.log('提交的数据', r);
        addSuccess(r);
      },
    });
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

  const runSearch = (value: string) => {
    console.log('search', value);
    if (value) {
      runFetch(value);
      return;
    }
    runFetch();
  };

  const runFilter = (value: string) => {
    if (!value) {
      setFieldValue('');
    }
    runFetch();
  };

  const renderItemOption = (d: fieldInfo) => {
    // 如果是struct 并且不是时间
    if (d.kind === 'struct' && !d?.is_time && d.children?.length) {
      return (
        <OptGroup key={d.level} label={d?.comment || d.map_name}>
          {d.children.map((b) => {
            return renderItemOption(b);
          })}
        </OptGroup>
      );
    }

    return (
      <Option key={d.level} value={d.params_key}>
        <div>
          <b>{d.comment || d.map_name}</b>
        </div>
        <div style={{ fontSize: 12 }}>{d.types}</div>
      </Option>
    );
  };

  const sortFiles = useMemo(() => {
    return (modelInfo?.field_list || [])?.map((d) => {
      return renderItemOption(d);
    });
  }, [modelInfo]);

  return (
    <React.Fragment>
      <div className={'my-2'}>
        <Row justify={'start'} align={'middle'} gutter={8}>
          <Col>{`模型共:${docTotal || 0}条`}</Col>
          <Col>
            <div>
              <Select value={sortMode} onChange={setSortMode}>
                <Option value={'_o'}>升序</Option>
                <Option value={'_od'}>降序</Option>
              </Select>
              <Select
                value={sortField}
                onChange={setSortField}
                style={{ width: 200 }}
                placeholder={'请选择排序字段'}
              >
                {sortFiles}
              </Select>
            </div>
          </Col>
          <Col>
            {permission?.post && <Button onClick={runAddBefore}>新增</Button>}
            <Button onClick={runRefresh}>刷新</Button>
          </Col>
          <Col>
            <Input.Search
              placeholder={'请输入关键词搜索'}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={runSearch}
            />
          </Col>
          <Col>
            <Input.Search
              addonBefore={
                <Select
                  value={selectField}
                  onChange={setSelectField}
                  placeholder={'请选择一个字段'}
                  style={{ width: 150, textAlign: 'left' }}
                >
                  {sortFiles}
                </Select>
              }
              placeholder={'请输入搜索内容'}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              onSearch={runFilter}
            />
          </Col>
          <Col>
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
          </Col>
        </Row>
      </div>
      <SimpleTable
        data={data}
        field_list={modelInfo?.field_list || []}
        extraColumns={extraColumns}
        beforeColumns={beforeOp}
        customColumns={customColumns}
        loading={loading || addLoading || deleteLoading || updateLoading}
        pagination={{
          total: total,
          current: page,
          pageSize: pageSize,
          showSizeChanger: true,
          onShowSizeChange: (current: number, size: number) => {
            pageSizeChange && pageSizeChange(size);
          },
          onChange: (newPage) => pageChange && pageChange(newPage),
        }}
      />
    </React.Fragment>
  );
};
export default ModelTableView;
