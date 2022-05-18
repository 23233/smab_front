import React, { useEffect } from 'react';

interface p {
  fullUri: string;
  className?: string;
  onSuccess: (data: any) => void;
}

// sso页面跳转
const SsoPage: React.FC<p> = ({ fullUri, className, onSuccess, ...props }) => {
  const receiveMsg = (event: any) => {
    let origin = event.origin;
    const allow = ['https://resok.cn', 'https://www.resok.cn'];
    if (!allow.includes(origin)) return;
    onSuccess && onSuccess(JSON.parse(event.data));
  };

  useEffect(() => {
    window.addEventListener('message', receiveMsg, false);
    return () => {
      window.removeEventListener('message', receiveMsg);
    };
  }, []);

  return (
    <React.Fragment>
      <div className={className}>
        <iframe
          src={`https://resok.cn/${fullUri}`}
          frameBorder="0"
          width={'100%'}
          height={'100%'}
        />
      </div>
    </React.Fragment>
  );
};
export default SsoPage;
