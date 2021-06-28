import React, { useState } from 'react';
import { Drawer } from 'antd';
import ReactJson from 'react-json-view';
import ReactDOM from 'react-dom';

interface p {
  data: any;
  title?: string;
}
export const openDrawerFields = (data: any, title?: string) => {
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
      ReactDOM.render(<DrawerShowFields data={data} title={title} />, div);
    });
  }
  render();

  return {
    destroy: close,
  };
};

const DrawerShowFields: React.FC<p> = ({ data, title, ...props }) => {
  const [show, setShow] = useState<boolean>(true);

  return (
    <Drawer
      title={title || '字段信息'}
      visible={show}
      onClose={() => setShow(false)}
      destroyOnClose={true}
      width={'50%'}
    >
      <ReactJson
        src={data}
        name={null}
        displayDataTypes={false}
        displayObjectSize={false}
      />
    </Drawer>
  );
};
export default DrawerShowFields;
