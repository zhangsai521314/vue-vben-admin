// 公共api
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';
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
    return defHttp.get(
      {
        url: '/Common/text',
      }
    );
  },
};
export default common;
