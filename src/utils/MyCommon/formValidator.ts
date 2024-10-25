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
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
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
  //经度校验
  longitude: async (rule, value, callback) => {
    const longitude = /^-?((1?[0-7]?\d(\.\d{1,16})?)|(180(\.0{1,16})?))$/;
    if (myCommon.isnull(value) || longitude.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('经度范围是-180至180，不超过16位小数');
    }
  },
  //纬度校验
  latitude: async (rule, value, callback) => {
    const latitude = /^-?(([0-8]?\d(\.\d{1,16})?)|(90(\.0{1,16})?))$/;
    if (myCommon.isnull(value) || latitude.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject('纬度范围是-90至90，不超过16位小数');
    }
  },
  //最小值
  min: async (rule, value, callback) => {
    if (parseFloat(value) < rule.min) {
      return Promise.reject(`最小值应大于${rule.min}`);
    }
    return Promise.resolve();
  },
  //最大值
  max: async (rule, value, callback) => {
    if (parseFloat(value) > rule.max) {
      return Promise.reject(`最大值应小于${rule.max}`);
    }
    return Promise.resolve();
  },
};
export default FormValidator;
