<template>
  <div class="alarm fontColor">
    <div class="bottombg"></div>
    <div class="title">告警信息</div>
    <div class="alarmNo" v-show="pendingAlarmData.length == 0">
      <div>无待处理告警</div>
    </div>
    <div v-show="pendingAlarmData.length > 0" class="data">
      <vue3-seamless-scroll
        class="scroll"
        :list="pendingAlarmData"
        :hover="true"
        :limitScrollNum="5"
        :isWatch="true"
        :step="0.5"
      >
        <div
          @click="goView(item)"
          class="alarmWai_for"
          v-for="(item, i) in pendingAlarmData"
          :key="i"
        >
          <div class="alarmWai_content">
            <div class="alarm_title">{{ item.title }}</div>
            <div class="alarm_time">{{ item.time }}</div>
          </div>
        </div>
      </vue3-seamless-scroll>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
  import { ref } from 'vue';
  import type { TreeProps } from 'ant-design-vue';

  const pendingAlarmData = ref([
    {
      title: '1距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
    },
    {
      title: '2距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
    },
    {
      title: '3距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
    },
    {
      title: '4距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
    },
    {
      title: '5距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
    },
    {
      title: '6距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
    },
  ]);
  function goView(item) {}
</script>
<style lang="less" scoped>
  .alarm {
    width: 386px;
    height: 250px;
    background-image: url('@/assets/images/largeScreen/xbj_1_1.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    .title {
      position: relative;
      top: 6px;
      right: -256px;
      font-size: 20px;
    }

    .alarmNo {
      display: flex;
      align-items: center; /* 垂直居中 */
      justify-content: center; /* 水平居中 */
      width: 342px;
      height: calc(100% - 60px);
    }
  }
</style>
