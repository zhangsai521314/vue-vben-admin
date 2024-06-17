//拓扑图公用属性
import { defineStore } from 'pinia';
import { store } from '@/store';

export interface GplotState {
  //画布的配置
  containerConfig: object;
  //是否渲染成功
  renderSuccess: Boolean;
  //是否选中了画布
  isSelectContaine: Boolean;
  //选中的组件
  selectedOb: object;
  //节点的配置项
  nodeConfig: object;
}

//gploat数据存储类
export const useGplotStore = defineStore({
  id: 'gploat-data',
  state: (): GplotState => ({
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
      style: {
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
        labelText: '默认文字',
        //文字颜色
        labelFill: '#000',
        //文字大小
        labelFontSize: 30,
        //文字位移X
        labelOffsetX: -20,
        //文字位移Y
        labelOffsetY: -20,
        //是否文字背景
        labelBackground: true,
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
        opacity: 100,

        //线条宽度
        lineWidth: 2,
        //线条颜色
        stroke: '#9AAED1',
        //是否显示开始箭头
        startArrow: true,
        //开始箭头大小
        startArrowSize: 10,
        //开始箭头类型
        startArrowType: 'triangle',
        //是否显示结束箭头
        endArrow: true,
        //结束箭头大小
        endArrowSize: 10,
        //结束箭头类型
        endArrowType: 'triangle',
      },
      data: {
        //锁定
        lockAll: false,
        //事件
        event: [],
      },
    },
    nodeConfig: {
      style: {
        lineWidth: 2,
        //node是方形的边框角度
        radius: 2,
        //node图形大小
        size: 100,
        //node图形填充色
        fill: '',
        //文字
        labelText: '默认文字',
        //文字颜色
        labelFill: '#000',
        //文字大小
        labelFontSize: 30,
        //文字位移
        labelOffsetY: -12,
        //图标类型
        iconFontFamily: 'iconfont',
        //图标颜色
        iconFill: '#1783FF',
        //图标大小
        iconFontSize: 80,
        //透明度
        opacity: 100,
      },
      //自定义信息
      data: {
        //锁定
        lockAll: false,
        //图元标记，编辑器左侧能显示的哪些
        sign: ['text'],
      },
    },
  }),
  getters: {},
  actions: {},
});

// Need to be used outside the setup
export function useGplotStoreWithOut() {
  return useGplotStore(store);
}
