import { fieldInfo } from '@/define/exp';
import { objIsGeo } from '@/pages/model/tools';

export const objectToData = (data: object, prefix: string, limit?: string) => {
  if (!limit) {
    limit = '__';
  }
  const result = {} as any;
  for (const [key, value] of Object.entries(data)) {
    result[prefix + limit + key] = value;
  }
  return result;
};

export const customTagParse = (tagStr: string) => {
  let r = {} as any;
  if (tagStr) {
    const actionList = tagStr.split(',');
    actionList.map((b) => {
      const [k, v] = b.split('=');
      r[k] = v;
    });
  }
  return r;
};

export const jsonDiff = (
  init: Record<string, any>,
  news: Record<string, any>,
  fields: Array<fieldInfo>,
) => {
  if (!init || !news) {
    return null;
  }
  // geo信息 如果表更则需要保留
  if (objIsGeo(news)) {
    if (!isEq(init?.coordinates, news?.coordinates)) {
      return news;
    }
  }
  let result = {} as Record<string, any>;
  for (const [key, value] of Object.entries(init)) {
    if (key === '_id') {
      continue;
    }
    // 判断值是否存在
    const bv = news?.[key];
    // 判断值类型是否可以继续迭代
    if (getVarType(value) == 'Object') {
      const v = jsonDiff(value, bv, fields);
      if (v) {
        result[key] = v;
      }
    } else {
      if (!isEq(value, bv)) {
        result[key] = bv;
      }
    }
  }

  // 如果为空则返回
  if (isEmptyObj(result)) {
    return null;
  }

  return result;
};

const isEmptyObj = (a: any) => {
  return !Object.keys(a).length;
};

const isArrayEqual = (array1: Array<any>, array2: Array<any>) => {
  return (
    array1.length === array2.length &&
    array1.every(function (v, i) {
      return JSON.stringify(v) === JSON.stringify(array2[i]);
    })
  );
};

const getVarType = (val: any) => {
  let t:
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function' = typeof val;
  // object需要使用Object.prototype.toString.call判断
  if (t === 'object') {
    let typeStr = Object.prototype.toString.call(val);
    // 解析[object String]
    typeStr = typeStr.split(' ')[1];
    // @ts-ignore
    t = typeStr.substring(0, typeStr.length - 1);
  }
  return t as string;
};

const isEq = (a: any, b: any) => {
  // 判断是否为数组
  if (Array.isArray(a)) {
    // 判断两个数组是否相等
    return isArrayEqual(a, b);
  }
  // 判断值是否想等
  return a == b;
};
