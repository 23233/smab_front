import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import SimpleTable, { simpleTable } from '@/components/simpleTable';
import { Drawer } from 'antd';

interface p extends simpleTable {
  name: string;
}

export const openDrawerTable = (p: p) => {
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
      ReactDOM.render(<DrawerShowTable {...p} />, div);
    });
  }

  render();

  return {
    destroy: close,
  };
};

const DrawerShowTable: React.FC<p> = ({ name, ...props }) => {
  const [show, setShow] = useState<boolean>(true);

  return (
    <Drawer
      title={name || '字段信息'}
      visible={show}
      onClose={() => setShow(false)}
      destroyOnClose={true}
      width={'70%'}
    >
      <SimpleTable {...props} />
    </Drawer>
  );
};

export default openDrawerTable;
