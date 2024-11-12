//部门
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';

const Organization = {
  //根据ID获取详情
  GetOrganization: function (params) {
    return defHttp.post({
      url: '/Organization/GetOrganization/',
      params,
    });
  },
  //获取部门列表
  GetOrganizationSimple: function () {
    return defHttp.get({
      url: '/Organization/GetOrganizationSimple',
    });
  },
  //获取部门树
  GetOrganizationTree: function (params) {
    return defHttp.post({
      url: '/Organization/GetOrganizationTree',
      params,
    });
  },
  //获取列表
  GetOrganizations: function (params) {
    return defHttp.post({
      url: '/Organization/GetOrganizations',
      params,
    });
  },
  //新增部门
  AddOrganization: function (params) {
    return defHttp.post({
      url: '/Organization/AddOrganization',
      params,
    });
  },
  //编辑部门
  UpdateOrganization: function (params) {
    return defHttp.post({
      url: '/Organization/UpdateOrganization',
      params,
    });
  },
  //删除部门
  DeleteOrganization: function (params) {
    return defHttp.post({
      url: '/Organization/DeleteOrganization/',
      params,
    });
  },
  ///获取调度服务数据的线路和车站的上下级列表
  GetLineStationTree: function () {
    return defHttp.get({
      url: '/Organization/GetLineStationTree',
    });
  },
  GetLineStationSimple: function () {
    return defHttp.get({
      url: '/Organization/GetLineStationSimple',
    });
  },
};
export default Organization;
