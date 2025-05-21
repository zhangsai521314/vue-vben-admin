//日志
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';

const Option = {
  //获取日志列表
  GetLogList: function (params) {
    return defHttp.post({
      url: '/ViewLog/GetLogList',
      params,
    });
  },
};
export default Option;
