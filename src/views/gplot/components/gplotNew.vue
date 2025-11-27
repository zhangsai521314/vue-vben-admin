<template>
  <a-spin :spinning="rendering">
    <div
      @contextmenu.prevent="rightClick"
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
  import { Graph } from '@antv/g6';
  import ContextMenu from '@imengyu/vue3-context-menu';
  import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
  import { message } from 'ant-design-vue';
  import { useGplotStoreWithOut } from '@/store/modules/gplot';
  import gplotApi from '@/api/gplot';
  import softwareApi from '@/api/software';
  import messageApi from '@/api/message';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';
  import { useGo } from '/@/hooks/web/usePage';
  import { cloneDeep, sortBy } from 'lodash-es';

  const go = useGo();
  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;

  const props = defineProps({
    viewType: {
      type: String,
      default: 'monitor',
    },
    gplotId: {
      type: String,
      default: null,
    },
    menuId: {
      type: String,
      default: null,
    },
  });

  const gplotKey = `${myCommon.uniqueId()}`;
  const appStore = useAppStore();
  const gplotStore = useGplotStoreWithOut();

  // 初始化 Store 配置
  gplotStore.setGplotKeyOb(gplotKey);
  gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId = props.menuId;

  // 核心变量
  let graphOb: Graph | null = null;
  const rendering = ref(false);
  const mountRef = ref<HTMLElement | null>(null);

  // 键盘状态
  let isDownAlt = false;
  let isDownCtrl = false;
  let isDownShift = false;

  // ID 与 状态管理
  let gplotId = props.gplotId;
  let changeSaveTimeId: any = null;
  let isHaveSave = false;
  let noAgileStateChangeStatus_timeId: any = null;

  // 标志位：是否停止运行（用于中断轮询）
  let isStop = false;

  // 存储动态 watch 的停止函数，用于防止内存泄漏
  let watchStoppers: Function[] = [];

  // 节点数据缓存
  let serviceIdDatas: any[] = [];
  let agileStateData: any[] = [];

  // --- 核心逻辑 ---

  // 清理所有动态监听器
  function clearWatchers() {
    if (watchStoppers.length > 0) {
      watchStoppers.forEach((stop) => stop());
      watchStoppers = [];
    }
  }

  async function init(isClear, gpltHisId) {
    // 每次重新初始化前，清理旧的资源
    clearWatchers();
    if (graphOb) {
      graphOb.destroy();
      graphOb = null;
    }

    // 重置基础数据
    serviceIdDatas = [];
    agileStateData = [];

    rendering.value = true;

    let gplotConfig: any = {};

    // 获取配置
    if (
      !isClear &&
      (gplotId != null || gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId != null)
    ) {
      try {
        const config = await getConfig(gpltHisId);
        if (config) {
          gplotId = config.gplotId;
          if (config.gplotConfig) {
            gplotConfig = JSON.parse(config.gplotConfig);
            // 多语言处理
            for (const key in gplotConfig) {
              gplotConfig[key].forEach((item) => {
                switch (locale) {
                  case 'zh-CN':
                    item.style.labelText = item.style.labelTextCn;
                    break;
                  case 'en-US':
                    item.style.labelText = item.style.labelTextEn;
                    break;
                  case 'fr-FR':
                    item.style.labelText = item.style.labelTextFr;
                    break;
                }
              });
            }
          }
          if (config.globalConfig) {
            gplotStore.gplotKeyOb[gplotKey].containerConfig = JSON.parse(config.globalConfig);
            gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = false;
          }
        }
      } catch (error) {
        console.error(error);
        message.warning(t('view.failedToRetrieveConfigurationInformation'));
      }
    } else if (isClear) {
      gplotStore.gplotKeyOb[gplotKey].selectedOb = null;
    }

    if (isStop) return; // 如果在await期间组件销毁，直接返回

    // 画布配置
    const graphConfig: any = {
      container: mountRef.value,
      autoResize: true,
      zoom: 1,
      width: mountRef.value?.clientWidth || 800,
      height: mountRef.value?.clientHeight || 600,
      behaviors: [
        {
          key: 'ZoomCanvas',
          type: 'zoom-canvas',
          sensitivity: 0.1,
          onFinish: () => {
            if (graphOb) gplotStore.gplotKeyOb[gplotKey].containerConfig.zoom = graphOb.getZoom();
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
          enable: () => props.viewType == 'edit' && !isDownShift,
        },
        {
          key: 'ClickSelect',
          type: 'click-select',
          multiple: true,
          trigger: ['Control'],
          enable: () => props.viewType == 'edit',
        },
        {
          key: 'BrushSelect',
          type: 'brush-select',
          mode: 'union',
          trigger: ['shift'],
          enable: () => props.viewType == 'edit',
          style: { fill: '#00f', fillOpacity: 0.2, stroke: '#0ff' },
          onSelect: (e) => {
            if (!graphOb) return e;
            const ids = Object.keys(e);
            if (ids.length > 0) {
              gplotStore.gplotKeyOb[gplotKey].selectedOb = graphOb.getElementData(ids);
            } else {
              gplotStore.gplotKeyOb[gplotKey].selectedOb = null;
            }
            return e;
          },
        },
        {
          key: 'CreateEdge',
          type: 'create-edge',
          trigger: 'click',
          style: gplotStore.gplotKeyOb[gplotKey].nodeConfig.style,
          enable: () => props.viewType == 'edit' && isDownAlt,
          onCreate: (e) => {
            if (e.source == e.target) {
              message.info(t('view.cannotConnectTheSameNode'));
              return null;
            }
            const data = graphOb?.getData();
            if (data) {
              // @ts-ignore
              if (!data.edges.find((m) => m.source == e.source && m.target == e.target)) {
                e.style.type = 'polyline';
                e['type'] = 'polyline';
                e['data'] = {
                  myType: 'edge',
                  myOldStyle: { iconFill: '', labelFill: '' },
                  myLockAll: false,
                  myEvent: [],
                  myAgileState: [],
                  myIsAgileState: false,
                  mySimpleState: gplotStore.gplotKeyOb[gplotKey].nodeConfig.data.mySimpleState,
                };
                return e;
              } else {
                message.info(t('view.thereIsAlreadyAConnectionBetweenTheNodes'));
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
        {
          key: 'ContextMenu',
          type: 'contextmenu',
          trigger: 'contextmenu',
          getContent: (e) => {
            if (gplotStore.gplotKeyOb[gplotKey].selectedOb != null) {
              setTimeout(() => {
                ContextMenu.showContextMenu({
                  x: e.client.x,
                  y: e.client.y,
                  items: [
                    {
                      label: t('view.delete'),
                      onClick: () => deleteGplot(gplotStore.gplotKeyOb[gplotKey].selectedOb),
                    },
                    {
                      label: t('view.group'),
                      onClick: () => groupGplot(),
                    },
                    {
                      label: t('view.split'),
                      onClick: () => chaiFengGplot(),
                    },
                  ],
                });
              }, 150);
            }
            return null;
          },
        },
      ],
      data: gplotConfig,
      edge: {
        type: 'polyline',
        style: {
          router: { type: 'orth' },
        },
      },
    };

    if (props.viewType == 'edit') {
      graphConfig.plugins.push({
        type: 'history',
        key: 'history',
        enable: () => props.viewType == 'edit',
      });
    }

    const gridPlugin = graphConfig.plugins.find((m) => m.key == 'GridLine');
    if (gridPlugin) {
      gridPlugin.lineWidth = gplotStore.gplotKeyOb[gplotKey].containerConfig.grid.myIsShow ? 1 : 0;
    }

    graphOb = new Graph(graphConfig);

    // 监控事件
    graphOb.on('click', (e) => {
      if (isStop || !graphOb) return;
      try {
        if (props.viewType == 'edit') {
          // @ts-ignore
          if (e.target?.nodeName == 'document' && !e.target.hasOwnProperty('type')) {
            gplotStore.gplotKeyOb[gplotKey].selectedOb = null;
          } else {
            let selectedObs = getAllSelectOb(true);
            if (selectedObs.length > 1) {
              gplotStore.gplotKeyOb[gplotKey].selectedOb = selectedObs;
            } else if (selectedObs.length === 1) {
              // 这里不能直接从event target取ID，最好从selectedObs取
              // 但为了兼容原逻辑：
              // @ts-ignore
              const elementId = e.target.id;
              const selectedOb = graphOb.getElementData(elementId);
              if (selectedOb) {
                gplotStore.gplotKeyOb[gplotKey].selectedOb = {
                  id: selectedOb.id,
                  style: cloneDeep(selectedOb.style),
                  data: cloneDeep(selectedOb.data),
                };
              }
            }
          }
        } else {
          // @ts-ignore
          const clickOb = graphOb.getElementData(e.target.id);
          if (clickOb && clickOb.data && clickOb.data.myServiceId) {
            go(`/message/index/${clickOb.data.myServiceId}`);
          }
        }
      } catch (error) {
        console.warn('点击图谱元素报错', error);
      }
    });

    await graphOb.render();

    if (isStop) return;

    $('.g6-background').css({ backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' });

    if (props.viewType == 'edit') {
      window.addEventListener('beforeunload', beforeunloadHandler);
      graphOb.fitCenter();
    } else {
      if (gplotStore.gplotKeyOb[gplotKey].containerConfig.fit == 'fitCenter') {
        graphOb.fitCenter();
      } else if (gplotStore.gplotKeyOb[gplotKey].containerConfig.fit == 'fitView') {
        viewShiPei();
      }
    }
    gplotStore.gplotKeyOb[gplotKey].renderSuccess = true;

    // --- 注册新的 Watcher ---
    if (props.viewType == 'edit') {
      // 注册并收集 stop handler
      const stopSelectWatch = watch(
        () => gplotStore.gplotKeyOb[gplotKey].selectedOb,
        () => {
          if (
            gplotStore.gplotKeyOb[gplotKey].selectedOb != null &&
            Object.keys(gplotStore.gplotKeyOb[gplotKey].selectedOb).length != 0
          ) {
            isHaveSave = true;
            if (!Array.isArray(gplotStore.gplotKeyOb[gplotKey].selectedOb) && graphOb) {
              const ob = gplotStore.gplotKeyOb[gplotKey].selectedOb;
              switch (ob.data.myType) {
                case 'node':
                  graphOb.updateNodeData([ob]);
                  break;
                case 'edge':
                  graphOb.updateEdgeData([ob]);
                  break;
                case 'combo':
                  graphOb.updateComboData([ob]);
                  break;
              }
              graphOb.draw();
            }
            changeSave();
          }
        },
        { deep: true },
      );
      watchStoppers.push(stopSelectWatch);

      const stopGridWatch = watch(
        () => gplotStore.gplotKeyOb[gplotKey].containerConfig.grid.myIsShow,
        () => {
          if (!graphOb) return;
          graphOb.updatePlugin({
            key: 'GridLine',
            lineWidth: gplotStore.gplotKeyOb[gplotKey].containerConfig.grid.myIsShow ? 1 : 0,
          });
          $('.g6-background').css({ backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' });
        },
      );
      watchStoppers.push(stopGridWatch);

      const stopBgWatch = watch(
        [
          () => gplotStore.gplotKeyOb[gplotKey].containerConfig.background.myBackground,
          () => gplotStore.gplotKeyOb[gplotKey].containerConfig.background.backgroundImage,
        ],
        () => {
          if (!graphOb) return;
          const bgConfig = gplotStore.gplotKeyOb[gplotKey].containerConfig.background;
          if (bgConfig.backgroundImage) {
            bgConfig.background = '';
          } else {
            bgConfig.background = bgConfig.myBackground;
          }
          graphOb.updatePlugin(bgConfig);
          $('.g6-background').css({ backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' });
        },
      );
      watchStoppers.push(stopBgWatch);

      // 修复数据
      const datas = graphOb.getData();
      for (const key in datas) {
        // @ts-ignore
        datas[key].forEach((item) => {
          if (!item.data.myAgileState) {
            item.data.myAgileState = gplotStore.gplotKeyOb[gplotKey].nodeConfig.data.myAgileState;
          }
        });
      }
    } else {
      // 监控视图数据处理
      const datas = graphOb.getData();
      for (const key in datas) {
        // @ts-ignore
        datas[key].forEach((changeNode) => {
          changeNode.data.myOldStyle = cloneDeep(changeNode.style);
          if (!changeNode.data.myIsAgileState && changeNode.data.myServiceId != null) {
            serviceIdDatas.push(changeNode);
          } else if (changeNode.data.myIsAgileState && changeNode.data.myAgileState.length > 0) {
            agileStateData.push(changeNode);
          }
        });
      }

      if (serviceIdDatas.length > 0) {
        noAgileStateChangeStatus();
      }
      if (agileStateData.length > 0) {
        agileStateLastStatus();
      }
    }
    rendering.value = false;
  }

  //动态保存配置
  function changeSave() {
    if (graphOb && isHaveSave) {
      clearTimeout(changeSaveTimeId);
      changeSaveTimeId = setTimeout(() => {
        if (!isStop) saveHisConfig();
      }, 5000);
    }
  }

  //正式保存配置
  function saveConfig() {
    if (!graphOb) return Promise.resolve();
    if (gplotId == null) {
      return saveHisConfig();
    }
    try {
      gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = true;
      return graphOb
        .toDataURL()
        .then((img) => {
          if (isStop || !graphOb) return;
          const configData = cloneDeep(graphOb.getData());
          for (const key in configData) {
            // @ts-ignore
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
              message.success(t('view.saveSuccessful'));
            })
            .catch(() => {
              gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = false;
            });
        })
        .catch((e) => {
          console.error('图片生成错误', e);
          message.error(t('view.thereIsAnErrorInTheStructurePleaseCheck'));
        });
    } catch (error) {
      console.error('动态保存配置错误', error);
      gplotStore.gplotKeyOb[gplotKey].containerConfig.runSave = false;
    }
  }

  //保存历史配置
  function saveHisConfig() {
    clearTimeout(changeSaveTimeId);
    if (!graphOb) return Promise.resolve();
    try {
      return graphOb.toDataURL().then((img) => {
        if (isStop || !graphOb) return;
        const configData = cloneDeep(graphOb.getData());
        for (const key in configData) {
          // @ts-ignore
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
          });
      });
    } catch (error) {
      console.error('动态保存配置错误', error);
    }
  }

  // 快捷键处理 (改进：使用 addEventListener)
  function handleKeyDown(e: KeyboardEvent) {
    if (e.altKey || e.keyCode == 18) isDownAlt = true;
    if (e.ctrlKey || e.keyCode == 17) isDownCtrl = true;
    if (e.shiftKey || e.keyCode == 16) isDownShift = true;
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.altKey || e.keyCode == 18) isDownAlt = false;
    if (e.ctrlKey || e.keyCode == 17) isDownCtrl = false;
    if (e.shiftKey || e.keyCode == 16) isDownShift = false;
  }

  function shortcutKey_() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  function rightClick(event) {
    // 阻止系统右键事件
    // event.preventDefault(); // 在template中已使用 @contextmenu.prevent
  }

  // 窗口适配
  function viewShiPei() {
    if (!graphOb) return;
    graphOb.fitView();
    setTimeout(() => {
      if (!graphOb) return;
      graphOb.zoomTo(graphOb.getZoom() - 0.05, true, [
        graphOb.getViewportCenter()[0],
        graphOb.getViewportCenter()[1],
      ]);
    }, 300);
  }

  //增加拓扑对象
  function addGplot(ob) {
    if (!graphOb) return;
    const zuoBiao = graphOb.getCanvasByClient([ob.domX, ob.domY]);
    const id = myCommon.uniqueId();
    const nodeConfig = cloneDeep(gplotStore.gplotKeyOb[gplotKey].nodeConfig);
    myCommon.objectToObject(nodeConfig, {
      id: id,
      type: 'rect',
      style: {
        x: zuoBiao[0],
        y: zuoBiao[1],
        iconText: eval(`'${ob.iconUnicode}'`),
        lineWidth: 0,
        labelText: t('view.defaultText'),
        labelTextCn: '默认文本',
        labelTextEn: 'Default text',
        labelTextFr: 'Txt par def',
      },
      data: {
        myType: 'node',
      },
    });
    graphOb.addNodeData([nodeConfig]);
    graphOb.draw();
  }

  //组合选中
  function groupGplot() {
    if (!graphOb) return;
    let selectedObs = getAllSelectOb();
    if (selectedObs.length > 1) {
      const comboSelectedObs = selectedObs.filter(
        (m) => m.hasOwnProperty('combo') && m.combo != undefined,
      );
      const selectObCombo = selectedObs.filter((m) => m.data.myType == 'combo');
      if (comboSelectedObs.length == 0 && selectObCombo.length == 0) {
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
              myOldStyle: { iconFill: '', labelFill: '' },
              myLockAll: false,
              myEvent: [],
              myAgileState: [],
              myIsAgileState: false,
              mySimpleState: gplotStore.gplotKeyOb[gplotKey].nodeConfig.data.mySimpleState,
            },
          },
        ]);

        selectedObs.forEach((m) => (m['combo'] = comboId));

        const nodes: any[] = [];
        const combos: any[] = [];

        selectedObs
          .filter((m) => (m.data.type = 'node'))
          .forEach((m) => {
            nodes.push({ id: m.id, combo: comboId });
          });
        selectedObs
          .filter((m) => (m.data.type = 'combo'))
          .forEach((m) => {
            combos.push({ id: m.id, combo: comboId });
          });

        if (combos.length) graphOb.updateComboData(combos);
        if (nodes.length) graphOb.updateNodeData(nodes);
        graphOb.draw();
      } else {
        message.info(t('view.thisCombinationIsNotSupported'));
      }
    }
  }

  //拆分
  function chaiFengGplot() {
    if (!graphOb) return;
    let selectedObs = getAllSelectOb();
    if (selectedObs.length > 0) {
      const deleteComboIds = selectedObs
        .filter((m) => {
          return m.data.myType == 'combo';
        })
        .map((m) => m.id);
      if (deleteComboIds.length > 0) {
        const updateNodes: any[] = [];
        const updateCombos: any[] = [];
        const updateEdges: any[] = [];
        deleteComboIds.forEach((c) => {
          graphOb!.getChildrenData(c).forEach((m) => {
            delete m.combo;
            if (m.data.myType == 'node') {
              updateNodes.push(m);
            } else if (m.data.myType == 'edge') {
              updateEdges.push(m);
            } else if (m.data.myType == 'combo') {
              updateCombos.push(m);
            }
          });
        });
        if (updateCombos.length > 0) graphOb.updateComboData(updateCombos);
        if (updateNodes.length > 0) graphOb.updateNodeData(updateNodes);
        if (updateEdges.length > 0) graphOb.updateEdgeData(updateEdges);

        graphOb.removeComboData(deleteComboIds);
        graphOb.draw();
      }
    }
  }

  //删除选中
  function deleteGplot(data) {
    if (!graphOb) return;
    if (!Array.isArray(data)) {
      deleteGplot([data]);
    } else {
      const deleteOb: any = { nodes: [], edges: [] };
      const comboIds: any[] = [];
      data.forEach((m) => {
        if (m.data.myType == 'node') {
          deleteOb.nodes.push(m.id);
        } else if (m.data.myType == 'edge') {
          deleteOb.edges.push(m.id);
        } else if (m.data.myType == 'combo') {
          comboIds.push(m.id);
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
    if (!graphOb) return [];
    let selectedObs: any[] = [];
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('node', 'selected'));
    selectedObs = selectedObs.concat(graphOb.getElementDataByState('combo', 'selected'));
    if (isGetEdge) {
      selectedObs = selectedObs.concat(graphOb.getElementDataByState('edge', 'selected'));
    }
    return selectedObs;
  }

  function beforeunloadHandler(event) {
    if (gplotId != null && isHaveSave) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  async function getConfig(gpltHisId) {
    if (gpltHisId) {
      return gplotApi.GetGplotHisData(gpltHisId);
    } else if (gplotId) {
      return gplotApi.GetGplot(gplotId);
    } else {
      return gplotApi.GetGplotMenuId(gplotStore.gplotKeyOb[gplotKey].containerConfig.menuId);
    }
  }

  //非灵活配置的变化监控
  function noAgileStateChangeStatus() {
    clearTimeout(noAgileStateChangeStatus_timeId);
    if (isStop || !graphOb) return;

    softwareApi
      .GetServiceStatus(serviceIdDatas.map((m) => m.data.myServiceId))
      .then(async (nodeState) => {
        if (isStop || !graphOb) return; // 二次检查
        serviceIdDatas.forEach((node) => {
          const stateOb = graphOb!.getElementData(node.id);
          if (stateOb) {
            var serviceStatus = nodeState.find((m) => m.serviceId == stateOb.data.myServiceId);
            let color: any = null;
            if (serviceStatus) {
              for (let i = 0; i < stateOb.data.mySimpleState.filter((m) => m.open).length; i++) {
                const element = stateOb.data.mySimpleState[i];
                if (serviceStatus[element.code] == element.value) {
                  color = element.color;
                  break;
                }
              }
            } else {
              color = '#5D5D5D';
            }
            if (color == null) {
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
          }
        });
        await graphOb.draw();

        // 安全递归
        noAgileStateChangeStatus_timeId = setTimeout(() => {
          noAgileStateChangeStatus();
        }, 5000);
      })
      .catch((e) => {
        console.error(e);
        if (!isStop) {
          noAgileStateChangeStatus_timeId = setTimeout(() => {
            noAgileStateChangeStatus();
          }, 5000);
        }
      });
  }

  //灵活配置节点的状态初始化
  function agileStateLastStatus() {
    if (isStop) return;
    messageApi
      .GetServiceMsgTypeLastSimple()
      .then(async (nodeState) => {
        if (isStop) return;
        nodeState.forEach((state) => {
          changeAllDataConfig(state);
        });
        agileStateChange();
        agileStateChangeStatus();
      })
      .catch((e) => {
        console.error(e);
        if (!isStop) agileStateChangeStatus();
      });
  }

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

  async function agileStateChange() {
    if (!graphOb) return;
    if (Object.keys(gplotStore.gplotKeyOb[gplotKey].containerConfig.allDataValue).length > 0) {
      agileStateData.forEach((node) => {
        let color: any = null;
        const stateOb = graphOb!.getElementData(node.id);
        if (stateOb) {
          const orderData = sortBy(stateOb.data.myAgileState, (m) => m.level);
          for (let i = 0; i < orderData.length; i++) {
            try {
              const executeFunc = new Function('allDataValue', orderData[i].isChange);
              const runValue = executeFunc(
                gplotStore.gplotKeyOb[gplotKey].containerConfig.allDataValue,
              );
              if (typeof runValue === 'boolean') {
                if (runValue) {
                  color = orderData[i].color;
                }
                if (color == null) {
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
                if (runValue) break;
              }
            } catch (error) {
              console.error('设置画布节点变量值出错', orderData[i]);
            }
          }
        }
      });
      await graphOb.draw();
    }
  }

  function agileStateChangeStatus() {
    // 添加到 watchStoppers 列表中统一管理
    const stopMqttWatch = watch(
      () => gplotStore.mqttMsgChange,
      async () => {
        if (isStop) return;
        if (gplotStore.mqttMsgChange) {
          changeAllDataConfig(gplotStore.mqttMsgChange);
          await agileStateChange();
        }
      },
    );
    watchStoppers.push(stopMqttWatch);
  }

  function changeStyle(type, id, color) {
    if (!graphOb) return;
    if (color != null) {
      switch (type) {
        case 'node':
          graphOb.updateNodeData([{ id: id, style: { iconFill: color, labelFill: color } }]);
          break;
        case 'edge':
          graphOb.updateComboData([{ id: id, style: { fill: color, stroke: color } }]);
          break;
        case 'combo':
          graphOb.updateEdgeData([{ id: id, style: { stroke: color } }]);
          break;
      }
    }
  }

  // 菜单折叠监控
  const stopCollapseWatch = watch(
    () => appStore.projectConfig!.menuSetting.collapsed,
    () => {
      if (graphOb) {
        setTimeout(() => {
          if (!graphOb) return;
          graphOb.resize(mountRef.value?.clientWidth, mountRef.value?.clientHeight);
          if (props.viewType != 'edit') {
            viewShiPei();
          }
        }, 300);
      }
    },
  );

  // 窗口大小处理函数
  const handleResize = () => {
    if (graphOb) {
      setTimeout(() => {
        if (!graphOb || !mountRef.value) return;
        graphOb.resize(mountRef.value.clientWidth, mountRef.value.clientHeight);
        if (props.viewType != 'edit') {
          viewShiPei();
        }
      }, 300);
    }
  };

  onMounted(() => {
    shortcutKey_();
    init(false, null);
    window.addEventListener('resize', handleResize);
  });

  // 页面卸载处理 (优化点)
  onBeforeUnmount(() => {
    console.log('gplot_onBeforeUnmount: 开始清理资源');
    isStop = true;

    // 1. 停止所有定时器
    clearTimeout(changeSaveTimeId);
    clearTimeout(noAgileStateChangeStatus_timeId);

    // 2. 停止所有动态 Watcher
    clearWatchers();
    stopCollapseWatch(); // 停止静态定义的 watcher

    // 3. 移除全局事件监听
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('beforeunload', beforeunloadHandler);

    // 4. 销毁图谱实例
    if (graphOb) {
      graphOb.destroy();
      graphOb = null;
    }
    console.log('gplot_onBeforeUnmount: 清理完成');
  });

  defineExpose({
    getGraphOb: () => graphOb,
    groupGplot,
    addGplot,
    gplotKey,
    getGplotId: () => gplotId,
    saveConfig,
    saveHisConfig,
    fitCenter: () => {
      if (graphOb) graphOb.fitCenter();
    },
    fitView: () => {
      if (graphOb) graphOb.fitView();
    },
    zoomChange: (v) => {
      if (graphOb) {
        graphOb.zoomTo(v, true, [graphOb.getViewportCenter()[0], graphOb.getViewportCenter()[1]]);
        graphOb.draw();
      }
    },
    init,
  });
</script>

<style lang="less" scoped>
  /* 样式保持不变 */
  .g6-background {
    background-repeat: no-repeat !important;
    background-size: 100% 100% !important;
  }

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
</style>
