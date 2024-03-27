//角色apiGetModelInfo
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';
const role = {
  //获取角色列表
  GetRoles: function (params) {
    return defHttp.post({
      url: '/Role/GetRoles',
      params
    });
  },
  //获取角色 a-select 标签
  GetRoleSimple: function (mode: ErrorMessageMode = 'none') {
    return defHttp
      .get({
        url: '/Role/GetRoleSimple',
      }, {
        errorMessageMode: mode,
      });
  },
  //根据ID获取用户角色信息
  GetRole: function (params) {
    return defHttp.post({
      url: '/Role/GetRole/',
      params,
    });
  },
  //删除角色
  DeleteRole: function (params) {
    return defHttp.post({
      url: '/Role/DeleteRole/',
      params,
    });
  },
  //添加角色
  AddRole: function (params) {
    return defHttp.post({
      url: '/Role/AddRole',
      params,
    });
  },
  //编辑角色
  UpdateRole: function (params) {
    return defHttp.post({
      url: '/Role/UpdateRole',
      params,
    });
  },
  //获取右键角色配置
  GetRightRoles: function (params) {
    return defHttp.get({
      url: '/Role/GetRightRoles',
      params
    });
  },
  //分配权限
  AssignPower: function (params) {
    return defHttp.post({
      url: '/Role/AssignPower',
      params,
    });
  },
  //获取角色权限
  GetRoleAssignPower: function (params) {
    return defHttp.post({
      url: '/Role/GetRoleAssignPower',
      params,
    });
  },
};
export default role;
