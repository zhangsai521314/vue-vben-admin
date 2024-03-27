import type { AlarmData } from '#/store';
import { defineStore } from 'pinia';
import { store } from '@/store';
import dayjs from 'dayjs';

export interface MqttState {
  //mqtt连接对象
  mqttClient: Nullable<object>;
  //mqtt连接状态:-1无需连接、0未连接、1已连接、2连接中、3连接失败
  mqttStatus: String;
  //告警信息
  alarmData: AlarmData[];
  //通过mqtt存储的最新信息
  newInfo: object;
  //当前newInfo变更的键
  changeNewInfoKey: Nullable<String>;
  //是否已初始加载完告警信息
  isInitAlarmData: Boolean;
}

//mqtt数据存储类
export const useMqttStore = defineStore({
  id: 'mqtt-data',
  state: (): MqttState => ({
    mqttClient: null,
    mqttStatus: '无需连接',
    alarmData: [],
    newInfo: {},
    changeNewInfoKey: null,
    isInitAlarmData: false,
  }),
  getters: {},
  actions: {
    //增加报警信息
    addAlarmData(item: AlarmData) {
      if (
        !this.newInfo[item.joinId] ||
        dayjs(this.newInfo[item.joinId].alarmTime) <= dayjs(item.alarmTime)
      ) {
        this.newInfo[item.joinId] = item;
      }
      this.changeNewInfoKey = `${item.joinId}_${item.alarmStatus}`;
      if (!this.alarmData?.find((m) => m.alarmId == item.alarmId)) {
        this.alarmData = [item, ...(this.alarmData || [])];
        if (this.alarmData.length > 500) {
          this.alarmData.splice(this.alarmData.length - 1, 1);
        }
        this.alarmData = _.orderBy(this.alarmData, ['alarmTime'], ['desc']);
      }
    },
    //更改报警信息
    updateAlarmData(item: AlarmData) {
      if (
        !this.newInfo[item.joinId] ||
        dayjs(this.newInfo[item.joinId].alarmTime) <= dayjs(item.alarmTime)
      ) {
        this.newInfo[item.joinId] = item;
      }
      this.changeNewInfoKey = `${item.joinId}_${item.alarmStatus}`;
      const data = this.alarmData?.find((m) => m.alarmId == item.alarmId);
      if (data) {
        myCommon.objectReplace(data, item);
        this.alarmData = _.orderBy(this.alarmData, ['alarmTime'], ['desc']);
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
        this.mqttClient.publish(topic, msg, { qos: 1, retain: true }, (error) => back(error));
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
