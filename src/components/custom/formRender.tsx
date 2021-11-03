import React from 'react';
import FormBase, { FRProps } from 'form-render';
import CustomTimePicker from '@/components/custom/customTime';
import CustomMarkdown from '@/components/custom/customMarkdown';

interface p extends FRProps {}

// 遵循官方的最佳实践 全局仅实例一个地方加载插件
// 暂无插件 但是可以留着

const SchemeForm: React.FC<p> = ({ ...props }) => {
  return (
    <FormBase
      widgets={{
        c_datetime: CustomTimePicker,
        c_markdown: CustomMarkdown,
      }}
      {...props}
    />
  );
};
export default SchemeForm;
