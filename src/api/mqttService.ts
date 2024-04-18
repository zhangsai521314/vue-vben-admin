import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
const mqttService = {
  //获取还未增加mqtt信息的服务的类型
  GetServerTypes: function (params) {
    return defHttp.get({
      url: '/Mqtt/GetServerTypes/',
      params,
    });
  },
  //获取服务类型mqtt列表
  GetMqtts: function (params) {
    return defHttp.post({
      url: '/Mqtt/GetMqtts',
      params,
    });
  },
  //获取mqtt
  GetMqtt: function (params) {
    return defHttp.post({
      url: '/Mqtt/GetMqtt/',
      params,
    });
  },
  //新增mqtt信息
  AddMqtt: function (params) {
    return defHttp.post({
      url: '/Mqtt/AddMqtt',
      params,
    });
  },
  //更新mqtt信息
  UpdateMqtt: function (params) {
    return defHttp.post({
      url: '/Mqtt/UpdateMqtt',
      params,
    });
  },
  //删除mqtt信息
  DeleteMqtt: function (params) {
    return defHttp.post({
      url: '/Mqtt/DeleteMqtt/',
      params,
    });
  },
};
export default mqttService;
