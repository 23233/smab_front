import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, List, Button, Select, Drawer, Input, message } from 'antd';
import './selectChat.less';
import charTypeJson from './chatType.json';
import ChatConfig from './chatConfig';

const { Option } = Select;

interface p {
  onSuccess: Function;
  show: boolean;
  onCancel: Function;
}

// 获取方式 https://charts.ant.design/demos/global
// var importJs=document.createElement('script')//在页面新建一个script标签
// importJs.setAttribute("type","text/javascript")//给script标签增加type属性
// importJs.setAttribute("src", 'https://ajax.microsoft.com/ajax/jquery/jquery-1.4.min.js') //给script标签增加src属性， url地址为cdn公共库里的
// document.getElementsByTagName("head")[0].appendChild(importJs)
// // 等待几秒后 执行下面
// var result = [];
// var s = $('.markdown').children();
// s.each(function(index) {
//   if ($(this).attr('tagName') === 'H2') {
//     var p = $(this).text();
//     var img = $('img', s[index + 1]).attr('src');
//     var href = window.location.protocol + "//" + window.location.host+$('a', s[index + 1]).attr('href');
//     var types = new URL(href).pathname.replace("/demos/","")
//     var reg = /-(\w)/g;
//     types = types.replace(reg,function($,$1){
//         return $1.toUpperCase();
//         })
//     result.push({ 'name': p, 'preview': img, 'href': href,'types':types.slice(0, 1).toUpperCase() + types.slice(1) });
//   }
// });

const SelectChatType: React.FC<p> = ({
  onSuccess,
  show,
  onCancel,
  ...props
}) => {
  const [step, setStep] = useState<number>(0);
  const [select, setSelect] = useState<any>();

  const success = (
    json: any,
    value: string,
    refresh_second: number,
    name: string,
  ) => {
    if (!select || !value) {
      message.warning('请选择图表类型并填写数据请求地址');
      return;
    }
    onSuccess(select, value, json, refresh_second, name);
  };

  const runSelect = (value: string) => {
    setSelect(charTypeJson.find((d: any) => d.name === value));
    setStep(1);
  };

  return (
    <Drawer
      visible={show}
      width={'70%'}
      title={'配置图表信息'}
      onClose={() => onCancel(false)}
    >
      {step === 0 && (
        <React.Fragment>
          <div>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="快速选择"
              optionFilterProp="children"
              onChange={runSelect}
              filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {charTypeJson.map((d: any, i: number) => {
                return (
                  <Option key={`ii${i}`} value={d.name}>
                    {d.name}
                  </Option>
                );
              })}
            </Select>
          </div>
          <div className={'mt-6'}>
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 4,
                xl: 5,
                xxl: 6,
              }}
              dataSource={charTypeJson}
              renderItem={(item: any) => (
                <List.Item style={{ marginBottom: 5 }}>
                  <div
                    title={item.name}
                    onClick={() => runSelect(item.name)}
                    className={`chat_li ${
                      select?.name === item.name ? 'shadow-lg' : ''
                    }`}
                  >
                    <img src={item.preview} alt={item.name} />
                    <p>{item.name}</p>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </React.Fragment>
      )}
      {step === 1 && (
        <React.Fragment>
          <ChatConfig
            selectChat={select}
            onSuccess={success}
            onBack={() => setStep(0)}
          />
        </React.Fragment>
      )}
    </Drawer>
  );
};
export default SelectChatType;
