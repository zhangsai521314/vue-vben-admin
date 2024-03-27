<template>
  <vue3-seamless-scroll v-model="dd" :list="list" class="scroll" :hover="true" limitScrollNum="5" :count="1">
    <div class="item" v-for="(item, index) in list" :key="index">
      <span>{{ item.title }}</span>
      <span>{{ item.date }}</span>
    </div>
  </vue3-seamless-scroll>
</template>
<script setup>
import { defineComponent, ref } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
const list = ref([
  {
    title: 'Vue3.0 无缝滚动组件展示数据第1条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第2条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第3条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第4条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第5条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第6条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第7条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第8条',
    date: Date.now(),
  },
  {
    title: 'Vue3.0 无缝滚动组件展示数据第9条',
    date: Date.now(),
  },
]);

const dd = ref(true);

let i = 0;
setTimeout(() => {
  setInterval(() => {
    list.value.push({
      title: i,
      date: Date.now(),
    });
    if (i > 10) {
      dd.value = false
    }
    // if (i > 20) {
    //   dd.value = true
    // }
    i++;
  }, 100);
}, 6000);
</script>

<style>
.scroll {
  height: 270px;
  width: 500px;
  margin: 100px auto;
  overflow: hidden;
}

.scroll .item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
}
</style>
