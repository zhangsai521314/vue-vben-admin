//拓扑图公用属性
import { defineStore } from 'pinia';
import { store } from '@/store';

interface GplotStateOb {
  gplotKeyOb: {
    //画布的配置
    containerConfig: object;
    //是否渲染成功
    renderSuccess: boolean;
    //是否选中了画布
    isSelectContaine: boolean;
    //选中的组件
    selectedOb: object;
    //节点的配置项
    nodeConfig: object;
  };
}
export interface GplotState {
  gplotKeyOb: object;
}

//gploat数据存储类
export const useGplotStore = defineStore({
  id: 'gploat-data',
  state: (): GplotState => ({
    gplotKeyOb: {},
  }),
  getters: {
    getKeyOb: (state) => {
      return (key) => state.gplotKeyOb[key];
    },
  },
  actions: {
    setGplotKeyOb(key) {
      this.gplotKeyOb[key] = {
        containerConfig: {
          //是否展示网格
          gridShow: true,
          //背景色
          backgroundColor: '#fff',
          //背景图
          backgroundImg: '',
          //缩放放大比例%
          zoom: 100,
          //运行限制：zommCanvas、dragCanvas
          runType: [],
        },
        renderSuccess: false,
        isSelectContaine: true,
        selectedOb: {
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
            //文字内边距
            labelPadding: 0,

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
            //虚线
            lineDash: [0, 0],
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
            padding: 20,
          },
          data: {
            //节点大类型：node、edge、combo
            myType: '',
            //锁定
            myLockAll: false,
            //事件
            myEvent: [],
          },
        },
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
            //锁定
            myLockAll: false,
            //事件
            myEvent: [],
          },
        },
      };
    },
  },
});

// Need to be used outside the setup
export function useGplotStoreWithOut() {
  return useGplotStore(store);
}
