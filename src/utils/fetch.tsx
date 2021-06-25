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
        id: id,
        password: password,
      },
    });
  },
  // 获取所有权限
  getAllPer: () => {
    return Req.get(`${v}/all_permissions`);
  },
  // 获取用户权限
  getUserPer:() => {
    return Req.get(`${v}/user_permissions`);
  },
  // 获取用户
  getUserList:() => {
    return Req.get(`${v}/self_users`);
  },
};

const Fetch = {
  ...req,
};

export default Fetch;
