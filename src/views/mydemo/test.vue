<template>
  <div>
    <button @click="executeCode">执行后端代码</button>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const backendCode = ref('');

  // 假设这是从后端获取的代码
  backendCode.value = 'console.log(s);';

  const executeCode = () => {
    // 使用Function类型执行代码
    const executeFunc = new Function(backendCode.value);
    const s = 1;
    executeFunc(s);
  };
</script>
