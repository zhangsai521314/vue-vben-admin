<template>
  <MyContent :class="prefixCls">
    <div>
      <div style="width: 100%; height: 100%">
        <gplot ref="graphObRef" :gplotId="_gplotId" :menuId="_menuId" :viewType="props.viewType" />
      </div>
    </div>
  </MyContent>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import gplot from './components/gplot.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { unref, ref } from 'vue';

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
  });
  defineOptions({ name: 'GplotIndex' });
  const { prefixCls } = useDesign('GplotIndex-');
  //获取url参数
  const { currentRoute } = useRouter();
  const _gplotId = ref(props.gplotId);
  const _menuId = ref();
  const { menuId } = unref(currentRoute).params;
  _menuId.value = menuId;
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotIndex-';
  .@{prefixCls} {
    height: calc(100vh - 48px);
    > div {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
  }
</style>
