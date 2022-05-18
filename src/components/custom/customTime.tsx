import React, { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import Moment from 'moment';
import { useMount } from 'ahooks';

interface p {
  value?: any;
  onChange?: (v: any) => void;

  [k: string]: any;
}

// 自定义时间选择 显示为本地时间 变更内容为utc时间
const CustomTimePicker: React.FC<p> = ({ value, onChange, ...props }) => {
  const [v, setV] = useState<string>();
  const change = (date: any, dateString: string) => {
    if (date) {
      const utc = Moment(date).utc().format('YYYY-MM-DDTHH:mm:ssZ');
      console.log('日期选择', dateString, utc);
      onChange && onChange(utc);
    } else {
      onChange && onChange(undefined);
    }
    setV(dateString);
  };
  useMount(() => {
    if (value) {
      setV(Moment.utc(value).local().format());
    }
  });

  return (
    <React.Fragment>
      <DatePicker
        {...props}
        value={v ? Moment(v) : undefined}
        onChange={change}
        showTime
        format={'YYYY-MM-DD HH:mm:ss'}
      />
    </React.Fragment>
  );
};
export default CustomTimePicker;
