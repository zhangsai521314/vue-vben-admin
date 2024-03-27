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
  GetServiceNewStatusMsg: function () {
    return defHttp.get(
      {
        url: '/Message/GetServiceNewStatusMsg',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
};
export default Message;
