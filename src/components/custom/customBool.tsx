import React, { useEffect, useState } from 'react';
import { DatePicker, Switch } from 'antd';
import Moment from 'moment';
import { useMount } from 'ahooks';

interface p {
  value?: any;
  onChange?: (v: any) => void;

  [k: string]: any;
}

// 自定义布尔选择器
const CustomBoolean: React.FC<p> = ({ value, onChange, ...props }) => {
  const [v, setV] = useState<boolean>();

  const change = (checked: boolean) => {
    onChange && onChange(checked);
    setV(checked);
  };

  useMount(() => {
    if (value) {
      setV(!!value);
    }
  });

  return (
    <React.Fragment>
      <Switch
        checkedChildren="是"
        unCheckedChildren="否"
        checked={v}
        onChange={change}
      />
    </React.Fragment>
  );
};
export default CustomBoolean;
