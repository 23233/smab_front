import React, { useRef, useState } from 'react';
import { useMount } from 'ahooks';
import { Input } from 'antd';
import { snakeCase } from 'lodash';
import { FolderOpenOutlined } from '@ant-design/icons';
import { openDrawerModelTable } from '@/components/drawerOpenTable';
import { getPer } from '@/pages/model/tools';
import { Tooltip } from 'antd';

interface p {
  value?: any;
  onChange?: (v: any) => void;

  [k: string]: any;
}

// 外键选择器 可input输入 也可以打开选择
const CustomFk: React.FC<p> = ({ value, onChange, ...props }) => {
  const [v, setV] = useState<string>('');
  const modalRef = useRef<any>();

  const change = (r: string) => {
    setV(r);
    onChange && onChange(r);
  };

  useMount(() => {
    if (value) {
      setV(value);
    }
  });

  const getValue = (obj: Record<string, any>, k: string) => {
    if (obj.hasOwnProperty(k)) {
      return obj?.[k];
    }
    if (obj?.hasOwnProperty(snakeCase(k))) {
      return obj?.[snakeCase(k)];
    }
    return undefined;
  };

  const openDrawer = () => {
    console.log('打开选择', props?.schema?.fk);
    modalRef.current = openDrawerModelTable({
      name: snakeCase(props?.schema?.fk),
      permission: getPer(
        props?.schema?.fk,
        (window as any)?.c_policy,
        (window as any)?.c_userInfo?.super,
      ),
      onSelect: (record: any) => {
        console.log('外键选中了', record);

        const mapCol = props?.schema?.fk_map || '_id';
        const mapList = mapCol.split('.');
        let data = record;
        let end = false;

        for (let i = 0; i < mapList.length; i++) {
          let k = mapList[i];
          const v = getValue(data, k);
          if (!v) {
            break;
          }
          data = v;
          if (i === mapList.length - 1) {
            end = true;
          }
        }

        if (end) {
          const value = data || '';
          change(value);
        }

        modalRef.current?.destroy();
      },
    });
  };

  return (
    <React.Fragment>
      <Input
        value={v}
        onChange={(e) => change(e.target.value)}
        addonBefore={
          <Tooltip title={`映射字段:${props?.schema?.fk_map || '_id'}`}>
            {snakeCase(props?.schema?.fk)}
          </Tooltip>
        }
        addonAfter={
          <FolderOpenOutlined title={'进行选择'} onClick={openDrawer} />
        }
      />
    </React.Fragment>
  );
};
export default CustomFk;
