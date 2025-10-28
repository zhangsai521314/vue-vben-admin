import { defHttp } from '@/utils/http/axios';

const largeScreen = {
  //获取网管基本信息
  GetSysRequest: function () {
    return defHttp.get(
      {
        url: '/LargeScreen/GetSysRequest',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
  //获取设备的在线数量
  GetDeviceCount: function () {
    return defHttp.get(
      {
        url: '/LargeScreen/GetDeviceCount',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
  //获取车站的手持和电台的位置数量信息
  GetDeviceLocationCount: function () {
    return defHttp.get(
      {
        url: '/LargeScreen/GetDeviceLocationCount',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
  //获取线路位置信息
  GetMapLocation: function () {
    return defHttp.get(
      {
        url: '/LargeScreen/GetMapLocation',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
  //获取机车和人员位置等信息
  GetCirHandLocation: function () {
    return defHttp.get(
      {
        url: '/LargeScreen/GetCirHandLocation',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
  //获取服务状态
  GetServiceInfo: function () {
    return defHttp.get(
      {
        url: '/LargeScreen/GetServiceInfo',
      },
      {
        errorMessageMode: 'none',
      },
    );
  },
};
export default largeScreen;
