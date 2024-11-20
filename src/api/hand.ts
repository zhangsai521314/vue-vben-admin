//手持台
import { defHttp } from '@/utils/http/axios';

const Hand = {
  //获取手持台列表
  GetHandList: function (params) {
    return defHttp.post({
      url: '/Hand/GetHandList',
      params,
    });
  },
  //获取手持台日志文件列表
  GetHandLog: function (params) {
    return defHttp.post({
      url: '/Hand/GetHandLog',
      params,
    });
  },
  //获取手持台的权限
  GetHandPower: function (params) {
    return defHttp.get({
      url: '/Hand/GetHandPower/',
      params,
    });
  },
  //保存手持台权限
  SaveHandPower: function (params) {
    return defHttp.post({
      url: '/Hand/SaveHandPower',
      params,
    });
  },
};
export default Hand;
