import { defHttp } from '@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
import { message } from 'ant-design-vue';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();
const largeScreen = {
  //指定获取数据的url,请求类型
  Request: function name(
    url,
    params = {},
    method = 'post',
    headers = {},
    mode: ErrorMessageMode = 'message',
  ) {
    if (method == 'post') {
      return defHttp.post(
        {
          url: url,
          params,
          headers,
        },
        {
          errorMessageMode: mode,
        },
      );
    } else if (method == 'get') {
      return defHttp.get(
        {
          url: url,
          params,
          headers,
        },
        {
          errorMessageMode: mode,
        },
      );
    }
  },
  text: function () {
    return defHttp.get({
      url: '/largeScreen/text',
    });
  },
  //后台发送mq信息
  PushDDServerUpdateDBMq: function (params) {
    defHttp
      .post({
        url: '/largeScreen/PushDDServerUpdateDBMq',
        params,
      })
      .then((data) => {
        if (data) {
          message.success(t('view.commandHasBeenSentSuccessfully'));
        } else {
          message.error(t('view.commandSendingFailed'));
        }
      })
      .catch(() => {
        message.error(t('view.commandSendingFailed'));
      });
  },
  //获取可以下载的版本文件
  GetDownVersion: function () {
    return defHttp.get({
      url: '/largeScreen/GetDownVersion',
    });
  },
  //下载版本文件
  GetServiceFile: function (params) {
    return defHttp.get(
      {
        url: '/largeScreen/GetServiceFile',
        params,
        responseType: 'blob',
      },
      {
        retryRequest: {
          isOpenRetry: false,
          count: 5,
          waitTime: 1000,
        },
      },
    );
  },
};
export default largeScreen;
