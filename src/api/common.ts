// 公共api
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';
const common = {
  //指定获取数据的url,请求类型
  Request: function name(url, params = {}, method = "post", headers = {}, mode: ErrorMessageMode = 'message') {
    if (method == "post") {
      return defHttp.post({
        url: url,
        params,
        headers
      }, {
        errorMessageMode: mode,
      });
    } else if (method == "get") {
      return defHttp.get({
        url: url,
        params,
        headers
      }, {
        errorMessageMode: mode,
      });
    }
  },
  //获取品类组合列表(下拉列表)
  GetCategoryGroupSimple: function (mode: ErrorMessageMode = 'none') {
    return defHttp.get({
      url: '/Common/GetCategoryGroupSimple',
    }, {
      errorMessageMode: mode,
    });
  },
};
export default common;
