<template>
  <div :class="`${prefixCls}content-center`">
    <!-- <div :class="`${prefixCls}center-tool`">
      <div :class="`${prefixCls}tool-item`">
        <div @click="props.graphObRef.groupGplot()"> 组合 </div>
      </div>
      <div :class="`${prefixCls}tool-item`">
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
      </div>
      <div :class="`${prefixCls}tool-item`">
        <div>
          <a-tooltip placement="top">
            <template #title>格式刷</template>
            <IconFontClass class="not-click" name="icon-baseui-geshishua" />
          </a-tooltip>
        </div>
      </div>
      <div :class="`${prefixCls}tool-item`">
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
      </div>
      <div :class="`${prefixCls}tool-item`">
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
      </div>
      <div :class="`${prefixCls}tool-item`">
        <a-tooltip placement="top">
          <template #title>锁定</template>
          <IconFontClass name="icon-baseui-suo1" />
        </a-tooltip>
      </div>
    </div> -->
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
        </div>
        <div>
          <a-tooltip placement="top">
            <template #title>导出</template>
            <IconFontClass @click="props.exportConfig" name="icon-baseui-xiazai" />
          </a-tooltip>
        </div> -->
        <a-dropdown :class="`${prefixCls}menu-item`" @open-change="hisOpenChange">
          <a class="ant-dropdown-link" @click.prevent> {{ t('view.history') }} </a>
          <template #overlay>
            <a-menu>
              <!-- <a-menu-item @click="getGplotHis">刷新历史记录</a-menu-item> -->
              <a-menu-item @click="clearGplot">{{
                t('view.clearTheConfigurationContent')
              }}</a-menu-item>
              <a-menu-divider />
              <a-spin :spinning="isGetHisData">
                <a-menu-item
                  @click="backHisOnfig(item.gplotHisId)"
                  v-for="(item, index) in hisData"
                  :key="index"
                >
                  {{ item.createTime }}
                </a-menu-item>
              </a-spin>
            </a-menu>
          </template>
        </a-dropdown>
        <div>
          <a-tooltip placement="top">
            <template #title>{{ t('view.save') }}</template>
            <div style="float: right">
              <!-- @click="saveClick" -->
              <a-spin :spinning="isShowSaveMenu">
                <IconFontClass
                  style="font-weight: 600"
                  @click="saveConfig"
                  name="icon-baseui-baocun"
                />
              </a-spin>
            </div>
          </a-tooltip>
        </div>
        <!-- <div>
          <a-tooltip placement="top">
            <template #title>预览</template>
            <div style="float: right">
              <a-spin :spinning="isRunSavePreview">
                <IconFontClass @click="previewClick" name="icon-baseui-shengchengyulan" />
              </a-spin>
            </div>
          </a-tooltip>
        </div> -->
      </div>
    </div>
  </div>
  <menuDrawer
    :checkedKeys="
      props.graphObRef
        ? [gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.menuId]
        : []
    "
    :isRadio="true"
    :width="500"
    v-if="false"
    :isShow="isShowSaveMenu"
    :cancel="closeSaveConfig"
    :ztitle="t('view.configuration')"
    :menuType="2"
    :openSizeType="2"
    :isPageEditing="true"
    @check="menuDataChange"
    :footerStyle="{ height: '55px', textAlign: 'right' }"
  >
    <template #footer_>
      <a-spin :spinning="gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.runSave">
        <a-button type="primary" @click="saveConfig">{{ t('view.save') }}</a-button>
        <a-button style="margin-left: 8px" @click="closeSaveConfig">{{ t('view.close') }}</a-button>
      </a-spin>
    </template>
  </menuDrawer>
</template>
<script setup>
  import { QrCode } from '/@/components/Qrcode/index';
  import { message } from 'ant-design-vue';
  import { ref, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useGplotStoreWithOut } from '@/store/modules/gplot';
  import menuDrawer from '/@/components/MyMenu/index.vue';
  import gplotApi from '@/api/gplot';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();

  const gplotStore = useGplotStoreWithOut();
  const props = defineProps({
    //拓扑对象
    graphObRef: {
      type: Object,
      default() {
        return null;
      },
    },
    //预览
    viewPre: {
      type: Function,
      default() {
        return () => {};
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
  const isRunSavePreview = ref(false);
  const isShowShare = ref(false);
  const isShowSaveMenu = ref(false);
  const hisData = ref([]);
  const isGetHisData = ref(false);
  //获取分享地址
  function getShareUrl() {
    return `${window.location.origin}/#/modelingShare/index/${props.menuCheckedIds[0]}`;
  }

  //预览
  function previewClick() {
    isRunSavePreview.value = true;
    props
      .viewPre()
      .then(() => {
        isRunSavePreview.value = false;
      })
      .catch(() => {
        isRunSavePreview.value = false;
      });
  }

  //保存
  function saveClick() {
    isShowSaveMenu.value = true;
  }
  function closeSaveConfig() {
    isShowSaveMenu.value = false;
  }
  function saveConfig() {
    isShowSaveMenu.value = true;
    props.graphObRef
      .saveConfig()
      .then(() => {
        isShowSaveMenu.value = false;
      })
      .catch(() => {
        isShowSaveMenu.value = false;
      });
  }
  function menuDataChange(v) {
    gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.menuId =
      v.length > 0 ? v[0] : null;
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
    if (gplotStore.gplotKeyOb[props.graphObRef.gplotKey].renderSuccess) {
      const history = props.graphObRef.getGraphOb().getPluginInstance('history');
      if (history.canRedo()) history.redo();
    }
  }

  //后退
  function gplotBack() {
    if (gplotStore.gplotKeyOb[props.graphObRef.gplotKey].renderSuccess) {
      const history = props.graphObRef.getGraphOb().getPluginInstance('history');
      if (history.canUndo()) history.undo();
    }
  }

  //获取保存的历史
  function getGplotHis() {
    isGetHisData.value = true;
    gplotApi
      .GetGplotHisMenuId(gplotStore.gplotKeyOb[props.graphObRef.gplotKey].containerConfig.menuId)
      .then((data) => {
        isGetHisData.value = false;
        hisData.value = data.source;
      })
      .catch(() => {
        isGetHisData.value = false;
      });
  }

  //清空布局
  function clearGplot() {
    props.graphObRef.init(true, null);
  }

  //恢复历史布局
  function backHisOnfig(hisId) {
    props.graphObRef.init(false, hisId);
  }

  function hisOpenChange(v) {
    if (v) {
      getGplotHis();
    }
  }

  watch(
    () => gplotStore.renderSuccess,
    () => {},
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage-';

  .@{prefixCls}content-center {
    display: flex;
    //nowrap不换行
    flex-wrap: nowrap;
    // justify-content: space-between;
    justify-content: right;
    //space-between两端对齐，项目之间的间隔都相等
    width: 100%;
    height: 40px;
    transition: margin-top 0.5s ease-in-out;
    border-bottom: 1px solid #dfe3e8;
    background: #fafbfc;
  }

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
