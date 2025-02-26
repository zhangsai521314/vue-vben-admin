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
  GetHand: function (params) {
    return defHttp.get({
      url: '/Hand/GetHand/',
      params,
    });
  },
  //新增手持台
  AddHand: function (params) {
    return defHttp.post({
      url: '/Hand/AddHand',
      params,
    });
  },
  //更新手持台
  UpdateHand: function (params) {
    return defHttp.post({
      url: '/Hand/UpdateHand',
      params,
    });
  },
  //更改手持台禁用启用
  UpdateHandDisable: function (params) {
    return defHttp.post({
      url: '/Hand/UpdateHandDisable',
      params,
    });
  },
};
export default Hand;
