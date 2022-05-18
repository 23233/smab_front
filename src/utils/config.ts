interface windowData {
  prefix: string;
  name: string;
  publicKey?: string;
}

const CONFIG = {
  save: {
    token: 'smab_token',
    info: 'smab_user_info',
    welcome: 'smab_welcome',
    publicKey: 'smab_publicKey',
  },
  events: {
    tableRefresh: 'table_refresh',
  },
  getWindowData: () => {
    return ((window as any)?.smab || {}) as windowData;
  },
};
export default CONFIG;
