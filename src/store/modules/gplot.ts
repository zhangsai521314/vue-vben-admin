//拓扑图公用属性
import { defineStore } from 'pinia';
import { store } from '@/store';

export interface GplotState {
  //画布的配置
  containerConfig: object;
  //是否渲染成功
  renderSuccess: Boolean;
  //选中的组件
  selectedOb: Nullable<object>;
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
      //背景图是否自动扩展
      infinite: true,
      //背景图
      backgroundImg: '',
      //缩放放大比例
      zoom: 1,
      //运行限制
      runType: [],
    },
    renderSuccess: false,
    selectedOb: {
      obtype: 'container',
    },
    nodeConfig: {
      lineWidth: 2,
      //node是方形的边框角度
      nodeRectRadius: 2,
      //node图形大小
      nodeSize: 100,
      //node图形填充色
      nodeFill: '',
      //文字
      labelText: '默认文字',
      //文字颜色
      labelFill: '#000',
      //文字大小
      labelFontSize: 30,
      //文字位移
      labelOffsetY: -20,
      //图标类型
      iconFontFamily: 'iconfont',
      //图标颜色
      iconFill: '#1783FF',
      //图标大小
      iconFontSize: 80,
    },
  }),
  getters: {},
  actions: {},
});

// Need to be used outside the setup
export function useGplotStoreWithOut() {
  return useGplotStore(store);
}
