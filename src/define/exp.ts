export interface tabItem {
  id: string | number;
  label: string;

  [key: string]: any;
}

export interface defaultField {
  _id: string;
  id: string;
  update_at: string;
  create_at: string;
}

export interface actionItem {
  name: string;
  req_uri: string;
  scheme?: string; // 表单数据 json str
}

export interface task extends defaultField {
  name: string;
  desc?: string;
  type: number;
  group?: string;
  content?: string;
  exp_time: string;
  to_user: string;
  create_user: string;
  success: boolean;
  action?: Array<actionItem>;
  msg?: string; // 操作结果
  allow_delete?: boolean;
}

export interface action extends defaultField {
  name: string;
  scheme: string;
  post_url: string;
  scope: string;
}

export interface permission {
  get?: boolean;
  delete?: boolean;
  put?: boolean;
  post?: boolean;
}

export interface fieldInfo {
  name: string;
  map_name: string;
  full_name: string;
  full_map_name: string;
  params_key: string;
  comment: string;
  level: string;
  kind: string;
  bson: Array<string>;
  json_tag: Array<string>;
  types: string;
  index: number;
  is_pk: boolean;
  is_obj_id: boolean;
  is_created: boolean;
  is_updated: boolean;
  is_deleted: boolean;
  is_default_wrap: boolean;
  is_time: boolean;
  is_geo: boolean;
  is_mab_inline: boolean;
  is_inline: boolean;
  children: Array<fieldInfo>;
  children_kind: string;
  custom_tag: string;
}

export interface modelInfo {
  map_name: string;
  full_path: string;
  alias: string;
  field_list: Array<fieldInfo>;
  flat_fields: Array<fieldInfo>;
}
