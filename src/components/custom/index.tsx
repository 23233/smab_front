import React, { useEffect, useMemo } from 'react';

interface p {
  show?: boolean;
  uniqueId: string;
  fullUri: string;
  className?: string;
  onSuccess: (data: any, uniqueId: string) => void;
}

// sso页面跳转
const SsoPage: React.FC<p> = ({
  show = true,
  uniqueId,
  fullUri,
  className,
  onSuccess,
  ...props
}) => {
  const receiveMsg = (event: any) => {
    console.log('接收到事件', event);
    let origin = event.origin;
    const allow = ['https://resok.cn', 'https://www.resok.cn'];
    if (!allow.includes(origin)) return;
    onSuccess && onSuccess(JSON.parse(event.data), uniqueId);
  };

  useEffect(() => {
    window.addEventListener('message', receiveMsg, false);
    return () => {
      window.removeEventListener('message', receiveMsg);
    };
  }, []);

  return (
    <React.Fragment>
      {show && (
        <div className={className}>
          <iframe
            src={`https://resok.cn/${fullUri}?unique__id=${uniqueId}`}
            frameBorder="0"
            name={uniqueId}
            width={'100%'}
            height={'100%'}
          />
        </div>
      )}
    </React.Fragment>
  );
};
export default SsoPage;
