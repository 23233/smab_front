import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import useRealLocation from '@/components/useRealLocation';
import { useDebounceEffect, useMount, useRequest, useUnmount } from 'ahooks';
import { tabItem } from '@/define/exp';
import { sortBy } from 'lodash';
import { Result, Button } from 'antd';
import ModelTable from '@/pages/model/modelTable';
import { C } from '@/utils/fetch';
import useModelPer from '@/pages/model/useModelPer';

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

  return (
    <React.Fragment>
      {tabs?.length ? (
        <React.Fragment>
          {/*平铺比较安全*/}
          <div className="flex flex-wrap">
            {tabs.map((d) => {
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

          {!!tab && (
            <ModelTable
              modelName={tab.id as string}
              urlPrefix={C + '/'}
              permission={per}
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
