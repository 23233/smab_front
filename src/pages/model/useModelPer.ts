import { useModel } from 'umi';
import { useEffect, useRef, useState } from 'react';

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
      if (userInfo?.super) {
        result.current.get = true;
        result.current.post = true;
        result.current.put = true;
        result.current.delete = true;
        return;
      }
      userPer.map((d: any) => {
        if (d.key === 'model_i') {
          d?.children?.map((b: any) => {
            if (b.title === modelName) {
              b?.children.map((c: any) => {
                switch (c.title) {
                  case 'get':
                    result.current.get = true;
                    break;
                  case 'post':
                    result.current.post = true;
                    break;
                  case 'put':
                    result.current.put = true;
                    break;
                  case 'delete':
                    result.current.delete = true;
                    break;
                }
              });
            }
          });
        }
      });
    }
  }, [userPer]);

  return result.current;
};

export default useModelPer;
