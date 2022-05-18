import React, { useRef, useState } from 'react';
import { useMount } from 'ahooks';
import { Input } from 'antd';

import { PictureOutlined } from '@ant-design/icons';

import CONFIG from '@/utils/config';
import SsoPage from '@/components/custom/index';

interface p {
  value?: any;
  onChange?: (v: any) => void;

  [k: string]: any;
}

// 自定义文件上传 如果有publicKey 就打开sso跳转
const CustomFileUpload: React.FC<p> = ({ value, onChange, ...props }) => {
  const [v, setV] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);

  const change = (r: string) => {
    setV(r);
    onChange && onChange(r);
  };

  useMount(() => {
    if (value) {
      setV(value);
    }
  });

  const openDrawer = () => {
    console.log('打开图片上传', props);
    setShow(true);
  };

  const getUploadSuccess = (data: any) => {
    console.log('获取上传图片结果', data);
    if (data?.event === 'file_upload') {
      let last = data?.data?.urls?.pop();
      if (!last) {
        return;
      }

      // 如果是预览图 则读取预览图
      if (data.scheme?.thumbnail) {
        setV(last?.thumbnail);
        return;
      }
      setV(last?.origin);
    }
  };

  return (
    <React.Fragment>
      <div style={{ width: '100%' }}>
        <div>
          <Input
            value={v}
            placeholder={'请输入图片url地址'}
            onChange={(e) => change(e.target.value)}
            allowClear
            addonAfter={
              !!CONFIG.getWindowData().publicKey && (
                <PictureOutlined title={'进行上传'} onClick={openDrawer} />
              )
            }
            style={{ width: '100%' }}
          />
        </div>
        {show && (
          <div>
            <SsoPage
              fullUri={`uploads/${CONFIG.getWindowData().publicKey}`}
              onSuccess={getUploadSuccess}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
export default CustomFileUpload;
