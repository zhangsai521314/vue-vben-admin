<template>
  <Menu.Item :key="itemKey">
    <span class="flex items-center">
      <!-- <Icon :icon="icon" class="mr-1" /> -->
      <IconFontClass class="mr-1" :name="icon" :style="{ fontSize: '16px' }" />
      <span>{{ text }}</span>
    </span>
  </Menu.Item>
</template>
<script lang="ts" setup>
  //IconFontClass zs更改图标更换
  import { Menu } from 'ant-design-vue';
  import { computed, getCurrentInstance } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { propTypes } from '@/utils/propTypes';

  defineOptions({ name: 'DropdownMenuItem' });

  defineProps({
    text: propTypes.string,
    icon: propTypes.string,
  });

  const instance = getCurrentInstance();
  const itemKey = computed(() => instance?.vnode?.props?.key);
</script>
