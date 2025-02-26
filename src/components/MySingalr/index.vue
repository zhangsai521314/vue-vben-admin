<template>
  <div :class="props.placement" v-show="visible" :style="props.style" class="content">
    <div class="title">
      {{ props.title }}
    </div>
    <div class="msg">
      <p v-for="(item, index) in msgs" :key="index" :style="item.style">{{ item.msg }}</p>
    </div>
    <div class="footer">
      <a-button type="primary" @click="hide">{{ t('view.close') }}</a-button>
    </div>
  </div>
</template>
<script setup>
  import dayjs from 'dayjs';
  import * as signalR from '@microsoft/signalr';
  import { ref, reactive, watch } from 'vue';
  import { tryOnUnmounted } from '@vueuse/core';
  import { getAppEnvConfig } from '@/utils/env';
  import { useUserStore } from '@/store/modules/user';

  const { VITE_GLOB_API_URL, VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig();
  const defSignalRWithurl = `${VITE_GLOB_API_URL}${VITE_GLOB_API_URL_PREFIX}/control`;
  const userStore = useUserStore();
  const token = 'Bearer ' + userStore.getToken;
  const props = defineProps({
    //样式
    style: {
      type: Object,
      default() {
        return [];
      },
    },
    //提示框多久关闭，秒。0标示不自动关闭
    hideTime: {
      type: Number,
      default() {
        return 0;
      },
    },
    title: String,
    //提示信息前缀
    msgPrefix: {
      type: String,
      default() {
        return '';
      },
    },
    //发送的消息内容
    sendMsg: {
      type: String,
      default() {
        return '';
      },
    },
    //弹出位置，可选 topLeft topRight bottomLeft bottomRight
    placement: {
      type: String,
      default() {
        return 'bottomRight';
      },
    },
    //命令配置
    signalRConfig: {
      type: Object,
      default() {
        return {
          //地址
          withurl: '',
          //关闭标示
          close: 'close',
          //指令下发成功标示
          success: 'moniterlog',
          //错误标示
          error: 'signalrerror',
          //命令下发标示
          invoke: 'SendCommand',
          function: {
            close: (id) => {},
            success: (msg) => {},
            error: (error) => {},
          },
        };
      },
    },
  });

  const msgs = reactive([
    // {
    //   style:{},
    //   msg:""
    // }
  ]);
  const visible = ref(false);
  let connection = null;
  let signalRConfig = {};
  let sendMsg = '';
  let url = '';
  function hide() {
    visible.value = false;
    msgs.length = 0;
  }
  function show(msg) {
    sendMsg = msg;
    if (visible.value) {
      invoke();
    } else {
      visible.value = true;
    }
  }

  function definition() {
    let isInitial = false;
    // 创建连接
    if (
      !connection ||
      connection._connectionState != 'Connected' ||
      (props.signalRConfig.withurl != '' &&
        connection.connection.baseUrl != props.signalRConfig.withurl) ||
      (props.signalRConfig.withurl == '' && connection.connection.baseUrl != defSignalRWithurl)
    ) {
      isInitial = true;
      url = props.signalRConfig.withurl != '' ? props.signalRConfig.withurl : defSignalRWithurl;
      connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .build();
    }
    //断开连接
    if (isInitial || (signalRConfig.close && signalRConfig.close != props.signalRConfig.close)) {
      signalRConfig.close = props.signalRConfig.close;
      connection.on(props.signalRConfig.close, function (id) {
        msgs.push({ style: { color: 'red' }, msg: `${url} 断开连接` });
      });
    }
    //成功消息
    if (
      isInitial ||
      (signalRConfig.success && signalRConfig.success != props.signalRConfig.success)
    ) {
      signalRConfig.success = props.signalRConfig.success;
      connection.on(props.signalRConfig.success, function (msg) {
        msgs.push({ style: { color: 'green' }, msg: `${url} ${msg}` });
      });
    }
    //错误消息
    if (isInitial || (signalRConfig.error && signalRConfig.error != props.signalRConfig.error)) {
      signalRConfig.error = props.signalRConfig.error;
      connection.on(props.signalRConfig.error, function (err) {
        msgs.push({ style: { color: 'red' }, msg: `${url} ${err}` });
      });
    }
    return isInitial;
  }

  //发送信息
  function invoke() {
    let isInitial = definition();
    if (!isInitial) {
      if (_.isArray(sendMsg)) {
        if (sendMsg.length == 2) {
          connection.invoke(props.signalRConfig.invoke, sendMsg[0], sendMsg[1]);
        } else if (sendMsg.length == 3) {
          connection.invoke(props.signalRConfig.invoke, sendMsg[0], sendMsg[1], sendMsg[2]);
        }
      } else {
        connection.invoke(props.signalRConfig.invoke, sendMsg);
      }
      msgs.push({
        style: { color: 'blue' },
        // msg: `${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')} ${url} ${props.msgPrefix} 已下发，请等待结果返回...`,
        msg: `${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}${props.msgPrefix} 已下发`,
      });
      if (props.hideTime > 0) {
        setTimeout(() => {
          visible.value = false;
        }, props.hideTime * 1000);
      }
    } else {
      // msgs.push({ style: { color: '#1593cf' }, msg: `${url} 尝试连接` });
      msgs.push({ style: { color: '#1593cf' }, msg: `尝试连接` });
      connection
        .start()
        .then(function () {
          // msgs.push({ style: { color: 'green' }, msg: `${url} 连接成功` });
          msgs.push({ style: { color: 'green' }, msg: `连接成功` });
          if (_.isArray(sendMsg)) {
            if (sendMsg.length == 2) {
              connection.invoke(props.signalRConfig.invoke, sendMsg[0], sendMsg[1]);
            } else if (sendMsg.length == 3) {
              connection.invoke(props.signalRConfig.invoke, sendMsg[0], sendMsg[1], sendMsg[2]);
            }
          } else {
            connection.invoke(props.signalRConfig.invoke, sendMsg);
          }
          msgs.push({
            style: { color: 'blue' },
            // msg: `${url} ${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')} ${props.msgPrefix} 已下发，请等待结果返回...`,
            msg: `${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')} ${props.msgPrefix} 已下发`,
          });
        })
        .catch(function (err) {
          //链接错误消息
          // msgs.push({ style: { color: 'red' }, msg: `${url} ${err.toString()}` });
          msgs.push({ style: { color: 'red' }, msg: `${err.toString()}` });
        });
      if (props.hideTime > 0) {
        setTimeout(() => {
          visible.value = false;
        }, props.hideTime * 1000);
      }
    }
  }

  //监控对象
  watch(visible, (newValue, old) => {
    if (newValue) {
      invoke();
    }
  });

  //暴露给父组件可以调用的方法
  defineExpose({ hide, show });

  tryOnUnmounted(() => {
    if (connection) {
      try {
        connection.stop();
      } catch (error) {}
    }
  });
</script>
<style scoped>
  .bottomRight {
    position: absolute;
    right: 0;
    bottom: 0;
  }

  .content {
    width: 330px;
    height: 230px;
    border-radius: 0;
    background: #fff;
    box-shadow: inset 1px -1px 4px -2px #000;
  }

  .title {
    height: 40px;
    padding: 10px;
    overflow: hidden;
    border-radius: 3px 0 0;
    background-color: #f8f8f8;
    box-shadow: inset 1px 1px 4px -2px #000;
    color: #333;
    font-size: 14px;
  }

  .msg {
    width: 100%;
    height: calc(100% - 40px - 40px);
    padding: 5px 0 0 5px;
    overflow: auto;
  }

  .footer {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    padding: right 5px;
    padding-top: 5px;
    box-shadow: inset 0 1px 4px -3px #000;
    text-align: right;
  }
</style>
