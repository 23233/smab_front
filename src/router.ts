const ROUTER_PREFIX = '/';
const Main_Prefix = ROUTER_PREFIX + 'v';

const ROUTERS = {
  login: ROUTER_PREFIX + '/user/login',
  task: Main_Prefix,
  welcome: Main_Prefix + '/welcome',
  user: Main_Prefix + '/user',
  model: Main_Prefix + '/model',
  data: Main_Prefix + '/data',
  view: Main_Prefix + '/view',
};

export default ROUTERS;
export const Routes = [
  {
    path: ROUTER_PREFIX,
    component: './layout/layout',
    routes: [
      {
        path: ROUTER_PREFIX,
        redirect: ROUTERS.task,
      },
      {
        name: 'login',
        path: ROUTERS.login,
        component: './user/login/index',
      },
      {
        path: ROUTERS.task,
        component: './layout/SecurityLayout',
        routes: [
          {
            path: ROUTERS.task,
            redirect: ROUTERS.welcome,
          },
          {
            path: ROUTERS.welcome,
            name: '欢迎',
            component: './Welcome',
          },
          {
            path: ROUTERS.data,
            name: '报表',
            component: './user/manage/index',
          },
          {
            path: ROUTERS.view,
            name: '任务',
            component: './task/index',
          },
          {
            path: ROUTERS.user,
            name: '用户',
            component: './user/manage/index',
          },
          {
            path: ROUTERS.model,
            name: '模型',
            component: './model/index',
          },
        ],
      },
    ],
  },

  {
    component: './404',
  },
];
