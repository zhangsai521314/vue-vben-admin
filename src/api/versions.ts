import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';

const versions = {
  GetServerTypes: function () {
    return defHttp.get({
      url: '/VerSions/GetServerTypes',
    });
  },
  //获取软件类型列表
  GetVersions: function (params) {
    return defHttp.post({
      url: '/VerSions/GetVersions',
      params,
    });
  },
  //新增软件版本类型
  AddVersions: function (params) {
    return defHttp.post({
      url: '/VerSions/AddVersions',
      params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    });
  },
  //删除软件版本类型
  DeleteVersions: function (params) {
    return defHttp.post({
      url: '/VerSions/DeleteVersions/',
      params,
    });
  },
  //上传版本
  AddVersionsHis: function (params) {
    return defHttp.post({
      url: '/VerSions/AddVersionsHis',
      params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    });
  },
  //获取版本历史列表
  GetVersionsHis: function (params) {
    return defHttp.post({
      url: '/VerSions/GetVersionsHis/',
      params,
    });
  },
  //更改终端版本
  UpdateRunVersions: function (params) {
    return defHttp.post({
      url: '/VerSions/UpdateRunVersions/',
      params,
    });
  },
  //更改终端版本
  UpdateRunVersionsHis: function (params) {
    return defHttp.post({
      url: '/VerSions/UpdateRunVersionsHis/',
      params,
    });
  },
  //根据id获取版本信息
  GetVersion: function (params) {
    return defHttp.post({
      url: '/VerSions/GetVersion/',
      params,
    });
  },
  UpdateVersion: function (params) {
    return defHttp.post({
      url: '/VerSions/UpdateVersion',
      params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    });
  },
};
export default versions;
