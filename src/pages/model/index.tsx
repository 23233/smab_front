import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useModel } from 'umi';
import useRealLocation from '@/components/useRealLocation';
import { useDebounceEffect, useMount, useRequest, useUnmount } from 'ahooks';
import { tabItem } from '@/define/exp';
import { sortBy } from 'lodash';
import { Result, Button } from 'antd';
import ModelTable from '@/pages/model/modelTable';
import Fetch, { C } from '@/utils/fetch';
import useModelPer from '@/pages/model/useModelPer';
import { groupBy } from 'lodash';

interface p {}

// 模型信息编辑
const V: React.FC<p> = ({ ...props }) => {
  const { userPer } = useModel('useAuthModel');
  const [tabs, setTabs] = useState<Array<tabItem>>([]);
  const [tab, setTab] = useState<tabItem>();
  const per = useModelPer((tab?.id as string) || '');

  const location = useRealLocation();

  useEffect(() => {
    if (!!userPer) {
      const tt = [] as any;
      userPer.map((d: any) => {
        if (d.key === 'model_i') {
          // 因为golang map无序 所以使用英文顺序排名进行固定排序
          sortBy(d?.children, ['key'])?.map((b: any) => {
            // 判断是否有get权限
            if (b.children.some((c: any) => c.title === 'get')) {
              tt.push({
                id: b.title,
                label: b?.alias || b.title,
                group: b?.group || '',
                level: b?.level || 0,
                group_level: b?.group_level || 0,
              });
            }
          });
        }
      });
      setTabs(tt);
      if (!tab && !location.query?.model) {
        setTab(tt[0]);
      }
    }
  }, [userPer]);

  const tabChange = (item: tabItem) => {
    setTab(item);
  };

  useMount(() => {
    const query = location.query;
    if (query?.model) {
      setTab({
        label: query?.model,
        id: query?.model,
      } as tabItem);
    }
  });

  const tabs_group = useMemo(() => {
    if (tabs?.length) {
      // 根据组排序
      const nt = tabs?.sort((a: any, b: any) => {
        return b?.group_level - a?.group_level;
      });
      // 分组
      const groupObj = groupBy(nt, 'group');
      const r = {} as any;
      Object.keys(groupObj).map((d) => {
        // 组内排序
        const v = groupObj[d]?.sort((a: any, b: any) => {
          return b?.level - a?.level;
        });
        r[d] = v;
      });
      return r;
    }
    return {};
  }, [tabs]);

  return (
    <React.Fragment>
      {tabs?.length ? (
        <React.Fragment>
          {Object.keys(tabs_group)?.map((k, i) => {
            return (
              <div className="flex flex-wrap align-center" key={`tabs_${i}`}>
                <div className="pr-2 text-sm text-gray-400">
                  {k || '未命名'}:
                </div>
                {tabs_group?.[k].map((d: any) => {
                  return (
                    <div
                      className={`p-1 px-2 text-md border-b-2 border-transparent ${
                        tab?.id === d.id ? 'border-blue-400' : ''
                      } cursor-pointer mr-2`}
                      title={d.label}
                      key={d.id}
                      onClick={() => tabChange(d)}
                    >
                      {d.label}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {!!tab && (
            <ModelTable
              modelName={tab.id as string}
              urlPrefix={C + '/'}
              permission={per}
              getModalInfoReq={Fetch.getModelInfo}
            />
          )}
        </React.Fragment>
      ) : (
        <Result
          status="403"
          title="未获取到任何模型的权限"
          subTitle="若有异常请刷新或联系管理员"
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              立即刷新
            </Button>
          }
        />
      )}
    </React.Fragment>
  );
};
export default V;
