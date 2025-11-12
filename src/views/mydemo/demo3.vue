<!-- App.vue -->
<template>
  <div id="app">
    <div class="container">
      <h1>无缝滚动列表组件演示 - 滚动速度稳定</h1>

      <div class="demo-section">
        <h2>基础用法 - 数据更新时滚动速度稳定</h2>
        <div class="controls">
          <button @click="togglePlay">切换播放/暂停</button>
          <button @click="changeSpeed(20)">慢速 (20px/s)</button>
          <button @click="changeSpeed(40)">中速 (40px/s)</button>
          <button @click="changeSpeed(60)">快速 (60px/s)</button>
          <button @click="addItem">添加新项</button>
          <button @click="addMultipleItems">添加10项</button>
          <button @click="removeItem">移除最后一项</button>
          <button @click="updateAllItems">更新所有项</button>
          <button @click="clearList">清空列表</button>
          <button @click="resetList">重置列表</button>
        </div>

        <SeamlessScrollList
          ref="scrollList"
          :list="alarmList"
          container-height="300px"
          :speed="50"
          :pause-on-hover="true"
        >
          <template #default="{ item, index }">
            <div
              class="alarmWai_content"
              :style="{ color: item.color, borderLeftColor: item.color }"
              @click="handleItemClick(item, index)"
            >
              <div class="alarm_title">{{ item.name }}</div>
              <div class="alarm_time">{{ t('view.' + item.alarmType) }}</div>
              <div class="update-count">更新次数: {{ item.updateCount }}</div>
            </div>
          </template>
        </SeamlessScrollList>
      </div>

      <div class="status">
        当前速度: {{ currentSpeed }}像素/秒 | 数据项数: {{ alarmList.length }} | 最后更新:
        {{ lastUpdateTime }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import SeamlessScrollList from '@/components/MyScroll/index.vue';
  import largeScreenApi from '@/api/largeScreen';

  // 响应式数据
  const initialList = [
    {
      name: '通信服务器',
      id: '517830229491787',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 1,
    },
    {
      name: '车站集群调度信息服务器',
      id: '650854103662667',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 2,
    },
    {
      name: '智能网服务器',
      id: '521994196049995',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 3,
    },
    {
      name: '调度台值班台',
      id: '552844026605643',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 4,
    },
    {
      name: '马瑞巴亚港-车站值班台',
      id: '522045670068299',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 5,
    },
    {
      name: '穆萨亚-车站值班台',
      id: '522045728026699',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 6,
    },
    {
      name: '科里巴-车站值班台',
      id: '522045728034891',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 7,
    },
    {
      name: '卡萨-车站值班台',
      id: '522045728038987',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 8,
    },
    {
      name: '乌尔卡巴-车站值班台',
      id: '522045728059467',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 9,
    },
    {
      name: '蒙加塔-车站值班台',
      id: '522045728067659',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 10,
    },
    {
      name: '法拉纳-车站值班台',
      id: '522045728075851',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 11,
    },
    {
      name: '杜瓦科-车站值班台',
      id: '522045728092235',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 12,
    },
    {
      name: '尼亚林科-车站值班台',
      id: '522045819396171',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 13,
    },
    {
      name: '迪安库亚-车站值班台',
      id: '522045819404363',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 14,
    },
    {
      name: '西芒杜矿山-车站值班台',
      id: '522045819412555',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 16,
    },
    {
      name: '凯鲁阿内-车站值班台',
      id: '522045819408459',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 16,
    },
    {
      name: '辛铁矿值班台',
      id: '654453510357637',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 16.01,
    },
    {
      name: '线路所值班台',
      id: '654453510353541',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 16.02,
    },
    {
      name: 'siding0',
      id: '654453021245515',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 17,
    },
    {
      name: 'siding1值班台',
      id: '654453183423109',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 18,
    },
    {
      name: 'siding2值班台',
      id: '654453183435397',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 19,
    },
    {
      name: 'siding3值班台',
      id: '654453183439493',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 20,
    },
    {
      name: 'siding4值班台',
      id: '654453183447685',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 21,
    },
    {
      name: 'siding5值班台',
      id: '654453510337157',
      color: '#08d4fc',
      time: '2025-11-12 23:16:35',
      alarmType: 'offline',
      orderIndex: 22,
    },
  ];

  const alarmList = ref([...initialList]);
  const currentSpeed = ref(40); // 默认40像素/秒
  const scrollList = ref<InstanceType<typeof SeamlessScrollList> | null>(null);
  const lastUpdateTime = ref(new Date().toLocaleTimeString());

  // 方法
  const handleItemClick = (item: any, index: number) => {
    console.log('点击项:', item, '索引:', index);
    alert(`您点击了: ${item.name}\n告警类型: ${item.alarmType}`);
  };

  const changeSpeed = (speed: number) => {
    currentSpeed.value = speed;
  };

  const togglePlay = () => {
    if (scrollList.value) {
      scrollList.value.toggle();
    }
  };

  const addItem = () => {
    const newId = Math.max(...alarmList.value.map((item) => item.id), 0) + 1;
    const alarmTypes = ['紧急', '警告', '注意'];
    const colors = ['#ff4757', '#ffa502', '#2ed573'];
    const randomType = Math.floor(Math.random() * 3);

    alarmList.value.push({
      id: newId,
      name: `新告警 ${new Date().toLocaleTimeString()}`,
      alarmType: alarmTypes[randomType],
      color: colors[randomType],
      updateCount: 0,
    });

    lastUpdateTime.value = new Date().toLocaleTimeString();
  };

  const addMultipleItems = () => {
    // 一次性添加多个项目，测试滚动速度稳定性
    for (let i = 0; i < 10; i++) {
      const newId = Math.max(...alarmList.value.map((item) => item.id), 0) + 1;
      const alarmTypes = ['紧急', '警告', '注意'];
      const colors = ['#ff4757', '#ffa502', '#2ed573'];
      const randomType = Math.floor(Math.random() * 3);

      alarmList.value.push({
        id: newId,
        name: `批量告警 ${i + 1} - ${new Date().toLocaleTimeString()}`,
        alarmType: alarmTypes[randomType],
        color: colors[randomType],
        updateCount: 0,
      });
    }

    lastUpdateTime.value = new Date().toLocaleTimeString();
  };

  const removeItem = () => {
    if (alarmList.value.length > 1) {
      alarmList.value.pop();
      lastUpdateTime.value = new Date().toLocaleTimeString();
    }
  };

  const updateAllItems = () => {
    // 更新所有项目，模拟数据刷新
    alarmList.value.forEach((item) => {
      item.updateCount += 1;
      item.name = `${item.name.split(' - ')[0]} - 更新${item.updateCount}次`;
    });

    lastUpdateTime.value = new Date().toLocaleTimeString();
  };

  const clearList = () => {
    alarmList.value = [];
    lastUpdateTime.value = new Date().toLocaleTimeString();
  };

  const resetList = () => {
    alarmList.value = [...initialList];
    lastUpdateTime.value = new Date().toLocaleTimeString();
  };

  // 模拟i18n翻译函数
  const t = (key: string): string => {
    const translations: Record<string, string> = {
      'view.紧急': '紧急告警',
      'view.警告': '警告信息',
      'view.注意': '注意提示',
    };
    return translations[key] || key;
  };

  // 模拟数据更新
  let dataUpdateInterval: number;

  onMounted(() => {
    // 每3秒更新一次数据，测试数据更新时的稳定性
    // dataUpdateInterval = setInterval(() => {
    //   if (alarmList.value.length > 0) {
    //     // 模拟数据更新 - 修改现有项目
    //     const randomIndex = Math.floor(Math.random() * alarmList.value.length);
    //     const item = alarmList.value[randomIndex];
    //     item.updateCount += 1;
    //     item.name = `${item.name.split(' - ')[0]} - 自动更新${item.updateCount}次`;

    //     lastUpdateTime.value = new Date().toLocaleTimeString();
    //   }
    // }, 3000);
    getServiceInfo();
  });

  function rrrr() {
    resetList();
    setTimeout(() => {
      rrrr();
    }, 3000);
  }

  function getServiceInfo() {
    largeScreenApi
      .GetServiceInfo()
      .then((data) => {
        alarmList.value = [...data];
        lastUpdateTime.value = new Date().toLocaleTimeString();
        setTimeout(() => {
          getServiceInfo();
        }, 5 * 1000);
      })
      .catch(() => {
        setTimeout(() => {
          getServiceInfo();
        }, 5 * 1000);
      });
  }

  onUnmounted(() => {
    clearInterval(dataUpdateInterval);
  });
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
    color: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  #app {
    display: flex;
    justify-content: center;
  }

  .container {
    width: 100%;
    max-width: 800px;
  }

  h1 {
    margin-bottom: 30px;
    font-size: 2.5rem;
    text-align: center;
    text-shadow: 2px 2px 4px rgb(0 0 0 / 30%);
  }

  .demo-section {
    margin-bottom: 30px;
    padding: 20px;
    border-radius: 15px;
    background-color: rgb(255 255 255 / 10%);
    box-shadow: 0 10px 30px rgb(0 0 0 / 30%);
    backdrop-filter: blur(10px);
  }

  .demo-section h2 {
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 15px;
    gap: 10px;
  }

  button {
    padding: 8px 15px;
    transition: all 0.3s ease;
    border: none;
    border-radius: 5px;
    background: rgb(255 255 255 / 20%);
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
  }

  button:hover {
    background: rgb(255 255 255 / 30%);
  }

  .status {
    margin-top: 15px;
    opacity: 0.8;
    font-size: 0.9rem;
    text-align: center;
  }

  /* 自定义项样式 */
  .alarmWai_content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    padding: 15px;
    transition: all 0.3s ease;
    border-left: 4px solid;
    border-radius: 10px;
    background: rgb(255 255 255 / 15%);
    cursor: pointer;
  }

  .alarmWai_content:hover {
    transform: translateX(5px);
    background: rgb(255 255 255 / 25%);
  }

  .alarm_title {
    flex: 1;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .alarm_time {
    margin: 0 15px;
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .update-count {
    opacity: 0.7;
    font-size: 0.8rem;
  }
</style>
