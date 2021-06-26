import Req from '@/utils/request';

// crud rest接口生成器
class RestApiGen {
  url: string;

  constructor(url: string) {
    this.url = this.changeUrl(url);
  }

  get = (params: object) => {
    return Req.get(this.url, {
      params: params,
    });
  };

  post = (data: any) => {
    return Req.post(this.url, {
      data: data,
      requestType: 'form',
    });
  };

  put = (mid: string, data: any) => {
    return Req.put(`${this.url}/${mid}`, {
      data: data,
      requestType: 'form',
    });
  };

  delete = (mid: string) => {
    return Req.delete(`${this.url}/${mid}`);
  };

  getSingle = (mid: string) => {
    return Req.get(`${this.url}/${mid}`);
  };

  // 前缀匹配% 后缀匹配 前后匹配
  search = (val: string, match: 'left' | 'right' | 'full', params?: object) => {
    return Req.get(`${this.url}`, {
      params: {
        ...params,
        [`_s`]:
          match === 'left'
            ? '__' + val
            : match === 'right'
            ? val + '__'
            : '__' + val + '__',
      },
    });
  };

  // 变更url
  private changeUrl = (url: string): string => {
    let u = url;
    if (u.endsWith('/')) {
      return u.slice(0, url.length - 1);
    }
    return u;
  };
  changeUri = (url: string) => {
    this.url = this.changeUrl(url);
  };
}

export const getResultFormat = (res: any) => {
  if (res?.response?.status === 200) {
    // 有page代表是列表
    if (res.data?.page) {
      res.data.data = res.data?.data.map((d: any) => {
        return { id: d?._id, ...d };
      });
    } else {
      res.data.id = res.data?._id || res.data?.id;
    }
  }
  if (!res?.response) {
    return {
      response: {},
      data: {},
    };
  }
  return res;
};

export default RestApiGen;
