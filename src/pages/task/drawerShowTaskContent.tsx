import React, { useEffect, useState } from 'react';

import { Drawer, Row, Card, List, Image } from 'antd';
import { taskPackage } from '@/define/exp';
import ReactDOM from 'react-dom';
import ReactJson from 'react-json-view';

const { Meta } = Card;

interface p {
  contents: Array<taskPackage>;
}

export const openDrawerTaskContent = (c: Array<taskPackage>) => {
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
      ReactDOM.render(<DrawerShowTaskContent contents={c} />, div);
    });
  }

  render();

  return {
    destroy: close,
  };
};

const DrawerShowTaskContent: React.FC<p> = ({ contents, ...props }) => {
  const [show, setShow] = useState<boolean>(true);

  const renders = () => {
    // 过滤出图片
    const imgs = contents.filter((d) => d.type === 'img');
    const texts = contents.filter((d) => d.type === 'text');
    const jsons = contents.filter((d) => d.type === 'json');
    return (
      <React.Fragment>
        <h4>图片内容</h4>
        {!!imgs?.length && (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 5,
              xxl: 5,
            }}
            dataSource={imgs}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  cover={<Image alt={item.title} src={item.value} />}
                >
                  <Meta title={item.title} />
                </Card>
              </List.Item>
            )}
          />
        )}
        <h4>文字内容</h4>

        {!!texts?.length && (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 5,
              xxl: 5,
            }}
            dataSource={texts}
            renderItem={(item) => (
              <List.Item>
                <Card title={item.title}>{item.value}</Card>
              </List.Item>
            )}
          />
        )}
        <h4>json内容</h4>
        {!!jsons?.length && (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 2,
              xxl: 3,
            }}
            dataSource={jsons}
            renderItem={(item) => (
              <List.Item>
                <ReactJson
                  src={JSON.parse(item.value)}
                  name={null}
                  displayDataTypes={false}
                  displayObjectSize={false}
                />
              </List.Item>
            )}
          />
        )}
      </React.Fragment>
    );
  };

  const renderItem = (d: taskPackage) => {
    switch (d.type) {
      case 'img':
        return <img src={d.value} alt={d.title} />;
      default:
        return (
          <p>
            {d.title}:{d.value}
          </p>
        );
    }
  };

  return (
    <React.Fragment>
      <Drawer
        visible={show}
        title={'任务参考内容'}
        width={'70%'}
        onClose={() => setShow(false)}
      >
        {renders()}
      </Drawer>
    </React.Fragment>
  );
};
export default DrawerShowTaskContent;
