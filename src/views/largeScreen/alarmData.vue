<template>
  <div class="alarm fontColor">
    <div class="bottombg"></div>
    <div class="title">{{ t('view.serviceStatus') }}</div>
    <div class="data">
      <VirtualScroll
        :data="alarmList"
        :speed="40"
        :container-height="200"
        :item-height="30"
        :hover-pause="true"
      >
        <template #default="{ item, index }">
          <div class="alarmWai_content" :style="{ color: item.color }" @click="goIndex(item)">
            <div class="alarm_title">{{ item.name }}</div>
            <!-- <div class="alarm_time">{{ t('view.' + item.alarmType) }}</div> -->
            <div class="alarm_time">2</div>
          </div>
        </template>
      </VirtualScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import largeScreenApi from '@/api/largeScreen';
  import VirtualScroll from '@/components/MyScroll/index.vue';
  import { useI18n } from '@/hooks/web/useI18n';

  let isLoading = false;
  const refreshTimer = ref<NodeJS.Timeout>();
  const { t } = useI18n();
  interface ScrollItem {
    name: string;
    color: string;
    alarmType: string;
  }
  const alarmList = ref<ScrollItem[]>([]);

  async function getServiceInfo() {
    if (isLoading) return;
    isLoading = true;
    try {
      let data = await largeScreenApi.GetServiceInfo();
      data = data.map((m) => ({
        name: m.name,
        color: m.color,
        alarmType: m.alarmType,
      }));
      alarmList.value = [...data];
    } catch (ex) {
      console.error(ex);
    } finally {
      nextTick(() => {
        isLoading = false;
      });
    }
  }

  // 自动刷新数据
  const startAutoRefresh = () => {
    refreshTimer.value = setInterval(getServiceInfo, 12000);
  };

  // 清理定时器
  const stopAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value);
      refreshTimer.value = undefined;
    }
  };

  function goIndex(item) {
    window.open(`${window.location.origin}/#/message/index/${item.id}`, '_blank');
  }

  onMounted(() => {
    getServiceInfo();
    startAutoRefresh();
  });

  onUnmounted(() => {
    stopAutoRefresh();
  });
</script>

<style lang="less" scoped>
  .fontColor {
    color: #08d4fc;
  }

  @media (max-width: 1999px) {
    .alarm {
      position: absolute;
      top: 40px;
      right: 4px;
      width: 384px;
      min-width: 310px;
      height: 168px;
      min-height: 136px;
      background-image: url('@/assets/images/largeScreen/xbj72.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      .scroll-wrapper {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
      }

      .title {
        position: relative;
        top: 2%;
        right: 19px;
        width: 100%;
        overflow: hidden;
        font-size: 18px;
        text-align: right;
        text-emphasis: inherit;
        cursor: pointer;
      }

      .alarmNo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 89%;
        height: 74%;
      }

      .data {
        width: 92%;
        height: calc(100% - 32px);
        margin-top: 8px;
        margin-left: 7px;
        overflow: hidden;
        cursor: pointer;
      }

      .alarmWai_content {
        display: flex;
        flex-direction: row;
        height: 30px;
        line-height: 30px;
        gap: 6px;
      }

      .alarm_title {
        width: 68%;
        overflow: hidden;
        font-size: 16px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .alarm_time {
        flex-grow: 1;
        overflow: hidden;
        font-size: 14px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  @media (min-width: 2000px) {
    .alarm {
      position: absolute;
      top: 40px;
      right: 4px;
      width: 494px;
      min-width: 310px;
      height: 217px;
      min-height: 136px;
      background-image: url('@/assets/images/largeScreen/xbj72.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      .title {
        position: relative;
        top: 2%;
        right: 19px;
        width: 100%;
        overflow: hidden;
        font-size: 18px;
        text-align: right;
        text-emphasis: inherit;
        cursor: pointer;
      }

      .alarmNo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 89%;
        height: 74%;
      }

      .data {
        width: 92%;
        height: calc(100% - 32px);
        margin-top: 8px;
        margin-left: 7px;
        overflow: hidden;
        cursor: pointer;
      }

      .alarmWai_content {
        display: flex;
        flex-direction: row;
        height: 30px;
        line-height: 30px;
        gap: 6px;
      }

      .alarm_title {
        width: 68%;
        overflow: hidden;
        font-size: 16px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .alarm_time {
        flex-grow: 1;
        overflow: hidden;
        font-size: 14px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
