// 公共api
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';
import { message } from 'ant-design-vue';

const common = {
  //指定获取数据的url,请求类型
  Request: function name(
    url,
    params = {},
    method = 'post',
    headers = {},
    mode: ErrorMessageMode = 'message',
  ) {
    if (method == 'post') {
      return defHttp.post(
        {
          url: url,
          params,
          headers,
        },
        {
          errorMessageMode: mode,
        },
      );
    } else if (method == 'get') {
      return defHttp.get(
        {
          url: url,
          params,
          headers,
        },
        {
          errorMessageMode: mode,
        },
      );
    }
  },
  text: function () {
    return defHttp.get({
      url: '/Common/text',
    });
  },
  //后台发送mq信息
  PushDDServerUpdateDBMq: function (params) {
    defHttp
      .post({
        url: '/Common/PushDDServerUpdateDBMq',
        params,
      })
      .then((data) => {
        if (data) {
          message.success('命令发送成功');
        } else {
          message.error('命令发送失败');
        }
      })
      .catch(() => {
        message.error('命令发送失败');
      });
  },
  //获取可以下载的版本文件
  GetDownVersion: function () {
    return defHttp.get({
      url: '/Common/GetDownVersion',
    });
  },
  //下载版本文件
  GetServiceFile: function (params) {
    return defHttp.get({
      url: '/Common/GetServiceFile',
      params,
      responseType: 'blob',
    });
  },
};
export default common;
