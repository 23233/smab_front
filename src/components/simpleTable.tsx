import React, { useMemo } from 'react';
import { fieldInfo } from '@/pages/model/table';
import { Image, Table } from 'antd';
import { customTagParse } from '@/utils/tools';
import { TablePaginationConfig } from 'antd/lib/table/interface';
import openDrawerTable from '@/components/drawShowTable';

export interface simpleTable {
  field_list: Array<fieldInfo>;
  data: Array<any>;
  beforeColumns?: Array<any>;
  extraColumns?: Array<any>;
  loading?: boolean;
  pagination?: TablePaginationConfig;
}

const SimpleTable: React.FC<simpleTable> = ({
  data = [],
  field_list = [],
  extraColumns = [],
  beforeColumns = [],
  pagination,
  loading,
  ...props
}) => {
  //
  const showExtraTable = (field: any, record: any) => {
    let data = (field?.kind === 'slice' ? record : [record])?.map((d: any) => {
      const p = {
        ...d,
      } as any;
      if (!p?._id) {
        p._id = Math.random().toString(36).slice(-8);
      }
      return p;
    });

    openDrawerTable({
      data: data,
      field_list: field.children,
      name: field.comment || field.name,
    });
  };

  const sliceTagNameToElement = (
    tagName: string,
    value: string,
    fields: fieldInfo,
  ) => {
    if (Array.isArray(value)) {
      switch (tagName) {
        case 'img':
          return value?.map((vv, i) => {
            return (
              <Image key={i} src={vv} title={vv} style={{ maxHeight: 60 }} />
            );
          });
        default:
          return value?.map((vv: string, i: number) => {
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
                title={vv}
              >
                {vv}
              </div>
            );
          });
      }
    }

    return value;
  };

  const tagNameToElement = (
    tagName: string,
    value: string,
    fields: fieldInfo,
  ) => {
    switch (tagName) {
      case 'img':
        return (
          <Image
            src={value}
            title={fields.comment || fields.map_name}
            style={{ maxHeight: 60 }}
          />
        );
    }
    return value;
  };

  const columns = useMemo(() => {
    let r = [] as Array<any>;
    if (data.length && field_list?.length) {
      field_list.map((d) => {
        // 如果是默认模型上层 则遍历下层
        if (d?.is_default_wrap || d?.is_inline) {
          return d?.children?.map((b) => {
            return r?.push({
              title: b.comment || b.name,
              dataIndex: b.map_name,
              render: (text: string) => {
                return (
                  <div
                    style={{ width: 150, wordBreak: 'break-all' }}
                    title={text}
                  >
                    {text}
                  </div>
                );
              },
            });
          });
        }

        // 如果是时间也跳
        if (d.is_time) {
          r.push({
            title: d.comment || d.name,
            dataIndex: d.map_name,
            render: (text: string) => {
              return (
                <div style={{ width: 150, wordBreak: 'break-all' }}>{text}</div>
              );
            },
          });
        }
        // 如果是数组
        if (d.kind === 'slice') {
          if (d?.children_kind === 'struct') {
            return r.push({
              title: d.comment || d.name,
              render: (_: any, record: any) => {
                return (
                  <div style={{ width: 100 }}>
                    {record?.[d.map_name] ? (
                      <div
                        onClick={() => showExtraTable(d, record?.[d.map_name])}
                      >
                        {d.children?.length} 个字段
                      </div>
                    ) : (
                      <div className={'text-gray-400'}>暂无内容</div>
                    )}
                  </div>
                );
              },
            });
          }
          return r.push({
            title: d.comment || d.name,
            dataIndex: d.map_name,
            render: (text: string) => {
              return (
                <div style={{ width: 200, wordBreak: 'break-all' }}>
                  {sliceTagNameToElement(
                    customTagParse(d.custom_tag)?.t,
                    text,
                    d,
                  )}
                </div>
              );
            },
          });
        }

        // 如果是struct
        if (d.kind === 'struct') {
          if (d?.children?.length) {
            return r.push({
              title: d.comment || d.name,
              render: (_: any, record: any) => {
                return (
                  <div style={{ width: 100 }}>
                    <div
                      onClick={() => showExtraTable(d, record?.[d.map_name])}
                    >
                      {d?.children?.length} 个字段
                    </div>
                  </div>
                );
              },
            });
          }
        }

        return r.push({
          title: d.comment || d.name,
          dataIndex: d.map_name,
          render: (text: string) => {
            return (
              <div style={{ width: 100 }}>
                {tagNameToElement(customTagParse(d.custom_tag)?.t, text, d)}
              </div>
            );
          },
        });
      });
    }
    if (!r.some((b: any) => b?.dataIndex == '_id')) {
      r.unshift({
        title: 'Id',
        dataIndex: '_id',
      });
    }

    r = [...beforeColumns, ...r, ...extraColumns];
    return r;
  }, [data, field_list, extraColumns]);

  return (
    <React.Fragment>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={'_id'}
        loading={loading}
        pagination={pagination}
        scroll={{ x: true }}
      />
    </React.Fragment>
  );
};
export default SimpleTable;
