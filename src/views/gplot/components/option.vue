<template>
  <div :class="`${prefixCls}content-center`">
    <div :class="`${prefixCls}center-tool`">
      <div :class="`${prefixCls}tool-item`">
        <div @click="props.graphObRef.groupGplot()"> 组合 </div>
      </div>
      <!-- <div :class="`${prefixCls}tool-item`">
        <div>
          <a-tooltip placement="top">
            <template #title>后退 Ctrl+Z</template>
            <IconFontClass name="icon-baseui-huotui" @click="gplotBack" />
          </a-tooltip>
        </div>
      </div>
      <div :class="`${prefixCls}tool-item`">
        <div>
          <a-tooltip placement="top">
            <template #title>前进 Ctrl+Y</template>
            <IconFontClass name="icon-baseui-huifu" @click="gplotAdvance" />
          </a-tooltip>
        </div>
      </div> -->
      <!-- <div :class="`${prefixCls}tool-item`">
                <div>
                    <a-tooltip placement="top">
                        <template #title>格式刷</template>
                        <IconFontClass
                            class="not-click"
                            name="icon-baseui-geshishua" />
                    </a-tooltip>
                </div>
            </div> -->
      <!-- <div :class="`${prefixCls}tool-item`">
        <a-dropdown :class="`${prefixCls}menu-item`">
          <IconFontClass name="icon-baseui-zuoduiqi1" />
          <template #overlay>
            <div style="padding: 10px; background-color: #fff">
              <IconFontClass
                style="margin: 0 3px; font-size: 23px"
                @click="selectedObSetConfig('alignment_top')"
                name="icon-baseui-shangduiqi"
              />
              <IconFontClass
                style="margin: 0 3px; font-size: 23px"
                @click="selectedObSetConfig('alignment_bottom')"
                name="icon-baseui-xiaduiqi"
              />
              <IconFontClass
                style="margin: 0 3px; font-size: 23px"
                @click="selectedObSetConfig('alignment_left')"
                name="icon-baseui-zuoduiqi1"
              />
              <IconFontClass
                style="margin: 0 3px; font-size: 23px"
                @click="selectedObSetConfig('alignment_right')"
                name="icon-baseui-youduiqi1"
              />
              <IconFontClass
                style="margin: 0 3px; font-size: 23px"
                @click="selectedObSetConfig('alignment_horizontal')"
                name="icon-baseui-juzhongduiqi1"
              />
              <IconFontClass
                style="margin: 0 3px; font-size: 23px"
                @click="selectedObSetConfig('alignment_vertical')"
                name="icon-baseui-shuipingduiqi"
              />
            </div>
          </template>
        </a-dropdown>
      </div> -->
      <!-- <div :class="`${prefixCls}tool-item`">
        <a-tooltip placement="top">
          <template #title>垂直翻转</template>
          <IconFontClass @click="selectedObSetConfig('vertical')" name="icon-baseui-vertical" />
        </a-tooltip>
      </div>
      <div :class="`${prefixCls}tool-item`">
        <a-tooltip placement="top">
          <template #title>水平翻转</template>
          <IconFontClass @click="selectedObSetConfig('horizontal')" name="icon-baseui-horizontal" />
        </a-tooltip>
      </div>
      <div :class="`${prefixCls}tool-item`">
        <a-tooltip placement="top">
          <template #title>置顶层</template>
          <IconFontClass @click="levelOption('topLevel')" name="icon-baseui-zhidingceng" />
        </a-tooltip>
      </div>
      <div :class="`${prefixCls}tool-item`">
        <a-tooltip placement="top">
          <template #title>置底层</template>
          <IconFontClass @click="levelOption('groundLevel')" name="icon-baseui-zhidiceng" />
        </a-tooltip>
      </div> -->
      <!-- <div :class="`${prefixCls}tool-item`">
                <a-tooltip placement="top">
                    <template #title>锁定</template>
                    <IconFontClass
                        name="icon-baseui-suo1" />
                </a-tooltip>
            </div> -->
    </div>
    <div :class="`${prefixCls}center-menu`">
      <div :class="`${prefixCls}menu-item`">
        <!-- <div style="display: flex">
          <a-tooltip placement="top">
            <template #title>分享</template>
            <IconFontClass @click="shareClick" isSvg="true" name="icon-baseui-fenxiang" />
          </a-tooltip>
          <div
            v-show="isShowShare"
            style="
              position: absolute;
              z-index: 9999;
              top: 67px;
              right: 66px;
              padding: 5px;
              border: 1px solid #dedede;
              background: #fff;
            "
          >
            <a-input-search
              disabled="true"
              :value="getShareUrl()"
              placeholder="分享地址"
              size="small"
            >
              <template #enterButton>
                <a-button @click="copyShareUrl">复制</a-button>
              </template>
            </a-input-search>
            <QrCode
              style="position: relative; top: -16px"
              :value="getShareUrl()"
              class="enter-x flex justify-center xl:justify-start"
              :width="280"
            />
          </div>
        </div> -->
        <!-- <div>
          <a-tooltip placement="top">
            <template #title>导出</template>
            <IconFontClass @click="props.exportConfig" name="icon-baseui-xiazai" />
          </a-tooltip>
        </div> -->
        <div>
          <a-tooltip placement="top">
            <template #title>预览</template>
            <div style="float: right">
              <a-spin :spinning="isRunSavePreview">
                <IconFontClass @click="previewClick" name="icon-baseui-dapingzhanshi" />
              </a-spin>
            </div>
          </a-tooltip>
        </div>
      </div>
    </div>
    <!-- <a-modal
            style="top: 10px"
            v-model:visible="previewInfo.isShow"
            :width="previewInfo.width"
            title="链接页面">
            <template #footer>
                <a-button key="back" @click="previewClose">关闭</a-button>
            </template>
            <myViewModel v-if="previewInfo.isShow" :noImport="['modeling']" :style="{ width: '100%', height: previewInfo.height + 'px' }" menuurl="/modelingPreview/index/" :menuid="previewInfo.id" :outherInfo="previewInfo" />
        </a-modal> -->
  </div>
</template>
<script setup>
  import { QrCode } from '/@/components/Qrcode/index';
  import { message } from 'ant-design-vue';
  import { ref, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useGplotStoreWithOut } from '@/store/modules/gplot';

  const gplotStore = useGplotStoreWithOut();
  const props = defineProps({
    //拓扑对象
    graphObRef: {
      type: Object,
      default() {
        return null;
      },
    },
    //总的容器配置
    canvasCotainers: {
      type: Array,
      default() {
        return [
          // {
          //   canvasType: "2d",
          //   containerId: `ineuos${myCommon.uniqueId()}`,
          //   //容器的配置
          //   containerConfig: {
          //     //是否自动扩展
          //     infinite: true,
          //     //是否显示网格
          //     gridShow:true ,
          //     //容器大小类型
          //     size: "custom",
          //     //宽度
          //     sizeWidth: "",
          //     //高度
          //     sizeHeight: "",
          //     //背景色
          //     backgroundColor: "",
          //     //背景图
          //     backgroundImg: "",
          //     //自定义接口是否启用
          //     requestUse: false,
          //     //接口刷新频率
          //     requstRefresh: 1000,
          //     //运行方式
          //     runType: [],
          //   },
        ];
      },
    },
    //选中的组件
    selectedOb: {
      type: Object,
      default() {
        return {};
      },
      //选中的容器配置
    },
    containerConfig: {
      type: Object,
      default() {
        return {
          //是否自动扩展
          infinite: true,
          //容器大小类型
          size: 'custom',
          //宽度
          sizeWidth: '',
          //高度
          sizeHeight: '',
          //背景色
          backgroundColor: '',
          //背景图
          backgroundImg: '',
          //自定义接口是否启用
          requestUse: false,
          //接口刷新频率
          requstRefresh: 1000,
          //运行方式
          runType: [],
        };
      },
    },
    //控制属性的显示
    showSign: {
      type: Array,
      default() {
        return [];
      },
    },
    //菜单选中
    menuCheckedIds: {
      type: Array,
      default() {
        return [];
      },
    },
    //导出
    exportConfig: {
      type: Function,
      default() {
        return () => {};
      },
    },
    //获取能保存的配置
    getAllConfig: {
      type: Function,
      default() {
        return () => {};
      },
    },
    isRunexport: {
      type: Boolean,
      default() {
        return false;
      },
    },
  });

  const { prefixCls } = useDesign('GplotManage-');
  const previewInfo = ref({
    width: 600,
    height: 500,
    isShow: false,
    type: 'preview',
    id: null,
  });

  const isRunSavePreview = ref(false);
  const isShowShare = ref(false);

  //获取分享地址
  function getShareUrl() {
    return `${window.location.origin}/#/modelingShare/index/${props.menuCheckedIds[0]}`;
  }

  function previewClose() {
    previewInfo.value.isShow = false;
  }

  //预览
  function previewClick() {
    isRunSavePreview.value = true;
    const config = props.getAllConfig();
    config.execompleteBefore = () => {
      isRunSavePreview.value = false;
    };
    modelingApi.AddPreviewMenuConfig(config).then((data) => {
      window.open(`#/modelingPreview/index/${data}`);
      // const info = {
      //     isShow: true,
      //     width: $(`body`).width() - 10,
      //     height: $(`body`).height() - 120,
      //     type: "preview",
      //     id: data
      // }
      // previewInfo.value = info;
    });
  }

  //层级设置
  function levelOption(runType) {
    const containerOb = props.graphObRef.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    if (containerOb) {
      switch (runType) {
        case 'topLevel':
          containerOb.canvasOb.canvas.bringToFront(containerOb.canvasOb.canvas.getActiveObject());
          break;
        case 'groundLevel':
          containerOb.canvasOb.canvas.sendToBack(containerOb.canvasOb.canvas.getActiveObject());
          containerOb.canvasOb.canvas.sendToBack(containerOb.canvasOb.canvasObject.visibleArea);
          break;
      }
    }
  }

  //选中组件更改配置值
  function selectedObSetConfig(key, value, delay = false, way = 'equal') {
    const containerOb = props.graphObRef.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    if (delay) {
      clearTimeout(changeTime);
      changeTime = setTimeout(() => {
        containerOb.canvasOb.edit_set_config(key, value.target.value, way);
      }, 100);
    } else {
      containerOb.canvasOb.edit_set_config(key, value, way);
    }
  }

  //隐藏
  function showHideAll(type, type_) {
    const containerOb = props.graphObRef.find(
      (m) => m.canvasId == props.selectedOb.attribute.containerId,
    );
    containerOb.canvasOb.showHideAll(type, type_);
  }

  //分享
  function shareClick() {
    if (!isShowShare.value) {
      if (props.menuCheckedIds.length > 0) {
        menugApi.ShareView({ menuId: props.menuCheckedIds[0], Share: true }).then((data) => {
          if (data) {
            isShowShare.value = true;
          } else {
            message.error('分享失败');
          }
        });
      } else {
        message.info('请先选中保存菜单');
      }
    } else {
      isShowShare.value = false;
    }
  }

  //复制分享地址
  function copyShareUrl() {
    myCommon.copyText(getShareUrl());
    message.success('链接复制成功');
  }

  //前进
  function gplotAdvance() {
    if (gplotStore.renderSuccess) {
      const history = gplotStore.gplotOb.getPluginInstance('history');
      if (history.canRedo()) history.redo();
    }
  }

  //后退
  function gplotBack() {
    if (gplotStore.renderSuccess) {
      const history = gplotStore.gplotOb.getPluginInstance('history');
      if (history.canUndo()) history.undo();
    }
  }

  watch(
    () => gplotStore.renderSuccess,
    () => {},
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage-';

  .@{prefixCls}center-tool {
    display: flex;
    flex-direction: row;
    line-height: 41px;
    cursor: pointer;

    .@{prefixCls}tool-item {
      padding: 0 10px;

      i {
        font-size: 22px;
      }
    }
  }

  .@{prefixCls}center-menu {
    display: flex;
    flex-direction: row;
    line-height: 41px;

    .@{prefixCls}menu-item {
      display: flex;
      padding: 0 10px;

      > div {
        width: 32px;
        height: 40px;
      }

      i {
        padding: 0 5px;
        font-size: 22px;
      }
    }
  }
</style>
