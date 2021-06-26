import React, { useEffect, useRef, useState } from 'react';
import { useMount, useSize } from 'ahooks';

export interface tabItem {
  id: string | number;
  label: string;
  [key: string]: any;
}

interface item extends tabItem {}

interface p {
  current?: item;
  defaultCurrent?: item;
  items: Array<item>;
  extra?: React.ReactNode;
  onReplaceClick?: (item: item) => void; // 当前选中点击
  onChange?: (item: item) => void;
}

// 可横向滚动的tab
const HorizontallyTabs: React.FC<p> = ({
  current,
  defaultCurrent,
  ...props
}) => {
  const [value, setValue] = useState<item>();
  // 使用了dom的能力 后期可以考虑换种方案
  const ref = useRef<HTMLDivElement>(null);
  const extraSize = useSize(ref);

  useEffect(() => {
    setValue(current);
  }, [current]);

  useMount(() => {
    if (defaultCurrent) {
      setValue(defaultCurrent);
    }
  });

  const onClick = (item: item) => {
    if (value?.id === item.id) {
      props?.onReplaceClick && props.onReplaceClick(item);
      return;
    }
    props?.onChange && props.onChange(item);
    setValue(item);
  };

  return (
    <div className="relative">
      <div
        className={`flex overflow-x-auto flex-none items-center no-scrollbar`}
        style={{ marginRight: extraSize.width && extraSize.width + 5 }}
      >
        {props.items.map((d, i) => {
          return (
            <div
              key={i}
              className={`flex-shrink-0 py-1 px-3 box-border border-b-2 ${
                value?.id === d.id ? ' border-blue-400' : 'border-transparent'
              }`}
              onClick={(e) => onClick(d)}
            >
              <div
                className={`transition-all h-7 text-base flex justify-center items-center ${
                  value?.id === d.id ? 'text-black font-bold' : 'text-gray-400'
                }`}
              >
                {d.label}
              </div>
              {d?.desc && (
                <p
                  className={`text-xs ${
                    value?.id === d.id
                      ? 'text-black opacity-80'
                      : 'text-gray-200'
                  }`}
                >
                  {d.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {props?.extra ? (
        <div
          ref={ref}
          className="absolute right-0 top-0 h-full flex items-center"
        >
          {props.extra}
        </div>
      ) : null}
    </div>
  );
};
export default HorizontallyTabs;
