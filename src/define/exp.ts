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
  built?: string; // 内置数据 json str
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
