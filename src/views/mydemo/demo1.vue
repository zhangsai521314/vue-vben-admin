<template>
  <div class="app1111">
    <Carousel3D
      :perspective="300"
      :items="carouselData"
      :showControls="false"
      :showIndicators="false"
      :baseTiltAngle="-8"
      :cardCountRatio="0.1"
      :cardWidthRatio="0.3"
      :autoPlayTime="300000"
    />
  </div>
</template>

<script setup>
  import Carousel3D from './Carousel3D.vue';
  import { ref } from 'vue';

  // 10张卡片的轮播数据（示例）
  const carouselData = ref([
    { imgUrl: 'https://picsum.photos/id/1/300/200', title: '卡片1', alt: '第1张' },
    { imgUrl: 'https://picsum.photos/id/2/300/200', title: '卡片2', alt: '第2张' },
    { imgUrl: 'https://picsum.photos/id/3/300/200', title: '卡片3', alt: '第3张' },
    { imgUrl: 'https://picsum.photos/id/4/300/200', title: '卡片4', alt: '第4张' },
    { imgUrl: 'https://picsum.photos/id/5/300/200', title: '卡片5', alt: '第5张' },
    { imgUrl: 'https://picsum.photos/id/6/300/200', title: '卡片6', alt: '第6张' },
    { imgUrl: 'https://picsum.photos/id/7/300/200', title: '卡片7', alt: '第7张' },
    { imgUrl: 'https://picsum.photos/id/8/300/200', title: '卡片8', alt: '第8张' },
    { imgUrl: 'https://picsum.photos/id/9/300/200', title: '卡片9', alt: '第9张' },
    { imgUrl: 'https://picsum.photos/id/10/300/200', title: '卡片10', alt: '第10张' },
    { imgUrl: 'https://picsum.photos/id/1/300/200', title: '卡片11', alt: '第1张' },
    { imgUrl: 'https://picsum.photos/id/2/300/200', title: '卡片12', alt: '第2张' },
    { imgUrl: 'https://picsum.photos/id/3/300/200', title: '卡片13', alt: '第3张' },
    { imgUrl: 'https://picsum.photos/id/4/300/200', title: '卡片14', alt: '第4张' },
    { imgUrl: 'https://picsum.photos/id/5/300/200', title: '卡片15', alt: '第5张' },
    { imgUrl: 'https://picsum.photos/id/6/300/200', title: '卡片16', alt: '第6张' },
    { imgUrl: 'https://picsum.photos/id/7/300/200', title: '卡片17', alt: '第7张' },
    { imgUrl: 'https://picsum.photos/id/8/300/200', title: '卡片18', alt: '第8张' },
    { imgUrl: 'https://picsum.photos/id/9/300/200', title: '卡片19', alt: '第9张' },
    { imgUrl: 'https://picsum.photos/id/10/300/200', title: '卡片20', alt: '第10张' },
  ]);
</script>

<style>
  .app1111 {
    position: absolute;
    top: 200px;
    left: 100px;
    width: 570px;
    height: 370px;

    /* background: #ffffff06; */
    background-color: red;
  }
</style>
