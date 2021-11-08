import { useModel } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { getPer } from '@/pages/model/tools';

export interface useModelRef {
  get: boolean;
  post: boolean;
  put: boolean;
  delete: boolean;
}

const useModelPer = (modelName: string): useModelRef => {
  const { userPer, userInfo } = useModel('useAuthModel');

  const result = useRef<useModelRef>({
    get: false,
    post: false,
    put: false,
    delete: false,
  });

  useEffect(() => {
    if (!!userPer) {
      result.current = getPer(modelName, userPer, userInfo?.super);
    }
  }, [userPer]);

  return result.current;
};

export default useModelPer;
