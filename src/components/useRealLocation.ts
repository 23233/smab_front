import * as H from 'history';
import { parse, ParsedQuery } from 'query-string';
import { useLocation } from 'umi';

// 获取location 因为umi的useLocation 类型有点问题所以重新封装了一个
// https://github.com/umijs/umi/issues/5278

const useRealLocation = <Q extends ParsedQuery<string>>() => {
  const location = useLocation<undefined>() as H.Location<undefined> & {
    query: Q;
  };
  const query = location.query || parse(location.search);

  return { ...location, query };
};

export default useRealLocation;
