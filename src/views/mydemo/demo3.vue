<template>
  <div>
    <button @click="playAudio">播放音频</button>
    <button @click="stopAudio">停止音频</button>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  const audio = ref(null);

  onMounted(() => {
    audio.value = new Audio('/src/assets/audio/gaojin2.mp3'); // 替换为你的音频文件路径
    audio.value.addEventListener('canplaythrough', function () {
      audio.value.play();
    });

    audio.value.load();
  });

  onUnmounted(() => {
    audio.value.pause();
    audio.value = null;
  });

  const playAudio = () => {
    audio.value.play();
  };

  const stopAudio = () => {
    audio.value.pause();
    audio.value.currentTime = 0; // 重置音频时间
  };
</script>
