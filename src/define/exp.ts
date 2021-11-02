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

export interface formItem {
  label: string;
  key: string;
  type: string;
  slice: boolean;
  required: boolean;
  init_value?: string;
}

export interface actionItem {
  name: string;
  extra?: Array<formItem>;
  req_uri: string;
  form_data?: Array<formItem>;
}

export interface taskPackage {
  title: string;
  type: string;
  value: string;
}

export interface task extends defaultField {
  name: string;
  desc?: string;
  msg?: string; // 操作结果
  type: number;
  allow_change_success: boolean;
  exp_time: string;
  to_user: string;
  create_user: string;
  success: string;
  action?: Array<actionItem>;
  package?: Array<taskPackage>;
}

export interface action extends defaultField {
  name: string;
  scheme: string;
  post_url: string;
  scope: string;
}
