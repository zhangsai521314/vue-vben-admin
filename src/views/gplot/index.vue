<template>
  <MyContent :class="prefixCls">
    <gplot
      ref="graphObRef"
      :gplotId="gplotId ? gplotId : props.gplotId"
      :viewType="props.viewType"
    />
  </MyContent>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import gplot from './components/gplot.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { unref } from 'vue';

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
  defineOptions({ name: 'GplotManage' });
  const { prefixCls } = useDesign('GplotManage-');

  //获取url参数
  const { currentRoute } = useRouter();
  const { gplotId } = unref(currentRoute).params;
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage-';
</style>
