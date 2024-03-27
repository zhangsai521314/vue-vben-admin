<template>
  <i v-if="!isSvg" :title="title" :style="style" class="iconfont" :class="name">
    <slot></slot>
  </i>
  <i v-else :title="title" :style="style">
    <svg style="display: inline-block" class="icon" aria-hidden="true">
      <use :xlink:href="`#${name}`" />
    </svg>
    <slot></slot>
  </i>
</template>
<script>
  export default {
    name: 'IconFontClass',
    props: {
      title: {
        type: String,
        default: '',
      },
      style: {
        type: Object,
        default: () => {
          return {};
        },
      },
      isSvg: {
        type: Boolean,
        default: false,
      },
      name: {
        type: String,
        required: true,
      },
    },
  };
</script>
