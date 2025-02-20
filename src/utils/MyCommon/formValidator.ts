import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();

//自定义的表单验证
const FormValidator = {
  //非空校验。vue自带空对0也是空
  empty: async (rule, value, callback) => {
    if (myCommon.isnull(value)) {
      return Promise.reject(t('view.contentCannotBeEmpty'));
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
      return Promise.reject(t('view.ipAddressIsIncorrect'));
    }
  },
  //手机号码校验
  phone: async (rule, value, callback) => {
    //手机格式
    const mobilePhone = /^1[3|4|5|7|8|9]\d{9}$/;
    if (myCommon.isnull(value) || mobilePhone.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(t('view.mobileNumberFormatError'));
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
      return Promise.reject(t('view.phoneNumberFormatError'));
    }
  },
  //正整数校验
  positiveInteger: async (rule, value, callback) => {
    const number_int = /^[0-9]*$/;
    if (myCommon.isnull(value) || number_int.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(t('view.notANaturalNumber'));
    }
  },
  //经度校验
  longitude: async (rule, value, callback) => {
    const longitude = /^-?((1?[0-7]?\d(\.\d{1,16})?)|(180(\.0{1,16})?))$/;
    if (myCommon.isnull(value) || longitude.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(t('view.longitudeRules'));
    }
  },
  //纬度校验
  latitude: async (rule, value, callback) => {
    const latitude = /^-?(([0-8]?\d(\.\d{1,16})?)|(90(\.0{1,16})?))$/;
    if (myCommon.isnull(value) || latitude.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(t('view.latitudeRules'));
    }
  },
  //最小值
  min: async (rule, value, callback) => {
    if (parseFloat(value) < rule.min) {
      return Promise.reject(t('view.La valeur minimale doit être supérieure à', [rule.min]));
    }
    return Promise.resolve();
  },
  //最大值
  max: async (rule, value, callback) => {
    if (parseFloat(value) > rule.max) {
      return Promise.reject(t('view.maxValueShouldBeLessThan', [rule.max]));
    }
    return Promise.resolve();
  },
};
export default FormValidator;
