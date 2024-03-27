import 'uno.css';
import '@/design/index.less';
import '@/components/VxeTable/src/css/index.scss';
import 'ant-design-vue/dist/reset.css';
// Register icon sprite
import 'virtual:svg-icons-register';

// 其他组件css
import 'jquery-ui-dist/jquery-ui.min.css';
import 'vxe-table/lib/style.css';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';

//本地css覆盖组件自带css
import '@/design/myGlobalCss.less';
import '@/design/myAntCss.less';
import '@/design/myVxeCss.less';
import '@/design/myVbencss.less';
import '@/design/myContextMenu.less';
import '@/design/myDraggableResizable.less';

import { createApp } from 'vue';
import { registerGlobComp } from '@/components/registerGlobComp';
import { setupGlobDirectives } from '@/directives';
import { setupI18n } from '@/locales/setupI18n';
import { setupErrorHandle } from '@/logics/error-handle';
import { initAppConfigStore } from '@/logics/initAppConfig';
import { router, setupRouter } from '@/router';
import { setupRouterGuard } from '@/router/guard';
import { setupStore } from '@/store';
import App from './App.vue';

import { getAppEnvConfig } from '@/utils/env';
import { useMqttStoreWithOut } from '@/store/modules/mqtt';
import messageApi from '@/api/message';
import type { AlarmData } from '#/store';

async function bootstrap() {
  const app = createApp(App);

  // Configure store
  // 配置 store
  setupStore(app);

  // Initialize internal system configuration
  // 初始化内部系统配置
  initAppConfigStore();

  // Register global components
  // 注册全局组件
  registerGlobComp(app);

  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  await setupI18n(app);

  // Configure routing
  // 配置路由
  setupRouter(app);

  // router-guard
  // 路由守卫
  setupRouterGuard(router);

  // Register global directive
  // 注册全局指令
  setupGlobDirectives(app);

  // Configure global error handling
  // 配置全局错误处理
  setupErrorHandle(app);

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  app.mount('#app');
}

async function mqttInit() {
  const mqttStore = useMqttStoreWithOut();
  let timeId;
  let isDingYue = false;
  const errTopic = [];
  //初始化数据仓库
  dataInit();

  function dataInit() {
    mqttStore.isInitAlarmData = false;
    clearTimeout(timeId);
    mqttStore.updateMqttStatus(5);
    Promise.all([getServiceNewStatusMsg()])
      .then((rdata) => {
        mqttStore.updateMqttStatus(7);
        rdata[0].forEach((m) => {
          mqttStore.addAlarmData(m);
        });
        mqttStore.isInitAlarmData = true;
        mqttStore.updateMqttStatus(8);
        try {
          init();
        } catch (error) {
          console.error(error);
        }
      })
      .catch((error) => {
        console.log(error);
        mqttStore.updateMqttStatus(6);
        timeId = setTimeout(() => {
          dataInit();
        }, 1000 * 2);
      });
  }

  function init() {
    const { VITE_GLOB_MQTT } = getAppEnvConfig();
    const mqttConfig = JSON.parse(VITE_GLOB_MQTT);

    const decoder = new TextDecoder('utf-8');
    if (mqttConfig.IsOpen) {
      mqttStore.updateMqttStatus(2);
      const client = mqtt.connect(mqttConfig.ServerAddress, {
        clientId: mqttConfig.ClientId + myCommon.uniqueId(),
        username: mqttConfig.UserName,
        password: mqttConfig.UserPwd,
        keepalive: mqttConfig.KeepAlivePeriod, // 默认60秒，设置0为禁用
        clean: mqttConfig.CleanSession, // 设置为false以在脱机时接收QoS 1和2消息
        connectTimeout: mqttConfig.ConnectTimeout * 1000, // 收到connect之前等待的时间
        protocolId: 'MQIsdp', // 只支持MQTT 3.1(不符合3.1.1)的代理
        protocolVersion: 3, // 版本
        reconnectPeriod: mqttConfig.ReconnectPeriod * 1000, //设置多长时间进行重新连接 单位毫秒 两次重新连接之间的时间间隔。通过将设置为，禁用自动重新连接0
      });
      //连接成功
      client.on('connect', function () {
        mqttStore.updateMqttStatus(1);
        Array.from(new Set(mqttConfig.Topics)).forEach((topic) => {
          client.subscribe(topic, { qos: 1 }, function (err) {
            if (!err) {
              console.log(`订阅mqtt主题${topic}成功`);
            } else {
              errTopic.push(topic);
              console.log(`订阅mqtt主题${topic}失败`);
            }
          });
        });
        isDingYue = true;
      });
      //连接失败
      client.on('error', (error) => {
        mqttStore.updateMqttStatus(3);
      });
      //接收信息
      client.on('message', function (topic, message) {
        let msg = decoder.decode(message);
        if (!myCommon.isnull(msg)) {
          try {
            msg = JSON.parse(msg);
          } catch (error) {
            console.warn(`mqtt_${topic}_转换错误_丢弃${error}`);
          }
          if (topic.indexOf('Data/Monitor/AlarmWeb/Insert') != -1) {
            //告警插入
            mqttStore.addAlarmData(msg);
          } else if (topic.indexOf('Data/Monitor/AlarmWeb/Update') != -1) {
            //告警更新
            mqttStore.updateAlarmData(msg);
          } else if (topic.indexOf('Data/Change/Performance') != -1) {
            mqttStore.updateAlarmData(msg);
          } else {
            console.warn(`mqtt_${topic}_非匹配主题_丢弃`);
          }
        } else {
          console.warn(`mqtt_${topic}_信息为空_丢弃`);
        }
      });
      //连接断开
      client.on('close', function () {
        mqttStore.updateMqttStatus(4);
      });
      //重连
      client.on('reconnect', () => {
        mqttStore.updateMqttStatus(2);
      });
      //客户端已发出数据包
      client.on('packetsend', (packet) => {
        if (packet && packet.payload) {
          console.log('packetsend' + packet.payload);
        }
      });
      //客户端脱机下线触发回调
      client.on('offline', function () {
        console.log('offline');
      });
      //当客户端接收到任何数据包时发出。这包括来自订阅主题的信息包以及MQTT用于管理订阅和连接的信息包
      client.on('packetreceive', (packet) => {
        console.log('packetreceive', packet);
      });
      mqttStore.setMqttClient(client);
      //订阅失败处理
      errTopicRetry();
    } else {
      mqttStore.updateMqttStatus(-1);
    }
  }

  //重新订阅
  function errTopicRetry() {
    if (isDingYue && errTopic.length > 0) {
      for (let i = errTopic.length - 1; i >= 0; i--) {
        mqttStore.mqttClient.subscribe(errTopic[i], { qos: 1 }, function (err) {
          if (!err) {
            errTopic.splice(i, 1);
            console.log(`订阅mqtt主题${errTopic[i]}成功`);
          } else {
            console.log(`订阅mqtt主题${errTopic[i]}失败`);
          }
        });
      }
      if (errTopic.length > 0) {
        setTimeout(() => {
          errTopicRetry();
        }, 5000);
      }
    }
  }

  function getServiceNewStatusMsg() {
    return messageApi.GetServiceNewStatusMsg();
    // return new Promise((resolve, reject) => {
    //   reject('reject');
    // });
  }
}

bootstrap();
mqttInit();
