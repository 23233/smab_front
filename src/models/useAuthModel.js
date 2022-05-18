import { useState, useCallback, useEffect } from 'react';
import { useRequest, useSessionStorageState } from 'ahooks';
import CONFIG from '../utils/config';
import Fetch from '../utils/fetch';

export default function useAuthModel() {
  const [userInfo, setUserInfo] = useSessionStorageState(CONFIG.save.info);
  const [userToken, setUserToken] = useSessionStorageState(CONFIG.save.token);
  const [welCome, setWelCome] = useSessionStorageState(CONFIG.save.welcome);
  const [userPer, setUserPer] = useState([]);
  const [publicKey, setPublicKey] = useSessionStorageState(
    CONFIG.save.publicKey,
  );

  const { run: getUserInfoReq } = useRequest(Fetch.getUserInfo, {
    manual: true,
    onSuccess: (resp) => {
      if (resp.response.status === 200) {
        let policy = resp.data?.policy?.data || [];
        window.c_policy = policy;
        setUserPer(policy);
        setWelCome(resp.data?.welcome || {});
        setPublicKey(resp.data?.public_key);
        window.smab.publicKey = resp.data?.public_key;
      }
    },
  });

  useEffect(() => {
    if (userToken) {
      getUserInfoReq();
    }
  }, []);

  useEffect(() => {
    window.c_userInfo = userInfo;
  }, [userInfo]);

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
    publicKey,
  };
}
