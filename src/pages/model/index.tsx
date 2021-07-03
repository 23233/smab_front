import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import useRealLocation from '@/components/useRealLocation';
import { useDebounceEffect, useMount, useRequest, useUnmount } from 'ahooks';
import ModelTableView from '@/pages/model/table';
import { tabItem } from '@/define/exp';

interface p {}

// 模型信息编辑
const V: React.FC<p> = ({ ...props }) => {
  const { userInfo, userPer } = useModel('useAuthModel');
  const [tabs, setTabs] = useState<Array<tabItem>>([]);
  const [tab, setTab] = useState<tabItem>();

  const location = useRealLocation();

  useEffect(() => {
    if (!!userPer) {
      const tt = [] as any;
      userPer.map((d: any) => {
        if (d.key === 'model_i') {
          d?.children?.map((b: any) => {
            // 判断是否有get权限
            if (b.children.some((c: any) => c.title === 'get')) {
              tt.push(b.title);
            }
          });
        }
      });
      const tabList = tt.map((d: string) => {
        return {
          id: d,
          label: d,
        };
      });
      setTabs(tabList);
      if (!tab && !location.query?.model) {
        setTab(tabList[0]);
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

  return (
    <React.Fragment>
      {/*平铺比较安全*/}
      <div className={'flex flex-wrap mb-2'}>
        {tabs.map((d) => {
          return (
            <div
              className={`p-1 px-2 text-md ${
                tab?.id === d.id ? 'border-b-2 border-blue-400' : ''
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

      {!!tab && <ModelTableView modelName={tab.label} />}
    </React.Fragment>
  );
};
export default V;
