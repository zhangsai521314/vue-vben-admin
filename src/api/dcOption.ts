//调度台
import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { ErrorMessageMode } from '/#/axios';

const TelephoneBook = {
  //获取列表
  GetDCOptionTelephoneBooks: function (params) {
    return defHttp.post({
      url: '/DCOptionTelephoneBook/GetDCOptionTelephoneBooks',
      params,
    });
  },
  //根据id获取实体
  GetDCOptionTelephoneBook: function (params) {
    return defHttp.post({
      url: '/DCOptionTelephoneBook/GetDCOptionTelephoneBook/',
      params,
    });
  },
  //增加
  AddDCOptionTelephoneBook: function (params) {
    return defHttp.post({
      url: '/DCOptionTelephoneBook/AddDCOptionTelephoneBook',
      params,
    });
  },
  //编辑
  UpdateDCOptionTelephoneBook: function (params) {
    return defHttp.post({
      url: '/DCOptionTelephoneBook/UpdateDCOptionTelephoneBook',
      params,
    });
  },
  //删除
  DeleteDCOptionTelephoneBook: function (params) {
    return defHttp.post({
      url: '/DCOptionTelephoneBook/DeleteDCOptionTelephoneBook/',
      params,
    });
  },
};
const CallRecord = {
  //获取列表
  GetDCOptionCallRecords: function (params) {
    return defHttp.post({
      url: '/DCOptionCallRecord/GetDCOptionCallRecords',
      params,
    });
  },
  //获取录音文件地址
  GetCallRecordFilePath: function (params) {
    return defHttp.post({
      url: '/DCOptionCallRecord/GetCallRecordFilePath',
      params,
    });
  },
  //导出数据
  ExportData: function (params) {
    return defHttp.post({
      url: '/DCOptionCallRecord/ExportData',
      params,
      responseType: 'blob',
    });
  },
};
const KeypadRecord = {
  //获取列表
  GetDCOptionKeypadRecords: function (params) {
    return defHttp.post({
      url: '/DCOptionKeypadRecord/GetDCOptionKeypadRecords',
      params,
    });
  },
  //导出数据
  ExportData: function (params) {
    return defHttp.post({
      url: '/DCOptionKeypadRecord/ExportData',
      params,
      responseType: 'blob',
    });
  },
};
const ServiceTest = {
  //获取树列表
  GetDCOptionServiceTests: function (params) {
    return defHttp.post({
      url: '/DCOptionServiceTest/GetDCOptionServiceTests',
      params,
    });
  },
  //导出数据
  ExportData: function (params) {
    return defHttp.post({
      url: '/DCOptionServiceTest/ExportData',
      params,
      responseType: 'blob',
    });
  },
};
export { TelephoneBook, CallRecord, KeypadRecord, ServiceTest };
