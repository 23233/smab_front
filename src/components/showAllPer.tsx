import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import { useSelections, useUpdateEffect } from 'ahooks';
import { Tree } from 'antd';
import { DataNode } from 'rc-tree/lib/interface';

interface p {
  onChange?: (checkKeys: React.Key[]) => void;
}

// 选择用户权限
const AllPerSelect: React.FC<p> = ({ onChange, ...props }) => {
  const { userPer } = useModel('useAuthModel');
  const [treeData, setTreeData] = useState<Array<any>>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (!!userPer) {
      setTreeData(userPer);
    }
  }, [userPer]);

  const onCheck = (checkedKeysValue: React.Key[]) => {
    setCheckedKeys(checkedKeysValue);
  };

  useUpdateEffect(() => {
    const r = checkedKeys.filter((d) => !d.toString().endsWith('_i'));
    onChange && onChange(r);
  }, [checkedKeys]);

  return (
    <React.Fragment>
      <div>
        <Tree
          checkable
          defaultExpandAll={true}
          // @ts-ignore
          onCheck={onCheck}
          titleRender={(node: DataNode) => {
            // @ts-ignore
            return node?.alias || node.title;
          }}
          checkedKeys={checkedKeys}
          treeData={treeData}
        />
      </div>
    </React.Fragment>
  );
};
export default AllPerSelect;
