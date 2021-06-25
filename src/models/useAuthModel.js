import { useState, useCallback, useEffect } from 'react';
import {
  useLocalStorageState,
  useMount,
  useRequest,
  useSessionStorageState,
} from 'ahooks';
import CONFIG from '../utils/config';
import Fetch from '../utils/fetch';

export default function useAuthModel() {
  let [userInfo, setUserInfo] = useSessionStorageState(CONFIG.save.info);
  let [userToken, setUserToken] = useSessionStorageState(CONFIG.save.token);
  const [userPer, setUserPer] = useState([]);

  const { run: getUserPer } = useRequest(Fetch.getUserPer, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        setUserPer(resp.data?.data || []);
      }
    },
  });

  useEffect(() => {
    if (userToken) {
      getUserPer();
    }
  }, []);

  const signin = useCallback((token, userInfo) => {
    // signin implementation
    // setUser(user from signin API)
    setUserInfo(userInfo);
    setUserToken(token);
    getUserPer();
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
  };
}
