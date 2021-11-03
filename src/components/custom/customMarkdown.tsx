import React, { useState } from 'react';
import 'bytemd/dist/index.min.css';
import { Editor, Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import { useMount } from 'ahooks';
import zh from 'bytemd/lib/locales/zh_Hans.json';
import './markdown.css';

const plugins = [
  gfm(),
  // Add more plugins here
];

interface p {
  value?: any;
  onChange?: (v: any) => void;

  [k: string]: any;
}

// 自定义markdown编辑器
const CustomMarkdown: React.FC<p> = ({ value, onChange, ...props }) => {
  const [v, setV] = useState<string>('');

  const change = (r: string) => {
    setV(r);
    onChange && onChange(r);
  };

  useMount(() => {
    if (value) {
      setV(value);
    }
  });

  return (
    <React.Fragment>
      <Editor
        {...props}
        value={v}
        plugins={plugins}
        onChange={change}
        mode={'split'}
        locale={zh}
        placeholder={'请按照markdown格式输入内容 暂未支持上传'}
      />
    </React.Fragment>
  );
};
export default CustomMarkdown;
