//日志
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';

const Option = {
  //获取日志列表
  GetLogList: function (params) {
    return defHttp.post({
      url: '/ViewLog/GetLogList',
      params,
    });
  },
  //获取系统日志目录信息
  GetLogDirectory: function (params) {
    return defHttp.post({
      url: '/ViewLog/GetLogDirectory',
      params,
    });
  },
  //获取指定文件压缩包
  GetLogFile: function (params) {
    return defHttp.post({
      url: '/ViewLog/GetLogFile',
      params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
      responseType: 'blob',
    });
  },
};
export default Option;
