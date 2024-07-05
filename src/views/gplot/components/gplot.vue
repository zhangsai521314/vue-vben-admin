<template>
  <a-spin tip="渲染中..." :spinning="rendering">
    <!-- <button @click="executeCode">执行后端代码</button> -->
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
  import { useAppStore } from '@/store/modules/app';
  import { Circle } from '@antv/g';
  import { CubicHorizontal, ExtensionCategory, Graph, register, subStyleProps } from '@antv/g6';
  import { Renderer } from '@antv/g-svg';
  import dayjs from 'dayjs';
  import ContextMenu from '@imengyu/vue3-context-menu';
  import { onMounted, ref, nextTick, createVNode, watch, unref, onBeforeUnmount } from 'vue';
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
  import gplotApi from '@/api/gplot';
  import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
  import softwareApi from '@/api/software';
  import messageApi from '@/api/message';

  const props = defineProps({
    viewType: {
      type: String,
      default() {
        return 'monitor';
      },
    },
    gplotId: {
      type: String,
      default() {
        return null;
      },
    },
    menuId: {
      type: String,
      default() {
        return null;
      },
    },
  });
  const gplotKey = `${myCommon.uniqueId()}`;
  const timeKey = `gplot_${myCommon.uniqueId()}`;
  const appStore = useAppStore();
  const gplotStore = useGplotStoreWithOut();
  //初始化配置
  gplotStore.setGplotKeyOb(gplotKey);
  //拓扑图对象
  let graphOb: Graph;
  const rendering = ref(false);
  const mountRef = ref();
  //是否按下alt
  let isDownAlt = false;
  let isDownCtrl = false;
  let isDownShift = false;
  //保存的配置id
  let gplotId = props.gplotId;
  //动态保存配置信息id
  let changeSaveTimeId;
  //是否需要保存
  let isHaveSave = false;
  //绑定软件服务的节点
  const serviceIdDatas = [];
  //绑定灵活配置的节点
  const agileStateData = [];
  gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId = props.menuId;
  shortcutKey_();

  async function init() {
    rendering.value = true;
    // setInterval(() => {
    //   gplotStore.gplotKeyOb[gplotKey].lineWidth = gplotStore.gplotKeyOb[gplotKey].lineWidth + 2;
    // }, 2000);
    let gplotConfig = {};
    if (gplotId != null || gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId != null) {
      try {
        const config = await getConfig();
        gplotId = config.gplotId;
        if (config.gplotConfig) {
          gplotConfig = JSON.parse(config.gplotConfig);
        }
        if (config.globalConfig) {
          gplotStore.gplotKeyOb[gplotKey].containerConfig = JSON.parse(config.globalConfig);
          gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = false;
        }
      } catch (error) {
        message.warning('获取配置信息失败');
      }
    }
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

    const graphConfig = {
      //画布容器
      container: mountRef.value,
      // renderer: () => new Renderer(),
      //是否自动调整大小
      autoResize: true,
      // //画布背景色，暂有bug
      // background: gplotStore.gplotKeyOb[gplotKey].containerConfig.backgroundColor,
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
          sensitivity: 0.1,
          onFinish: () => {
            gplotStore.gplotKeyOb[gplotKey].containerConfig.zoom = graphOb.getZoom();
          },
          enable: () => {
            if (props.viewType == 'edit') {
              return props.viewType == 'edit' && !isDownShift;
            } else {
              return !gplotStore.gplotKeyOb[gplotKey].containerConfig.runType.includes(
                'zommCanvas',
              );
            }
          },
        },
        {
          key: 'DragCanvas',
          type: 'drag-canvas',
          enable: () => {
            if (props.viewType == 'edit') {
              return !isDownAlt && !isDownShift && !isDownCtrl;
            } else {
              return !gplotStore.gplotKeyOb[gplotKey].containerConfig.runType.includes(
                'dragCanvas',
              );
            }
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
          onSelect: (e) => {
            const ids = [];
            for (const key in e) {
              ids.push(key);
            }
            if (ids.length > 0) {
              gplotStore.gplotKeyOb[gplotKey].selectedOb = graphOb.getElementData(ids);
            } else {
              gplotStore.gplotKeyOb[gplotKey].selectedOb = null;
            }
            return e;
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
            return false;
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
                  //配置原有的样式
                  myOldStyle: {
                    iconFill: '',
                    labelFill: '',
                  },
                  //锁定
                  myLockAll: false,
                  myEvent: [],
                  myAgileState: [],
                  myIsAgileState: false,
                  mySimpleState: gplotStore.gplotKeyOb[gplotKey].nodeConfig.mySimpleState,
                };
                return e;
              } else {
                message.info('该节点直接已有连线');
                return null;
              }
            }
            return null;
          },
        },
      ],
      plugins: [
        gplotStore.gplotKeyOb[gplotKey].containerConfig.grid,
        gplotStore.gplotKeyOb[gplotKey].containerConfig.background,
        //右键菜单
        {
          key: 'ContextMenu',
          type: 'contextmenu',
          trigger: 'contextmenu', // 'click' or 'contextmenu'
          getContent: (e) => {
            console.log(e);
            if (gplotStore.gplotKeyOb[gplotKey].selectedOb != null) {
              setTimeout(() => {
                ContextMenu.showContextMenu({
                  x: e.client.x,
                  y: e.client.y,
                  items: [
                    // {
                    //   label: '复制',
                    //   icon: '',
                    //   onClick: () => {
                    //     alert('复制');
                    //   },
                    // },
                    {
                      label: '删除',
                      icon: '',
                      onClick: () => {
                        deleteGplot(gplotStore.gplotKeyOb[gplotKey].selectedOb);
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
            }
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
      data: gplotConfig,
      edge: {
        //全部边线都是正交线
        type: 'polyline',
        style: {
          router: true,
        },
      },
    };
    if (props.viewType == 'edit') {
      graphConfig.plugins.push({
        //前进后退
        type: 'history',
        key: 'history',
        enable: () => {
          return props.viewType == 'edit';
        },
      });
    }
    graphConfig.plugins.find((m) => m.key == 'GridLine').lineWidth = gplotStore.gplotKeyOb[gplotKey]
      .containerConfig.grid.myIsShow
      ? 1
      : 0;
    graphOb = new Graph(graphConfig);
    //监控事件
    graphOb.on('click', (e) => {
      console.log('点击', e.target);
      if (e.target?.nodeName == 'document' && !e.target.hasOwnProperty('type')) {
        //点击了画布
        gplotStore.gplotKeyOb[gplotKey].selectedOb = null;
      } else {
        let selectedObs = getAllSelectOb(true);
        if (selectedObs.length == 0) {
        } else if (selectedObs.length > 1) {
          gplotStore.gplotKeyOb[gplotKey].selectedOb = selectedObs;
        } else {
          const selectedOb = graphOb.getElementData(e.target.id);
          gplotStore.gplotKeyOb[gplotKey].selectedOb = {
            id: selectedOb.id,
            style: _.cloneDeep(selectedOb.style),
            data: _.cloneDeep(selectedOb.data),
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
      // graphOb.setBackground('#0960BD');
      // graphOb.draw();
      // console.log('背景颜色', graphOb.getBackground());
      $('.g6-background').css({ backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' });
      if (props.viewType == 'edit') {
        window.addEventListener('beforeunload', beforeunloadHandler);
        //将图缩放至合适大小并平移至视口中心，编辑状态下使用户拖拽位置计算不正确
        // graphOb.fitView();
        //平移至中心
        graphOb.fitCenter();
      } else {
        if (gplotStore.gplotKeyOb[gplotKey].containerConfig.fit == 'fitCenter') {
          graphOb.fitCenter();
        } else if (gplotStore.gplotKeyOb[gplotKey].containerConfig.fit == 'fitView') {
          graphOb.fitView();
          setTimeout(() => {
            graphOb.zoomTo(graphOb.getZoom() - 0.05, true, [
              graphOb.getViewportCenter()[0],
              graphOb.getViewportCenter()[1],
            ]);
          }, 300);
        }
      }
      gplotStore.gplotKeyOb[gplotKey].renderSuccess = true;
      //更新功能
      //graphOb.updateBehavior({key: 'key', ...});
      if (props.viewType == 'edit') {
        watch(
          () => gplotStore.gplotKeyOb[gplotKey].selectedOb,
          () => {
            console.log('切换', gplotStore.gplotKeyOb[gplotKey].selectedOb);
            if (
              gplotStore.gplotKeyOb[gplotKey].selectedOb != null &&
              Object.keys(gplotStore.gplotKeyOb[gplotKey].selectedOb).length != 0
            ) {
              isHaveSave = true;
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
              changeSave();
            }
          },
          { deep: true },
        );
        watch(
          () => gplotStore.gplotKeyOb[gplotKey].containerConfig.grid.myIsShow,
          () => {
            //根据插件的key获取插件
            // const plugin = graphOb.getPluginInstance('GridLine');
            //更新组件
            graphOb.updatePlugin({
              key: 'GridLine',
              lineWidth: gplotStore.gplotKeyOb[gplotKey].containerConfig.grid.myIsShow ? 1 : 0,
            });
            $('.g6-background').css({ backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' });
          },
        );
        watch(
          () => gplotStore.gplotKeyOb[gplotKey].containerConfig.background.myBackground,
          () => {
            if (gplotStore.gplotKeyOb[gplotKey].containerConfig.background.backgroundImage == '') {
              gplotStore.gplotKeyOb[gplotKey].containerConfig.background.background =
                gplotStore.gplotKeyOb[gplotKey].containerConfig.background.myBackground;
              graphOb.updatePlugin(gplotStore.gplotKeyOb[gplotKey].containerConfig.background);
            } else {
              //  delete gplotStore.gplotKeyOb[gplotKey].containerConfig.background.background;
            }
            // graphOb.updatePlugin(gplotStore.gplotKeyOb[gplotKey].containerConfig.background);
          },
        );
        watch(
          () => gplotStore.gplotKeyOb[gplotKey].containerConfig.background.backgroundImage,
          () => {
            if (gplotStore.gplotKeyOb[gplotKey].containerConfig.background.backgroundImage != '') {
              gplotStore.gplotKeyOb[gplotKey].containerConfig.background.background = '';
              //  delete gplotStore.gplotKeyOb[gplotKey].containerConfig.background.background;
            } else {
              gplotStore.gplotKeyOb[gplotKey].containerConfig.background.background =
                gplotStore.gplotKeyOb[gplotKey].containerConfig.background.myBackground;
            }
            graphOb.updatePlugin(gplotStore.gplotKeyOb[gplotKey].containerConfig.background);
            $('.g6-background').css({ backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' });
          },
        );
        // //修复新增加的配置对象
        // const datas = graphOb.getData();
        // for (const key in datas) {
        //   datas[key].forEach((item) => {
        //     item.data.mySimpleState = gplotStore.gplotKeyOb[gplotKey].nodeConfig.data.mySimpleState;
        //   });
        // }
        //修复新增加的配置对象
      } else {
        //区别是否灵活配置更改状态
        const datas = graphOb.getData();
        for (const key in datas) {
          datas[key].forEach((changeNode) => {
            //增加原本的样式属性
            changeNode.data.myOldStyle = _.cloneDeep(changeNode.style);
            if (!changeNode.data.myIsAgileState && changeNode.data.myServiceId != null) {
              serviceIdDatas.push(changeNode);
            } else if (changeNode.data.myIsAgileState && changeNode.data.myAgileState.length > 0) {
              agileStateData.push(changeNode);
            }
          });
        }
        //非灵活配置的变化监控
        if (serviceIdDatas.length > 0) {
          noAgileStateChangeStatus();
        }
        if (agileStateData.length > 0) {
          agileStateLastStatus();
        }
      }
      rendering.value = false;
    });
  }

  //动态保存配置
  function changeSave() {
    if (graphOb && isHaveSave) {
      clearTimeout(changeSaveTimeId);
      changeSaveTimeId = useTimeFn(
        setTimeout(() => {
          saveHisConfig();
        }, 5000),
        timeKey,
        'changeSave',
      );
    }
  }

  //正式保存配置
  function saveConfig() {
    if (gplotId == null) {
      return saveHisConfig();
    }
    try {
      gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = true;
      return graphOb.toDataURL().then((img) => {
        const configData = _.cloneDeep(graphOb.getData());
        for (const key in configData) {
          configData[key].forEach((item) => {
            item.states = [];
          });
        }
        return gplotApi
          .UpdateGplot({
            globalConfig: JSON.stringify(gplotStore.gplotKeyOb[gplotKey].containerConfig),
            gplotConfig: JSON.stringify(configData),
            gplotId: gplotId,
            mainImg: img,
            menuId: gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId,
          })
          .then(() => {
            gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = false;
            message.success('保存配置成功');
          })
          .catch(() => {
            gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = false;
          });
      });
    } catch (error) {
      console.error('动态保存配置错误', error);
      gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = false;
    }
  }

  //保存历史配置
  function saveHisConfig() {
    clearTimeout(changeSaveTimeId);
    try {
      return graphOb.toDataURL().then((img) => {
        const configData = _.cloneDeep(graphOb.getData());
        for (const key in configData) {
          configData[key].forEach((item) => {
            item.states = [];
          });
        }
        return gplotApi
          .AddtGplotHis({
            globalConfig: JSON.stringify(gplotStore.gplotKeyOb[gplotKey].containerConfig),
            gplotConfig: JSON.stringify(configData),
            gplotId: gplotId,
            mainImg: img,
            menuId: gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId,
          })
          .then((data) => {
            isHaveSave = false;
            gplotId = data;
            message.info('已为您自动保存配置历史');
          });
      });
    } catch (error) {
      console.error('动态保存配置错误', error);
    }
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

  //组合选中
  function groupGplot() {
    let selectedObs = getAllSelectOb();
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
              //配置原有的样式
              myOldStyle: {
                iconFill: '',
                labelFill: '',
              },
              //锁定
              myLockAll: false,
              myEvent: [],
              myAgileState: [],
              myIsAgileState: false,
              mySimpleState: gplotStore.gplotKeyOb[gplotKey].nodeConfig.mySimpleState,
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

  //删除选中
  function deleteGplot(data) {
    if (!Array.isArray(data)) {
      deleteGplot([data]);
    } else {
      const deleteOb = {
        nodes: [],
        edges: [],
        // , combos: []
      };
      const comboIds = [];
      data.forEach((m) => {
        if (m.data.myType == 'node') {
          deleteOb.nodes.push(m.id);
        } else if (m.data.myType == 'edge') {
          deleteOb.edges.push(m.id);
        } else if (m.data.myType == 'combo') {
          comboIds.push(m.id);
          // deleteOb.combos.push(m.id);
        }
      });
      graphOb.removeData(deleteOb);
      try {
        graphOb.removeComboData(comboIds);
      } catch (error) {
        console.error(error);
      }
      graphOb.draw();
    }
  }

  //获取所有选中的对象
  function getAllSelectOb(isGetEdge = false) {
    let selectedObs = [];
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('node', 'selected'));
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('combo', 'selected'));
    if (isGetEdge) {
      selectedObs = selectedObs.concat(graphOb.getElementDataByState('edge', 'selected'));
    }
    return selectedObs;
  }

  //监控浏览器关闭
  function beforeunloadHandler(event) {
    if (gplotId != null && isHaveSave) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  async function getConfig() {
    if (gplotId) {
      if (props.viewType == 'pre') {
        return gplotApi.GetGplotHisLast(gplotId);
      } else {
        return gplotApi.GetGplot(gplotId);
      }
    } else {
      return gplotApi.GetGplotMenuId(gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId);
    }
  }

  //非灵活配置的变化监控
  function noAgileStateChangeStatus() {
    softwareApi
      .GetServiceStatus(serviceIdDatas.map((m) => m.data.myServiceId))
      .then(async (nodeState) => {
        console.log('nodeState', nodeState);
        serviceIdDatas.forEach((node) => {
          const stateOb = graphOb.getElementData(node.id);
          let color = null;
          // if (stateOb.data.myServiceId == '522045670068299') {
          //   debugger;
          // }
          for (let i = 0; i < stateOb.data.mySimpleState.filter((m) => m.open).length; i++) {
            const element = stateOb.data.mySimpleState[i];
            if (!nodeState[element.code + stateOb.data.myServiceId]) {
              color = element.color;
              break;
            }
          }
          if (color == null) {
            //回复原始状态
            switch (stateOb.data.myType) {
              case 'node':
                color = stateOb.data.myOldStyle.iconFill;
                break;
              case 'edge':
                color = stateOb.data.myOldStyle.fill;
                break;
              case 'combo':
                color = stateOb.data.myOldStyle.stroke;
                break;
            }
          }
          changeStyle(stateOb.data.myType, node.id, color);
        });
        await graphOb.draw();
        useTimeFn(
          setTimeout(() => {
            noAgileStateChangeStatus();
          }, 500),
          timeKey,
          'noAgileStateChangeStatus',
        );
      })
      .catch((e) => {
        console.error(e);
        useTimeFn(
          setTimeout(() => {
            noAgileStateChangeStatus();
          }, 500),
          timeKey,
          'noAgileStateChangeStatus',
        );
      });
  }

  //灵活配置节点的状态初始化
  function agileStateLastStatus() {
    messageApi
      .GetServiceMsgTypeLastSimple()
      .then(async (nodeState) => {
        //设置全局变量值
        nodeState.forEach((state) => {
          changeAllDataConfig(state);
        });
        console.log(gplotStore.gplotKeyOb[gplotKey].containerConfig.allDataValue);
        agileStateChange();
        agileStateChangeStatus();
      })
      .catch((e) => {
        console.error(e);
        agileStateChangeStatus();
      });
  }

  //灵活配置更改全局值
  function changeAllDataConfig(data) {
    gplotStore.gplotKeyOb[gplotKey].containerConfig.allDataConfig.forEach((dataConfig) => {
      try {
        const executeFunc = new Function('dataOb', dataConfig.getValue);
        const runValue = executeFunc(data);
        if (runValue != undefined) {
          gplotStore.gplotKeyOb[gplotKey].containerConfig.allDataValue[dataConfig.key] = runValue;
        }
      } catch (error) {
        console.error('设置全局变量值出错', error, dataConfig);
      }
    });
  }
  //灵活配置状态判定及改变
  async function agileStateChange() {
    if (Object.keys(gplotStore.gplotKeyOb[gplotKey].containerConfig.allDataValue).length > 0) {
      //画布节点灵活配置赋值
      agileStateData.forEach((node) => {
        let color = null;
        //获取画布节点
        const stateOb = graphOb.getElementData(node.id);
        const orderData = _.sortBy(stateOb.data.myAgileState, (m) => m.level);
        for (let i = 0; i < orderData.length; i++) {
          try {
            const executeFunc = new Function('allDataValue', orderData[i].isChange);
            const runValue = executeFunc(
              gplotStore.gplotKeyOb[gplotKey].containerConfig.allDataValue,
            );
            if (typeof runValue === 'boolean') {
              if (runValue) {
                //灵活配置颜色
                color = orderData[i].color;
              }
              if (color == null) {
                //回复原始状态
                switch (stateOb.data.myType) {
                  case 'node':
                    color = stateOb.data.myOldStyle.iconFill;
                    break;
                  case 'edge':
                    color = stateOb.data.myOldStyle.fill;
                    break;
                  case 'combo':
                    color = stateOb.data.myOldStyle.stroke;
                    break;
                }
              }
              changeStyle(stateOb.data.myType, node.id, color);
              if (runValue) {
                //按优先级计算,有满足则跳出
                break;
              }
            } else {
              console.error('设置画布节点变量值返回值错误', orderData[i]);
            }
          } catch (error) {
            console.error('设置画布节点变量值出错', orderData[i]);
          }
        }
      });
      await graphOb.draw();
    }
  }
  //灵活配置的变化监控
  function agileStateChangeStatus() {
    watch(
      () => gplotStore.mqttMsgChange,
      async () => {
        if (gplotStore.mqttMsgChange) {
          changeAllDataConfig(gplotStore.mqttMsgChange);
          await agileStateChange();
        }
      },
    );
  }

  function changeStyle(type, id, color) {
    if (color != null) {
      //更改成对应状态
      switch (type) {
        case 'node':
          graphOb.updateNodeData([
            {
              id: id,
              style: {
                iconFill: color,
                labelFill: color,
              },
            },
          ]);
          break;
        case 'edge':
          graphOb.updateComboData([
            {
              id: id,
              style: {
                fill: color,
                stroke: color,
              },
            },
          ]);
          break;
        case 'combo':
          graphOb.updateEdgeData([
            {
              id: id,
              style: {
                stroke: color,
              },
            },
          ]);
          break;
      }
    }
  }
  watch(
    () => appStore.projectConfig!.menuSetting.collapsed,
    () => {
      if (graphOb) {
        graphOb.resize(mountRef.value?.clientWidth, mountRef.value?.clientHeight);
      }
    },
  );

  onMounted(() => {
    init();
    window.onresize = () => {
      if (graphOb) {
        graphOb.resize(mountRef.value?.clientWidth, mountRef.value?.clientHeight);
      }
    };
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
    //拓扑图id
    getGplotId: () => {
      return gplotId;
    },
    saveConfig,
    saveHisConfig,
    fitCenter: () => {
      if (graphOb) {
        graphOb.fitCenter();
      }
    },
    fitView: () => {
      if (graphOb) {
        graphOb.fitView();
      }
    },
    zoomChange: (v) => {
      graphOb.zoomTo(v, true, [graphOb.getViewportCenter()[0], graphOb.getViewportCenter()[1]]);
      graphOb.draw();
    },
  });

  //页面卸载后
  tryOnUnmounted(() => {
    if (graphOb) {
      graphOb.destroy();
    }
  });
</script>

<style lang="less" scoped>
  .g6-background {
    background-repeat: no-repeat !important;
    background-size: 100% 100% !important;
  }

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
