<template>
  <a-tree
    v-model:expandedKeys="expandedKeys"
    v-model:selectedKeys="selectedKeys"
    :tree-data="treeData"
    @expand="_expand"
  >
    <template #title="node"> 哈哈 {{ node.title }} </template>
  </a-tree>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import type { TreeProps } from 'ant-design-vue';

  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const treeData = ref<TreeProps['treeData']>([
    { title: 'Expand to load', key: '0', isLeaf: false },
    { title: 'Expand to load', key: '1', isLeaf: false },
    { title: 'Tree Node', key: '2', isLeaf: true },
  ]);

  function _expand(a, b) {
    b.node.dataRef.children = [
      { title: 'Child Node_1', key: `${b.node.eventKey}-0` },
      { title: 'Child Node_2', key: `${b.node.eventKey}-1` },
    ];
    // treeData.value = [...treeData.value];
  }
</script>
