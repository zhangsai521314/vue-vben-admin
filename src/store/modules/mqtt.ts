import type { MsgData } from '#/store';
import { defineStore } from 'pinia';
import { store } from '@/store';
import dayjs from 'dayjs';
import { update } from 'lodash-es';

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
  //当前newInfo变更的键
  changeNewInfoKey: Nullable<String>;
  //查看服务配置的主题
  lookConfig: Nullable<String>;
  //主题替换后缀
  monitorClient: Nullable<String>;

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
    monitorClient: '',
    //最新日志目录信息内容
    newServiceLogShowDirectory: null,
    //是否打开了通话录音播放弹框
    //最新播放通话记录录音文件地址
    newCallRecordPlayFile: null,
    callRecordChange: null,
  }),
  getters: {},
  actions: {
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
    //增加报警信息
    addAlarmData(item: MsgData) {
      if (
        !this.newInfo[item.joinId] ||
        dayjs(this.newInfo[item.joinId].alarmStartTime) <= dayjs(item.alarmStartTime)
      ) {
        this.newInfo[item.joinId] = item;
      }
      this.changeNewInfoKey = `${item.joinId}_${item.msgStatus}`;
      if (!this.msgData?.find((m) => m.msgId == item.msgId)) {
        this.msgData = [item, ...(this.msgData || [])];
        if (this.msgData.length > 500) {
          this.msgData.splice(this.msgData.length - 1, 1);
        }
        this.msgData = _.orderBy(this.msgData, ['alarmStartTime'], ['desc']);
      }
    },
    //更改报警信息
    updateAlarmData(item: MsgData) {
      if (
        !this.newInfo[item.joinId] ||
        dayjs(this.newInfo[item.joinId].alarmStartTime) <= dayjs(item.alarmStartTime)
      ) {
        this.newInfo[item.joinId] = item;
      }
      this.changeNewInfoKey = `${item.joinId}_${item.msgStatus}`;
      const data = this.msgData?.find((m) => m.msgId == item.msgId);
      if (data) {
        myCommon.objectReplace(data, item);
        this.msgData = _.orderBy(this.msgData, ['alarmStartTime'], ['desc']);
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
          if (error != null) {
            back(error);
          }
        });
      } else {
        back('mqtt未连接，同步失败');
      }
    },
    // 取消订阅
    unSubScribe(topic, back: Function) {
      if (this.mqttClient && this.mqttClient.connected) {
        this.mqttClient.unsubscribe(topic, (error) => back(error));
      }
    },
  },
});

// Need to be used outside the setup
export function useMqttStoreWithOut() {
  return useMqttStore(store);
}
