<template>
  <MyContent :class="prefixCls">
    <div id="container"></div>
  </MyContent>
</template>
<script setup lang="ts">
  import { ref, reactive, createVNode, nextTick, watch, onMounted } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { Graph } from '@antv/g6';

  const { prefixCls } = useDesign('GplotManage-');
  // 准备数据
  const data = {
    nodes: [
      /* your nodes data */
    ],
    edges: [
      /* your edges data */
    ],
  };

  onMounted(() => {
    // 初始化图表实例
    const graph = new Graph({
      container: 'container',
      autoFit: 'view',
      data,
      node: {
        palette: {
          type: 'group',
          field: 'cluster',
        },
      },
      layout: {
        type: 'force',
      },
      behaviors: ['drag-canvas', 'drag-node'],
    });

    // 渲染可视化
    graph.render();
  });
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-suitManage-';

  .@{prefixCls} {
    .@{prefixCls}tableBtn {
      width: 100%;
    }
  }
</style>
