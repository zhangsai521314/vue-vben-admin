import { defHttp } from '@/utils/http/axios';

const performance = {
  //获取性能数据列表
  GetPerformances: function (params) {
    return defHttp.post({
      url: '/Performance/GetPerformances',
      params,
    });
  },
  //获取用户订阅主题
  GetUserSubscribes: function (params) {
    return defHttp.post({
      url: '/Performance/GetUserSubscribes',
      params,
    });
  },
  //用户订阅主题
  UserSubscribeTopic: function (params) {
    return defHttp.post({
      url: '/Performance/UserSubscribeTopic',
      params,
    });
  },
  //取消用户订阅主题
  CancelUserSubscribeTopic: function (params) {
    return defHttp.post({
      url: '/Performance/CancelUserSubscribeTopic',
      params,
    });
  },
};
export default performance;
