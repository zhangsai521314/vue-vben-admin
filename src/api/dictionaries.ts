//字典
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';

const Dictionaries = {
  //根据ID获取详情
  GetDictionaries: function (params) {
    return defHttp.post({
      url: '/Dictionaries/GetDictionaries/',
      params,
    });
  },
  //获取字典列表-下拉框key
  GetDictionariesSimpleKey: function (params) {
    return defHttp.post({
      url: '/Dictionaries/GetDictionariesSimpleKey',
      params,
    });
  },
  //获取字典列表-下拉框
  GetDictionariesimple: function (params) {
    return defHttp.post({
      url: '/Dictionaries/GetDictionariesSimple',
      params,
    });
  },
  //获取字典树
  GetDictionariesTree: function (params) {
    return defHttp.post({
      url: '/Dictionaries/GetDictionariesTree',
      params,
    });
  },
  //获取列表
  GetDictionariess: function (params) {
    return defHttp.post({
      url: '/Dictionaries/GetDictionariess',
      params,
    });
  },
  //新增字典
  AddDictionaries: function (params) {
    return defHttp.post({
      url: '/Dictionaries/AddDictionaries',
      params,
    });
  },
  //编辑字典
  UpdateDictionaries: function (params) {
    return defHttp.post({
      url: '/Dictionaries/UpdateDictionaries',
      params,
    });
  },
  //删除字典
  DeleteDictionaries: function (params) {
    return defHttp.post({
      url: '/Dictionaries/DeleteDictionaries/',
      params,
    });
  },
  //更改同步状态
  UpdateSync: function (params) {
    return defHttp.post({
      url: '/Dictionaries/UpdateSync/',
      params,
    });
  },
};
export default Dictionaries;
