<template>
  <MyContent :class="prefixCls">gplot</MyContent>
</template>

<script setup lang="ts">
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import menuApi from '@/api/menu';

  defineOptions({ name: 'GplotManage' });
  const { prefixCls } = useDesign('GplotManage-');
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-GplotManage-';
</style>
