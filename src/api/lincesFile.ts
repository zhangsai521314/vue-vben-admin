import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';

const lincesFile = {
  //获取授权文件列表
  GetLincesList: function (params) {
    return defHttp.post({
      url: '/Linces/GetLincesList',
      params,
    });
  },
  //上传手持台日志文件
  AddOrUpdateLinces: function (params) {
    return defHttp.post({
      url: '/Linces/AddOrUpdateLinces',
      params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    });
  },
};
export default lincesFile;
