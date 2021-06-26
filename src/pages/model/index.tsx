import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import HorizontallyTabs, { tabItem } from '@/components/tabs/horizontally';
import useRealLocation from '@/components/useRealLocation';
import useUrlState from '@ahooksjs/use-url-state';
import { useDebounceEffect, useMount, useRequest, useUnmount } from 'ahooks';
import ModelTableView from '@/pages/model/table';

interface p {}

// 模型信息编辑
const V: React.FC<p> = ({ ...props }) => {
  const { userInfo, userPer } = useModel('useAuthModel');
  const [tabs, setTabs] = useState<Array<tabItem>>([]);
  const [tab, setTab] = useState<tabItem>();

  // 把参数变化保留到url上
  const location = useRealLocation();
  const [uriState, setUriState] = useUrlState(undefined, {
    navigateMode: 'replace',
  });

  useEffect(() => {
    if (!!userPer) {
      const tt = [] as any;
      userPer.map((d: any) => {
        if (d.key === 'model_i') {
          d?.children?.map((b: any) => {
            tt.push(b.title);
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

  useDebounceEffect(
    () => {
      setUriState({
        model: tab?.label,
      });
    },
    [tab],
    {
      wait: 800,
    },
  );

  useMount(() => {
    const query = location.query;
    if (query?.model) {
      setTab({
        label: query?.model,
        id: query?.model,
      } as tabItem);
    }
  });

  useUnmount(() => {
    setUriState({
      model: undefined,
    });
  });

  return (
    <React.Fragment>
      <HorizontallyTabs items={tabs} current={tab} onChange={tabChange} />

      {!!tab && <ModelTableView modelName={tab.label} />}
    </React.Fragment>
  );
};
export default V;
