<template>
  <div class="parent-container">
    <!-- 第二个滚动列表展示不同配置 -->
    <div class="scroll-section secondary">
      <SeamlessVirtualScroll
        :data="scrollData"
        :speed="scrollSpeed"
        :container-height="containerHeight"
        :item-height="itemHeight"
        :hover-pause="hoverPause"
      >
        <template #default="{ item, index }">
          <div class="alarmWai_content" :style="{ color: item.color }">
            <div class="alarm_title">{{ item.name }}</div>
            <div class="alarm_time">{{ 1 }}</div>
          </div>
        </template>
      </SeamlessVirtualScroll>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import SeamlessVirtualScroll from '@/components/MyScroll/index.vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import largeScreenApi from '@/api/largeScreen';

  const { t } = useI18n();
  interface ScrollItem {
    name: string;
    color: string;
    alarmType: string;
  }

  // 响应式数据
  const scrollData = ref<ScrollItem[]>([]);
  const isLoading = ref(false);
  const refreshTimer = ref<NodeJS.Timeout>();
  const lastUpdateTime = ref<string>('');

  // 配置项
  const scrollSpeed = ref(40);
  const containerHeight = ref(300);
  const itemHeight = ref(30);
  const hoverPause = ref(true);

  // 生成模拟数据
  const generateMockData = (count: number): ScrollItem[] => {
    // const categories = ['重要', '一般', '通知', '更新'];
    // const timestamp = Date.now();
    // return Array.from({ length: count }, (_, index) => ({
    //   id: `item-${timestamp}-${index}`,
    //   title: `滚动项目 ${scrollData.value.length + index + 1}`,
    //   time: new Date().toLocaleTimeString(),
    //   content: `这是第 ${scrollData.value.length + index + 1} 个项目的内容描述，用于展示真正的无缝循环滚动效果。`,
    //   category: categories[Math.floor(Math.random() * categories.length)],
    // }));
    return [
      {
        name: '通信服务器',
        color: '#0DE963',
        alarmType: 'normal',
      },
      {
        name: '测试',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '车站集群调度信息服务器',
        color: '#0DE963',
        alarmType: 'normal',
      },
      {
        name: '智能网服务器',
        color: '#0DE963',
        alarmType: 'normal',
      },
      {
        name: '调度值班台',
        color: '#0DE963',
        alarmType: 'normal',
      },
      {
        name: '马瑞巴亚港-车站值班台',
        color: '#0DE963',
        alarmType: 'normal',
      },
      {
        name: '穆萨亚-车站值班台',
        color: '#0DE963',
        alarmType: 'normal',
      },
      {
        name: '科里巴-车站值班台',
        color: '#0DE963',
        alarmType: 'normal',
      },
      {
        name: '卡萨-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '乌尔卡巴-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '蒙加塔-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '法拉纳-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '杜瓦科-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '尼 亚林科-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '迪安库亚-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '凯鲁阿内-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '西芒杜矿山-车站值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '线路所值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: 'siding0',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: 'siding1值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: 'siding2值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: 'siding3值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: 'siding4值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: 'siding5值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
      {
        name: '辛铁矿值班台',
        color: '#08d4fc',
        alarmType: 'offline',
      },
    ];
  };

  // 获取数据
  const fetchData = async () => {
    if (isLoading.value) return;

    isLoading.value = true;
    try {
      // 模拟API请求

      let newData = await largeScreenApi.GetServiceInfo();
      newData = newData.map((m) => ({
        name: m.name,
        color: m.color,
        alarmType: m.alarmType,
      }));

      // 整体更新数据
      scrollData.value = [...newData];

      lastUpdateTime.value = new Date().toLocaleTimeString();
      console.log('数据更新完成，当前数据量:', scrollData.value.length);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // 添加数据
  const addItems = () => {
    const newItems = generateMockData(5);
    scrollData.value = [...scrollData.value, ...newItems];
    lastUpdateTime.value = new Date().toLocaleTimeString();
  };

  // 清空数据
  const clearData = () => {
    scrollData.value = [];
    lastUpdateTime.value = new Date().toLocaleTimeString();
  };

  // 处理项目点击
  const handleItemClick = (item: ScrollItem, index: number) => {
    console.log('点击项目:', item, '索引:', index);
    // 这里可以添加点击处理逻辑
  };

  // 自动刷新数据
  const startAutoRefresh = () => {
    refreshTimer.value = setInterval(fetchData, 10000); // 10秒刷新一次
  };

  // 清理定时器
  const stopAutoRefresh = () => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value);
      refreshTimer.value = undefined;
    }
  };

  // 初始加载一些数据
  const initData = () => {
    const initialData = generateMockData(12);
    scrollData.value = initialData;
    lastUpdateTime.value = new Date().toLocaleTimeString();
  };
  function goIndex(item) {
    window.open(`${window.location.origin}/#/message/index/${item.id}`, '_blank');
  }
  // 生命周期
  onMounted(() => {
    // 初始加载数据
    initData();
    // 启动自动刷新
    startAutoRefresh();
  });

  onUnmounted(() => {
    // 清理定时器，防止内存泄漏
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
