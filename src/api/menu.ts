//菜单apiGetModelInfo
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';
const menu = {
  //获取菜单列表
  GetMenuList: function (params) {
    return defHttp.post({
      url: '/Menu/GetMenuList',
      params,
    });
  },
  //获取菜单
  GetMenuTree: function (params, mode: ErrorMessageMode = 'message') {
    return defHttp.post(
      {
        url: '/Menu/GetMenuTree',
        params,
      },
      {
        errorMessageMode: mode,
      },
    );
  },
  //获取菜单 a-select 标签
  GetMenuSimple: function (params, mode: ErrorMessageMode = 'message') {
    return defHttp.post(
      {
        url: '/Menu/GetMenuSimple',
        params,
      },
      {
        errorMessageMode: mode,
      },
    );
  },
  //根据ID获取用户菜单信息
  GetMenu: function (params) {
    return defHttp.post({
      url: '/Menu/GetMenu/',
      params,
    });
  },
  //删除菜单
  DeleteMenu: function (params) {
    return defHttp.post({
      url: '/Menu/DeleteMenu/',
      params,
    });
  },
  //添加菜单
  AddMenu: function (params) {
    return defHttp.post({
      url: '/Menu/AddMenu',
      params,
    });
  },
  //编辑菜单
  UpdateMenu: function (params) {
    return defHttp.post({
      url: '/Menu/UpdateMenu',
      params,
    });
  },
  //获取右键菜单配置
  GetRightMenus: function (params) {
    return defHttp.get({
      url: '/Menu/GetRightMenus',
      params,
    });
  },
};
export default menu;
