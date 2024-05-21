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
const CirStatus = {
  //获取列表
  GetDDCirStatus: function (params) {
    return defHttp.post({
      url: '/DDServerCirStatus/GetDDCirStatus',
      params,
    });
  },
};
const DCStatus = {
  //获取列表
  GetDDCirStatus: function (params) {
    return defHttp.post({
      url: '/DDServerDCStatus/GetDDServerDCStatus',
      params,
    });
  },
};
const Lacci = {
  GetDDServerLacciSimple: function () {
    return defHttp.get({
      url: '/DDServerLacci/GetDDServerLacciSimple',
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
};
const MobileStatus = {
  //获取列表
  GetDDServerMobileStatus: function (params) {
    return defHttp.post({
      url: '/DDServerMobileStatus/GetDDServerMobileStatus',
      params,
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
export {
  Black,
  CirStatus,
  DCStatus,
  Lacci,
  Line,
  MobileStatus,
  RegisterHistory,
  Station,
  StationLacci,
};
