//公共方法
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();

let id = 0;
//其他扩展
String.prototype.replaceAll = function (f, e) {
  const reg = new RegExp(f, 'g');
  return this.replace(reg, e);
};

const Common = {
  //获取加解密密秘钥-禁止外传
  getCryptogramKey() {
    return {
      cryptoType: 'sm2',
      sm2: {
        publicKey:
          '048a39b1c0800a2b01d93cc7a5d7c2d4cb20d1a2b062b52dba9dbb36ebf5ac996f234213978318d78a2e4a374317e4e2397d18803187540a8392b65913ba5746db',
        privateKey: 'cf78bbd30b569643c2c26d6a12f4a82c1a2c6a0f0be656649fa4e3db8e95726e',
      },
      sm4: {
        key: '0123456789txceeffetxce9876543210',
        iv: 'txce98c7c6fdtxce0402f804c33dtxce',
      },
    };
  },
  //判断值是否为空
  isnull(data) {
    if (
      !_.isBoolean(data) &&
      (_.isNull(data) ||
        _.isUndefined(data) ||
        (_.isString(data) && data.trim() == '') ||
        (!_.isNumber(data) && _.isEmpty(data)) ||
        (_.isObject(data) && Object.keys(data).length === 0))
    ) {
      return true;
    }
    return false;
  },
  //获取url参数
  getQuery(name) {
    return Common.getQueryByUrl(window.location.href, name);
  },
  //获取url参数
  getQueryByUrl(url, name) {
    if (!Common.isnull(url)) {
      const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
      if (url.indexOf('?') != -1) {
        url = url.substring(url.indexOf('?') + 1);
      }
      const r = url.match(reg);
      if (r != null) return unescape(r[2]);
      return '';
    }
  },
  getQuerys(names) {
    const re = {};
    names.forEach((name) => {
      re[name] = Common.getQuery(name);
    });
    return re;
  },
  //随机id
  uniqueId() {
    return (
      'i' + Math.random().toString(36).substr(3, 3) + Number(`${Date.now()}${++id}`).toString(36)
    );
  },
  //获取guid
  getGuid() {
    return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      })
      .replaceAll('-', '');
  },
  //获取随机颜色
  getColor: function () {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  },
  //使用第二对象属性的值替换第一个对象存在的属性的值
  objectReplace(o1, o2) {
    for (const key in o1) {
      if (o2.hasOwnProperty(key)) {
        o1[key] = _.cloneDeep(o2[key]);
      }
    }
  },
  //拷贝对象2中对象1存在的键给对象1
  objectToObject(obj, obj2) {
    for (const i in obj2) {
      if ($.isPlainObject(obj[i])) {
        this.objectToObject(obj[i], obj2[i]);
      } else {
        obj[i] = obj2[i];
      }
    }
  },
  //根据指定属性，指定值在对象数组中获取对象
  //allDatas数据，key值，keyStr值的键名，childrenStr子集的键名
  arrayFindOb(allDatas, key, keyStr, childrenStr) {
    let data = allDatas.find((m) => m[keyStr] == key);
    if (data) {
      return data;
    } else {
      for (let index = 0; index < allDatas.length; index++) {
        data = Common.arrayFindOb(allDatas[index][childrenStr], key, keyStr, childrenStr);
        if (data) {
          break;
        }
      }
    }
    return data;
  },
  //把父子级转换为不是父子级
  generateList(allList, treeList, chaildrenKey) {
    if (treeList != null) {
      for (let i = 0; i < treeList.length; i++) {
        allList.push(treeList[i]);
        if (treeList[i][chaildrenKey] && treeList[i][chaildrenKey].length > 0) {
          this.generateList(allList, treeList[i].children, chaildrenKey);
        }
      }
    }
  },
  //获取随机数num表示获取随机数的个数
  getRandomNumber(min, max, nums) {
    min = parseInt(min);
    max = parseInt(max);
    const num = [];
    let Range;
    let Rand;
    if (Common.isnull(nums)) {
      nums = 1;
    }
    nums = parseInt(nums);
    for (let i = 0; i < nums; i++) {
      Range = max - min;
      Rand = Math.random();
      num.push(min + Math.round(Rand * Range));
    }
    return num.length == 1 ? num[0] : num;
  },
  //数组分页
  paging(pageNo, pageSize, array) {
    if (pageSize == -1) {
      return array;
    }
    const offset = (pageNo - 1) * pageSize;
    const newArr = [];
    if (offset + pageSize >= array.length) {
      for (let i = offset; i < array.length; i++) {
        newArr.push(_.cloneDeep(array[i]));
      }
    } else {
      for (let i = offset; i < offset + pageSize; i++) {
        newArr.push(_.cloneDeep(array[i]));
      }
    }
    return newArr;
  },
  //获取时间a表示当前时间+a或-a天的时间,b是时间的格式YYYY年MM月DD日 hh时mm分ss秒  YYYY/MM/DD hh:mm:ss, YYYY-MM-DD hh:mm:ss
  getDate(a, b) {
    if (this.isnull(a)) {
      a = 0;
    }
    if (this.isnull(b)) {
      b = 'YYYY-MM-DD hh:mm:ss';
    }
    b = b.replace('yyyy', 'YYYY').replace('dd', 'DD').replace('HH', 'hh');
    const digit = function (a) {
      return 10 > a ? '0' + (0 | a) : a;
    };
    const parse = function (a, d, e) {
      return (
        (a = a.concat(d)),
        e.replace(/YYYY|MM|DD|hh|mm|ss/g, function () {
          return (a.index = 0 | ++a.index), digit(a[a.index]);
        })
      );
    };
    const d = new Date(
      0 | a
        ? (function (a) {
            return 864e5 > a ? +new Date() + 864e5 * a : a;
          })(parseInt(a))
        : +new Date(),
    );
    return parse(
      [d.getFullYear(), d.getMonth() + 1, d.getDate()],
      [d.getHours(), d.getMinutes(), d.getSeconds()],
      b,
    );
  },
  //获取时间戳
  getTimeStamp() {
    return new Date() * 1;
  },
  //结束时间是否大于开始时间
  dateCompare(start, end) {
    if (this.isnull(end)) {
      return false;
    }
    if (start.length == 13) {
      start = start + ':00:00';
    }
    if (end.length == 13) {
      end = end + ':00:00';
    }
    const startDate = new Date(start.replace(/-/g, '/'));
    const endDate = new Date(end.replace(/-/g, '/'));
    if (endDate.toString() == startDate.toString()) {
      return false;
    } else {
      return endDate > startDate;
    }
  },
  //计算时间相差
  dateDiff: function (start, end, type) {
    start = start.length == 10 ? start + ' 00:00:00' : start;
    start = start.length == 13 ? start + ':00:00' : start;
    end = end.length == 10 ? end + ' 00:00:00' : end;
    end = end.length == 13 ? end + ':00:00' : end;
    let l = 0;
    let sdate = new Date();
    let edate = new Date();
    switch (type) {
      case 'd':
        //天
        l = 24 * 60 * 60 * 1000;
        start = start.split(' ')[0];
        end = end.split(' ')[0];
        sdate = new Date(start);
        edate = new Date(end);
        break;
      case 'h':
        //时
        l = 60 * 60 * 1000;
        start = start.split(' ')[0] + ' ' + start.split(' ')[1].split(':')[0] + ':00:00';
        end = end.split(' ')[0] + ' ' + end.split(' ')[1].split(':')[0] + ':00:00';
        sdate = new Date(start);
        edate = new Date(end);
        break;
      case 'f':
        //分
        l = 60 * 1000;
        sdate = new Date(start);
        edate = new Date(end);
        break;
      case 's':
        // 秒
        l = 1000;
        sdate = new Date(start);
        edate = new Date(end);
        break;
    }
    return (edate - sdate) / l;
  },
  dateDiff_: function (start, end, type) {
    return this.dateDiff(
      dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
      dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
      type,
    );
  },
  //当前时间的字符串
  nowTimeStr(format = 'YYYYMMDDHHmmss') {
    const ntime = _.now();
    return dayjs(ntime).format(format);
  },
  //根据字符串分割获取对象指定属性
  getStringFieldOb: function (stringField, langData) {
    if (!_.isObject(langData)) {
      return '';
    }
    let getFieldTarget = '';
    const fieldsList = stringField.split('|');
    if (fieldsList.length > 0 && Object.keys(langData).length > 0) {
      for (let index = 0; index < fieldsList.length; index++) {
        const element = fieldsList[index];
        if (index == 0) {
          getFieldTarget = langData && langData[element];
        } else {
          getFieldTarget = getFieldTarget[element];
        }
      }
    }
    return getFieldTarget;
  },
  //下载文件，res为后台返回的FileStreamResult文件数据
  downLoadFile(res) {
    try {
      const blob = new Blob([res.data], { type: 'application/octet-stream;charset=UTF-8' });
      const contentDisposition = res.headers['content-disposition'];
      const patt = new RegExp('filename=([^;]+\\.[^\\.;]+);*');
      const result = patt.exec(contentDisposition);
      const filename = result[1];
      const downloadElement = document.createElement('a');
      const href = window.URL.createObjectURL(blob); // 创建下载的链接
      const reg = /^["](.*)["]$/g;
      downloadElement.style.display = 'none';
      downloadElement.href = href;
      downloadElement.download = decodeURI(filename.replace(reg, '$1')); // 下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); // 点击下载
      document.body.removeChild(downloadElement); // 下载完成移除元素
      window.URL.revokeObjectURL(href);
    } catch (error) {
      debugger;
      console.error(error);
      message.warning(t('view.fileDownloadFailed'));
    }
  },
  //下载文件，res为后台返回的FileStreamResult文件数据
  downLoadFileByUrl(url) {
    try {
      const downloadElement = document.createElement('a');
      downloadElement.style.display = 'none';
      downloadElement.href = url;
      let filename = url.split('/').pop();
      filename = decodeURIComponent(filename);
      downloadElement.download = filename; // 下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); // 点击下载
      document.body.removeChild(downloadElement); // 下载完成移除元素
    } catch (error) {
      debugger;
      console.error(error);
      message.warning(t('view.fileDownloadFailed'));
    }
  },
  /**
   * 解密 JWT token 的信息
   * @param token jwt token 字符串
   * @returns <any>object
   */
  decryptJWT(token: string) {
    token = token.replace(/_/g, '/').replace(/-/g, '+');
    const json = decodeURIComponent(escape(window.atob(token.split('.')[1])));
    return JSON.parse(json);
  },
  /**
   * 将 JWT 时间戳转换成 Date
   * @description 主要针对 `exp`，`iat`，`nbf`
   * @param timestamp 时间戳
   * @returns Date 对象
   */
  getJWTDate(timestamp: number) {
    return new Date(timestamp * 1000);
  },
  //拷贝对象2中对象1存在的键给对象1
  // objectToObject(obj, obj2) {
  //   for (const i in obj2) {
  //     if ($.isPlainObject(obj[i])) {
  //       this.objectToObject(obj[i], obj2[i]);
  //     } else {
  //       obj[i] = obj2[i];
  //     }
  //   }
  // },
  //修改对象的某个属性值，子集属性用|分割
  changeObAtrrValue(oldOb, attr, value, way = 'equal') {
    let ob = oldOb;
    for (let i = 0; i < attr.split('|').length - 1; i++) {
      ob = ob[attr.split('|')[i]];
    }
    const b = ob[attr.split('|')[attr.split('|').length - 1]];
    if (b instanceof Array) {
      if (way == 'equal') {
        ob[attr.split('|')[attr.split('|').length - 1]] = value;
      } else if (way == 'push') {
        b.push(value);
      }
    } else {
      ob[attr.split('|')[attr.split('|').length - 1]] = value;
    }
  },
  //图片转换base64
  imgBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      let imgResult;
      reader.readAsDataURL(file);
      reader.onload = function () {
        imgResult = reader.result;
      };
      reader.onerror = function (error) {
        reject(error);
      };
      reader.onloadend = function () {
        resolve(imgResult);
      };
    });
  },
  //颜色转换
  rgbToHex(rgb) {
    const values = rgb.match(/\d+/g); // 提取RGB值
    const hex = values.reduce((hexValue, currentValue) => {
      const hexString = Number(currentValue).toString(16); // 将每个RGB值转换成16进制字符串
      const paddedHexString = hexString.padStart(2, '0'); // 在不满两位的字符串前补0
      return hexValue + paddedHexString; // 拼接每个RGB值对应的16进制字符串
    }, '');
    return `#${hex.toUpperCase()}`; // 返回完整的HEX颜色代码（需将字母转换为大写）
  },
};
export default Common;
