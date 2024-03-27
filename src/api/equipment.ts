//硬件设备
import { defHttp } from '@/utils/http/axios';
const Equipment = {
  //根据ID获取详情
  GetEquipment: function (params) {
    return defHttp.post({
      url: '/Equipment/GetEquipment/',
      params,
    });
  },
  //获取硬件设备列表
  GetEquipmentSimple: function (params) {
    return defHttp.post({
      url: '/Equipment/GetEquipmentSimple',
      params,
    });
  },
  //获取列表
  GetEquipments: function (params) {
    return defHttp.post({
      url: '/Equipment/GetEquipments',
      params,
    });
  },
  //新增硬件设备
  AddEquipment: function (params) {
    return defHttp.post({
      url: '/Equipment/AddEquipment',
      params,
    });
  },
  //编辑硬件设备
  UpdateEquipment: function (params) {
    return defHttp.post({
      url: '/Equipment/UpdateEquipment',
      params,
    });
  },
  //删除硬件设备
  DeleteEquipment: function (params) {
    return defHttp.post({
      url: '/Equipment/DeleteEquipment/',
      params,
    });
  },
};
export default Equipment;
