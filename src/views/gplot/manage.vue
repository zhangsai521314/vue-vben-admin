<template>
  <MyContent :class="prefixCls">
    <!-- <div :class="`${prefixCls}content-top`">
      <head_
        :isRunexport="isRunexport"
        :viewConfigLoad="viewConfigLoad"
        :menuCheckedIds="checkedIds"
        :getAllConfig="getAllConfig"
        :exportConfig="exportConfig"
        :containerObArray="containerObArray"
        :canvasCotainers="canvasCotainers"
      />
    </div> -->
    <div :class="`${prefixCls}content-center`">
      <option_ :graphObRef="graphObRef" :viewPre="viewPre" />
    </div>
    <div :class="`${prefixCls}content-bottom`" class="draggable-content">
      <div :class="`${prefixCls}bottom-left`">
        <assembly :graphObRef="graphObRef" />
      </div>
      <div :class="`${prefixCls}bottom-center`">
        <gplot ref="graphObRef" :gplotId="gplotId" viewType="edit" :menuId="menuId" />
      </div>
      <div style="width: 2px; height: 100%; background-color: #eee"></div>
      <div :class="`${prefixCls}bottom-right`">
        <prop :graphObRef="graphObRef" />
      </div>
    </div>
    <a-modal
      wrap-class-name="gplot-full-modal"
      v-model:open="openView"
      width="100%"
      :footer="null"
      @on-cancel="viewCancel"
    >
      <viewIndex
        v-if="openView"
        style="width: 100%; height: 100%"
        viewType="pre"
        :gplotId="graphObRef.getGplotId()"
      />
    </a-modal>
  </MyContent>
</template>
<script setup lang="ts">
  import viewIndex from './index.vue';
  import { useRouter } from 'vue-router';
  import { useDesign } from '@/hooks/web/useDesign';
  import option_ from './components/option.vue';
  import assembly from './components/assembly.vue';
  import prop from './components/prop.vue';
  import gplot from './components/gplotNew.vue';
  import { ref, unref, watch, nextTick } from 'vue';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();
  defineOptions({ name: 'GplotManage' });
  const { prefixCls } = useDesign('GplotManage-');
  //获取url参数
  const { currentRoute } = useRouter();
  const { menuId } = unref(currentRoute).params;
  const gplotId = ref(null);
  const graphObRef = ref(null);
  const openView = ref(false);
  //预览
  function viewPre() {
    return graphObRef.value?.saveHisConfig().then(() => {
      openView.value = true;
    });
  }
  function viewCancel() {
    openView.value = false;
  }
</script>
<style lang="less">
  .gplot-full-modal {
    .ant-modal {
      top: 0;
      max-width: 100%;
      margin: 0;
      padding-bottom: 0;
    }

    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh) !important;
      border-radius: 0;
    }

    .ant-modal-body {
      flex: 1;
    }

    .ant-modal-header {
      margin-bottom: 0;
      padding: 6px;
    }

    .ant-modal-close-x {
      line-height: 36px !important;
    }
  }
</style>
<style lang="less" scoped>
  .full-modal {
    .ant-modal {
      top: 0;
      max-width: 100%;
      margin: 0;
      padding-bottom: 0;
    }

    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh) !important;
    }

    .ant-modal-body {
      flex: 1;
    }
  }
  @prefixCls: ~'@{namespace}-GplotManage-';

  .@{prefixCls} {
    // 弹性布局
    display: flex;
    //弹性布局方向为列(上下排列)
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'Segoe UI', Arial,
      Roboto, 'PingFang SC', miui, 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
    font-size: 13px;
    font-weight: 400;
    //user-select: none;

    // .@{prefixCls}content-top {
    //   display: flex;
    //   flex-direction: row;
    //   width: 100%;
    //   height: 35px;
    //   border-bottom: 1px solid #dfe3e8;
    //   background: #fafbfc;
    //   color: #333;
    //   font-size: 15px;
    // }

    .@{prefixCls}content-bottom {
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 100%;
      overflow: hidden;

      .@{prefixCls}bottom-left {
        display: flex;
        flex-direction: row;
        width: 280px;
        height: 100%;
        background-color: #fafbfc;
      }

      .@{prefixCls}bottom-center {
        flex: 1 0;
        height: 100%;
        margin: 2px;
        overflow: auto;
      }

      .@{prefixCls}bottom-right {
        width: 300px;
        height: 100%;
        padding: 0 4px;
        background-color: #fafbfc;

        .prop-bottom {
          width: 100%;
          height: 100%;
          overflow: hidden;

          button {
            width: 100%;
            height: 24px;
            border-radius: 0;
            line-height: 1px;
          }

          span {
            line-height: 0px;
          }
        }
      }
    }
  }

  .@{prefixCls}HotkeyDoc-title {
    margin-top: 10px;
    padding-bottom: 10px;
    padding-left: 222px;
    font-size: 16px;
    font-weight: 700;
  }

  .@{prefixCls}HotkeyDoc-item {
    width: 100%;
    height: 25px;
    margin-bottom: 5px;

    > div {
      float: left;
    }

    > div:first-child {
      width: 240px;
      text-align: right;
    }

    > .@{prefixCls}HotkeyDoc-illustrate {
      display: inline-block;
      width: 140px;
    }
  }
</style>
