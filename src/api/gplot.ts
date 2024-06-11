//拓扑图
import { defHttp } from '@/utils/http/axios';

const Gplot = {
  //根据ID获取详情
  GetGplot: function (params) {
    return defHttp.post({
      url: '/Gplot/GetGplot/',
      params,
    });
  },
  //获取列表
  GetGplotMain: function (params) {
    return defHttp.post({
      url: '/Gplot/GetGplotMain',
      params,
    });
  },
  //新增
  AddGplot: function (params) {
    return defHttp.post({
      url: '/Gplot/AddGplot',
      params,
    });
  },
  //编辑
  UpdateGplot: function (params) {
    return defHttp.post({
      url: '/Gplot/UpdateGplot',
      params,
    });
  },
  //删除
  DeleteService: function (params) {
    return defHttp.post({
      url: '/Gplot/DeleteService/',
      params,
    });
  },
  //获取元素
  GetGplotelements: function () {
    return defHttp.get({
      url: '/Gplot/GetGplotelements',
    });
  },
};
export default Gplot;
