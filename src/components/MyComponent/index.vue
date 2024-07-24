<!-- html外层组件-->
<!-- 因框架本身是有head的，但是这个head的高度某些时候是不需要的-->
<template>
  <div
    :id="domid"
    :class="{
      'div-content': true,
      'div-content-height-header': projectSetting.headerSetting.show,
      'div-content-height-multiTabs': projectSetting.multiTabsSetting.show,
      'div-content-height-header-multiTabs':
        projectSetting.multiTabsSetting.show && projectSetting.headerSetting.show,
      model: model,
    }"
  >
    <!-- 插槽，子组件的内容会填充到此：http://note.youdao.com/noteshare?id=2548401a58f896bf0a971f5d423dd3fa&sub=2C911B6793FA4AA99CF97E170AB1C9E2 -->
    <slot></slot>
  </div>
</template>
<script setup>
  import { useAppStore } from '@/store/modules/app';
  import { useDesign } from '@/hooks/web/useDesign';
  import { onMounted, ref } from 'vue';

  const appStore = useAppStore();
  const projectSetting = appStore.getProjectConfig;
  const domid = myCommon.uniqueId();
  const { prefixCls } = useDesign('MyViewModel-');
  const model = ref($(`#${domid}`).parent(`.${prefixCls}`).length > 0);
  onMounted(() => {
    //在模态框中使用
    model.value = $(`#${domid}`).parent(`.${prefixCls}`).length > 0;
  });
</script>
<style lang="less" scoped>
  .div-content {
    position: relative;
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
    // background-color: #fff;
  }

  .div-content-height-header {
    height: calc(100vh - 58px);
  }

  .div-content-height-multiTabs {
    height: calc(100vh - 44px);
  }

  .div-content-height-header-multiTabs {
    height: calc(100vh - 58px - 44px);
  }

  .model {
    width: 100%;
    height: 100%;
    padding: 2px;
  }
</style>
