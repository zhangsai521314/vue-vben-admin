//自定义的表单验证
const FormValidator = {
  //非空校验。vue自带空对0也是空
  empty: async (rule, value, callback) => {
    if (myCommon.isnull(value)) {
      return Promise.reject('内容不能为空');
    } else {
      return Promise.resolve();
    }
  },
  //ip校验
  ip: async (rule, value, callback) => {
    const reg =
      /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/;
    if (myCommon.isnull(value) || reg.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('ip地址不正确');
    }
  },
  //手机号码校验
  phone: async (rule, value, callback) => {
    //手机格式
    const mobilePhone = /^1[3|4|5|7|8|9]\d{9}$/;
    if (myCommon.isnull(value) || mobilePhone.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('手机号码格式不正确');
    }
  },
  //电话校验
  phoneOrTele: async (rule, value, callback) => {
    //手机格式
    const mobilePhone = /^1[3|4|5|7|8|9]\d{9}$/;
    //座机格式
    const telePhone = /^((0\d{2,3})-)?(\d{7,8})$/;
    if (myCommon.isnull(value) || mobilePhone.test(value) || telePhone.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('电话号码格式不正确');
    }
  },
  //正整数校验
  positiveInteger: async (rule, value, callback) => {
    const number_int = /^[0-9]*$/;
    if (myCommon.isnull(value) || number_int.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('不是自然数');
    }
  },
};
export default FormValidator;
