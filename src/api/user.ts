import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';

const user = {
  //获取用户列表
  GetUsers: function (params) {
    return defHttp.post({
      url: '/User/GetUsers',
      params,
    });
  },
  //获取用户
  GetUser: function (params) {
    return defHttp.post({
      url: '/User/GetUser',
      params,
    });
  },
  //获取用户下拉列表
  GetUsersSimple: function () {
    return defHttp.get({
      url: '/User/GetUsersSimple',
    });
  },
  //获取用户信息
  GetUserMsg: function (params) {
    return defHttp.post({
      url: '/User/GetUserMsg',
      params,
    });
  },
  //阅读消息
  ReadMsg: function (params) {
    return defHttp.post({
      url: '/User/ReadMsg',
      params,
    });
  },
  //新增用户
  AddUser: function (params) {
    return defHttp.post({
      url: '/User/AddUser',
      params,
    });
  },
  //删除用户
  DeleteUser: function (params) {
    return defHttp.post({
      url: '/User/DeleteUser',
      params,
    });
  },
  //更新用户信息
  UpdateUser: function (params) {
    return defHttp.post({
      url: '/User/UpdateUser',
      params,
    });
  },
  //更新用户自定义配置
  UpdateUseSystemCustomr: function (params) {
    return defHttp.post({
      url: '/User/UpdateUseSystemCustomr',
      params,
    });
  },
  //验证用户名密码
  VerifyNamePwd: function (params) {
    return defHttp.post({
      url: '/User/VerifyNamePwd',
      params,
    });
  },
  //分配权限
  AssignPower: function (params) {
    return defHttp.post({
      url: '/User/AssignPower',
      params,
    });
  },
  //分配用户权限
  GetUserAssignPower: function (params) {
    return defHttp.post({
      url: '/User/GetUserAssignPower',
      params,
    });
  },
  //获取用户指定的所有权限（用户管理显示权限使用）
  GetUserAllPower: function (params) {
    return defHttp.post({
      url: '/User/GetUserAllPower',
      params,
    });
  },
};
export default user;
