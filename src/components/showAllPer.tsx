import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useSelections, useUpdateEffect } from 'ahooks';
import { Checkbox, Row, Col, Typography } from 'antd';
import { Tree } from 'antd';

const { Title, Paragraph, Text, Link } = Typography;

interface p {
  onChange?: (checkKeys: React.Key[]) => void
}

const AllPerSelect: React.FC<p> = ({ onChange, ...props }) => {
  const { userInfo, allPer, userPer } = useModel('useAuthModel');
  const [treeData, setTreeData] = useState<Array<any>>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);


  useEffect(() => {
    if (!!allPer) {
      // 解析成children结构
      const result = [] as any;
      for (const [key, value] of Object.entries(allPer)) {
        const item = {
          title: key,
          key: key + '_i',
          children: getTree(value, key),
        };
        result.push(item);
      }
      setTreeData(result);
    }
  }, [allPer]);

  const getTree = (obj: any, prefix: string) => {
    if (Array.isArray(obj)) {
      return obj.map((d, i) => {
        return {
          title: d,
          key: prefix + '-' + d,
        };
      });
    } else {
      const result = [] as any;
      for (const [key, value] of Object.entries(obj)) {
        const item = {
          title: key,
          key: prefix + '-' + key + '_i',
          children: getTree(value, key),
        };
        result.push(item);
      }
      return result;
    }
  };

  const onCheck = (checkedKeysValue: React.Key[]) => {
    setCheckedKeys(checkedKeysValue);
  };


  useUpdateEffect(() => {
    const r = checkedKeys.filter((d) => !d.toString().endsWith('_i'));
    onChange && onChange(r);
  }, [checkedKeys]);


  return <React.Fragment>
    <div>
      <Tree
        checkable
        defaultExpandAll={true}
        // @ts-ignore
        onCheck={onCheck}
        checkedKeys={checkedKeys}
        treeData={treeData}
      />
    </div>
  </React.Fragment>;
};
export default AllPerSelect;
