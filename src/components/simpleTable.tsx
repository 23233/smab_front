import React, { useMemo, useRef } from 'react';
import { Button, Image, Popover, Table } from 'antd';
import { customTagParse } from '@/utils/tools';
import { TablePaginationConfig } from 'antd/lib/table/interface';
import openDrawerTable from '@/components/drawShowTable';
import { openDrawerModelTable } from '@/components/drawerOpenTable';
import { snakeCase } from 'lodash';
import { getPer } from '@/pages/model/tools';
import { fieldInfo } from '@/define/exp';
import { openDrawerMarkdown } from '@/components/drawerShowMarkdown';
import dayjs from 'dayjs';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface simpleTable {
  field_list: Array<fieldInfo>;
  data: Array<any>;
  beforeColumns?: Array<any>;
  extraColumns?: Array<any>;
  loading?: boolean;
  pagination?: TablePaginationConfig;
  customColumns?: Array<any>;
  size?: SizeType;
}

const SimpleTable: React.FC<simpleTable> = ({
  data = [],
  field_list = [],
  extraColumns = [],
  beforeColumns = [],
  pagination,
  loading,
  customColumns = [],
  size = 'middle',
  ...props
}) => {
  const modalRef = useRef<any>();

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

  const openDrawer = (fkName: string, mapCol: string, value: string) => {
    let mapKeys = mapCol;
    if (mapCol.indexOf('.') >= 0) {
      mapKeys = mapCol
        .split('.')
        .map((d) => snakeCase(d))
        .join('__');
    }
    console.log('表格打开外键信息', fkName, mapCol, value, mapKeys);

    modalRef.current = openDrawerModelTable({
      name: snakeCase(fkName),
      permission: getPer(
        fkName,
        (window as any)?.c_policy,
        (window as any)?.c_userInfo?.super,
      ),
      extraQuery: {
        [mapKeys]: value,
      },
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
              <Image
                key={i}
                src={vv}
                title={vv}
                style={{ maxHeight: 60 }}
                referrerPolicy={'no-referrer'}
              />
            );
          });
        default:
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {value?.map((vv: string, i: number) => {
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
              })}
            </div>
          );
      }
    }

    return value;
  };

  const tagNameToElement = (
    tagName: string,
    value: string,
    fields: fieldInfo,
  ) => {
    const inline = () => {
      switch (tagName) {
        case 'img':
          return (
            <Image
              src={value}
              title={fields.comment || fields.map_name}
              style={{ maxHeight: 60 }}
              referrerPolicy={'no-referrer'}
            />
          );
        case 'markdown':
          if (!value) {
            return null;
          }
          return (
            <div
              style={{
                fontSize: 12,
                color: '#5b43bb',
                cursor: 'pointer',
                paddingBottom: 2,
                borderBottom: '2px solid #eee',
                textAlign: 'center',
              }}
              onClick={() =>
                openDrawerMarkdown({
                  content: value,
                  title: `渲染${
                    fields.comment || fields.map_name
                  }的markdown内容`,
                })
              }
              title={'渲染markdown'}
            >
              渲染markdown
            </div>
          );
      }
      // bool类型解析成0和1
      if (fields.kind === 'bool') {
        return !!value ? 1 : 0;
      }
      return value;
    };

    const t = customTagParse(fields.custom_tag);

    // 判断是否有外键
    if (t?.fk) {
      // console.log('渲染表格fk', t);
      const fkMap = t?.col || '_id';
      return (
        <div
          style={{ color: '#52c41a', cursor: 'pointer' }}
          title={`${t?.fk}外键 字段${fkMap}`}
          onClick={() => openDrawer(t?.fk, fkMap, value)}
        >
          {inline()}
        </div>
      );
    }
    return inline();
  };

  const parseCol = (l: Array<fieldInfo>) => {
    let r = [] as Array<any>;
    let timeCol = [] as Array<any>;
    l.map((d) => {
      // 如果是默认模型上层 则遍历下层
      if (d.is_inline) {
        return r.push(...parseCol(d?.children));
      }
      // 如果是时间也跳
      if (d.is_time) {
        const title = d.comment || d.name;
        const key = d.map_name;
        timeCol.push({
          title,
          key,
        });
        return;
      }
      // 如果是数组
      if (d.kind === 'slice') {
        if (d?.children_kind === 'struct') {
          return r.push({
            title: d.comment || d.name,
            render: (_: any, record: any) => {
              return (
                <div style={{ width: 100 }}>
                  {!!record?.[d.map_name] ? (
                    <div
                      onClick={() => showExtraTable(d, record?.[d.map_name])}
                      style={{ color: '#1288f6' }}
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
                    style={{ color: '#1288f6', cursor: 'pointer' }}
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
            <div
              style={{ width: 100, maxHeight: 200, overflowY: 'auto' }}
              className={`no-scrollbar ${text?.length >= 100 ? 'text-xs' : ''}`}
            >
              {tagNameToElement(customTagParse(d.custom_tag)?.t, text, d)}
            </div>
          );
        },
      });
    });

    if (timeCol.length) {
      r.unshift({
        title: '时间',
        render: (_: any, record: any) => {
          return (
            <div style={{ width: 150, wordBreak: 'break-all' }}>
              {timeCol.map((d: any) => {
                const v = record?.[d.key];
                return (
                  <div key={d.key} className={''} style={{ fontSize: 12 }}>
                    <span>{d.title}</span>
                    <span>:</span>
                    <Popover
                      content={
                        <div style={{ fontSize: 14 }}>
                          <div>{v}</div>
                          <div>{dayjs(v).format('YYYY-MM-DD HH:mm:ss')}</div>
                        </div>
                      }
                    >
                      {dayjs(v).fromNow()}
                    </Popover>
                  </div>
                );
              })}
            </div>
          );
        },
      });
    }

    return r;
  };

  const columns = useMemo(() => {
    if (customColumns?.length) {
      return customColumns;
    }
    let r = [] as Array<any>;

    if (data.length && field_list?.length) {
      r = parseCol(field_list);
    }
    if (!r.some((b: any) => b?.dataIndex == '_id')) {
      r.unshift({
        title: 'Id',
        dataIndex: '_id',
      });
    }

    r = [...beforeColumns, ...r, ...extraColumns];
    return r;
  }, [data, field_list, extraColumns, customColumns]);

  return (
    <React.Fragment>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={'_id'}
        loading={loading}
        pagination={pagination}
        scroll={{ x: true }}
        size={size}
      />
    </React.Fragment>
  );
};
export default SimpleTable;
