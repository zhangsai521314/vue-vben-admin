<template>
  <div
    style="
      width: 100%;
      height: 100%;
      background-image: url('/src/assets/images/largeScreen/bj1.png');
    "
  >
    <div class="app1111">
      <Carousel3D
        :perspective="130"
        :items="carouselData"
        :showControls="false"
        :showIndicators="false"
        :baseTiltAngle="-5"
        :cardCountRatio="0.3"
        :cardWidthRatio="0.4"
        :autoPlayTime="2000"
      />
    </div>
  </div>
</template>

<script setup>
  import Carousel3D from './Carousel3D.vue';
  import { ref } from 'vue';

  // 10张卡片的轮播数据（示例）
  const carouselData = ref([
    {
      imgUrl: 'https://picsum.photos/id/1/300/200',
      title: '马瑞巴亚港',
      alt: '第1张',
      bColor: '#D7D7D7',
    },
    { imgUrl: 'https://picsum.photos/id/2/300/200', title: '穆萨亚', alt: '第2张', bColor: 'red' },
    {
      imgUrl: 'https://picsum.photos/id/3/300/200',
      title: '科里巴',
      alt: '第3张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/4/300/200',
      title: '乌尔卡巴',
      alt: '第4张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/5/300/200',
      title: '蒙加塔',
      alt: '第5张',
      bColor: 'yellow',
    },
    {
      imgUrl: 'https://picsum.photos/id/6/300/200',
      title: '法拉纳',
      alt: '第6张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/7/300/200',
      title: '杜瓦科',
      alt: '第7张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/8/300/200',
      title: '尼 亚林科',
      alt: '第8张',
      bColor: '#D7D7D7',
    },
    {
      imgUrl: 'https://picsum.photos/id/9/300/200',
      title: '迪安库亚',
      alt: '第9张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/10/300/200',
      title: '凯鲁阿内',
      alt: '第10张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/1/300/200',
      title: '西芒杜矿山',
      alt: '第1张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/2/300/200',
      title: '辛铁矿',
      alt: '第2张',
      bColor: 'yellow',
    },
    {
      imgUrl: 'https://picsum.photos/id/3/300/200',
      title: '线路所',
      alt: '第3张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/4/300/200',
      title: 'siding1',
      alt: '第4张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/5/300/200',
      title: 'siding2',
      alt: '第5张',
      bColor: '#D7D7D7',
    },
    {
      imgUrl: 'https://picsum.photos/id/6/300/200',
      title: 'siding3',
      alt: '第6张',
      bColor: 'yellow',
    },
    {
      imgUrl: 'https://picsum.photos/id/7/300/200',
      title: 'siding4',
      alt: '第7张',
      bColor: '#D7D7D7',
    },
    {
      imgUrl: 'https://picsum.photos/id/8/300/200',
      title: 'siding5',
      alt: '第8张',
      bColor: 'yellow',
    },
  ]);
</script>

<style>
  .app1111 {
    position: absolute;
    top: -45px;
    right: 440px;
    width: 500px;
    height: 370px;

    /* background: #ffffff06; */
  }
</style>
