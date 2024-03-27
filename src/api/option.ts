//字典
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';
const Option = {
  //根据ID获取详情
  GetOption: function (params) {
    return defHttp.post({
      url: '/Option/GetOption/',
      params,
    });
  },
  //获取所有选项
  GetAllOptionSimple: function (params) {
    return defHttp.post({
      url: '/Option/GetAllOptionSimple',
      params,
    });
  },
  //获取字典列表
  GeOptionts: function (params) {
    return defHttp.post({
      url: '/Option/GeOptionts',
      params,
    });
  },
  //新增
  AddOption: function (params) {
    return defHttp.post({
      url: '/Option/AddOption',
      params,
    });
  },
  //编辑
  UpdateOption: function (params) {
    return defHttp.post({
      url: '/Option/UpdateOption',
      params,
    });
  },
  //删除
  DeleteOption: function (params) {
    return defHttp.post({
      url: '/Option/DeleteOption/',
      params,
    });
  },
};
export default Option;
