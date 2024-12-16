// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosInstance, AxiosResponse } from 'axios';
import { clone } from 'lodash-es';
import type { RequestOptions, Result } from '#/axios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';
import { VAxios } from './Axios';
import { checkStatus } from './checkStatus';
import { useGlobSetting } from '@/hooks/setting';
import { useMessage } from '@/hooks/web/useMessage';
import { RequestEnum, ResultEnum, ContentTypeEnum } from '@/enums/httpEnum';
import { isString, isUndefined, isNull, isEmpty } from '@/utils/is';
import { getToken, getRefreshToken } from '@/utils/auth';
import { setObjToUrlParams, deepMerge } from '@/utils';
import { useErrorLogStoreWithOut } from '@/store/modules/errorLog';
import { useI18n } from '@/hooks/web/useI18n';
import { joinTimestamp, formatRequestDate } from './helper';
import { useUserStoreWithOut } from '@/store/modules/user';
import { AxiosRetry } from '@/utils/http/axios/axiosRetry';
import axios from 'axios';
import { getAppEnvConfig } from '@/utils/env';
import { router } from '@/router';
import { PageEnum } from '@/enums/pageEnum';
import { useLocaleStore } from '@/store/modules/locale';

const globSetting = useGlobSetting();
const urlPrefix = globSetting.urlPrefix;
const { createMessage, createErrorModal } = useMessage();

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理响应数据。如果数据不是预期格式，可直接抛出错误
   */
  transformResponseHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { t } = useI18n();
    const { isTransformResponse } = options;
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse || res.request.responseType === 'blob') {
      return res;
    }
    const { success, message } = res.data;
    if (typeof message != 'string') {
      //等待处理
    }
    if (!success) {
      if (message == '登录已过期，请重新登录') {
        // 直接回登陆页
        router.replace(PageEnum.BASE_LOGIN);
      }
      // errorMessageMode=‘modal’的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
      // errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
      if (options.errorMessageMode === 'modal') {
        createErrorModal({ title: t('sys.api.errorTip'), content: message });
      } else if (options.errorMessageMode === 'message') {
        if (
          message.indexOf('连接数据库过程中发生错误，检查服务器是否正常连接字符串是否正确') != -1
        ) {
          createMessage.error('数据库链接失败');
        } else {
          createMessage.error(message);
        }
      }
      throw new Error(message || t('sys.api.apiRequestFailed'));
    } else {
      return res.data.data;
    }
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const localeStore = useLocaleStore();
    const locale = localeStore.getLocale;
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options;
    const { VITE_GLOB_APP_LOWERCASEROUTE } = getAppEnvConfig();
    //是否外部请求
    let isExternal = false;
    try {
      isExternal =
        config.url?.substring(0, 7).toLowerCase() == 'http://'
          ? true
          : config.url?.substring(0, 8).toLowerCase() == 'https://'
            ? true
            : false;
    } catch (error) {
      console.error(error);
    }
    if (!isExternal) {
      if (VITE_GLOB_APP_LOWERCASEROUTE) {
        config.url = config.url?.toLocaleLowerCase();
      }
      if (joinPrefix) {
        config.url = `${urlPrefix}${config.url}`;
      }
      if (apiUrl && isString(apiUrl)) {
        config.url = `${apiUrl}${config.url}`;
      }
    }
    const params = config.params || {};
    const data = config.data || false;
    formatDate && data && !isString(data) && formatRequestDate(data);
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params);
        if (
          Reflect.has(config, 'data') &&
          config.data &&
          (Object.keys(config.data).length > 0 || config.data instanceof FormData)
        ) {
          config.data = data;
          config.params = params;
        } else {
          // 非GET请求如果没有提供data，则将params视为data
          config.data = params;
          config.params = {
            culture: locale,
          };
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data),
          );
        }
      } else {
        // 兼容restful风格:url/参数1/参数2/参数n
        if (config.url[config.url?.length - 1] == '/') {
          config.url = `${config.url}${params}${joinTimestamp(joinTime, true)}`;
        } else {
          config.url = `${config.url}/${params}${joinTimestamp(joinTime, true)}`;
        }
        config.params = undefined;
        config.data = undefined;
      }
    }
    return config;
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    const token = getToken();
    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // jwt token
      (config as Recordable).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token;
      // 判断 accessToken 是否过期
      const jwt: any = myCommon.decryptJWT(token);
      const exp = myCommon.getJWTDate(jwt.exp as number);
      // token 已经过期
      if (new Date() >= exp) {
        const refreshToken = getRefreshToken();
        (config as Recordable).headers['X-Authorization'] = options.authenticationScheme
          ? `${options.authenticationScheme} ${refreshToken}`
          : refreshToken;
      }
    }
    return config;
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    const userStore = useUserStoreWithOut();
    // 读取响应报文头 token 信息
    const accessToken = res.headers['access-token'];
    const refreshAccessToken = res.headers['x-access-token'];
    // 判断是否是无效 token
    if (accessToken === 'invalid_token') {
      userStore.resetState();
    } else if (refreshAccessToken && accessToken) {
      userStore.setToken(accessToken);
      userStore.setRefreshToken(refreshAccessToken);
    }
    return res;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (axiosInstance: AxiosInstance, error: any) => {
    const { t } = useI18n();
    const errorLogStore = useErrorLogStoreWithOut();
    errorLogStore.addAjaxErrorInfo(error);
    const { response, code, message, config } = error || {};
    const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';
    const msg: string = response?.data?.error?.message ?? '';
    const err: string = error?.toString?.() ?? '';
    let errMessage = '';

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        errMessage = t('sys.api.apiTimeoutMessage');
      }
      if (err?.includes('Network Error')) {
        errMessage = t('sys.api.networkExceptionMsg');
      }
      if (error.request.responseType == 'blob' && errorMessageMode != 'none') {
        const reader = new FileReader();
        reader.readAsText(error.response.data, 'utf-8'); // 读取blob数据为文本
        reader.onload = function (e) {
          try {
            // 将读取到的文本解析为JSON对象
            const jsonData = JSON.parse(e.target.result);
            createMessage.error(jsonData);
          } catch (error) {
            // 处理解析JSON时可能出现的错误
            console.error('Error parsing JSON:', error);
          }
        };
      }
      if (errMessage) {
        if (errorMessageMode === 'modal') {
          createErrorModal({ title: t('sys.api.errorTip'), content: errMessage });
        } else if (errorMessageMode === 'message') {
          createMessage.error(errMessage);
        }
        return Promise.reject(error);
      }
    } catch (error) {
      throw new Error(error as unknown as string);
    }

    checkStatus(error?.response?.status, msg, errorMessageMode);

    // 添加自动重试机制 保险起见 只针对GET请求
    const retryRequest = new AxiosRetry();
    const { isOpenRetry } = config.requestOptions.retryRequest;
    config.method?.toUpperCase() === RequestEnum.GET &&
      isOpenRetry &&
      // @ts-ignore
      retryRequest.retry(axiosInstance, error);
    return Promise.reject(error);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    // 深度合并
    deepMerge(
      {
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // authentication schemes，e.g: Bearer
        authenticationScheme: 'Bearer',
        timeout: 60 * 1000 * 5,
        // 基础接口地址
        // baseURL: globSetting.apiUrl,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform: clone(transform),
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: globSetting.apiUrl,
          // 接口拼接地址
          urlPrefix: urlPrefix,
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
          retryRequest: {
            isOpenRetry: true,
            count: 5,
            waitTime: 100,
          },
        },
      },
      opt || {},
    ),
  );
}
export const defHttp = createAxios();

// other api url
// export const otherHttp = createAxios({
//   requestOptions: {
//     apiUrl: 'xxx',
//     urlPrefix: 'xxx',
//   },
// });
