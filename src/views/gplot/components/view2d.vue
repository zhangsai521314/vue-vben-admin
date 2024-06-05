<template>
  <!-- 测试多个canvas下a-spin会影响正确性 -->
  <a-spin tip="渲染中..." :spinning="rendering">
    <div
      onclick=""
      @contextmenu="rightClick()"
      :style="{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: props.viewType == 'edit' && !props.containerConfig.infinite ? 'auto' : 'hidden',
      }"
      class="canvas2dContent"
    >
      <canvas :id="props.canvasId" class="canvas2d"></canvas>
      <template v-for="(item, i) in domConfig" :key="i">
        <template v-if="item.attribute.obtype == 'elemnt-video'">
          <div
            v-show="item.attribute.visible"
            :class="{ selectedDom: item.attribute.isSelected }"
            :data_id="item.attribute.key"
            class="otherDom ui-draggable ui-draggable-handle"
            :style="{
              position: 'absolute',
              left: `${item.attribute.left}px`,
              top: `${item.attribute.top}px`,
              width: `${item.attribute.width}px`,
              height: `${item.attribute.height}px`,
              transform: `rotate(${item.attribute.angle}deg)`,
            }"
            @click="domClick(item)"
            @mousedown="domClick(item)"
          >
            <div
              :style="{ opacity: item.attribute.opacity }"
              v-show="item.attribute.src == ''"
              class="show-noData"
              title="暂无视频地址"
            >
              <IconFontClass name="icon-iNeuOS-shipinjiankong" />
            </div>
            <div
              :style="{ opacity: item.attribute.opacity }"
              v-show="item.attribute.src != ''"
              class="show-data"
            >
              <template v-if="item.attribute.type != 'websocket'">
                <video :id="item.attribute.key">
                  <source :src="item.attribute.src" />
                </video>
              </template>
              <template v-else>
                <canvas :id="item.attribute.key"></canvas>
              </template>
            </div>
            <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-border"></div>
            <template v-if="!item.attribute.lockAll && !item.attribute.lockWidthHeight">
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rotate-line"></div>
              <div
                v-show="item.attribute.isSelected"
                class="ineuos-point ineuos-rotate-point"
              ></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-lt-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rt-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-lb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-ct-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cl-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cr-point"></div>
            </template>
          </div>
        </template>
        <template v-else-if="item.attribute.obtype == 'elemnt-iframe'">
          <div
            v-show="item.attribute.visible"
            :class="{ selectedDom: item.attribute.isSelected }"
            :data_id="item.attribute.key"
            class="otherDom ui-draggable ui-draggable-handle"
            :style="{
              position: 'absolute',
              left: `${item.attribute.left}px`,
              top: `${item.attribute.top}px`,
              width: `${item.attribute.width}px`,
              height: `${item.attribute.height}px`,
              transform: `rotate(${item.attribute.angle}deg)`,
            }"
          >
            <div
              :style="{ opacity: item.attribute.opacity }"
              v-show="props.viewType == 'edit'"
              class="iframe_edit_mask"
              @click="domClick(item)"
              @mousedown="domClick(item)"
              style="
                position: absolute;
                z-index: 2;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
              "
            >
            </div>
            <div
              :style="{ opacity: item.attribute.opacity }"
              v-show="item.attribute.src == ''"
              class="show-noData"
              title="暂无网页地址"
            >
              <IconFontClass name="icon-iNeuOS-iframe1" />
            </div>
            <div
              :style="{ opacity: item.attribute.opacity }"
              v-show="item.attribute.src != ''"
              class="show-data"
            >
              <iframe
                :id="item.attribute.key"
                :src="item.attribute.src"
                frameborder="0"
                style="width: 100%; height: 100%"
              ></iframe>
            </div>
            <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-border"></div>
            <template v-if="!item.attribute.lockAll && !item.attribute.lockWidthHeight">
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rotate-line"></div>
              <div
                v-show="item.attribute.isSelected"
                class="ineuos-point ineuos-rotate-point"
              ></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-lt-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rt-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-lb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-ct-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cl-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cr-point"></div>
            </template>
          </div>
        </template>
        <template v-else-if="item.attribute.obtype == 'elemnt-chart'">
          <div
            v-show="item.attribute.visible"
            :class="{ selectedDom: item.attribute.isSelected }"
            :data_id="item.attribute.key"
            class="otherDom ui-draggable ui-draggable-handle"
            :style="{
              position: 'absolute',
              left: `${item.attribute.left}px`,
              top: `${item.attribute.top}px`,
              width: `${item.attribute.width}px`,
              height: `${item.attribute.height}px`,
              transform: `rotate(${item.attribute.angle}deg)`,
            }"
            @click="domClick(item)"
            @mousedown="domClick(item)"
          >
            <div
              class="show-data"
              :style="{
                backgroundColor: item.attribute.options.backgroundColor,
                opacity: item.attribute.opacity,
              }"
            >
              <chart
                :menuId="props.menuId"
                :sourceUrl="chartSourceUrl"
                :id="item.attribute.key"
                :options="item.attribute.options"
                :dataInfo="item.attribute.dataInfo"
                :isGetSource="true"
                :isFormalSource="props.viewType != 'edit'"
              />
            </div>
            <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-border"></div>
            <template v-if="!item.attribute.lockAll && !item.attribute.lockWidthHeight">
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rotate-line"></div>
              <div
                v-show="item.attribute.isSelected"
                class="ineuos-point ineuos-rotate-point"
              ></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-lt-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rt-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-rb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-lb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-ct-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cb-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cl-point"></div>
              <div v-show="item.attribute.isSelected" class="ineuos-point ineuos-cr-point"></div>
            </template>
          </div>
        </template>
      </template>
      <signalrmsg ref="signalrmsgRef" title="指令下发" style="height: 230px" msgPrefix=" 指令" />
      <a-modal
        v-model:visible="customIssueInstructionsIsShow"
        width="300px"
        title="指令"
        okText="下发指令"
        @ok="customIssueInstructions"
      >
        <div style="padding: 10px">
          <a-row>
            <a-col :span="5" style="line-height: 32px"> 指令值: </a-col>
            <a-col :span="15">
              <a-input v-model:value="customIssueInstructionsValue" />
            </a-col>
          </a-row>
        </div>
      </a-modal>
      <a-modal
        style="top: 0"
        v-model:visible="pageUrlInfo.isShow"
        :width="pageUrlInfo.width"
        title="链接页面"
        @cancel="pageUrlClose"
      >
        <template #footer>
          <a-button key="back" @click="pageUrlClose">关闭</a-button>
        </template>
        <iframe
          v-if="pageUrlInfo.urlType == 'custom'"
          width="100%"
          :height="pageUrlInfo.height"
          :src="pageUrlInfo.url"
        ></iframe>
      </a-modal>
    </div>
  </a-spin>
</template>

<script setup>
  import dayjs from 'dayjs';
  import signalrmsg from '/@/components/MySingalr/index.vue';
  import ContextMenu from '@imengyu/vue3-context-menu';
  import { onMounted, ref, nextTick, createVNode, watch, unref } from 'vue';
  import { message, Modal } from 'ant-design-vue';

  import videojs from 'video.js';
  import 'video.js/dist/video-js.css';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import chart from '/@/components/MyEcharts/index.vue';
  import { tryOnUnmounted } from '@vueuse/core';
  //定时器
  import { useTimeFn } from '/@/hooks/core/useTime_';
  import html2Canvas from 'html2canvas';
  import * as echarts from 'echarts';
  //快捷键监控
  import shortcutKey from 'keymaster';

  // const emits = defineEmits(['changeSelectOb']);
  const props = defineProps({
    //更改选中的对象
    changeSelectOb: {
      type: Function,
      default() {
        return (data) => {};
      },
    },
    //组件配置
    assemblyConfig: {
      type: Object,
      default() {
        return {
          //绘画边框颜色
          borderColor: '',
          // 绘画边框大小
          borderSize: 2,
          //填充颜色
          fillColor: '',
        };
      },
    },
    canvasId: {
      type: String,
      default() {
        return '';
      },
    },
    //容器内的组件配置
    canvasConfig: {
      type: String,
      default() {
        return null;
      },
    },
    //容器内的dom配置
    domConfig: {
      type: String,
      default() {
        return null;
      },
    },
    viewType: {
      type: String,
      default() {
        return 'monitor';
      },
    },
    //容器配置
    containerConfig: {
      type: Object,
      default() {
        return null;
      },
    },
    //页面弹出
    pageShow: {
      type: Function,
      default() {
        return (urlInfo) => {};
      },
    },
    //视频列表
    getvideoData: {
      type: Function,
      default() {
        return nulll;
      },
    },
    //获取当前选中的对象
    getSelectob: {
      type: Function,
      default() {
        return nulll;
      },
    },
    //修改当前选中容器的属性值
    updateSelectContainerValue: {
      type: Function,
      default() {
        return (attr, value) => {};
      },
    },
    //保存组件
    showSaveComponent: {
      type: Function,
      default() {
        return (config) => {};
      },
    },
    menuId: {
      type: Number,
      default() {
        return 0;
      },
    },
    //刷新组件树数据
    refreshassemblyTreeData: {
      type: Function,
      default() {
        return (canvasId) => {};
      },
    },
  });
  const canvasOb = ref(null);
  const rendering = ref(false);
  //自定义指令下发是否显示
  const customIssueInstructionsIsShow = ref(false);
  let customIssueInstructionsTagInfo = null;
  const customIssueInstructionsValue = ref('');
  const signalrmsgRef = ref(null);
  //url本页展示
  const pageUrlInfo = ref({
    url: '',
    width: 600,
    height: 500,
    isShow: false,
    menuId: null,
  });
  const timeKey = `view2d_${myCommon.uniqueId()}`;
  //所有dom类型的配置
  const domConfig = !props.domConfig ? ref([]) : ref(unref(JSON.parse(props.domConfig)));
  const chartSourceUrl = ref(getChartSourceUrl());

  function init() {
    rendering.value = true;
    canvasOb.value = new Canvas2d({
      canvasId: props.canvasId,
      changeRender,
      changeSelectOb,
      canvasConfig: props.canvasConfig,
      viewType: props.viewType,
      containerConfig: props.containerConfig,
      showCustomIssueInstructions: showCustomIssueInstructions,
      issueInstructions: issueInstructions,
      pageShow: pageShow,
      assemblyConfig: props.assemblyConfig,
      getvideoData: props.getvideoData,
      getSelectob: props.getSelectob,
      getConfigLoadCompleteCallBack: (_this) => {
        rendering.value = false;
        const ob = _this.getDefaultCanvasConfig();
        ob.attribute.obtype = 'container'; //图元类型
        changeSelectOb(ob);
        shortcutKey_();
        setTimeout(() => {
          props.refreshassemblyTreeData(props.canvasId);
        });
      },
      obClick,
      obDbClick: rightClick,
      updateSelectContainerValue: props.updateSelectContainerValue,
      addDom: addDom_,
      menuId: props.menuId,
      refreshassemblyTreeData: props.refreshassemblyTreeData,
    });
    canvasOb.value['addDom'] = addDom;
    canvasOb.value['getAllDomConfig'] = getAllDomConfig;
    canvasOb.value['showHideAll'] = showHideAll;
    domConfig.value.forEach((element) => {
      if (element.attribute.obtype == 'elemnt-video') {
        try {
          canvasOb.value.playVideo(element);
        } catch (error) {
          console.error(error);
        }
      }
      if (props.viewType == 'edit') {
        canvasOb.value.dragRotateSize($(`#${element.attribute.key}`).parents('.otherDom'));
      }
    });
  }

  //canvas单击
  function obClick(obj) {
    if (props.viewType != 'edit') {
      changeSelectOb(obj);
      obj.attribute.event
        .filter((m) => m.open && m.event == 'click')
        .forEach((item) => {
          if (item.type == 'instructions') {
            canvasOb.value.issueInstructions(obj, item.instructions);
          } else if (item.type == 'open_url') {
            canvasOb.value.openUrl(item.openurl);
          } else if (item.type == 'request_url') {
            canvasOb.value.requestUrl(item.requesturl);
          }
        });
    }
  }

  //canvas显示右键
  function rightClick(object) {
    //阻止系统右键事件
    event.preventDefault();
    try {
      let isActiveObject = false;
      let isCanvas = true;
      if (!object) {
        if ($(event.target).parents('.otherDom').length > 0) {
          object = domConfig.value.find(
            (m) => m.attribute.key == $(event.target).parents('.otherDom').attr('data_id'),
          );
          isCanvas = false;
        } else {
          const objects = canvasOb.value.canvas.getObjects();
          for (let i = objects.length - 1; i >= 0; i--) {
            if (objects[i].attribute.obtype != 'visibleArea') {
              object = objects[i];
              //判断该对象是否在鼠标点击处
              if (
                object.containsPoint(new iNeuOs.Point(event.offsetX, event.offsetY)) &&
                object.attribute != undefined
              ) {
                break;
              } else {
                if (
                  object.containsPoint(new iNeuOs.Point(event.offsetX, event.offsetY)) &&
                  !myCommon.isnull(object._objects) &&
                  object._objects.length > 0
                ) {
                  break;
                } else {
                  object = null;
                }
              }
            }
          }
        }
        if (myCommon.isnull(object) && canvasOb.value.canvas.getActiveObject() != null) {
          object = canvasOb.value.canvas.getActiveObject();
          isActiveObject = true;
        }
      }
      let menuItems = [];
      if (!myCommon.isnull(object)) {
        //关闭自由绘制
        canvasOb.value.canvas.isDrawingMode = false;
        canvasOb.value.canvasObject.drawingType = null;
        canvasOb.value.canvas.selection = true;
        canvasOb.value.canvas.hoverCursor = 'move';
        //关闭自由绘制
        if (props.viewType == 'edit') {
          menuItems = [
            {
              label: '复制',
              icon: '',
              onClick: () => {
                rightClick_(object, 'copy');
              },
            },
            {
              label: '删除',
              icon: '',
              onClick: () => {
                rightClick_(object, 'delete');
              },
            },
            {
              label: '组合',
              icon: '',
              disabled: true,
              onClick: () => {
                rightClick_(object, 'group');
              },
            },
            {
              label: '拆分',
              icon: '',
              disabled: true,
              onClick: () => {
                rightClick_(object, 'split');
              },
            },
            {
              label: '保存为组件',
              disabled: false,
              icon: '',
              onClick: () => {
                rightClick_(object, 'saveGroup');
              },
            },
            //数据点绑定后，组合成组件(转成组合为支持多源组件)，可以选择父级设备，通过绑定的tagName比对绑定tagid
            //适应，不同设备只是点id不同，组合内其他相同的情况
            // {
            //     label: '转多源组件',
            //     disabled: true,
            //     icon: '',
            //     onClick: () => {
            //         rightClick_(object, "toMultipleSourceGroup");
            //     },
            // }
          ];
          if (isCanvas) {
            if (object._objects && object._objects.length > 1) {
              //动态精灵图保存为组件后不会动，所以
              menuItems.find((m) => m.label == '保存为组件').disabled =
                object._objects.filter((m) => m.type == 'sprite').length > 0;
            }
            if (object.type == 'group' && object._objects && object._objects.length > 1) {
              // menuItems.find(m => m.label == "转多源组件").disabled = object._objects.filter((m) => m.type == "sprite").length > 0;
            }
            if (object.type == 'group') {
              menuItems.find((m) => m.label == '拆分').disabled = false;
            }
            if (object.type != 'group' && object._objects && object._objects.length > 1) {
              menuItems.find((m) => m.label == '组合').disabled =
                object._objects.filter((m) => m.type == 'sprite').length > 0;
            }
          } else {
            menuItems.find((m) => m.label == '保存为组件').disabled = false;
          }
        }
        if (isCanvas && object.type != 'group') {
          //增加canvas下的右键菜单
          const c = _.cloneDeep(
            object.attribute.event.find((m) => m.event == 'rightClick' && m.open),
          );
          if (c) {
            c.children.forEach((m) => {
              const re = {
                label: m.title,
                onClick: () => {
                  rightClick_(object, 'rightClick', m);
                },
              };
              if (m.children.length > 0) {
                re['children'] = getRightMenuChildren(m.children, object);
              }
              menuItems.push(re);
            });
          }
        }
        if (props.viewType == 'edit') {
          if (isCanvas) {
            if (!isActiveObject) {
              canvasOb.value.canvas.discardActiveObject();
              //选中对象
              canvasOb.value.canvas.setActiveObject(object);
            }
          } else {
            //清除所有dom的选中状态
            domConfig.value.forEach((item) => {
              item.attribute.isSelected = false;
            });
          }
        }
        if (props.viewType == 'edit') {
          changeSelectOb(object);
          if (isCanvas) {
            canvasOb.value.canvas.renderAll();
          }
          //显示菜单
          ContextMenu.showContextMenu({
            x: event.x,
            y: event.y,
            items: menuItems,
          });
        } else {
          //显示菜单,canvas开启fireRightClick，不延迟会弹出组件(图片)那种右键内容
          const x = event.x;
          const y = event.y;
          setTimeout(() => {
            ContextMenu.showContextMenu({
              x,
              y,
              items: menuItems,
            });
          }, 300);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  //判断是否是canvas
  function isCanvas(selectOb) {
    return !['elemnt-video', 'elemnt-iframe', 'elemnt-chart'].includes(selectOb.attribute.obtype);
  }

  //右键点击
  function rightClick_(object, actionType, item) {
    let componentImage;
    let componentJson;
    let houZhui = '.png';
    if (!isCanvas(object)) {
      switch (actionType) {
        case 'copy':
          const c_clonedObj = _.cloneDeep(object);
          delete c_clonedObj.attribute.player;
          c_clonedObj.attribute.isSelected = false;
          c_clonedObj.attribute.key = `${object.attribute.obtype.split('-')[1]}_${myCommon.getTimeStamp()}`;
          c_clonedObj.attribute.left = c_clonedObj.attribute.left + 25;
          c_clonedObj.attribute.top = c_clonedObj.attribute.top + 25;
          domConfig.value.push(c_clonedObj);
          if (c_clonedObj.attribute.obtype == 'elemnt-video') {
            canvasOb.value.playVideo(c_clonedObj);
          }
          nextTick(() => {
            canvasOb.value.dragRotateSize($(`#${c_clonedObj.attribute.key}`).parents('.otherDom'));
            props.refreshassemblyTreeData(props.canvasId);
          });
          changeSelectOb(canvasOb.value.getDefaultCanvasConfig());
          break;
        case 'delete':
          domConfig.value = domConfig.value.filter((m) => m.attribute.key != object.attribute.key);
          props.refreshassemblyTreeData(props.canvasId);
          break;
        case 'saveGroup':
          componentJson = JSON.stringify(object);
          if (['elemnt-video', 'elemnt-iframe'].includes(object.attribute.obtype)) {
            html2canvas($('.selectedDom .show-data')[0], {
              backgroundColor: 'transparent',
              allowTaint: true,
              useCORS: true,
            }).then((mycanvas) => {
              componentImage = mycanvas.toDataURL();
              componentImage = componentImage == 'data:,' ? '' : componentImage.split(',')[1];
              saveComponent(componentImage, componentJson, houZhui);
            });
          } else {
            const ob = echarts.getInstanceByDom($('.selectedDom .show-data>div')[0]);
            if (ob) {
              componentImage = ob.getConnectedDataURL({ type: 'png' }).split(',')[1];
              saveComponent(componentImage, componentJson, houZhui);
            }
          }
          break;
      }
    } else {
      switch (actionType) {
        case 'copy':
          canvasOb.value.edit_copy(object);
          props.refreshassemblyTreeData(props.canvasId);
          break;
        case 'delete':
          canvasOb.value.edit_delete_selecttd(object);
          props.refreshassemblyTreeData(props.canvasId);
          break;
        case 'group':
          canvasOb.value.edit_combination_canvas();
          props.refreshassemblyTreeData(props.canvasId);
          break;
        case 'split':
          canvasOb.value.edit_split_canvas();
          props.refreshassemblyTreeData(props.canvasId);
          break;
        case 'saveGroup':
          houZhui = '.svg';
          let isZuHe = false;
          if (object._objects != undefined || object.type != 'group') {
            canvasOb.value.edit_combination_canvas();
            isZuHe = true;
          }
          const selectOb = canvasOb.value.canvas.getActiveObject();
          $('body').append(
            '<div id="savesvgtemp" style="display:block;width:100px:height:100px"><svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">' +
              selectOb.toSVG() +
              '</svg> </div>',
          );
          const savesvgtemp = $('#savesvgtemp svg')[0];
          savesvgtemp.children[0].setAttribute(
            'transform',
            'matrix(1 0 0 1 ' +
              Math.abs(savesvgtemp.children[0].getBBox().x) +
              ' ' +
              Math.abs(savesvgtemp.children[0].getBBox().y) +
              ')',
          );
          savesvgtemp.setAttribute(
            'viewBox',
            '0,0,' + savesvgtemp.getBBox().width + ',' + savesvgtemp.getBBox().height + '',
          );
          componentImage = window.btoa(unescape(encodeURIComponent($('#savesvgtemp').html())));
          $('#savesvgtemp').remove();
          componentJson = JSON.stringify(selectOb.toJSON(['attribute']));
          if (isZuHe) {
            canvasOb.value.edit_split_canvas();
          }
          saveComponent(componentImage, componentJson, houZhui);
          break;
        case 'toMultipleSourceGroup':
          message.info('升级中...');
          break;
        case 'rightClick':
          if (item.type == 'instructions') {
            canvasOb.value.issueInstructions(object, item.instructions);
          } else if (item.type == 'open_url') {
            canvasOb.value.openUrl(item.openurl);
          } else if (item.type == 'request_url') {
            canvasOb.value.requestUrl(item.requesturl);
          } else {
            message.warning('未绑定事件');
          }
          break;
      }
    }
  }

  //保存组件
  function saveComponent(baseImg, json, name) {
    props.showSaveComponent({
      name,
      thumb: baseImg,
      type: 3,
      level: 1,
      isshare: 1,
      issystem: 1,
      jsonconfig: json,
    });
  }

  //更改渲染状态
  function changeRender(value) {
    rendering.value = value;
  }

  //更改选中的对象
  function changeSelectOb(ob) {
    if (props.viewType == 'edit') {
      domConfig.value.forEach((item) => {
        item.attribute.isSelected = false;
      });
      if (['elemnt-video', 'elemnt-iframe', 'elemnt-chart'].includes(ob.attribute.obtype)) {
        ob.attribute.isSelected = true;
      }
      remove_();
    }
    props.changeSelectOb(ob);
  }

  //获取右键菜单的子项
  function getRightMenuChildren(node, Ob) {
    let children = [];
    node.forEach(function (m) {
      const c = {
        label: m.title,
        onClick: () => {
          rightClick_(Ob, 'rightClick', m);
        },
      };
      if (m.children.length > 0) {
        c['children'] = getRightMenuChildren(m, Ob);
      }
      children.push(c);
    });
    return children;
  }

  //显示指令下发框
  function showCustomIssueInstructions(tagInfo) {
    customIssueInstructionsTagInfo = tagInfo;
    customIssueInstructionsIsShow.value = true;
  }

  //自定义指令提交下发
  function customIssueInstructions() {
    //指令内容
    const ntime = _.now();
    const time = dayjs(ntime).format('YYYY-MM-DD HH:mm:ss');
    const timeStr = myCommon.nowTimeStr();
    const instructionsContent = {
      Author: 'iNeuOS',
      Version: '1.0',
      ActionCode: timeStr,
      Type: 'dev',
      Desc: '',
      DevicePacket: {
        OperationCode: timeStr,
        DeviceId: customIssueInstructionsTagInfo.deviceId,
        DeviceName: '',
        Desc: '',
        DeviceFrames: [
          {
            TagId: customIssueInstructionsTagInfo.tagId,
            TagName: customIssueInstructionsTagInfo.tagName,
            DataType: 'int',
            Value: customIssueInstructionsValue.value,
            FrameId: timeStr,
            OperationType: 'run',
            Code: '',
            Desc: '',
            Time: time,
          },
        ],
      },
      SystemFrame: {
        RunCmd: '',
        FrameId: timeStr,
        OperationType: 'run',
        Code: '',
        Desc: '',
        Time: time,
      },
    };
    signalrmsgRef.value.hide();
    const msg = JSON.stringify(instructionsContent);
    nextTick(() => {
      signalrmsgRef.value.show(msg);
      customIssueInstructionsIsShow.value = false;
    });
  }
  //指令下发
  function issueInstructions(content) {
    signalrmsgRef.value.hide();
    nextTick(() => {
      signalrmsgRef.value.show(content);
    });
  }

  function pageUrlClose() {
    pageUrlInfo.value.isShow = false;
  }
  //页面本页弹出
  function pageShow(urlInfo) {
    urlInfo['isShow'] = true;
    const urlInfo_ = _.clone(urlInfo);
    if (urlInfo.sizeUit == '%') {
      urlInfo_.width = ($(`body`).width() - 10) * (urlInfo_.width / 100);
      urlInfo_.height = ($(`body`).height() - 10) * (urlInfo_.height / 100);
    }
    pageUrlInfo.value = urlInfo_;
  }

  //dom点击
  function domClick(config) {
    if (props.viewType == 'edit') {
      canvasOb.value.canvas.discardActiveObject();
      canvasOb.value.canvas.renderAll();
      domConfig.value.forEach((item) => {
        item.attribute.isSelected = false;
      });
      config.attribute.isSelected = true;
      props.changeSelectOb(config);
    }
  }

  function domIdClick(id) {
    const t = domConfig.value.find((item) => item.attribute.key == id);
    if (t) {
      domClick(t);
    }
  }

  //增加dom
  function addDom(x, y, obtype, type, name, urlDataType, tagCount) {
    let did;
    const config_ = _.clone(canvasOb.value.getDefaultCanvasConfig());
    if (obtype == 'elemnt-video') {
      did = `video_${myCommon.getTimeStamp()}`;
      config_.attribute.sign = 'video';
      config_.attribute.obtype = obtype;
      config_.attribute.name = did;
      config_.attribute.key = did;
      config_.attribute.videoId = '';
      config_.attribute.src = '';
      config_.attribute.left = x;
      config_.attribute.top = y;
      config_.attribute.width = 328;
      config_.attribute.height = 186;
      config_.attribute.angle = 0;
      config_.attribute.isSelected = false;
      config_.attribute.player = null; //播放器返回的对象，保存的时候需要清除}
      domConfig.value.push(config_);
    } else if (obtype == 'elemnt-iframe') {
      did = `iframe_${myCommon.getTimeStamp()}`;
      config_.attribute.sign = 'iframe';
      config_.attribute.obtype = obtype;
      config_.attribute.name = did;
      config_.attribute.key = did;
      config_.attribute.src = '';
      config_.attribute.left = x;
      config_.attribute.top = y;
      config_.attribute.width = 328;
      config_.attribute.height = 186;
      config_.attribute.angle = 0;
      config_.attribute.isSelected = false;
      domConfig.value.push(config_);
    } else if (obtype == 'elemnt-chart') {
      did = `chart_${myCommon.getTimeStamp()}`;
      config_.attribute.sign = 'chart';
      config_.attribute.obtype = obtype;
      config_.attribute.name = did;
      config_.attribute.key = did;
      config_.attribute.type = type;
      config_.attribute.src = '';
      config_.attribute.left = x;
      config_.attribute.top = y;
      config_.attribute.width = 405;
      config_.attribute.height = 195;
      config_.attribute.angle = 0;
      config_.attribute.isSelected = false;
      config_.attribute.options = {
        tagCount: tagCount, //tag数量
        urlDataType, //获取数据值的类型
        getSourceUrl: urlDataType == 'new' ? '/Data/GetTagDataLatest' : '/Data/GetDataHistory', //获取数据的地址
        chartType: type, //图表类型 line(单Y轴折线图)/ bar(单Y轴的柱状图)
        showTitle: true, //是否显示标题
        title: '演示数据', //图表的标题
        showLegend: true, //是否显示图例
        legendColor: '#333333', //图例颜色
        timeFrequency: 4, //查询数据的默认时间间隔
        timeInterval: 'h', //查询数据的默认时间间隔类型
        isRefresh: true, //是否刷新数据
        refreshFrequency: 5, //刷新的时间频率
        refreshInterval: 's', //刷新数据时间类型:s(秒)，m(分)
        rangeMin: null, //量程最小值
        rangeMax: null, //量程最大值
        alarmValue: null, //报警值
        alarmColor: '', //报警线的色
        warningValue: null, //预警值
        warningColor: '', //预警线的颜色
        dColor: '#ffffff', //底色
        tColor: '#42B8FA', //顶色
        bkcolor: '', //边框色
        yuanHuanColor: '', //圆环色
        fillColor: '', //填充色
        backgroundColor: '', //背景色
        titleColor: '#333333', //标题的颜色
        gradientColorStart: '#1badf9', //渐变色初始色
        gradientColorEnd: '#03fcfe', //渐变色结束色
        borderColor: '#ffffff', //边框颜色
        showXSplitLine: false, //x轴是否显示分割线
        xAxisLineColor: '#768b9b', //x轴线颜色
        xSplitLineColor: '#768b9b', //x轴分割线颜色
        xAxisLabelColor: '#768b9b', //x轴刻度色
        showYSplitLine: true, //y轴是否显示分割线
        yAxisLineColor: '#768b9b', //y轴线颜色
        ySplitLineColor: '#768b9b', //y轴分割线颜色
        yAxisLabelColor: '#768b9b', //y轴刻度色
        progressType: type == 'jindu_2' ? '%' : 'number', //进度值显示的方式：数值(number)、百分比(%)
        renderType: '2d', //渲染方式2d和3d
        render_3d: function (option) {
          //3d图表渲染
        },
        updateRender_3d: function (data) {
          //3d图表数据更新
        },
        chartServiseClick: function name(params, chart) {
          //图表上的数据点的点击
        },
      };
      config_.attribute.dataInfo = {
        source: [],
        tags: [
          // {
          //     //数据点集合
          //     //    tagid: "", //数据点id
          //     //    tagname:"",//名称
          //     //    filtermin: null, //过滤最小值
          //     //    filtermax: null, //过滤最大值
          //     //    color: ""//颜色
          //     //    tagunit:"",//单位
          //     //    tagquantiles: node.tagquantiles//小数位
          //     //
          // }
        ],
      };
      domConfig.value.push(config_);
    }
    nextTick(() => {
      canvasOb.value.dragRotateSize($(`#${did}`).parents('.otherDom'));
      props.refreshassemblyTreeData(props.canvasId);
    });
  }

  //addDom
  function addDom_(config) {
    config.attribute.key = config.attribute.key.split('_')[0] + myCommon.getTimeStamp();
    config.attribute.player = null;
    domConfig.value.push(config);
    nextTick(() => {
      canvasOb.value.dragRotateSize($(`#${config.attribute.key}`).parents('.otherDom'));
      if (config.attribute.obtype == 'elemnt-video') {
        try {
          canvasOb.value.playVideo(config);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  //获取所有domConfig
  function getAllDomConfig() {
    const c_domConfig = _.cloneDeep(domConfig.value);
    c_domConfig.forEach((item) => {
      item.attribute.isSelected = false;
      delete item.attribute.player;
    });
    return c_domConfig;
  }

  function shortcutKey_() {
    document.onkeydown = function (e) {
      if (e.ctrlKey && e.keyCode == 187) {
        //shortcutKey组件加号冲突
        event.preventDefault();
        //放大画布
        if (parseInt((canvasOb.value.canvasObject.relationship.zoom + 0.2) * 100) < 500) {
          props.updateSelectContainerValue(
            'zoom',
            parseInt((canvasOb.value.canvasObject.relationship.zoom + 0.2) * 100),
          );
          canvasOb.value.cavasZomm(canvasOb.value.canvasObject.relationship.zoom + 0.2);
        }
      }
    };
    shortcutKey('ctrl+-', function () {
      event.preventDefault();
      if (parseInt((canvasOb.value.canvasObject.relationship.zoom - 0.2) * 100) > 10) {
        //缩小画布
        props.updateSelectContainerValue(
          'zoom',
          parseInt((canvasOb.value.canvasObject.relationship.zoom - 0.2) * 100),
        );
        canvasOb.value.cavasZomm(canvasOb.value.canvasObject.relationship.zoom - 0.2);
      }
    });

    shortcutKey('ctrl+o', function () {
      console.log('ctrl+o');
      event.preventDefault();
      //还原画布缩放
      props.updateSelectContainerValue('zoom', 100);
      canvasOb.value.cavasZomm(1);
    });
    shortcutKey('ctrl+up', function () {
      event.preventDefault();
      //上移动
      const selectOb = props.getSelectob();
      if (selectOb) {
        canvasOb.value.edit_set_config('attribute|top', --selectOb.attribute.top, 'equal');
      }
    });
    shortcutKey('ctrl+down', function () {
      event.preventDefault();
      //下移动
      const selectOb = props.getSelectob();
      if (selectOb) {
        canvasOb.value.edit_set_config('attribute|top', ++selectOb.attribute.top, 'equal');
      }
    });
    shortcutKey('ctrl+left', function () {
      event.preventDefault();
      //左移动
      const selectOb = props.getSelectob();
      if (selectOb) {
        canvasOb.value.edit_set_config('attribute|left', --selectOb.attribute.left, 'equal');
      }
    });
    shortcutKey('ctrl+right', function () {
      event.preventDefault();
      //右移动
      const selectOb = props.getSelectob();
      if (selectOb) {
        canvasOb.value.edit_set_config('attribute|left', ++selectOb.attribute.left, 'equal');
      }
    });
    shortcutKey('ctrl+r', function () {
      event.preventDefault();
      //正旋转
      const selectOb = props.getSelectob();
      if (selectOb) {
        const r = selectOb.attribute.angle + 1 > 360 ? 0 : ++selectOb.attribute.angle;
        canvasOb.value.edit_set_config('attribute|angle', r, 'equal');
      }
    });
    shortcutKey('ctrl+shift+r', function () {
      event.preventDefault();
      //倒旋转
      const selectOb = props.getSelectob();
      if (selectOb) {
        const r = selectOb.attribute.angle - 1 < 0 ? 0 : --selectOb.attribute.angle;
        canvasOb.value.edit_set_config('attribute|angle', r, 'equal');
      }
    });
    // shortcutKey('ctrl+a', function () {
    //     event.preventDefault();
    //     //全选
    //     canvasOb.value.getSelectAll();
    // });
    // shortcutKey('esc', function () {
    //     event.preventDefault();
    //     //取消全选
    // });
    shortcutKey('delete', function () {
      event.preventDefault();
      //删除选择
      const selectOb = props.getSelectob();
      if (selectOb) {
        rightClick_(selectOb, 'delete');
      }
    });
    shortcutKey('ctrl+c', function () {
      event.preventDefault();
      //复制
      const selectOb = props.getSelectob();
      if (selectOb) {
        rightClick_(selectOb, 'copy');
      }
    });
    shortcutKey('ctrl+g', function () {
      event.preventDefault();
      //组合
      const selectOb = props.getSelectob();
      if (selectOb && isCanvas(selectOb)) {
        rightClick_(selectOb, 'group');
      }
    });
    shortcutKey('ctrl+shift+g', function () {
      event.preventDefault();
      //取消组合
      const selectOb = props.getSelectob();
      if (selectOb && isCanvas(selectOb)) {
        rightClick_(selectOb, 'split');
      }
    });
    shortcutKey('ctrl+alt+]', function () {
      event.preventDefault();
      //置顶层
      const selectOb = props.getSelectob();
      if (selectOb && isCanvas(selectOb)) {
        canvasOb.value.canvas.bringToFront(selectOb);
      }
    });
    shortcutKey('ctrl+alt+[', function () {
      event.preventDefault();
      //置底层
      const selectOb = props.getSelectob();
      if (selectOb && isCanvas(selectOb)) {
        canvasOb.value.canvas.sendToBack(selectOb);
        canvasOb.value.canvas.sendToBack(canvasOb.value.canvasObject.visibleArea);
      }
    });
    shortcutKey('ctrl+]', function () {
      event.preventDefault();
      //上移一层
      const selectOb = props.getSelectob();
      if (selectOb && isCanvas(selectOb)) {
        canvasOb.value.canvas.bringForward(selectOb);
      }
    });
    shortcutKey('ctrl+[', function () {
      event.preventDefault();
      //下移一层
      const selectOb = props.getSelectob();
      if (selectOb && isCanvas(selectOb)) {
        canvasOb.value.canvas.sendBackwards(selectOb);
        canvasOb.value.canvas.sendToBack(canvasOb.value.canvasObject.visibleArea);
      }
    });
    shortcutKey('ctrl+d', function () {
      event.preventDefault();
      //隐藏所有dom
      showHideAll('dom', false);
    });
    shortcutKey('ctrl+f', function () {
      event.preventDefault();
      //显示多有dom
      showHideAll('dom', true);
    });
    shortcutKey('ctrl+J', function () {
      event.preventDefault();
      //隐藏所有canva
      showHideAll('canvas', false);
    });
    shortcutKey('ctrl+K', function () {
      event.preventDefault();
      //显示所有canva
      showHideAll('canvas', true);
    });
  }

  //按钮双击会出现一个文本域，影响窗口大小
  function remove_() {
    if (props.getSelectob().attribute.obtype == 'elemnt-button') {
      $('textarea[data-fabric-hiddentextarea]').width(0);
      $('textarea[data-fabric-hiddentextarea]').height(0);
      $('textarea[data-fabric-hiddentextarea]').css({ left: 0, top: 0 });
      useTimeFn(
        setTimeout(() => {
          remove_();
        }, 0),
        timeKey,
        'view2dRemove_',
      );
    }
  }

  //
  function showHideAll(type, type_) {
    if (type == 'dom') {
      if (type_) {
        //显示多有dom
        domConfig.value.forEach((m) => (m.attribute.visible = 1));
      } else {
        //隐藏所有dom
        domConfig.value.forEach((m) => (m.attribute.visible = 0));
        changeSelectOb(canvasOb.value.getDefaultCanvasConfig());
        nextTick(() => {
          domConfig.value.forEach((m) => {
            if (m.isSelected) {
              m.attribute.isSelected = false;
            }
          });
        });
      }
    } else {
      if (type_) {
        //显示所有canva
        canvasOb.value.edit_showAll();
      } else {
        //隐藏所有canva
        canvasOb.value.edit_hideAll();
      }
    }
  }

  //获取图表的获取数据的url
  function getChartSourceUrl() {
    if (props.viewType != 'edit') {
      if (props.containerConfig.requestUse) {
        return {
          //历史值
          requstHistoryValue: props.containerConfig.requstHistoryValue,
          //当前值
          requstNewValue: props.containerConfig.requstNewValue,
        };
      } else if (props.viewType == 'share') {
        return {
          //历史值
          requstHistoryValue: '/Common/GetDataHistory',
          //当前值
          requstNewValue: '/Common/GetTagDataLatest',
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  onMounted(() => {
    init();
  });

  //页面卸载后
  tryOnUnmounted(() => {
    delete window[props.canvasId];
  });

  //暴露给父组件可以调用的方法
  defineExpose({
    //创建对象
    canvasOb,
    changeRender,
    canvasId: props.canvasId,
    domIdClick,
    changeSelectOb,
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
