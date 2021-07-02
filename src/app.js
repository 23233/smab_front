import React from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
import './app.less';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

// 引入dayjs 中文包 相对时间插件
require('dayjs/locale/zh-cn');
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
dayjs.extend(utc);
