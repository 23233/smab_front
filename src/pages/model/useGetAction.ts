import { useRequest, useUpdateEffect } from 'ahooks';
import Fetch from '@/utils/fetch';
import { useEffect, useRef, useState } from 'react';
import { action } from '@/define/exp';
import { uniqBy } from 'lodash';

const useGetAction = (startPage: number, scope: string, query?: object) => {
  const [data, setData] = useState<Array<action>>([]);
  const [page, setPage] = useState<number>();
  const [pageSize, setPageSize] = useState<number>(50);
  const [total, setTotal] = useState<number>(10);
  const cover = useRef<boolean>(false);

  const { run, loading } = useRequest(Fetch.action.get, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
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
      }
    },
  });

  useEffect(() => {
    setPage(startPage);
  }, []);

  useEffect(() => {
    if (page) {
      runFetch();
    }
  }, [page]);

  useUpdateEffect(() => {
    if (scope) {
      runRefresh();
    }
  }, [scope]);

  // 刷新
  const runRefresh = () => {
    cover.current = true;
    runFetch();
  };
  const runFetch = () => {
    const p = {
      page: page,
      page_size: pageSize,
      _od: 'update_at',
      ...query,
    } as any;
    if (scope) {
      p.scope = scope;
    }
    run(p);
  };

  const pageChange = (page: number) => {
    setPage(page);
  };

  return {
    page,
    total,
    pageSize,
    data,
    loading,
    runRefresh,
    pageChange,
    runFetch,
  };
};

export default useGetAction;
