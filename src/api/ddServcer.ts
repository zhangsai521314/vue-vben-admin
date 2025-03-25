//调度服务
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';

const Black = {
  //获取列表
  GetDDServerBlacks: function (params) {
    return defHttp.post({
      url: '/DDServerBlack/GetDDServerBlacks',
      params,
    });
  },
  //根据id获取实体
  GetDDServerBlack: function (params) {
    return defHttp.post({
      url: '/DDServerBlack/GetDDServerBlack/',
      params,
    });
  },
  //增加
  AddDDServerBlack: function (params) {
    return defHttp.post({
      url: '/DDServerBlack/AddDDServerBlack',
      params,
    });
  },
  //编辑
  UpdateDDServerBlack: function (params) {
    return defHttp.post({
      url: '/DDServerBlack/UpdateDDServerBlack',
      params,
    });
  },
  //删除
  DeleteDDServerBlack: function (params) {
    return defHttp.post({
      url: '/DDServerBlack/DeleteDDServerBlack/',
      params,
    });
  },
};

const DDDev = {
  //获取调度台\值班台列表
  GetDDServerDCStatus: function (params) {
    return defHttp.post({
      url: '/DDDev/GetDDServerDCStatus',
      params,
    });
  },
  //获取机车电台列表
  GetDDCirStatus: function (params) {
    return defHttp.post({
      url: '/DDDev/GetDDCirStatus',
      params,
    });
  },
  //获取列表
  GetDDServerMobileStatus: function (params) {
    return defHttp.post({
      url: '/DDDev/GetDDServerMobileStatus',
      params,
    });
  },
  GetDevFnList: function (params) {
    return defHttp.post({
      url: '/DDDev/GetDevFnList',
      params,
    });
  },
  GetDevFnSimple: function (params) {
    return defHttp.post({
      url: '/DDDev/GetDevFnSimple',
      params,
    });
  },
};
const Lacci = {
  //获取未绑定过车站的小区号
  GetDDServerLacciNoStationSimple: function () {
    return defHttp.get({
      url: '/DDServerLacci/GetDDServerLacciNoStationSimple',
    });
  },
  //获取列表
  GetDDServerTLaccis: function (params) {
    return defHttp.post({
      url: '/DDServerLacci/GetDDServerTLaccis',
      params,
    });
  },
  //根据id获取实体
  GetDDServerTLacci: function (params) {
    return defHttp.post({
      url: '/DDServerLacci/GetDDServerTLacci/',
      params,
    });
  },
  //增加
  AddDDServerTLacci: function (params) {
    return defHttp.post({
      url: '/DDServerLacci/AddDDServerTLacci',
      params,
    });
  },
  //编辑
  UpdateDDServerTLacci: function (params) {
    return defHttp.post({
      url: '/DDServerLacci/UpdateDDServerTLacci',
      params,
    });
  },
  //删除
  DeleteDDServerTLacci: function (params) {
    return defHttp.post({
      url: '/DDServerLacci/DeleteDDServerTLacci/',
      params,
    });
  },
};
const Line = {
  GetDDServerLineCodeSimple: function () {
    return defHttp.get({
      url: '/DDServerLine/GetDDServerLineCodeSimple',
    });
  },
  GetDDServerLineSimple: function () {
    return defHttp.get({
      url: '/DDServerLine/GetDDServerLineSimple',
    });
  },
  //获取列表
  GetDDServerLines: function (params) {
    return defHttp.post({
      url: '/DDServerLine/GetDDServerLines',
      params,
    });
  },
  //根据id获取实体
  GetDDServerLine: function (params) {
    return defHttp.post({
      url: '/DDServerLine/GetDDServerLine/',
      params,
    });
  },
  //增加
  AddDDServerLine: function (params) {
    return defHttp.post({
      url: '/DDServerLine/AddDDServerLine',
      params,
    });
  },
  //编辑
  UpdateDDServerLine: function (params) {
    return defHttp.post({
      url: '/DDServerLine/UpdateDDServerLine',
      params,
    });
  },
  //删除
  DeleteDDServerLine: function (params) {
    return defHttp.post({
      url: '/DDServerLine/DeleteDDServerLine/',
      params,
    });
  },
  //线路经纬度地图信息
  LineMapChange: function (params) {
    return defHttp.post({
      url: '/DDServerLine/LineMapChange',
      params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    });
  },
};
const RegisterHistory = {
  //获取列表
  GetDDServerRegisterHistorys: function (params) {
    return defHttp.post({
      url: '/DDServerRegisterHistory/GetDDServerRegisterHistorys',
      params,
    });
  },
};
const Station = {
  GetDDServerStationCodeSimple: function () {
    return defHttp.get({
      url: '/DDServerStation/GetDDServerStationCodeSimple',
    });
  },
  GetDDServerStationSimple: function () {
    return defHttp.get({
      url: '/DDServerStation/GetDDServerStationSimple',
    });
  },
  //获取列表
  GetDDServerStations: function (params) {
    return defHttp.post({
      url: '/DDServerStation/GetDDServerStations',
      params,
    });
  },
  //根据id获取实体
  GetDDServerStation: function (params) {
    return defHttp.post({
      url: '/DDServerStation/GetDDServerStation/',
      params,
    });
  },
  //增加
  AddDDServerStation: function (params) {
    return defHttp.post({
      url: '/DDServerStation/AddDDServerStation',
      params,
    });
  },
  //编辑
  UpdateDDServerStation: function (params) {
    return defHttp.post({
      url: '/DDServerStation/UpdateDDServerStation',
      params,
    });
  },
  //删除
  DeleteDDServerStation: function (params) {
    return defHttp.post({
      url: '/DDServerStation/DeleteDDServerStation/',
      params,
    });
  },
  //获取线路&车站的树-code
  GetDDServerStationTreeCode: function () {
    return defHttp.get({
      url: '/DDServerStation/GetDDServerStationTreeCode',
    });
  },
};
const StationLacci = {
  //获取列表
  GetDDServerStationLaccis: function (params) {
    return defHttp.post({
      url: '/DDServerStationLacci/GetDDServerStationLaccis',
      params,
    });
  },
  //获取实体
  GetDDServerStationLacci: function (params) {
    return defHttp.post({
      url: '/DDServerStationLacci/GetDDServerStationLacci',
      params,
    });
  },
  //增加&编辑
  AUDDServerStationLacci: function (params) {
    return defHttp.post({
      url: '/DDServerStationLacci/AUDDServerStationLacci',
      params,
    });
  },
  //删除
  DeleteDDServerStationLacci: function (params) {
    return defHttp.post({
      url: '/DDServerStationLacci/DeleteDDServerStationLacci',
      params,
    });
  },
};

const AddressingHis = {
  //获取列表
  GetDDAddressingHis: function (params) {
    return defHttp.post({
      url: '/AddressingHis/GetDDAddressingHis',
      params,
    });
  },
};
const LwLinkHis = {
  //获取列表
  GetDDLwLinkHis: function (params) {
    return defHttp.post({
      url: '/LwLinkHis/GetDDLwLinkHis',
      params,
    });
  },
};
const LwStatusHis = {
  //获取列表
  GetDDLwStatusHis: function (params) {
    return defHttp.post({
      url: '/LwStatusHis/GetDDLwStatusHis',
      params,
    });
  },
};
export {
  Black,
  DDDev,
  Lacci,
  Line,
  RegisterHistory,
  Station,
  StationLacci,
  AddressingHis,
  LwLinkHis,
  LwStatusHis,
};
