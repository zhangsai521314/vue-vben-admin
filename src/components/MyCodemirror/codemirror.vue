<template>
  <Codemirror
    :class="prefixCls"
    :disabled="disabled"
    v-model="code"
    placeholder="暂无数据..."
    :style="comStyle"
    :autofocus="true"
    :indent-with-tab="true"
    :tabSize="2"
    :fullScreen="true"
    :extensions="extensions"
    @ready="() => {}"
    @change="change"
    @focus="() => {}"
    @blur="() => {}"
  />
</template>
<script setup>
  import { watch, ref, toRefs, computed } from 'vue';
  import { Codemirror } from 'vue-codemirror';
  import { javascript } from '@codemirror/lang-javascript';
  import { xml } from '@codemirror/lang-xml';
  import { json } from '@codemirror/lang-json';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { useDesign } from '/@/hooks/web/useDesign';

  const { prefixCls } = useDesign('myCodemirror-codemirror-');
  const props = defineProps({
    modelValue: {
      type: String,
      required: false,
      default: '',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    disabled: {
      type: [String, Boolean],
      default: false,
    },
    style: {
      type: [Object],
      default: () => ({
        height: '400px',
      }),
    },
  });
  const emits = defineEmits(['change']);
  const { modelValue, disabled, style } = toRefs(props);
  const code = ref(modelValue);
  const extensions = ref([getLang()(), oneDark]);

  function getLang() {
    return { javascript, xml, json }[props.language];
  }
  function change(value) {
    //1:v-model="props.code"，改变不了父级的code值，但是父级改变代码会刷新
    //2:const code = ref(props.code);v-model="code"，改变不了父级的code值,且父级改变页面不会刷新
    emits('change', value);
  }
  //监控父级改变
  watch(
    () => props.modelValue,
    () => {
      code.value = props.modelValue;
    },
  );
  watch(
    () => props.language,
    () => {
      extensions.value = ref([getLang()(), oneDark]);
    },
  );

  watch(
    () => modelValue.value,
    (val) => {
      code.value = val;
    },
  );
  const comStyle = computed(() => ({
    ...style.value,
    // ...{ height: fullScreen.value ? '100%' : '400px' },
  }));
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-myCodemirror-codemirror-';

  .@{prefix-cls} {
    width: 100%;
    height: 100%;
    overflow: 'auto';
  }
</style>
