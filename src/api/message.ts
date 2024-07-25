//信息
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';

const Message = {
  //获取列表
  GetMessages: function (params) {
    return defHttp.post({
      url: '/Message/GetMessages',
      params,
    });
  },
  //获取服务最新的报警状态
  GetServiceMsgTypeLast: function () {
    return defHttp.get(
      {
        url: '/Message/GetServiceMsgTypeLast',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
  //获取告警历史
  GetMessagesHis: function (params) {
    return defHttp.get({
      url: '/Message/GetMessagesHis/',
      params,
    });
  },
  //标记用户已读信息
  ReadMsg: function (params) {
    return defHttp.post({
      url: '/Message/ReadMsg',
      params,
    });
  },
  //标记用户已读信息
  OkMsg: function (params) {
    return defHttp.get({
      url: '/Message/OkMsg/',
      params,
    });
  },
  //获取服务每个类型的最新消息-简化版
  GetServiceMsgTypeLastSimple: function () {
    return defHttp.get({
      url: '/Message/GetServiceMsgTypeLastSimple',
    });
  },
  //获取修复内容
  GetRepair: function (params) {
    return defHttp.get({
      url: '/Message/GetRepair/',
      params,
    });
  },
  //更新简要修复内容
  UpdateRepair: function (params) {
    return defHttp.post({
      url: '/Message/UpdateRepair',
      params,
    });
  },
};
export default Message;
