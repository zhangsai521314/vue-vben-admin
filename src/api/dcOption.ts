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
};

export { TelephoneBook, CallRecord };
