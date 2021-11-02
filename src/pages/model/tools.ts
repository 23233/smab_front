// 模型转换为json
import { fieldInfo } from '@/pages/model/table';
import { isArray } from 'lodash';

export const numberTypeRule = (kind: string) => {
  switch (kind) {
    case 'int8':
      return {
        min: -128,
        max: 127,
      };
    case 'int16':
      return {
        min: -32768,
        max: 32767,
      };
    case 'int32' || 'int':
      return {
        min: -2147483648,
        max: 2147483647,
      };
    case 'int64':
      return {
        min: -9223372036854775808,
        max: 9223372036854775807,
      };
    case 'uint8':
      return {
        min: 0,
        max: 255,
      };
    case 'uint16':
      return {
        min: 0,
        max: 65535,
      };
    case 'uint32' || 'uint':
      return {
        min: 0,
        max: 4294967295,
      };
    case 'uint64':
      return {
        min: 0,
        max: 18446744073709551615,
      };
  }
  return {};
};

export const getSingleScheme = (
  d: fieldInfo,
  edit = false,
  initValue?: any,
): object | undefined => {
  if (d.is_pk) {
    return;
  }
  if (!edit) {
    if (d.is_created || d.is_updated) {
      return;
    }
  }
  const title = d.comment || d.map_name;
  if (d.is_time) {
    return {
      title: title,
      type: 'string',
      default: edit ? initValue : undefined,
      widget: 'c_datetime',
      placeholder: '请选择时间',
    };
  }
  if (d.is_geo) {
    return {
      title: title,
      type: 'object',
      properties: {
        type: {
          title: 'geo类型',
          type: 'string',
          enum: ['Point'],
          default: 'Point',
          required: true,
          width: '50%',
        },
        coordinates: {
          title: '经纬度',
          type: 'array',
          required: true,
          width: '50%',
          default: edit
            ? [
                { __flat: initValue?.coordinates?.[0] },
                { __flat: initValue?.coordinates?.[1] },
              ]
            : undefined,
          items: {
            type: 'object',
            properties: {
              __flat: {
                type: 'number',
                placeholder: 'lat优先 lng跟上 只需要这两',
              },
            },
          },
        },
      },
    };
  }

  const kind = d.kind;

  let t = 'string';
  let rule = {} as any;
  let placeholder = '请输入内容';
  if (d.is_obj_id) {
    rule = {
      min: 24,
      max: 24,
    };
  }

  if (
    kind.startsWith('int') ||
    kind.startsWith('uint') ||
    kind.startsWith('float')
  ) {
    t = 'number';
    rule = numberTypeRule(kind);
    placeholder = '请输入数字';
  }
  if (kind === 'bool') {
    t = 'boolean';
  }

  return {
    title: title,
    type: t,
    default: edit ? initValue : undefined,
    placeholder: placeholder,
    ...rule,
  };
};

export const getSliceScheme = (
  d: fieldInfo,
  edit = false,
  initValue?: any,
): object | undefined => {
  if (d.kind !== 'slice') {
    return;
  }
  const title = d.comment || d.map_name;
  let t = 'string';
  if (
    d.children_kind.startsWith('int') ||
    d.children_kind.startsWith('uint') ||
    d.children_kind.startsWith('float')
  ) {
    t = 'number';
  } else if (d.children_kind === 'bool') {
    t = 'boolean';
  }

  let df;
  if (edit) {
    if (!isPlainObject(initValue?.[0])) {
      df = initValue?.map((b: any) => {
        return {
          __flat: b,
        };
      });
    } else {
      df = initValue;
    }
  }
  console.log('df', title, df);

  // todo 等待解决 https://x-render.gitee.io/form-render/schema/schema#items 目前仅支持对象
  return {
    title: title,
    type: 'array',
    default: df,
    items: {
      type: 'object',
      properties: {
        __flat: {
          type: t,
          placeholder: '请输入' + title,
        },
      },
    },
  };
};

export const sliceToObject = (obj: any) => {
  let r = { ...obj };
  for (const [key, value] of Object.entries(r)) {
    if (isArray(value)) {
      const first = value?.[0];
      if (isPlainObject(first)) {
        value.map((bb, i) => {
          r[key][i] = sliceToObject(bb);
        });
      } else {
        r[key] = value.map((bb) => {
          return {
            __flat: bb,
          };
        });
      }
    } else if (isPlainObject(value)) {
      r[key] = sliceToObject(value);
    }
  }

  return r;
};

export const modelToFrScheme = (
  fields: Array<fieldInfo>,
  edit?: boolean,
  title?: string,
  initValues?: any,
) => {
  let obj = {
    type: 'object',
    properties: {} as any,
    displayType: 'row',
  } as any;
  if (title) {
    obj.title = title;
  }

  for (const d of fields) {
    let r: any;
    if (d.is_default_wrap) {
      if (!edit) {
        continue;
      }
      r = modelToFrScheme(d.children, edit, '', initValues);
    } else {
      const title = d.comment || d.map_name;
      if (d.kind === 'slice') {
        // 数组[]struct
        if (d.children) {
          console.log('[]type', title, initValues?.[d.map_name]);
          r = {
            title: title,
            type: 'array',
            items: modelToFrScheme(
              d.children,
              edit,
              title,
              initValues?.[d.map_name],
            ),
            default: edit ? initValues?.[d.map_name] : undefined,
          };
        } else {
          // 单纯数组[]type
          r = getSliceScheme(d, edit, initValues?.[d.map_name]);
        }
      } else if (d.children) {
        // 也有children
        if (d.is_geo) {
          r = getSingleScheme(d, edit, initValues?.[d.map_name]);
        } else if (d.is_inline) {
          if (!d.bson?.[0]) {
            const v = modelToFrScheme(d.children, edit, title, initValues);
            obj.properties = { ...obj.properties, ...v.properties };
          } else {
            r = modelToFrScheme(d.children, edit, title, initValues);
          }
        } else {
          console.log('有类型的内连');
          r = modelToFrScheme(
            d.children,
            edit,
            title,
            initValues?.[d.map_name],
          );
        }
      } else {
        // type
        r = getSingleScheme(d, edit, initValues?.[d.map_name]);
      }
    }

    if (r) {
      obj.properties[d.map_name] = r;
    }
  }
  return obj;
};

const isPlainObject = (obj: any) =>
  Object.prototype.toString.call(obj) === '[object Object]';

// 当xrender array支持其他非object类型时就不需要他了
export const flatKeyMatch = (formData: any) => {
  let r = { ...formData };
  for (const [key, value] of Object.entries(r)) {
    if (isArray(value)) {
      const first = value?.[0];
      if (isPlainObject(first)) {
        if (first.hasOwnProperty('__flat')) {
          r[key] = value.map((b) => {
            return b?.['__flat'];
          });
        } else {
          value.map((dd, i) => {
            r[key][i] = flatKeyMatch(dd);
          });
        }
      }
    } else if (isPlainObject(value)) {
      if (!Object.keys(value as any)?.length) {
        delete r[key];
      } else {
        r[key] = flatKeyMatch(value);
      }
    }
  }
  return r;
};