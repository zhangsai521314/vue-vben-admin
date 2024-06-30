//拓扑图公用属性
import { defineStore } from 'pinia';
import { store } from '@/store';

export interface GplotState {
  //根据画布key存储画布的对象
  gplotKeyOb: object;
  //和画布相关的mqtt信息变化
  mqttMsgChange: Nullable<object>;
}

//gploat数据存储类
export const useGplotStore = defineStore({
  id: 'gploat-data',
  state: (): GplotState => ({
    gplotKeyOb: {},
    mqttMsgChange: null,
  }),
  getters: {
    //根据key获取自己的拓扑配置项
    getKeyOb: (state) => {
      return (key) => state.gplotKeyOb[key];
    },
  },
  actions: {
    //初始化设置
    setGplotKeyOb(key) {
      this.gplotKeyOb[key] = {
        //是否渲染成功
        renderSuccess: false,
        //选中的组件
        selectedOb: null,
        //画布的配置
        containerConfig: {
          //是否展示网格
          grid: {
            //myIsShow非g6属性,用与控制lineWidth实现显示隐藏
            myIsShow: true,
            //画布网格
            key: 'GridLine',
            type: 'grid-line',
            lineWidth: 1,
            follow: false,
            size: 20,
          },
          //背景图
          background: {
            //myBackground非g6属性，由于background和backgroundImage同时存在，图片显示有问题
            myBackground: '',
            key: 'Background',
            type: 'background',
            width: '100%',
            height: '100%',
            //有background属性图片的backgrounfRepeat和backgroundSize会被忽略
            background: '',
            backgroundImage: '',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            opacity: 1,
          },
          //缩放放大比例%
          zoom: 1,
          //运行限制：zommCanvas、dragCanvas
          runType: [],
          fit: 'fitCenter',
          //所有数据的配置
          allDataConfig: [
            // {
            //   //数据来源类型
            //   type: 'mqtt',
            //   //主题
            //   topic: null,
            //   //值获取，'//默认参数mqttDataStr为当前主题接收到的数据\n//必须有返回值，返回值类型不得为undefined\n',
            //   getValue: '',
            //   //值键值
            //   key: '',
            //   //值描述名称
            //   name: '',
            // },
          ],
          //数据值对象,键为myValueConfg中的key,值为myValueConfg中的getValue的计算值
          allDataValue: {},
          //是否正在保存
          runSave: false,
          //菜单ID
          menuId: null,
        },
        //节点的全局配置项
        nodeConfig: {
          id: '',
          type: '',
          style: {
            //节点类型
            type: '',
            x: 0,
            y: 0,
            //边框角度
            rectRadius: 2,
            //大小
            size: 100,
            //填充色
            fill: '',
            //是否显示文字
            label: true,
            //文字
            labelText: '',
            //文字颜色
            labelFill: '#000',
            //文字大小
            labelFontSize: 30,
            //文字位移X
            labelOffsetX: 0,
            //文字位移Y
            labelOffsetY: -13,
            //是否文字背景
            labelBackground: false,
            //文字背景颜色
            labelBackgroundFill: '#fff',
            //文字边框颜色
            labelBackgroundStroke: '#fff',
            //文字边框短点大小
            labelBackgroundLineDash: 0,
            //文字边框大小
            labelBackgroundLineWidth: 0,
            //文字边框透明色
            labelBackgroundOpacity: 1,
            //文字边框圆角
            labelBackgroundRadius: 0,

            //图标类型
            iconFontFamily: 'iconfont',
            //图标颜色
            iconFill: '#1783FF',
            //图标大小
            iconFontSize: 80,

            //透明度
            opacity: 1,
            //线条宽度
            lineWidth: 2,
            //线条颜色
            stroke: 'blue',
            //是否显示开始箭头
            startArrow: false,
            //开始箭头大小
            startArrowSize: 10,
            //开始箭头类型
            startArrowType: 'triangle',
            //是否显示结束箭头
            endArrow: false,
            //结束箭头大小
            endArrowSize: 10,
            //结束箭头类型
            endArrowType: 'triangle',

            //组合的内边距
            padding: 0,
          },
          data: {
            //节点大类型：node、edge、combo
            myType: '',
            //配置原有的样式
            myOldStyle: {
              iconFill: '',
              labelFill: '',
            },
            //锁定
            myLockAll: false,
            //是否禁用全部事件
            myIsDisabledEvent: false,
            //事件
            myEvent: [
              // {
              //   key: "s1",
              //   title: '交互',
              //   //click、right
              //   event: "click",
              //   open: false,//配置是否有效
              //   type: "",//单击事件类型。open_url(打开连接)/instructions(下发指令)
              //   //右键菜单数据
              //   children: [
              //   ],
              //   openurl: {
              //     url: "",//菜单打开的地址
              //     target: "",//打开地址的方式内部打开和新浏览器标签打开。page_alert(页内弹出)/new_label(新页打开)
              //     width: "",//打开窗口的宽度
              //     height: "",//打开窗口的高度
              //     urlType: "",//url的类型，custom(自定义地址)/inside(监测页面)
              //     menuId: "",//urlType为inside时的菜单id
              //   },
              //   requesturl: {
              //     url: "",//请求地址
              //     reques_type: "",//请求地址方式
              //     isreturn: false //是否弹出返回消息
              //   }
              // }
            ],
            //是否灵活控制
            myIsAgileState: false,
            //灵活状态控制
            myAgileState: [
              // {
              //   key: myCommon.uniqueId(),
              //   //allDataValue为containerConfig下的allDataValue，可以根据allDataConfig的key获取所有绑定的的值，返回bool值
              //   isChange:
              //     '//默认参数allDataValue为该画布下所有数据源对象\n//您可以根据自己在数据配置中设置的主键，从allDataValue对象中获取数据\n//必须有返回值，返回值类型为bool\nif(allDataValue)\n{\n//编辑您的计算逻辑并return值;\n\n}\nelse{\n return false \n}\n',
              //   //isChange为true时更改的颜色
              //   color: '',
              //   //myAgileState中的优先计算的等级
              //   level: 0,
              //   //状态名称
              //   name: '',
              // }
            ],
            //服务的Id
            myServiceId: null,
            //简单状态控制
            mySimpleState: [
              {
                name: '中断',
                code: 'isOnline_',
                color: '#FF0000',
                open: true,
                level: 0,
              },
              {
                name: '故障',
                code: 'isNormal_',
                color: '#EE1481',
                open: true,
                level: 1,
              },
              {
                name: '性能超出',
                code: 'isPerformanceNormal_',
                color: '#FF7F27',
                open: true,
                level: 2,
              },
            ],
          },
        },
      };
    },
    //mqtt信息过滤
    async mqttMsgReceive(topic: string, message) {
      try {
        if (['Data/Monitor/WebMsg/Insert', 'Data/Monitor/WebMsg/Update'].includes(topic)) {
          this.mqttMsgChange = {
            topic,
            message,
          };
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
});

// Need to be used outside the setup
export function useGplotStoreWithOut() {
  return useGplotStore(store);
}
