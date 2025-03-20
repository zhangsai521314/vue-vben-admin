import type { MsgData } from '#/store';
import { defineStore } from 'pinia';
import { store } from '@/store';
import dayjs from 'dayjs';
import messageApi from '@/api/message';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/store/modules/user';
import { useI18n } from '@/hooks/web/useI18n';

const { t } = useI18n();
export interface MqttState {
  //系统mqtt全部配置信息
  mqttConfig: Nullable<object>;
  //mqtt连接对象
  mqttClient: Nullable<object>;
  //mqtt连接状态:-1无需连接、0未连接、1已连接、2连接中、3连接失败
  mqttStatus: String;
  //信息
  msgData: MsgData[];
  //通过mqtt存储的最新信息
  newInfo: object;
  //当前newInfo变更的键和最新状态
  changeNewInfoKey: Nullable<String>;
  //查看服务配置的主题
  lookConfig: Nullable<String>;
  //查看日志目录的主题
  lookLog: Nullable<String>;
  //下载日志文件
  downLog: Nullable<String>;
  //主题替换后缀
  monitorClient: Nullable<String>;
  //消息提示播放对象
  msgAudioOb: Nullable<object>;
  //提示是否静音
  msgIsMute: boolean;
  //弹出提示开启了声音提示（主要用户刷新状态下不操作页面，浏览器安全特性不允许放音）
  msgAudioIsAlert: boolean;
  //声音提示是否可以开启
  msgAudioIsShow: boolean;
  //是否已初始加载完告警信息
  isInitAlarmData: Boolean;
  //最新服务的的配置信息
  newServicConfig: Nullable<object>;
  //最新日志目录信息内容
  newServiceLogShowDirectory: Nullable<object>;
  //最新播放通话记录录音文件地址
  newCallRecordPlayFile: Nullable<object>;
  //录音文件在网管系统服务器上的状态发生改变
  callRecordChange: Nullable<object>;
  //消息是强提示时间限制,键是消息的serviceId_msgCategory_msgClass_msgType_msgStatus，值是时间和频率。当前时间大于值时可以强提示
  msgStrongPromptingTime: object;
  //已订阅的主题
  alreadyTopic: Array<string>;
  //用户订阅设备性能数据的最新值
  userTopicPerformanceNewValue: object;
}

//mqtt数据存储类
export const useMqttStore = defineStore({
  id: 'mqtt-data',
  state: (): MqttState => ({
    mqttConfig: null,
    mqttClient: null,
    mqttStatus: '无需连接',
    msgData: [],
    newInfo: {},
    changeNewInfoKey: null,
    isInitAlarmData: false,
    newServicConfig: null,
    lookConfig: null,
    lookLog: null,
    downLog: null,
    monitorClient: '',
    newServiceLogShowDirectory: null,
    newCallRecordPlayFile: null,
    callRecordChange: null,
    msgStrongPromptingTime: {},
    msgAudioOb: null,
    msgIsMute: false,
    msgAudioIsAlert: false,
    msgAudioIsShow: false,
    alreadyTopic: [],
    userTopicPerformanceNewValue: {},
  }),
  getters: {
    getAllMsgData(state) {
      return state.msgData;
    },
    //获取未读的报警信息
    getUnreadalarmData(state) {
      return state.msgData.filter((m) => !m.isRead && m.msgTitle && m.webMsgIsShow);
    },
    //获取报警信息
    getAlarmData(state) {
      return state.msgData.filter((m) => m.msgTitle && m.webMsgIsShow);
    },
  },
  actions: {
    clearMsgData() {
      this.msgData = [];
    },
    clearAllMsgStrongPromptingTime() {
      this.msgStrongPromptingTime = {};
    },
    clearMsgStrongPromptingTimeKey(key) {
      delete this.msgStrongPromptingTime[key];
    },
    clearMsgStrongPromptingTime(item: MsgData) {
      delete this.msgStrongPromptingTime[
        `${item.serviceId}_${item.msgCategory}_${item.msgClass}_${item.msgStatus}`
      ];
    },
    addMsgStrongPromptingTime(item: MsgData, timeFrequency) {
      this.msgStrongPromptingTime[
        `${item.serviceId}_${item.msgCategory}_${item.msgClass}_${item.msgStatus}`
      ] = {
        time: dayjs().add(timeFrequency, 'minute'),
        timeFrequency,
      };
    },
    addUserTopicPerformanceNewValue(topic, data) {
      this.userTopicPerformanceNewValue[topic] = data;
    },
    setMsgIsMute(data) {
      this.msgIsMute = data;
    },
    setNewServicConfig(data) {
      this.newServicConfig = data;
    },
    setCallRecordChange(data) {
      this.callRecordChange = data;
    },
    setNewServiceLogShowDirectory(data) {
      this.newServiceLogShowDirectory = data;
    },
    setNewCallRecordPlayFile(data) {
      this.newCallRecordPlayFile = data;
    },
    //更改mqtt配置信息
    setMqttConfig(config) {
      this.mqttConfig = config;
    },
    readMsg(data: MsgData) {
      this.sumitReadData([data.msgId])
        .then(() => {
          data['isRead'] = true;
        })
        .catch(() => {
          message.error(t('view.readFailed'));
        });
    },
    //全部已读
    allRead() {
      const _this = this;
      const ids: Array<string> = [];
      this.msgData
        .filter((m) => !m.isRead)
        .forEach((m) => {
          ids.push(m.msgId);
        });
      this.sumitReadData(ids)
        .then(() => {
          ids.forEach((id) => {
            const d = _this.msgData.find((m) => m.msgId == id);
            if (d) {
              d['isRead'] = true;
            }
          });
        })
        .catch(() => {
          message.error(t('view.readFailed'));
        });
    },
    //提交已读
    sumitReadData(msgIds) {
      return messageApi.ReadMsg(msgIds);
    },
    //播放信息提示音
    playMsgAudio(row: MsgData) {
      // if (!this.msgIsMute && this.msgAudioIsShow) {
      //   //播放告警提示音
      //   try {
      //     if (
      //       (row.msgClass == 1 || (row.msgClass == 2 && row.msgStatus == 1)) &&
      //       (this.msgStrongPromptingTime[
      //         `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
      //       ] == null ||
      //         this.msgStrongPromptingTime[
      //           `${row.serviceId}_${row.msgCategory}_${row.msgClass}_${row.msgStatus}`
      //         ].time.isBefore(dayjs()))
      //     ) {
      //       this.msgAudioOb?.play();
      //     }
      //   } catch (error) {
      //     console.error(error);
      //   }
      // }
    },
    //增加信息
    addMsgData(item: MsgData) {
      const userStore = useUserStore();
      const userInfo = userStore.userInfo;
      if (
        item.webMsgIsShow &&
        userInfo &&
        !userInfo.isSuperAdmin &&
        !userInfo.isAdmin &&
        (item.tenantId != userInfo.tenantId || !userInfo.orgIds.includes(item.orgId))
      ) {
        //只显示自己部门权限的告警
        item.webMsgIsShow = false;
      }
      const keyId = item.joinId ? item.joinId : item.serviceId;
      if (
        !this.newInfo[keyId] ||
        dayjs(this.newInfo[keyId].msgStartTime) <= dayjs(item.msgStartTime)
      ) {
        this.newInfo[keyId] = item;
      }
      if (item.webMsgIsShow) {
        this.changeNewInfoKey = `${keyId}_${item.msgStatus}`;
        if (!this.msgData?.find((m) => m.msgId == item.msgId)) {
          this.msgData = [item, ...(this.msgData || [])];
          if (this.msgData.length > 100) {
            this.msgData.splice(this.msgData.length - 1, 1);
          }
          this.msgData = _.orderBy(this.msgData, ['msgStartTime'], ['desc']);
          this.playMsgAudio(item);
        }
      }
    },
    //更改信息
    updateMsgData(item: MsgData) {
      const userStore = useUserStore();
      const userInfo = userStore.userInfo;
      if (
        item.webMsgIsShow &&
        userInfo &&
        !userInfo.isSuperAdmin &&
        !userInfo.isAdmin &&
        (item.tenantId != userInfo.tenantId || !userInfo.orgIds.includes(item.orgId))
      ) {
        //只显示自己部门权限的告警
        item.webMsgIsShow = false;
      }
      const keyId = item.joinId ? item.joinId : item.serviceId;
      if (
        !this.newInfo[keyId] ||
        dayjs(this.newInfo[keyId].msgStartTime) <= dayjs(item.msgStartTime)
      ) {
        this.newInfo[keyId] = item;
      }
      this.changeNewInfoKey = `${keyId}_${item.msgStatus}`;
      if (item.webMsgIsShow) {
        const data = this.msgData?.find((m) => m.msgId == item.msgId);
        if (data) {
          myCommon.objectReplace(data, item);
          this.msgData = _.orderBy(this.msgData, ['msgStartTime'], ['desc']);
          this.playMsgAudio(data);
        }
      }
    },
    //更改mqtt连接状态
    updateMqttStatus(status: Number) {
      switch (status) {
        case -1:
          this.mqttStatus = '无需连接';
          break;
        case 0:
          this.mqttStatus = '未连接';
          break;
        case 1:
          this.mqttStatus = '已连接';
          break;
        case 2:
          this.mqttStatus = '连接中';
          break;
        case 3:
          this.mqttStatus = '连接失败';
          break;
        case 4:
          this.mqttStatus = '连接断开';
          break;
        case 5:
          this.mqttStatus = '数据开始请求';
          break;
        case 6:
          this.mqttStatus = '数据初始化失败，10秒后重新初始化';
          break;
        case 7:
          this.mqttStatus = '数据开始初始化';
          break;
        case 8:
          this.mqttStatus = '数据初始化成功';
          break;
      }
      console.log(this.mqttStatus);
    },
    //更改mqtt对象
    setMqttClient(client: Object) {
      this.mqttClient = client;
    },
    //断开mqtt链接
    disConnect() {
      try {
        if (this.mqttClient && this.mqttClient.connected) {
          this.mqttClient.end();
          this.mqttClient = null;
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 重新链接
    reConnect() {
      if (this.mqttClient) {
        this.mqttClient.reconnect();
      }
    },
    //发布消息
    publish(topic, msg, back: Function) {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.publish(topic, msg, { qos: 1, retain: false }, (error) => {
          if (typeof back == 'function') back(error);
        });
      } else {
        if (typeof back == 'function') back('mqtt未连接，同步失败');
      }
    },
    //订阅
    subscribe(topic) {
      if (!this.alreadyTopic.includes(topic)) {
        const _this = this;
        this.mqttClient.subscribe(topic, { qos: 1 }, function (err) {
          if (!err) {
            _this.alreadyTopic.push(topic);
            console.log(`订阅mqtt主题${topic}成功`);
          } else {
            console.log(`订阅mqtt主题${topic}失败`);
          }
        });
      }
    },
    // 取消订阅
    unSubScribe(topic, back: Function) {
      if (this.mqttClient && this.mqttClient.connected) {
        this.alreadyTopic = this.alreadyTopic.filter(function (value) {
          return value !== topic;
        });
        this.mqttClient.unsubscribe(topic, (error) => back(error));
      }
    },
  },
});

// Need to be used outside the setup
export function useMqttStoreWithOut() {
  return useMqttStore(store);
}
