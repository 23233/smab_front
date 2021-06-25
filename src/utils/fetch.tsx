import Req, { prefix } from '@/utils/request';
import { loginRegReq } from '@/utils/req_interface';

const p = `${prefix}${(window as any)?.smab?.prefix}`;

const v = p + '/v';

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
  getUserPer: (uid?: string) => {
    return Req.get(`${v}/user_permissions`);
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
};

const Fetch = {
  ...req,
};

export default Fetch;
