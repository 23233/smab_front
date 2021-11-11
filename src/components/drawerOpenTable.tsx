import React, { useState } from 'react';
import { permission } from '@/define/exp';
import ReactDOM from 'react-dom';
import { Button, Drawer } from 'antd';
import { C } from '@/utils/fetch';
import PruneModalTable from '@/pages/model/pruneModalTable';

interface p {
  name: string;
  permission?: permission;
  onSelect?: (record: any) => void;
}

export const openDrawerModelTable = (p: p) => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  function close() {
    destroy();
  }

  function render() {
    setTimeout(() => {
      ReactDOM.render(<DrawerModelTable {...p} />, div);
    });
  }

  render();

  return {
    destroy: close,
  };
};

const DrawerModelTable: React.FC<p> = ({
  name,
  permission,
  onSelect,
  ...props
}) => {
  const [show, setShow] = useState<boolean>(true);

  const onSelectFunc = (record: any) => {
    onSelect && onSelect(record);
  };

  const checkOp = [
    {
      title: '选择',
      width: 80,
      render: (text: string, record: any) => {
        return (
          <div>
            <Button
              size={'small'}
              type={'link'}
              onClick={() => onSelectFunc(record)}
            >
              选择
            </Button>
          </div>
        );
      },
    },
  ] as Array<any>;

  return (
    <React.Fragment>
      <Drawer
        title={`外键${name}选择`}
        visible={show}
        onClose={() => setShow(false)}
        destroyOnClose={true}
        width={'70%'}
      >
        <PruneModalTable
          modelName={name}
          permission={permission}
          urlPrefix={C + '/'}
          beforeOp={checkOp}
        />
      </Drawer>
    </React.Fragment>
  );
};
export default DrawerModelTable;
