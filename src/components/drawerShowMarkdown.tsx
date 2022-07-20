import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Drawer } from 'antd';
import { Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';

import './markdown.less';

interface p {
  content: string;
  title?: string;
}

export const openDrawerMarkdown = (p: p) => {
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
      ReactDOM.render(<DrawerMarkdown {...p} />, div);
    });
  }

  render();

  return {
    destroy: close,
  };
};

const DrawerMarkdown: React.FC<p> = ({
  content,
  title = '查看内容',
  ...props
}) => {
  if (!content) {
    return null;
  }

  const [show, setShow] = useState<boolean>(true);

  const c = content
    .replaceAll('\\n', '\n')
    .replaceAll('\\r', '\n')
    .replaceAll('<br>', '\n');

  return (
    <React.Fragment>
      <Drawer
        title={title}
        visible={show}
        onClose={() => setShow(false)}
        destroyOnClose={true}
        width={'70%'}
      >
        <Viewer value={c} plugins={[gfm()]} />
      </Drawer>
    </React.Fragment>
  );
};
export default DrawerMarkdown;
