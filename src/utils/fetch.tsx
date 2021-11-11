import Req, { prefix } from '@/utils/request';
import { loginRegReq } from '@/utils/req_interface';
import RestApiGen from '@/utils/restApiGen';

const p = `${prefix}${(window as any)?.smab?.prefix}`;

export const PREFIX = p;

export const v = p + '/v';

export const C = v + '/c';

const req = {
  // 登录
  accountLogin: (data: loginRegReq) => {
    return Req.post(`${p}/login`, {
      data: data,
    });
  },
  // 变更密码
  changePassword: (id: string, password: string) => {
    return Req.post(`${v}/change_password`, {
      data: {
        id: String(id),
        password: password,
      },
    });
  },
  // 获取用户权限
  getUserInfo: (uid?: string) => {
    return Req.get(`${v}/user_info`);
  },
  // 获取用户
  getUserList: () => {
    return Req.get(`${v}/self_users`);
  },
  // 新增用户
  addUser: (data: any) => {
    return Req.post(`${v}/self_users`, {
      data: data,
    });
  },
  // 修改用户基本信息
  editUserBase: (data: any) => {
    return Req.put(`${v}/self_users`, {
      data: data,
    });
  },
  // 修改用户权限
  editUserPermission: (data: any) => {
    return Req.put(`${v}/self_users_permissions`, {
      data: data,
    });
  },
  // 删除用户
  removeUser: (id: string) => {
    return Req.delete(`${v}/self_users/${id}`);
  },
  // 获取模型信息
  getModelInfo: (name: string) => {
    return Req.get(`${C}/model_info/${name}`);
  },
  getNormalModelInfo: (name: string) => {
    return Req.get(`${v}/model_info/${name}`);
  },
  // 任务变更完成/失败
  changeTaskSuccess: (id: string, success: boolean) => {
    return Req.post(`${v}/task_change_success`, {
      data: {
        id,
        success,
      },
    });
  },
  dashboardGetData: (uri: string, params: any) => {
    return Req.get(uri, {
      params: params,
    });
  },
};

const Fetch = {
  ...req,
  task: new RestApiGen(v + '/sm_task'),
  dashboard_screen: new RestApiGen(v + '/sm_dash_board_screen'),
  dashboard: new RestApiGen(v + '/sm_dash_board'),
  action: new RestApiGen(v + '/sm_action'),
};

export default Fetch;
