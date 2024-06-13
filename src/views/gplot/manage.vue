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
      <option_ :graphObRef="graphObRef" />
    </div>
    <div :class="`${prefixCls}content-bottom`" class="draggable-content">
      <div :class="`${prefixCls}bottom-left`">
        <assembly :graphObRef="graphObRef" />
      </div>
      <div :class="`${prefixCls}bottom-center`">
        <gplot ref="graphObRef" gplotId="gplotId" viewType="edit" />
      </div>
      <div style="width: 4px; height: 100%; background-color: #fff"></div>
      <div :class="`${prefixCls}bottom-right`">
        <prop :graphObRef="graphObRef" />
      </div>
    </div>
  </MyContent>
</template>
<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { useDesign } from '@/hooks/web/useDesign';
  import option_ from './components/option.vue';
  import assembly from './components/assembly.vue';
  import prop from './components/prop.vue';
  import gplot from './components/gplot.vue';
  import { ref, unref, watch, nextTick } from 'vue';

  defineOptions({ name: 'GplotManage' });
  const { prefixCls } = useDesign('GplotManage');
  const { currentRoute } = useRouter();
  //获取url参数
  const { menuid } = unref(currentRoute).params;
  const gplotId = ref(null);
  const graphObRef = ref(null);
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage';

  .@{prefixCls} {
    // 弹性布局
    display: flex;
    //弹性布局方向为列(上下排列)
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'Segoe UI', Arial,
      Roboto, 'PingFang SC', miui, 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
    font-size: 13px;
    font-weight: 400;
    user-select: none;

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

    .@{prefixCls}content-center {
      display: flex;
      //nowrap不换行
      flex-wrap: nowrap;
      //定义了多根轴线的对齐方式，如果项目只有一根轴线，那么该属性将不起作用。flex-start：与交叉轴的起点对齐
      place-content: flex-start space-between;
      //space-between两端对齐，项目之间的间隔都相等
      width: 100%;
      height: 40px;
      transition: margin-top 0.5s ease-in-out;
      border-bottom: 1px solid #dfe3e8;
      background: #fafbfc;
    }

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
        width: 280px;
        height: 100%;
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
