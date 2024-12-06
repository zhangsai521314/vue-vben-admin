import 'uno.css';
import '@/design/index.less';
import '@/components/VxeTable/src/css/index.scss';
import 'ant-design-vue/dist/reset.css';
// Register icon sprite
import 'virtual:svg-icons-register';

// 其他组件css
import 'jquery-ui-dist/jquery-ui.min.css';
import 'vxe-table/lib/style.css';
import 'vxe-pc-ui/lib/style.css';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';

//本地css覆盖组件自带css
import '@/design/myGlobalCss.less';
import '@/design/myAntCss.less';
import '@/design/myVxeCss.less';
import '@/design/myVbencss.less';
import '@/design/myContextMenu.less';
import '@/design/myDraggableResizable.less';

import { createApp, unref, watch } from 'vue';
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
import { useGplotStoreWithOut } from '@/store/modules/gplot';
import messageApi from '@/api/message';
import dayjs from 'dayjs';
import { useUserStore } from '@/store/modules/user';
import { createLocalStorage } from '@/utils/cache';
import { message } from 'ant-design-vue';
import { find } from 'xe-utils';
import type { MsgData, UserInfo } from '#/store';

const userStore = useUserStore();
const mqttStore = useMqttStoreWithOut();
const gplotStore = useGplotStoreWithOut();
let dataInitTimeId;
const errTopic: Array<string> = [];
let isDataInit = false;

async function bootstrap() {
  const app = createApp(App);

  // Configure store
  // 配置 store
  setupStore(app);

  // Initialize internal system configuration
  // 初始化内部系统配置
  initAppConfigStore();

  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  await setupI18n(app);

  // Register global components
  // 注册全局组件
  registerGlobComp(app);

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
interval();
errTopicRetry();

//监控用户登录退出
watch(
  () => userStore.userInfo,
  () => {
    if (userStore.userInfo) {
      //初始化数据仓库
      dataInit();
    } else {
      isDataInit = false;
      //不刷新断开后重连不能接收新信息
      // mqttStore.disConnect();
      // errTopic = [];
      mqttStore.clearMsgData();
    }
  },
);

function interval() {
  // //定时判断是否强提示
  // setInterval(() => {
  //   for (const key in mqttStore.msgStrongPromptingTime) {
  //     if (mqttStore.msgStrongPromptingTime[key].time.isBefore(dayjs())) {
  //       delete mqttStore.msgStrongPromptingTime[key];
  //     }
  //   }
  // }, 3000);

  //有未确认未恢复的告警则一直播放告警声音
  setInterval(() => {
    if (!mqttStore.msgIsMute && userStore.userInfo) {
      const alarmDataCount = mqttStore.msgData.filter(
        (m) => m.msgClass == 2 && m.msgStatus == 1 && m.webMsgIsShow && m.confirmTime == null,
      ).length;
      if (alarmDataCount > 0) {
        try {
          mqttStore.msgAudioOb?.play();
        } catch (error) {}
      }
    }
  }, 1500);
}

//重新订阅
function errTopicRetry() {
  if (mqttStore.mqttClient && errTopic.length > 0) {
    for (let i = errTopic.length - 1; i >= 0; i--) {
      mqttStore.mqttClient.subscribe(
        errTopic[i].replace(
          mqttStore.mqttClient.MonitorClient,
          mqttStore.mqttClient.options.clientId,
        ),
        { qos: 1 },
        function (err) {
          if (!err) {
            errTopic.splice(i, 1);
            console.log(`订阅mqtt主题${errTopic[i]}成功`);
          } else {
            console.log(`订阅mqtt主题${errTopic[i]}失败`);
          }
        },
      );
    }
    if (errTopic.length > 0) {
      setTimeout(() => {
        errTopicRetry();
      }, 5000);
    }
  }
}

function dataInit() {
  mqttStore.clearMsgData();
  mqttStore.isInitAlarmData = false;
  clearTimeout(dataInitTimeId);
  mqttStore.updateMqttStatus(5);
  Promise.all([getServiceMsgTypeLast()])
    .then((rdata) => {
      mqttStore.updateMqttStatus(7);
      rdata[0].forEach((m) => {
        mqttStore.addMsgData(m);
      });
      mqttStore.isInitAlarmData = true;
      mqttStore.updateMqttStatus(8);
      isDataInit = true;
      if (!mqttStore.mqttClient) {
        initMq();
      } else {
        mqttStore.updateMqttStatus(1);
      }
    })
    .catch((error) => {
      console.log(error);
      mqttStore.updateMqttStatus(6);
      dataInitTimeId = setTimeout(() => {
        dataInit();
      }, 1000 * 2);
    });
}

function initMq() {
  try {
    const { VITE_GLOB_MQTT } = getAppEnvConfig();
    const mqttConfig = JSON.parse(VITE_GLOB_MQTT);
    mqttStore.setMqttConfig(mqttConfig);
    const decoder = new TextDecoder('utf-8');
    if (mqttConfig.IsOpen) {
      const topics = [
        mqttConfig.WebUserLoginTokenChange,
        mqttConfig.WebUserLoginOut,
        mqttConfig.WebDownLog,
        mqttConfig.WebPlayCallRecord,
        mqttConfig.WebDownCallRecord,
        // mqttConfig.UpPerformance,
        mqttConfig.LookConfigBack,
        mqttConfig.LookLogBack,
        mqttConfig.WebCallRecordChange,
        mqttConfig.DDServerUpdateDBRes,
        mqttConfig.WebUserInfoChange,
        mqttConfig.WebMsg,
      ];
      topics.concat(userStore.getUserInfo.userMqTopic.map((m) => m.topic));
      mqttStore.updateMqttStatus(2);
      const client = mqtt.connect(mqttConfig.ServerAddress, {
        clientId: mqttConfig.ClientIdPrefix + myCommon.uniqueId(),
        username: mqttConfig.UserName,
        password: mqttConfig.UserPwd,
        keepalive: mqttConfig.KeepAlivePeriod, // 默认60秒，设置0为禁用
        clean: mqttConfig.CleanSession, // 设置为false以在脱机时接收QoS 1和2消息
        connectTimeout: mqttConfig.ConnectTimeout * 1000, // 收到connect之前等待的时间
        protocolId: 'MQIsdp', // 只支持MQTT 3.1(不符合3.1.1)的代理
        protocolVersion: 3, // 版本
        reconnectPeriod: mqttConfig.ReconnectPeriod * 1000, //设置多长时间进行重新连接 单位毫秒 两次重新连接之间的时间间隔。通过将设置为，禁用自动重新连接0
      });
      mqttStore.lookLog = mqttConfig.LookLog;
      mqttStore.lookConfig = mqttConfig.LookConfig;
      mqttStore.monitorClient = mqttConfig.MonitorClient;
      mqttStore.downLog = mqttConfig.DownLog;
      //连接成功
      client.on('connect', function () {
        mqttStore.updateMqttStatus(1);
        Array.from(topics).forEach((topic: string) => {
          const tt = topic.replace(mqttConfig.MonitorClient, '/' + client.options.clientId);
          if (!mqttStore.alreadyTopic.includes(tt)) {
            client.subscribe(tt, { qos: 1 }, function (err) {
              if (!err) {
                mqttStore.alreadyTopic.push(tt);
                console.log(`订阅mqtt主题${topic}成功`);
              } else {
                errTopic.push(topic);
                console.log(`订阅mqtt主题${topic}失败`);
              }
            });
          }
        });
      });
      //连接失败
      client.on('error', (error) => {
        mqttStore.updateMqttStatus(3);
      });
      //接收信息
      client.on('message', function (topic, _message) {
        // console.log('getAllMsgData', mqttStore.getAllMsgData);
        if (isDataInit) {
          let msg = decoder.decode(_message);
          // console.log(msg);
          if (!myCommon.isnull(msg)) {
            try {
              msg = JSON.parse(msg);
              gplotStore.mqttMsgReceive(topic, msg);
            } catch (error) {
              console.error('mqtt转换json失败', msg);
            }
            if (topic == mqttConfig.WebUserLoginOut) {
              //退出登录
              if (
                !myCommon.isnull(userStore.userInfo?.userId) &&
                !myCommon.isnull(msg.UserId) &&
                msg.clientId != client.options.clientId &&
                userStore.userInfo?.userId == msg.UserId
              ) {
                //用户在别处退出登录
                userStore.logout(true);
                message.info('您的账户已在别处退出登录，如非自己操作，请更改密码', 10);
              }
            } else if (topic == mqttConfig.WebUserLoginTokenChange) {
              //token改变
              if (
                !myCommon.isnull(userStore.getToken) &&
                !myCommon.isnull(msg.Token) &&
                !myCommon.isnull(userStore.userInfo?.userId) &&
                !myCommon.isnull(msg.UserId) &&
                userStore.userInfo?.userId == msg.UserId &&
                userStore.getToken != msg.Token
              ) {
                //用户在别处已登录
                userStore.logout(true);
                message.info('您的账户已在别处登录，如非自己登录，请更改密码', 10);
              }
            } else if (topic == mqttConfig.WebUserInfoChange) {
              if (
                !myCommon.isnull(userStore.userInfo?.userId) &&
                (userStore.userInfo?.userId == msg.userId ||
                  userStore.userInfo?.roleId == msg.roleId)
              ) {
                //用户信息已被修改（基础信息-部门信息|角色信息，权限信息）
                userStore.logout(true, false);
                message.info(`${msg.msg}`, 10);
              }
            } else if (
              topic == mqttConfig.WebMsg.replace('+', '') + 'Insert' &&
              mqttStore.isInitAlarmData
            ) {
              //告警插入
              mqttStore.addMsgData(msg);
            } else if (
              topic == mqttConfig.WebMsg.replace('+', '') + 'Update' &&
              mqttStore.isInitAlarmData
            ) {
              //告警更新
              mqttStore.updateMsgData(msg);
            } else if (
              topic ==
              mqttConfig.WebPlayCallRecord.replace(
                mqttConfig.MonitorClient,
                '/' + client.options.clientId,
              )
            ) {
              //通话记录播放文件准备完毕
              mqttStore.setNewCallRecordPlayFile(msg);
            } else if (topic == mqttConfig.WebCallRecordChange) {
              //录音文件状态发生改变
              mqttStore.setCallRecordChange(msg);
            } else if (
              topic ==
              mqttConfig.WebDownCallRecord.replace(
                mqttConfig.MonitorClient,
                '/' + client.options.clientId,
              )
            ) {
              //通话记录下载文件准备完毕
              if (msg && msg.recordFile) {
                myCommon.downLoadFileByUrl(msg.recordFile);
              }
            } else if (
              topic ==
              mqttConfig.LookLogBack.replace(
                mqttConfig.MonitorClient,
                '/' + client.options.clientId,
              )
            ) {
              //日志目录内容
              mqttStore.setNewServiceLogShowDirectory(msg);
            } else if (
              topic ==
              mqttConfig.WebDownLog.replace(mqttConfig.MonitorClient, '/' + client.options.clientId)
            ) {
              //下载日志文件准备完毕
              myCommon.downLoadFileByUrl(msg);
            } else if (
              topic ==
              mqttConfig.LookConfigBack.replace(
                mqttConfig.MonitorClient,
                '/' + client.options.clientId,
              )
            ) {
              //终端配置文件内容
              mqttStore.setNewServicConfig(msg);
            } else if (topic.indexOf(mqttConfig.UpPerformance.replace('/+', '')) != -1) {
              //性能监测数据
              mqttStore.addUserTopicPerformanceNewValue(topic, msg);
            } else if (
              topic ==
              mqttConfig.DDServerUpdateDBRes.replace(
                mqttConfig.MonitorClient,
                '/' + client.options.clientId,
              )
            ) {
              //调度服务数据变更，更改回复
              msg.Result == 0 ? message.success(msg.Msg) : message.error(msg.Msg);
            } else {
              console.warn(`mqtt_${topic}_非匹配主题_丢弃`);
            }
          } else {
            console.warn(`mqtt_${topic}_信息为空_丢弃`);
          }
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
        // console.log('packetreceive', packet);
      });
      mqttStore.setMqttClient(client);
      //订阅失败处理
      errTopicRetry();
    } else {
      mqttStore.updateMqttStatus(-1);
    }
  } catch (error) {
    console.error(error);
  }
}

function getServiceMsgTypeLast() {
  return messageApi.GetServiceMsgTypeLast();
}

bootstrap();
