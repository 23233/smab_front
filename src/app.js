import React from 'react';
import './app.less';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import ZhCh from 'dayjs/locale/zh-cn';

// 引入dayjs 中文包 相对时间插件
require('dayjs/locale/zh-cn');
dayjs.locale(ZhCh);
dayjs.extend(relativeTime);
dayjs.extend(utc);
