import { useState, useCallback, useEffect } from 'react';
import { useRequest, useSessionStorageState } from 'ahooks';
import CONFIG from '../utils/config';
import Fetch from '../utils/fetch';

export default function useAuthModel() {
  const [userInfo, setUserInfo] = useSessionStorageState(CONFIG.save.info);
  const [userToken, setUserToken] = useSessionStorageState(CONFIG.save.token);
  const [welCome, setWelCome] = useSessionStorageState(CONFIG.save.welcome);
  const [userPer, setUserPer] = useState([]);

  const { run: getUserInfoReq } = useRequest(Fetch.getUserInfo, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        setUserPer(resp.data?.policy?.data || []);
        setWelCome(resp.data?.welcome || {});
      }
    },
  });

  useEffect(() => {
    if (userToken) {
      getUserInfoReq();
    }
  }, []);

  const signin = useCallback((token, userInfo) => {
    // signin implementation
    // setUser(user from signin API)
    setUserInfo(userInfo);
    setUserToken(token);
    getUserInfoReq();
  }, []);

  const signout = useCallback(() => {
    setUserInfo();
    setUserToken();
    // history.push(Router.login);
  }, []);

  return {
    userInfo,
    setUserInfo,
    userToken,
    setUserToken,
    signin,
    signout,
    userPer,
    welCome,
  };
}
