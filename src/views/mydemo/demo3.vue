<template>
  <div ref="mountRef" style="width: 100%; height: 100%"> </div>
</template>

<script lang="ts" setup>
  import { Graph } from '@antv/g6';
  import { onMounted, ref, watch } from 'vue';

  const mountRef = ref();
  onMounted(() => {
    const data = {
      nodes: [
        { id: 'node-1', style: { x: 200, y: 200 } },
        { id: 'node-2', style: { x: 350, y: 120 } },
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
        },
      ],
    };

    const graph = new Graph({
      container: mountRef.value,
      data,
      edge: {
        type: 'polyline',
        style: {
          router: {
            type: 'orth',
          },
        },
      },
      behaviors: [{ type: 'drag-element' }],
    });

    graph.render();
  });
</script>
