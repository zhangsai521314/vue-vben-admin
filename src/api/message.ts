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
};
export default Message;
