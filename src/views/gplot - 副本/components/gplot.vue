<template>
  <a-spin tip="渲染中..." :spinning="rendering">
    <div
      onclick=""
      @contextmenu="rightClick"
      :style="{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#fff',
      }"
      class="gplotDom"
    >
      <div ref="mountRef" style="width: 100%; height: 100%"> </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
  import { Circle } from '@antv/g';
  import { CubicHorizontal, ExtensionCategory, Graph, register, subStyleProps } from '@antv/g6';
  import { Renderer } from '@antv/g-svg';
  import dayjs from 'dayjs';
  import ContextMenu from '@imengyu/vue3-context-menu';
  import { onMounted, ref, nextTick, createVNode, watch, unref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { tryOnUnmounted } from '@vueuse/core';
  import { useGplotStoreWithOut } from '@/store/modules/gplot';
  //定时器
  import { useTimeFn } from '/@/hooks/core/useTime_';
  import html2Canvas from 'html2canvas';
  import * as echarts from 'echarts';
  //快捷键监控
  import shortcutKey from 'keymaster';

  const props = defineProps({
    viewType: {
      type: String,
      default() {
        return 'monitor';
      },
    },
  });
  const gplotKey = `${myCommon.uniqueId()}`;
  const gplotStore = useGplotStoreWithOut();
  gplotStore.setGplotKeyOb(gplotKey);
  //拓扑图对象
  let graphOb: Graph;
  const rendering = ref(false);
  const mountRef = ref();
  //是否按下alt
  let isDownAlt = false;
  let isDownCtrl = false;
  let isDownShift = false;

  shortcutKey_();

  function init() {
    // rendering.value = true;
    // setInterval(() => {
    //   gplotStore.gplotKeyOb[gplotKey].lineWidth = gplotStore.gplotKeyOb[gplotKey].lineWidth + 2;
    // }, 2000);
  }

  //快捷键监控
  function shortcutKey_() {
    document.onkeydown = function (e) {
      if (e.altKey || e.keyCode == 18) {
        isDownAlt = true;
      } else if (e.ctrlKey || e.keyCode == 17) {
        isDownCtrl = true;
      } else if (e.shiftKey || e.keyCode == 16) {
        isDownShift = true;
      }
    };
    document.onkeyup = function (e) {
      if (e.altKey || e.keyCode == 18) {
        isDownAlt = false;
      } else if (e.ctrlKey || e.keyCode == 17) {
        isDownCtrl = false;
      } else if (e.shiftKey || e.keyCode == 16) {
        isDownShift = false;
      }
    };
    // shortcutKey('ctrl', function () {
    //   event.preventDefault();
    // });
  }

  function rightClick() {
    //阻止系统右键事件
    event.preventDefault();
  }

  //更改状态
  function changeStatus(color) {
    graphOb.updateNodeData([
      {
        id: 'default',
        style: {
          iconFill: color,
          labelFill: color,
        },
      },
    ]);
    graphOb.updateComboData([
      {
        id: 'combo1',
        style: {
          fill: color,
          stroke: color,
        },
      },
    ]);
    graphOb.updateEdgeData([
      {
        id: 'edge-1',
        style: {
          stroke: color,
        },
      },
    ]);
    graphOb.draw();
  }

  //增加拓扑对象{domX, domY, iconUnicode}
  function addGplot(ob) {
    //给定的浏览器坐标，转换为画布上的绘制坐标
    const zuoBiao = graphOb.getCanvasByClient([ob.domX, ob.domY]);
    const id = myCommon.uniqueId();
    const nodeConfig = _.cloneDeep(gplotStore.gplotKeyOb[gplotKey].nodeConfig);
    myCommon.objectToObject(nodeConfig, {
      id: id,
      type: 'rect',
      style: {
        x: zuoBiao[0],
        y: zuoBiao[1],
        //图标
        iconText: eval(`'${ob.iconUnicode}'`),
        lineWidth: 0,
        labelText: '默认文字',
      },
      //自定义信息
      data: {
        myType: 'node',
      },
    });
    graphOb.addNodeData([nodeConfig]);
    console.log('增加', nodeConfig);
    graphOb.draw();
  }

  //组合
  function groupGplot() {
    let selectedObs = [];
    //获取选中的对象
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('node', 'selected'));
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('combo', 'selected'));
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('node', 'active'));
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('combo', 'active'));
    let active = graphOb
      .getElementDataByState('node', 'active')
      .filter((m) => selectedObs.find((i) => i.id != m.id));
    selectedObs = selectedObs.concat(active);
    active = graphOb
      .getElementDataByState('combo', 'active')
      .filter((m) => selectedObs.find((i) => i.id != m.id));
    selectedObs = selectedObs.concat(active);
    if (selectedObs.length > 1) {
      //获取带组的选中的对象
      const comboSelectedObs = selectedObs.filter((m) => m.hasOwnProperty('combo'));
      if (comboSelectedObs.length == 0) {
        //目前选中的对象都没组合
        const comboId = myCommon.uniqueId();
        graphOb.addComboData([
          {
            id: comboId,
            type: 'rect',
            style: {
              opacity: 1,
              lineWidth: 2,
              fill: '',
              stroke: '#99ADD1',
            },
            data: {
              myType: 'combo',
            },
          },
        ]);

        // const nodeConfig = _.cloneDeep(gplotStore.gplotKeyOb[gplotKey].nodeConfig);
        // myCommon.objectToObject(nodeConfig, {
        //   id: comboId,
        //   type: 'rect',
        //   style: {
        //     lineWidth: 2,
        //   },
        //   //自定义信息
        //   data: {
        //     type: 'combo',
        //   },
        // });
        // graphOb.addComboData([nodeConfig]);

        selectedObs.forEach((m) => (m['combo'] = comboId));
        //更新的方式：https://github.com/antvis/G6/issues/5857
        const nodes = [];
        const combos = [];
        selectedObs
          .filter((m) => (m.data.type = 'node'))
          .forEach((m) => {
            nodes.push({
              id: m.id,
              combo: comboId,
            });
          });
        selectedObs
          .filter((m) => (m.data.type = 'combo'))
          .forEach((m) => {
            combos.push({
              id: m.id,
              combo: comboId,
            });
          });
        graphOb.updateComboData(combos);
        graphOb.updateNodeData(nodes);
        graphOb.draw();
      }
      //有组合有节点:另外的组合形式
    }
  }

  onMounted(() => {
    init();

    // //自定义边上的marker的渲染规则
    // class FlyMarkerCubic extends CubicHorizontal {
    //   getMarkerStyle(attributes, t) {
    //     console.log(attributes);
    //     console.log(t);
    //     return {
    //       r: 5,
    //       fill: 'red',
    //       offsetPath: this.shapeMap.key,
    //       ...subStyleProps(attributes, 'marker'),
    //     };
    //   }

    //   override onCreate() {
    //     const marker = this.upsert(
    //       'marker',
    //       Circle,
    //       this.getMarkerStyle(this.attributes, this),
    //       this,
    //     );
    //     marker?.animate([{ offsetDistance: 0 }, { offsetDistance: 1 }], {
    //       duration: 1000,
    //       iterations: Infinity,
    //     });
    //   }
    // }
    // register(ExtensionCategory.EDGE, 'fly-marker-cubic', FlyMarkerCubic);
    // //自定义边上的marker的渲染规则
    //画布配置：https://g6-next.antv.antgroup.com/api/graph/option
    graphOb = new Graph({
      //画布容器
      container: mountRef.value,
      // renderer: () => new Renderer(),
      //是否自动调整大小
      autoResize: true,
      //画布背景色
      background: '#fff',
      //缩放比列
      zoom: 1,
      //图的宽度
      width: mountRef.value?.clientWidth,
      //图的高度
      height: mountRef.value?.clientHeight,
      //功能控制 https://g6-next.antv.antgroup.com/api/behaviors/brush-select
      behaviors: [
        {
          key: 'ZoomCanvas',
          type: 'zoom-canvas',
        },
        {
          key: 'DragCanvas',
          type: 'drag-canvas',
          enable: () => {
            return !isDownAlt && !isDownShift && !isDownCtrl;
          },
        },
        {
          key: 'DragElement',
          type: 'drag-element',
          enable: () => {
            return props.viewType == 'edit' && !isDownShift;
          },
        },
        {
          //单击选中
          key: 'ClickSelect',
          type: 'click-select',
          //开启多选
          multiple: true,
          trigger: ['Control'],
          enable: () => {
            return props.viewType == 'edit';
          },
        },
        {
          //框选
          key: 'BrushSelect',
          type: 'brush-select',
          mode: 'union',
          trigger: ['shift'],
          enable: () => {
            return props.viewType == 'edit';
          },
          style: {
            fill: '#00f',
            fillOpacity: 0.2,
            stroke: '#0ff',
          },
        },
        {
          //创建边
          key: 'CreateEdge',
          type: 'create-edge',
          //drag拖拽的方式创建、click通过点击
          trigger: 'click',
          style: gplotStore.gplotKeyOb[gplotKey].nodeConfig.style,
          enable: () => {
            return props.viewType == 'edit' && isDownAlt;
          },
          onCreate: (e) => {
            if (e.source == e.target) {
              message.info('同一节点不可连线');
              return null;
            }
            const data = graphOb.getData();
            if (data) {
              if (!data.edges.find((m) => m.source == e.source && m.target == e.target)) {
                e['data'] = {
                  myType: 'edge',
                  lockAll: false,
                  event: [],
                };
                return e;
              } else {
                message.info('该节点直接已有连线');
                return null;
              }
            }
            return null;
          },
          onFinish: (e) => {},
        },
      ],
      plugins: [
        {
          //画布网格
          key: 'GridLine',
          type: 'grid-line',
          enable: () => {
            return props.viewType == 'edit';
          },
        },
        {
          //前进后退
          type: 'history',
          key: 'history',
          enable: () => {
            return props.viewType == 'edit';
          },
        },
        //右键菜单
        {
          key: 'ContextMenu',
          type: 'contextmenu',
          trigger: 'contextmenu', // 'click' or 'contextmenu'
          getContent: (e) => {
            console.log(e);
            setTimeout(() => {
              ContextMenu.showContextMenu({
                x: e.client.x,
                y: e.client.y,
                items: [
                  {
                    label: '复制',
                    icon: '',
                    onClick: () => {
                      alert('复制');
                    },
                  },
                  {
                    label: '删除',
                    icon: '',
                    onClick: () => {
                      alert('删除');
                    },
                  },
                  {
                    label: '组合',
                    icon: '',
                    // disabled: true,
                    onClick: () => {
                      groupGplot();
                    },
                  },
                  {
                    label: '拆分',
                    icon: '',
                    disabled: true,
                    onClick: () => {},
                  },
                ],
              });
            }, 150);
            return null;
          },
        },
      ],
      // layout: {
      //   //
      //   type: 'antv-dagre',
      //   ranksep: 50,
      //   nodesep: 5,
      //   sortByCombo: true,
      // },
      data: {
        // nodes: [],
        // edges: [],
        // combos: [],
      },
      edge: {
        //全部边线都是正交线
        type: 'polyline',
        style: {
          router: true,
        },
      },
    });
    //监控事件
    graphOb.on('click', (e) => {
      console.log('点击', e.target);
      if (e.target?.nodeName == 'document' && !e.target.hasOwnProperty('type')) {
        //点击了画布
        gplotStore.gplotKeyOb[gplotKey].isSelectContaine = true;
      } else {
        gplotStore.gplotKeyOb[gplotKey].isSelectContaine = false;
        let selectedObs = [];
        //获取选中的对象
        selectedObs = selectedObs.concat(graphOb.getElementDataByState('node', 'selected'));
        selectedObs = selectedObs.concat(graphOb.getElementDataByState('combo', 'selected'));
        selectedObs = selectedObs.concat(graphOb.getElementDataByState('edge', 'selected'));
        console.log('点击获取', selectedObs);
        if (selectedObs.length == 0) {
          gplotStore.gplotKeyOb[gplotKey].isSelectContaine = true;
        } else if (selectedObs.length > 1) {
          gplotStore.gplotKeyOb[gplotKey].selectedOb = selectedObs;
        } else {
          const activeOb = graphOb.getElementData(e.target.id);
          console.log('点击获取activeOb', activeOb);
          gplotStore.gplotKeyOb[gplotKey].selectedOb = {
            id: activeOb.id,
            style: _.cloneDeep(activeOb.style),
            data: _.cloneDeep(activeOb.data),
          };
        }
      }
      // const contextmenu = graphOb.getPluginInstance('ContextMenu');
      // contextmenu?.hide();
    });
    // graphOb.on('contextmenu', (a, b, c) => {
    //   //阻止系统右键事件
    //   event.preventDefault();
    //   return false;
    // });
    graphOb.render().then(() => {
      if (props.viewType != 'edit') {
        //将图缩放至合适大小并平移至视口中心，编辑状态下使用户拖拽位置计算不正确
        graphOb.fitView();
      }
      gplotStore.gplotKeyOb[gplotKey].renderSuccess = true;
      //根据插件的key获取插件
      // const plugin = graphOb.getPluginInstance('GridLine');
      //根据插件的key更新插件信息
      // gplotStore.gplotKeyOb[gplotKey].gplotOb.updatePlugin({
      //   key: 'GridLine',
      //   size: 150,
      // });
      //更新功能
      //gplotStore.gplotKeyOb[gplotKey].gplotOb.updateBehavior({key: 'key', ...});
      if (props.viewType == 'edit') {
        watch(
          () => gplotStore.gplotKeyOb[gplotKey].selectedOb,
          () => {
            console.log('切换', gplotStore.gplotKeyOb[gplotKey].selectedOb);
            if (!Array.isArray(gplotStore.gplotKeyOb[gplotKey].selectedOb)) {
              switch (gplotStore.gplotKeyOb[gplotKey].selectedOb.data.myType) {
                case 'node':
                  graphOb.updateNodeData([gplotStore.gplotKeyOb[gplotKey].selectedOb]);
                  break;
                case 'edge':
                  graphOb.updateEdgeData([gplotStore.gplotKeyOb[gplotKey].selectedOb]);
                  break;
                case 'combo':
                  graphOb.updateComboData([gplotStore.gplotKeyOb[gplotKey].selectedOb]);
                  break;
              }
              graphOb.draw();
            }
          },
          { deep: true },
        );
      } else {
        //变化监控
      }
    });
  });

  //暴露给父组件可以调用的方法
  defineExpose({
    getGraphOb: () => {
      return graphOb;
    },
    //组合对象
    groupGplot,
    //添加node
    addGplot,
    //拓扑图的key
    gplotKey,
  });

  //页面卸载后
  tryOnUnmounted(() => {
    if (graphOb) {
      graphOb.destroy();
    }
  });
</script>

<style lang="less" scoped>
  /* 其他元素的-展示（视频） */
  .otherDom {
    z-index: auto;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }

  .otherDom > .show-noData {
    width: 100%;
    height: 100%;
    overflow: hidden;
    text-align: center;

    > i {
      font-size: 110px;
    }
  }

  .otherDom > .show-data,
  .otherDom > .show-data > div,
  .otherDom > .show-data > div > video,
  .otherDom > .show-data > canvas {
    width: 100%;
    height: 100%;
  }

  :deep(.vjs-modal-dialog-description) {
    position: relative;
    bottom: 19px;
  }

  /* 其他元素的-展示（视频） */

  /* 元素的拖拽及改变大小的样式 */
  .ineuos-point {
    position: absolute;
    width: 13px;
    height: 13px;
    border: 1px solid #88affe;
    border-radius: -7px;
  }

  .ineuos-border {
    top: -9px;
    left: -9px;
    width: calc(100% + 18px);
    height: calc(100% + 18px);
    padding: 8px;
    border: 1px solid #82a6ea;
  }

  .ineuos-rotate-line {
    top: -40px;
    left: 50%;
    width: 0;
    height: 22px;
    margin-left: 2px;
    border-left: 1px;
    cursor: s-resize;
  }

  .ineuos-rotate-point {
    top: -55px;
    left: 50%;
    margin-left: -5px;
    cursor: crosshair;
  }

  .ineuos-lt-point {
    top: -16px;
    left: -16px;
    cursor: nw-resize;
  }

  .ineuos-rt-point {
    top: -16px;
    right: -16px;
    cursor: sw-resize;
  }

  .ineuos-rb-point {
    right: -16px;
    bottom: -16px;
    cursor: nw-resize;
  }

  .ineuos-lb-point {
    bottom: -16px;
    left: -16px;
    cursor: sw-resize;
  }

  .ineuos-ct-point {
    top: -16px;
    left: 50%;
    margin-left: -5px;
    cursor: s-resize;
  }

  .ineuos-cb-point {
    bottom: -16px;
    left: 50%;
    margin-left: -5px;
    cursor: s-resize;
  }

  .ineuos-cl-point {
    top: 50%;
    left: -16px;
    margin-top: -5px;
    cursor: w-resize;
  }

  .ineuos-cr-point {
    top: 50%;
    right: -16px;
    margin-top: -5px;
    cursor: w-resize;
  }

  /* 元素的拖拽及改变大小的样式 */
</style>
