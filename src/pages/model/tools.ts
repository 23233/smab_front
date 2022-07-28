// 模型转换为json
import { isArray } from 'lodash';
import { customTagParse, isHidden } from '@/utils/tools';
import { useModelRef } from '@/pages/model/useModelPer';
import { fieldInfo } from '@/define/exp';

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
    console.log('geo scheme 解析 ', initValue);
    return {
      title: title,
      type: 'object',
      properties: {
        type: {
          title: 'geo类型',
          type: 'string',
          enum: ['Point'],
          default: 'Point',
          width: '50%',
        },
        coordinates: {
          title: '经纬度',
          type: 'array',
          min: 2,
          max: 2,
          width: '50%',
          default: edit
            ? initValue?.coordinates
            : [{ __flat: undefined }, { __flat: undefined }],
          items: {
            type: 'object',
            properties: {
              __flat: {
                type: 'number',
                placeholder: 'lat优先(-180 - 180) lng(-85 - 85)',
              },
            },
          },
        },
      },
    };
  }

  const kind = d.kind;

  let r = {
    title: title,
    type: 'string',
    default: edit ? initValue : undefined,
    widget: 'input',
    placeholder: '请输入内容',
  } as any;
  if (d.is_obj_id) {
    r.min = 24;
    r.max = 24;
  }

  if (
    kind.startsWith('int') ||
    kind.startsWith('uint') ||
    kind.startsWith('float')
  ) {
    const mx = numberTypeRule(kind);
    r.type = 'number';
    r.min = mx.min;
    r.max = mx.max;
    r.widget = 'c_number';
    r.placeholder = '请输入数字';
    r.props = {
      style: {
        width: '100%',
      },
    };
  }
  if (kind === 'bool') {
    r.type = 'boolean';
    r.widget = 'c_bool';
  }

  const customTag = customTagParse(d.custom_tag);
  console.log('customTag', d.comment || d.map_name, customTag);
  if (customTag?.t) {
    switch (customTag?.t) {
      case 'textarea':
        r.type = 'string';
        r.widget = 'textarea';
        r.props = {
          autoSize: { minRows: 3, maxRows: 30 },
        };
        break;
      case 'markdown':
        r.type = 'string';
        r.widget = 'c_markdown';
        break;
      case 'img':
        r.type = 'string';
        r.widget = 'c_img_upload';
        if (customTag.hasOwnProperty('thumbnail')) {
          r.thumbnail = true;
        }
        break;
    }
  }
  // 如果存在外键
  if (customTag?.fk) {
    r.type = 'string';
    r.widget = 'c_fk';
    r.fk = customTag.fk;
    r.fk_map = customTag?.col;
  }

  return r;
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

  const r = {
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
  } as any;

  const customTag = customTagParse(d.custom_tag);

  // 如果有外键
  if (customTag?.fk) {
    r.items.properties.__flat.widget = 'c_fk';
    r.items.properties.__flat.fk = customTag.fk;
    r.items.properties.__flat.fk_map = customTag?.col;
  }

  if (customTag?.t) {
    switch (customTag?.t) {
      case 'img':
        r.items.properties.__flat.widget = 'c_img_upload';
        if (customTag.hasOwnProperty('thumbnail')) {
          r.items.properties.__flat.thumbnail = true;
        }
        break;
    }
  }

  // todo 等待解决 https://x-render.gitee.io/form-render/schema/schema#items 目前仅支持对象
  return r;
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
    if (isHidden(d, 'form') || isHidden(d, edit ? 'edit' : 'add')) {
      continue;
    }

    let r: any;
    if (d.is_default_wrap) {
      if (!edit) {
        continue;
      }
      const v = modelToFrScheme(d.children, edit, '', initValues);
      obj.properties = { ...obj.properties, ...v.properties };
    } else {
      let title = d.comment || d.map_name;
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
          console.log('is_inline', d);
          // 如果指定了json标签 那么新增和修改必须变为json形式`
          if (d?.json_name) {
            r = modelToFrScheme(d.children, edit, title, initValues);
            obj.properties[d?.json_name] = r;
            continue;
          } else {
            // 匹配两种情况 bson:",inline"  bson:"field,inline"
            if (d.bson?.[0] != 'inline') {
              // bson:",inline"
              if (d.bson?.[0] == ',') {
                console.warn(
                  `${title} bson标签为默认名称 可能json解析会失败 最好删掉,号 仅使用inline`,
                  d.bson,
                );
                r = modelToFrScheme(d.children, edit, d?.name, initValues);
              } else {
                r = modelToFrScheme(d.children, edit, title, initValues);
              }
            } else {
              // 匹配这个 bson:"inline"
              const v = modelToFrScheme(d.children, edit, title, initValues);
              obj.properties = { ...obj.properties, ...v.properties };
            }
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
      const key = d.json_name || d.bson_name || d.name;
      obj.properties[key] = r;
    }
  }

  return sortScheme(obj);
};

interface scheme {
  displayType: string;
  properties: Record<string, any>;
  type: string;
}

export const sortScheme = (scheme: scheme) => {
  let array = {} as any;
  let obj = {} as any;
  let other = {} as any;
  for (const [key, value] of Object.entries(scheme?.properties)) {
    switch (value?.type) {
      case 'object':
        obj[key] = value;
        break;
      case 'array':
        array[key] = value;
        break;
      default:
        other[key] = value;
        break;
    }
  }

  return {
    ...scheme,
    properties: {
      ...other,
      ...obj,
      ...array,
    },
  };
};

export const schemeGetJson = (scheme: scheme) => {
  let result = {} as any;

  for (const [key, value] of Object.entries(scheme?.properties)) {
    switch (value.type) {
      case 'object':
        result[key] = schemeGetJson(value);
        break;
      default:
        result[key] = value?.default;
    }
  }

  return result;
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

export const objIsGeo = (jsonData: any) => {
  return (
    jsonData &&
    jsonData.hasOwnProperty('type') &&
    jsonData.hasOwnProperty('coordinates')
  );
};

//
export const geoAddFit = (formData: any) => {
  let r = { ...formData };
  for (const [key, value] of Object.entries(r)) {
    // 如果是个对象
    if (isPlainObject(value)) {
      if (objIsGeo(value)) {
        const v = value as Record<string, any>;
        if (!v?.coordinates?.length) {
          delete r[key];
        }
      } else {
        r[key] = geoAddFit(value);
      }
    }
  }
  return r;
};

export const getPer = (
  modelName: string,
  userPer: any,
  isSuperUser?: boolean,
): useModelRef => {
  let r = {
    get: false,
    post: false,
    put: false,
    delete: false,
  } as useModelRef;
  if (!!userPer) {
    if (isSuperUser) {
      return {
        get: true,
        post: true,
        put: true,
        delete: true,
      } as useModelRef;
    }
    userPer.map((d: any) => {
      if (d.key === 'model_i') {
        d?.children?.map((b: any) => {
          if (b.title === modelName) {
            b?.children.map((c: any) => {
              switch (c.title) {
                case 'get':
                  r.get = true;
                  break;
                case 'post':
                  r.post = true;
                  break;
                case 'put':
                  r.put = true;
                  break;
                case 'delete':
                  r.delete = true;
                  break;
              }
            });
          }
        });
      }
    });
  }
  return r;
};
