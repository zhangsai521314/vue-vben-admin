//软件服务
import { defHttp } from '@/utils/http/axios';

const Software = {
  //根据ID获取详情
  GetService: function (params) {
    return defHttp.post({
      url: '/Software/GetService/',
      params,
    });
  },
  //获取服务列表-下拉框
  GetServicesSimple: function (params) {
    return defHttp.post({
      url: '/Software/GetServicesSimple',
      params,
    });
  },
  //获取列表
  GetServices: function (params) {
    return defHttp.post({
      url: '/Software/GetServices',
      params,
    });
  },
  //新增软件服务
  AddService: function (params) {
    return defHttp.post({
      url: '/Software/AddService',
      params,
    });
  },
  //编辑软件服务
  UpdateService: function (params) {
    return defHttp.post({
      url: '/Software/UpdateService',
      params,
    });
  },
  //删除软件服务
  DeleteService: function (params) {
    return defHttp.post({
      url: '/Software/DeleteService/',
      params,
    });
  },
  //获取软件服务树上传性能数据的
  GetServiceSimpleUppDatas: function (params) {
    return defHttp.get({
      url: '/Software/GetServiceSimpleUppDatas',
      params,
    });
  },
  //获取服务的各种状态
  GetServiceStatus: function (params) {
    return defHttp.post({
      url: '/Software/GetServiceStatus',
      params,
    });
  },
};
export default Software;
