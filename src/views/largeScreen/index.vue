<template>
  <MyContent :class="prefixCls">
    <div class="content">
      <div class="map-container">
        <!-- 地图容器 -->
        <div ref="mapContainer" class="map"></div>
        <!-- 搜索和控制区 -->
        <div class="control-container">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('view.integratedServicesDigitalNetworkSearch')"
              @keyup.enter="handleSearch"
              class="search-input"
            />
          </div>
          <!-- 新增：显示/隐藏控制按钮 -->
          <div class="toggle-controls">
            <div class="toggle-btn" :class="{ active: showTrains }" @click="toggleTrainsVisibility">
              <IconFontClass
                name="icon-baseui-zhinengwangguan"
                :style="{ fontSize: '20px', marginRight: '5px' }"
              />
              {{ t('view._cabRadio') }}
            </div>
            <div
              class="toggle-btn"
              :class="{ active: showPersons }"
              @click="togglePersonsVisibility"
            >
              <IconFontClass
                name="icon-baseui-shouchidanbing"
                :style="{ fontSize: '20px', marginRight: '5px' }"
              />
              {{ t('view.handheldRadio') }}
            </div>
            <div class="toggle-btn active" @click="resetMap">
              <IconFontClass
                name="icon-baseui-zhizao"
                :style="{ fontSize: '20px', marginRight: '5px' }"
              />
              {{ t('view.resetMap') }}
            </div>
            <!-- 新增：手动重置按钮 -->
            <div class="toggle-btn" @click="manualReset" title="手动重置页面释放内存">
              <IconFontClass
                name="icon-baseui-zhizao"
                :style="{ fontSize: '20px', marginRight: '5px' }"
              />
              手动重置
            </div>
          </div>
        </div>
      </div>
      <div class="head">{{ t('view.operationMonitoringPlatform') }} </div>
      <div class="wgdata fontColor">
        <div class="bottombg"></div>
        <div class="title">{{ t('view.requestStatistics') }}</div>
        <div class="data">
          <div>
            <div>
              <div class="number">{{ deviceCount.optionCount }}</div>
              <div class="label">{{ t('view.dutyDesk') }}</div>
            </div>
          </div>
          <div>
            <div>
              <div class="number">{{ deviceCount.cirCount }}</div>
              <div class="label">{{ t('view._cabRadio') }}</div>
            </div>
          </div>
          <div>
            <div>
              <div class="number">{{ deviceCount.handCount }}</div>
              <div class="label">{{ t('view.handheldRadio') }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="jccir fontColor">
        <div class="bottombg"></div>
        <div class="title">{{ t('view.locomotiveRadioLocation') }}</div>
        <div class="data" ref="chartJiCirRef"> </div>
      </div>
      <div class="hand fontColor">
        <div class="bottombg"></div>
        <div class="title">{{ t('view.handheldTerminalLocation') }}</div>
        <div class="data" ref="chartHandRef"> </div>
      </div>
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
            <template #default="{ item }">
              <div class="alarmWai_content" :style="{ color: item.color }" @click="goIndex(item)">
                <div class="alarm_title">{{ item.name }}</div>
                <div class="alarm_time">{{ item.alarmType }}</div>
              </div>
            </template>
          </VirtualScroll>
        </div>
      </div>
    </div>
  </MyContent>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useECharts } from '@/hooks/web/useECharts';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.marker.slideto';
  import 'leaflet-rotate';
  import 'leaflet.markercluster';
  import 'leaflet.markercluster/dist/MarkerCluster.css';
  import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
  import { message } from 'ant-design-vue';
  import largeScreenApi from '@/api/largeScreen';
  import VirtualScroll from '@/components/MyScroll/index.vue';
  // 类型定义
  interface ScrollItem {
    id: string;
    name: string;
    color: string;
    alarmType: string;
  }

  interface Line {
    id: string;
    name: string;
    color: string;
    coordinates: [number, number][];
    stations: Station[];
  }

  interface Station {
    id: string;
    name: string;
    coordinate: [number, number];
    photo: string;
    circleMarker?: L.CircleMarker;
    nameMarker?: L.Marker;
  }

  interface Train {
    id: string;
    isdn: string;
    station: string;
    area: string;
    isOnline: boolean;
    coordinate: [number, number];
    marker?: L.Marker;
    isdnMarker?: L.Marker;
    lineId?: string;
    moving?: boolean;
    lastValidCoordinate?: [number, number];
    hasValidCoordinate?: boolean;
    glb?: number;
  }

  interface Person {
    id: string;
    role: string;
    isdn: string;
    station: string;
    area: string;
    isOnline: boolean;
    coordinate: [number, number];
    marker?: L.Marker;
    isdnMarker?: L.Marker;
    moving?: boolean;
    lastValidCoordinate?: [number, number];
    hasValidCoordinate?: boolean;
  }

  interface MemoryStats {
    used: number;
    total: number;
    limit: number;
  }

  interface ResetStats {
    beforeReset: MemoryStats | null;
    afterReset: MemoryStats | null;
    reduction: number | null;
    resetCount: number;
    lastResetTime: string | null;
  }

  // 组件定义
  defineOptions({ name: 'LargeScreen' });
  const { prefixCls } = useDesign('largeScreen-');
  const { t } = useI18n();

  // Refs
  const chartJiCirRef = ref<HTMLDivElement | null>(null);
  const chartHandRef = ref<HTMLDivElement | null>(null);
  const mapContainer = ref<HTMLDivElement | null>(null);
  const searchQuery = ref<string>('');

  const chartJiCir = useECharts(chartJiCirRef);
  const chartHand = useECharts(chartHandRef);

  const legendDatas = [t('view.leftSide'), t('view.inStation'), t('view.rightSide')];
  const showTrains = ref<boolean>(true);
  const showPersons = ref<boolean>(true);
  const resetInProgress = ref<boolean>(false);

  // 数据状态
  const requestData = ref({
    userCount: 0,
    requestCount: 0,
    onlineCount: 0,
  });

  const deviceCount = ref({
    cirCount: 0,
    handCount: 0,
    optionCount: 0,
  });

  const alarmList = ref<ScrollItem[]>([]);
  const lines = ref<Line[]>([]);
  const trains = ref<Train[]>([]);
  const persons = ref<Person[]>([]);

  // 内存监控状态
  const memoryStats = ref<ResetStats>({
    beforeReset: null,
    afterReset: null,
    reduction: null,
    resetCount: 0,
    lastResetTime: null,
  });

  // 配置常量
  const UPDATE_INTERVAL = 5000;
  const DEBOUNCE_DELAY = 300;
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2小时的毫秒数

  const initialMapState = {
    center: [9.2271, -10.9921] as [number, number],
    zoom: 8,
    bearing: -10,
  };

  // 地图相关变量
  let map: L.Map | null = null;
  let currentPopup: L.Popup | null = null;
  let trainLayerGroup: L.LayerGroup | null = null;
  let personClusterGroup: L.MarkerClusterGroup | null = null;

  // 标记存储
  const stationNameMarkers: Record<string, L.Marker> = {};
  const trainMarkers = new Map<string, L.Marker>();
  const personMarkers = new Map<string, L.Marker>();

  // 状态变量
  let isRotating = false;
  let lastMouseX = 0;
  let isMapInitialized = false;
  let isFirstHandE = true;
  let isFirstCirE = true;

  // 更新控制
  let updateInterval: NodeJS.Timeout | null = null;
  let resetTimer: NodeJS.Timeout | null = null;
  let lastTrainUpdateTime = 0;
  let lastPersonUpdateTime = 0;

  // 数据队列
  let pendingPersonData: Person[] = [];
  let pendingTrainData: Train[] = [];
  let isUpdatingTrains = false;
  let isUpdatingPersons = false;
  let personUpdateQueue: Person[] = [];
  let trainUpdateQueue: Train[] = [];

  // 内存监控函数
  const getMemoryUsage = (): MemoryStats | null => {
    try {
      if (window.performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        return {
          used: Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100,
          total: Math.round((memory.totalJSHeapSize / 1048576) * 100) / 100,
          limit: Math.round((memory.jsHeapSizeLimit / 1048576) * 100) / 100,
        };
      }
      return null;
    } catch (error) {
      console.error('获取内存使用情况失败:', error);
      return null;
    }
  };

  const logMemoryStats = (phase: string): MemoryStats | null => {
    try {
      const memory = getMemoryUsage();
      if (memory) {
        console.group(`🚀 内存使用情况 - ${phase}`);
        console.log(`📊 已使用内存: ${memory.used} MB`);
        console.log(`💾 总内存: ${memory.total} MB`);
        console.log(`⚡ 内存限制: ${memory.limit} MB`);
        console.log(`📈 使用率: ${Math.round((memory.used / memory.limit) * 100)}%`);

        console.log(`🗺️  地图对象数量: ${map ? '存在' : '不存在'}`);
        console.log(`🚂 火车标记数量: ${trainMarkers.size}`);
        console.log(`👤 人员标记数量: ${personMarkers.size}`);
        console.log(`🚉 车站标记数量: ${Object.keys(stationNameMarkers).length}`);
        console.log(`📊 火车数据条数: ${trains.value.length}`);
        console.log(`👥 人员数据条数: ${persons.value.length}`);
        console.log(`🛤️  线路数据条数: ${lines.value.length}`);
        console.groupEnd();

        return memory;
      } else {
        console.warn(`⚠️  无法获取内存信息 - ${phase}`);
        return null;
      }
    } catch (error) {
      console.error(`记录内存统计信息失败 (${phase}):`, error);
      return null;
    }
  };

  // 重置管理函数
  const startResetTimer = (): void => {
    try {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }

      const now = new Date();
      const todayElevenPM = new Date(now);
      todayElevenPM.setHours(23, 0, 0, 0); // 设置为今天23点

      const tomorrowElevenPM = new Date(now);
      tomorrowElevenPM.setDate(tomorrowElevenPM.getDate() + 1);
      tomorrowElevenPM.setHours(23, 0, 0, 0); // 设置为明天23点

      let nextResetTime: Date;

      // 计算距离今天23点的时间差
      const timeToTodayElevenPM = todayElevenPM.getTime() - now.getTime();

      // 如果距离今天23点小于2小时，则使用明天23点
      if (timeToTodayElevenPM < TWO_HOURS_MS && timeToTodayElevenPM > 0) {
        nextResetTime = tomorrowElevenPM;
        console.log('⏰ 距离今天23点不足2小时，将使用明天23点作为重置时间');
      } else {
        nextResetTime = timeToTodayElevenPM > 0 ? todayElevenPM : tomorrowElevenPM;
        console.log('⏰ 使用今天23点作为重置时间');
      }

      const timeUntilReset = nextResetTime.getTime() - now.getTime();

      resetTimer = setTimeout(() => {
        performPageReset();
        // 重置后重新设置定时器，以便每天执行
        startResetTimer();
      }, timeUntilReset);

      console.log(
        `⏰ 已启动重置定时器，将在 ${Math.round(timeUntilReset / 1000 / 60)} 分钟后自动重置页面`,
      );
      console.log(`📅 下次重置时间: ${nextResetTime.toLocaleString()}`);
    } catch (error) {
      console.error('启动重置定时器失败:', error);
    }
  };

  const manualReset = (): void => {
    if (resetInProgress.value) {
      return;
    }
    performPageReset();
  };

  const performPageReset = async (): Promise<void> => {
    if (resetInProgress.value) return;
    message.loading(t('view.resourceCleaning'), 0);
    resetInProgress.value = true;
    memoryStats.value.lastResetTime = new Date().toLocaleString();

    console.group('🔄 开始执行页面重置...');

    try {
      // 记录重置前的内存状态
      console.log('📊 重置前内存状态:');

      memoryStats.value.beforeReset = logMemoryStats('重置前');

      // 停止所有数据更新
      stopAllIntervals();

      // 清理所有资源
      cleanup();

      // 重置所有数据状态
      resetDataStates();

      // 重置图表状态
      resetCharts();

      await nextTick();

      //强制等待5秒
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 强制垃圾回收（如果可用）
      triggerGarbageCollection();

      // 等待垃圾回收
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // 记录重置后的内存状态
      console.log('📊 重置后内存状态:');
      memoryStats.value.afterReset = logMemoryStats('重置后');

      // 计算内存减少量
      calculateMemoryReduction();

      memoryStats.value.resetCount++;

      // 重新初始化页面
      console.log('🔄 开始重新初始化页面...');
      resetInProgress.value = false;
      await initializePage();

      console.log('✅ 页面重置完成');
    } catch (error) {
      resetInProgress.value = false;
      console.error('❌ 页面重置过程中发生错误:', error);
    } finally {
      message.destroy();
      console.groupEnd();
    }
  };

  const stopAllIntervals = (): void => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
      console.log('⏹️  已停止数据更新定时器');
    }
  };

  const resetDataStates = (): void => {
    trains.value = [];
    persons.value = [];
    lines.value = [];
    alarmList.value = [];
    deviceCount.value = {
      cirCount: 0,
      handCount: 0,
      optionCount: 0,
    };
    requestData.value = {
      userCount: 0,
      requestCount: 0,
      onlineCount: 0,
    };
    console.log('🗑️  已清空所有数据状态');
  };

  const resetCharts = (): void => {
    isFirstHandE = true;
    isFirstCirE = true;

    try {
      if (chartJiCir.getInstance()) {
        chartJiCir.getInstance().clear();
        console.log('📈 已清空机车图表');
      }
      if (chartHand.getInstance()) {
        chartHand.getInstance().clear();
        console.log('📊 已清空手持终端图表');
      }
    } catch (error) {
      console.error('重置图表失败:', error);
    }
  };

  const triggerGarbageCollection = (): void => {
    if (window.gc) {
      try {
        window.gc();
        console.log('🧹 已触发垃圾回收');
      } catch (error) {
        console.error('触发垃圾回收失败:', error);
      }
    }
  };

  const calculateMemoryReduction = (): void => {
    if (memoryStats.value.beforeReset && memoryStats.value.afterReset) {
      const reduction = memoryStats.value.beforeReset.used - memoryStats.value.afterReset.used;
      memoryStats.value.reduction = Math.round(reduction * 100) / 100;
      console.log(`🎉 内存释放: ${memoryStats.value.reduction} MB`);
    }
  };

  const initializePage = async (): Promise<void> => {
    try {
      await nextTick();
      await Promise.all([
        getServiceInfo(),
        getDeviceCount(),
        getDeviceLocationCount(),
        getMapLocation(),
      ]);
      console.log('✅ 页面重新初始化完成');
    } catch (error) {
      console.error('❌ 页面初始化失败:', error);
      throw error;
    }
  };

  // 资源清理函数
  const cleanup = (): void => {
    console.log('🧹 开始清理资源...');

    // 停止重置计时器
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
      console.log('⏹️  已停止重置定时器');
    }

    // 清理地图资源
    cleanupMapResources();

    // 清理标记
    cleanupMarkers();

    // 重置状态
    resetInternalStates();

    console.log('✅ 资源清理完成');
  };

  const cleanupMapResources = (): void => {
    if (map) {
      // 移除所有图层
      if (trainLayerGroup) {
        map.removeLayer(trainLayerGroup);
        trainLayerGroup = null;
        console.log('🗑️  已移除火车图层');
      }
      if (personClusterGroup) {
        map.removeLayer(personClusterGroup);
        personClusterGroup = null;
        console.log('🗑️  已移除人员聚合图层');
      }

      // 移除地图
      map.remove();
      map = null;
      console.log('🗑️  已移除地图实例');
    }
  };

  const cleanupMarkers = (): void => {
    const trainMarkerCount = trainMarkers.size;
    const personMarkerCount = personMarkers.size;
    const stationMarkerCount = Object.keys(stationNameMarkers).length;

    trainMarkers.clear();
    personMarkers.clear();
    Object.keys(stationNameMarkers).forEach((key) => {
      delete stationNameMarkers[key];
    });

    console.log(
      `🗑️  已清理标记: 火车 ${trainMarkerCount}个, 人员 ${personMarkerCount}个, 车站 ${stationMarkerCount}个`,
    );
  };

  const resetInternalStates = (): void => {
    isMapInitialized = false;
    pendingPersonData = [];
    pendingTrainData = [];
    isUpdatingTrains = false;
    isUpdatingPersons = false;
    personUpdateQueue = [];
    trainUpdateQueue = [];
    currentPopup = null;
  };

  // 地图相关函数
  /**
   * 检查坐标是否为(0,0)
   * @param coord 坐标数组
   * @returns 是否为(0,0)坐标
   */
  const isZeroCoordinate = (coord: [number, number]): boolean => {
    return coord[0] === 0 && coord[1] === 0;
  };

  /**
   * 验证坐标是否有效
   * @param coord 坐标数组
   * @returns 坐标是否有效
   */
  const isValidCoordinate = (coord: [number, number]): boolean => {
    return (
      !isNaN(coord[0]) && !isNaN(coord[1]) && Math.abs(coord[0]) < 90 && Math.abs(coord[1]) < 180
    );
  };

  /**
   * 创建火车图标
   * @param isOnline 是否在线
   * @param isZeroCoord 是否为(0,0)坐标
   * @returns Leaflet DivIcon
   */
  const createTrainIcon = (isOnline: boolean, isZeroCoord: boolean = false): L.DivIcon => {
    const className = `custom-train-marker ${isOnline ? 'online' : 'offline'} ${isZeroCoord ? 'zero-coord' : ''}`;
    return L.divIcon({
      html: `<div class="${className}"></div>`,
      className: 'custom-train-marker-container',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  /**
   * 创建人员图标
   * @param isOnline 是否在线
   * @param isZeroCoord 是否为(0,0)坐标
   * @returns Leaflet DivIcon
   */
  const createPersonIcon = (isOnline: boolean, isZeroCoord: boolean = false): L.DivIcon => {
    const className = `custom-person-marker ${isOnline ? 'online' : 'offline'} ${isZeroCoord ? 'zero-coord' : ''}`;
    return L.divIcon({
      html: `<div class="${className}"></div>`,
      className: 'custom-person-marker-container',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  /**
   * 创建车站名称标签
   * @param name 车站名称
   * @returns Leaflet DivIcon
   */
  const createStationNameLabel = (name: string): L.DivIcon => {
    const nameDom = document.createElement('div');
    nameDom.className = 'station-name-wrapper';
    const nameContent = document.createElement('div');
    nameContent.className = 'station-name-content';
    nameContent.textContent = name;
    nameContent.style.color = '#FC09EF';
    nameDom.appendChild(nameContent);

    return L.divIcon({
      html: nameDom,
      className: 'station-name-icon',
      iconSize: [120, 24],
      iconAnchor: [-10, 12],
    });
  };

  /**
   * 绘制线路
   * 在地图上绘制所有线路，包括白色背景线和彩色虚线
   */
  const drawLines = (): void => {
    try {
      lines.value.forEach((line) => {
        if (line.coordinates.length > 0) {
          // 绘制白色背景线
          L.polyline(line.coordinates, {
            color: '#ffffff',
            weight: 8,
            opacity: 1,
            lineCap: 'square',
          }).addTo(map!);

          // 绘制彩色虚线线路
          L.polyline(line.coordinates, {
            color: line.color,
            weight: 8,
            opacity: 1,
            dashArray: '35, 35',
            lineCap: 'square',
          }).addTo(map!);
        }
      });
    } catch (error) {
      console.error('绘制线路失败:', error);
    }
  };

  /**
   * 添加车站标记
   * 在地图上添加车站的圆形标记和名称标签
   */
  const addStations = (): void => {
    try {
      lines.value.forEach((line) => {
        line.stations.forEach((station) => {
          if (station.coordinate.length === 2 && isValidCoordinate(station.coordinate)) {
            // 创建车站圆形标记
            const circleMarker = L.circleMarker(station.coordinate, {
              radius: 4,
              fillColor: '#FC09EF',
              color: '#FC09EF',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            }).addTo(map!);

            // 创建车站名称标签
            const nameMarker = L.marker(station.coordinate, {
              icon: createStationNameLabel(station.name),
              zIndexOffset: 60,
              opacity: 0,
              interactive: true,
            }).addTo(map!);

            station.circleMarker = circleMarker;
            station.nameMarker = nameMarker;
            stationNameMarkers[station.id] = nameMarker;
          }
        });
      });
    } catch (error) {
      console.error('添加车站失败:', error);
    }
  };

  /**
   * 初始化图层组
   * 创建人员聚合图层和火车图层组
   */
  const initLayerGroups = (): void => {
    try {
      // 创建人员标记聚合组
      personClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 100,
        maxClusterRadius: 80,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function (cluster) {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="cluster-marker">${count}</div>`,
            className: 'marker-cluster-custom',
            iconSize: L.point(40, 40),
          });
        },
      });

      // 创建火车图层组
      trainLayerGroup = L.layerGroup();

      // 根据显示状态添加图层到地图
      if (showPersons.value) {
        map!.addLayer(personClusterGroup);
      }
      if (showTrains.value) {
        map!.addLayer(trainLayerGroup);
      }
    } catch (error) {
      console.error('初始化图层组失败:', error);
    }
  };

  /**
   * 添加火车到图层组
   * @param train 火车数据
   */
  const addTrainToLayerGroup = (train: Train): void => {
    try {
      if (trainMarkers.has(train.id) || !trainLayerGroup) {
        return;
      }

      const isZeroCoord = isZeroCoordinate(train.coordinate);
      const marker = L.marker(train.coordinate, {
        icon: createTrainIcon(train.isOnline, isZeroCoord),
        zIndexOffset: 60,
      });

      // 添加点击事件
      marker.on('click', () => {
        openPopup(
          train.coordinate,
          `
          <div class="popup-content">
            <div class='title fontColor'>${t('view._cabRadio')}</div>
            <div class='content'>
              <div class='info'>
                <div>ISDN:</div>
                <div>${train.isdn}</div>
              </div>
              <div class='info'>
                <div>${t('view._kilometerMarker')}:</div>
                <div>${train.glb}</div>
              </div>
              <div class='info'>
                <div>${t('view.locationStation')}:</div>
                <div>${train.station}</div>
              </div>
              <div class='info'>
                <div>${t('view.affiliatedRegion')}:</div>
                <div>${train.area}</div>
              </div>
            </div>
          </div>
          `,
        );
      });

      trainLayerGroup.addLayer(marker);
      train.marker = marker;
      train.lastValidCoordinate = [...train.coordinate] as [number, number];
      train.hasValidCoordinate = !isZeroCoord;
      trainMarkers.set(train.id, marker);
    } catch (error) {
      console.error(`添加火车标记失败 (ID: ${train.id}):`, error);
    }
  };

  /**
   * 添加人员到聚合组
   * @param person 人员数据
   */
  const addPersonToClusterGroup = (person: Person): void => {
    try {
      if (personMarkers.has(person.id) || !personClusterGroup) {
        return;
      }

      const isZeroCoord = isZeroCoordinate(person.coordinate);
      const marker = L.marker(person.coordinate, {
        icon: createPersonIcon(person.isOnline, isZeroCoord),
        zIndexOffset: 50,
      });

      // 添加点击事件
      marker.on('click', () => {
        openPopup(
          person.coordinate,
          `
          <div class="popup-content">
            <div class='title fontColor'>${t('view.handheldRadio')}</div>
            <div class='content'>
              <div class='info'>
                <div  class='min'>ISDN:</div>
                <div>${person.isdn}</div>
              </div>
              <div class='info'>
                <div  class='min'>${t('view.locationStation')}:</div>
                <div>${person.station}</div>
              </div>
              <div class='info'>
                <div  class='min'>${t('view.affiliatedRegion')}:</div>
                <div>${person.area}</div>
              </div>
            </div>
          </div>
          `,
        );
      });

      personClusterGroup.addLayer(marker);
      person.marker = marker;
      person.lastValidCoordinate = [...person.coordinate] as [number, number];
      person.hasValidCoordinate = !isZeroCoord;
      personMarkers.set(person.id, marker);
    } catch (error) {
      console.error(`添加人员标记失败 (ID: ${person.id}):`, error);
    }
  };

  /**
   * 更新火车图标状态
   * @param train 火车数据
   */
  const updateTrainIcon = (train: Train): void => {
    try {
      if (train.marker) {
        const isZeroCoord = isZeroCoordinate(train.coordinate);
        const newIcon = createTrainIcon(train.isOnline, isZeroCoord);
        train.marker.setIcon(newIcon);
      }
    } catch (error) {
      console.error(`更新火车图标失败 (ID: ${train.id}):`, error);
    }
  };

  /**
   * 更新人员图标状态
   * @param person 人员数据
   */
  const updatePersonIcon = (person: Person): void => {
    try {
      if (person.marker) {
        const isZeroCoord = isZeroCoordinate(person.coordinate);
        const newIcon = createPersonIcon(person.isOnline, isZeroCoord);
        person.marker.setIcon(newIcon);
      }
    } catch (error) {
      console.error(`更新人员图标失败 (ID: ${person.id}):`, error);
    }
  };

  /**
   * 平滑移动标记到新位置
   * @param marker Leaflet标记
   * @param newLatLng 新位置
   * @param duration 移动持续时间
   * @returns Promise
   */
  const smoothMoveTo = (
    marker: L.Marker,
    newLatLng: L.LatLng,
    duration: number = 3000,
  ): Promise<void> => {
    return new Promise<void>((resolve) => {
      try {
        (marker as any).slideTo(newLatLng, {
          duration: duration,
          keepAtCenter: false,
        });

        setTimeout(() => {
          resolve();
        }, duration);
      } catch (error) {
        console.error('平滑移动标记失败:', error);
        resolve();
      }
    });
  };

  const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    }) as T;
  };

  /**
   * 处理待处理数据
   * 在地图初始化后处理之前积累的火车和人员数据
   */
  const processPendingData = (): void => {
    if (!isMapInitialized) return;

    if (pendingTrainData.length > 0) {
      updateTrainPositions(pendingTrainData);
      pendingTrainData = [];
    }

    if (pendingPersonData.length > 0) {
      updatePersonPositions(pendingPersonData);
      pendingPersonData = [];
    }
  };

  /**
   * 更新火车位置
   * 批量更新火车标记的位置和状态，处理平滑移动
   * @param newTrainData 新的火车数据
   */
  const updateTrainPositions = async (newTrainData: Train[]): Promise<void> => {
    if (resetInProgress.value) return;
    if (!isMapInitialized) {
      pendingTrainData = [...newTrainData];
      return;
    }

    if (isUpdatingTrains) {
      trainUpdateQueue = [...newTrainData];
      return;
    }

    const now = Date.now();
    if (now - lastTrainUpdateTime < UPDATE_INTERVAL) {
      return;
    }
    lastTrainUpdateTime = now;

    isUpdatingTrains = true;

    try {
      const currentTrainIds = new Set(newTrainData.map((train) => train.id));

      // 移除不存在的火车
      const trainsToRemove: Array<{ id: string; marker: L.Marker }> = [];
      for (const [id, marker] of trainMarkers.entries()) {
        if (!currentTrainIds.has(id)) {
          trainsToRemove.push({ id, marker });
        }
      }

      if (trainsToRemove.length > 0 && trainLayerGroup) {
        trainsToRemove.forEach((item) => {
          trainLayerGroup!.removeLayer(item.marker);
          trainMarkers.delete(item.id);
          const index = trains.value.findIndex((t) => t.id === item.id);
          if (index !== -1) {
            trains.value.splice(index, 1);
          }
        });
      }

      const updatePromises: Promise<void>[] = [];

      for (const train of newTrainData) {
        if (!isValidCoordinate(train.coordinate) || resetInProgress.value) {
          continue;
        }

        if (trainMarkers.has(train.id)) {
          const marker = trainMarkers.get(train.id)!;
          const existingTrain = trains.value.find((t) => t.id === train.id);

          if (existingTrain) {
            const newLatLng = L.latLng(train.coordinate[0], train.coordinate[1]);
            const currentLatLng = marker.getLatLng();

            const isFromZero =
              existingTrain.lastValidCoordinate &&
              isZeroCoordinate(existingTrain.lastValidCoordinate) &&
              !isZeroCoordinate(train.coordinate);

            const isToZero =
              existingTrain.lastValidCoordinate &&
              !isZeroCoordinate(existingTrain.lastValidCoordinate) &&
              isZeroCoordinate(train.coordinate);

            if (isZeroCoordinate(train.coordinate) !== isZeroCoordinate(existingTrain.coordinate)) {
              updateTrainIcon(existingTrain);
            }

            if (isFromZero || isToZero) {
              marker.setLatLng(newLatLng);
              existingTrain.coordinate = [newLatLng.lat, newLatLng.lng];
              existingTrain.station = train.station;
              existingTrain.area = train.area;
              existingTrain.isOnline = train.isOnline;
              existingTrain.lastValidCoordinate = [...train.coordinate] as [number, number];
              existingTrain.hasValidCoordinate = !isZeroCoordinate(train.coordinate);
              continue;
            }

            const distance = newLatLng.distanceTo(currentLatLng);

            if (distance > 100 && !isZeroCoordinate(train.coordinate) && !existingTrain.moving) {
              existingTrain.moving = true;

              updatePromises.push(
                smoothMoveTo(marker, newLatLng, 3000)
                  .then(() => {
                    if (resetInProgress.value) return;
                    existingTrain.coordinate = [newLatLng.lat, newLatLng.lng];
                    existingTrain.station = train.station;
                    existingTrain.area = train.area;
                    existingTrain.isOnline = train.isOnline;
                    existingTrain.lastValidCoordinate = [...train.coordinate] as [number, number];
                    existingTrain.hasValidCoordinate = true;
                    existingTrain.moving = false;
                  })
                  .catch((error) => {
                    console.error('移动火车时出错:', error);
                    existingTrain.moving = false;
                  }),
              );
            } else if (!existingTrain.moving) {
              marker.setLatLng(newLatLng);
              existingTrain.coordinate = [newLatLng.lat, newLatLng.lng];
              existingTrain.station = train.station;
              existingTrain.area = train.area;
              existingTrain.isOnline = train.isOnline;
              existingTrain.lastValidCoordinate = [...train.coordinate] as [number, number];
              existingTrain.hasValidCoordinate = !isZeroCoordinate(train.coordinate);
            }
          }
        } else {
          addTrainToLayerGroup(train);
          trains.value.push(train);
        }
      }

      const batchSize = 10;
      for (let i = 0; i < updatePromises.length; i += batchSize) {
        const batch = updatePromises.slice(i, i + batchSize);
        await Promise.all(batch);
      }
    } catch (error) {
      console.error('更新火车位置时发生错误:', error);
    } finally {
      isUpdatingTrains = false;
      if (trainUpdateQueue.length > 0 && !resetInProgress.value) {
        const nextData = [...trainUpdateQueue];
        trainUpdateQueue = [];
        setTimeout(() => updateTrainPositions(nextData), 100);
      }
    }
  };

  /**
   * 更新人员位置
   * 批量更新人员标记的位置和状态
   * @param newPersonData 新的人员数据
   */
  const updatePersonPositions = async (newPersonData: Person[]): Promise<void> => {
    if (resetInProgress.value) return;
    if (!isMapInitialized) {
      pendingPersonData = [...newPersonData];
      return;
    }

    if (isUpdatingPersons) {
      personUpdateQueue = [...newPersonData];
      return;
    }

    const now = Date.now();
    if (now - lastPersonUpdateTime < UPDATE_INTERVAL) {
      return;
    }

    isUpdatingPersons = true;

    try {
      const currentPersonIds = new Set(newPersonData.map((person) => person.id));

      const personsToRemove: Array<{ id: string; marker: L.Marker }> = [];
      for (const [id, marker] of personMarkers.entries()) {
        if (!currentPersonIds.has(id)) {
          personsToRemove.push({ id, marker });
        }
      }

      if (personsToRemove.length > 0 && personClusterGroup) {
        personsToRemove.forEach((item) => {
          personClusterGroup!.removeLayer(item.marker);
          personMarkers.delete(item.id);
          const index = persons.value.findIndex((p) => p.id === item.id);
          if (index !== -1) {
            persons.value.splice(index, 1);
          }
        });
      }

      for (const person of newPersonData) {
        if (!isValidCoordinate(person.coordinate) || resetInProgress.value) {
          continue;
        }

        if (personMarkers.has(person.id)) {
          const marker = personMarkers.get(person.id)!;
          const existingPerson = persons.value.find((p) => p.id === person.id);

          if (existingPerson) {
            const newLatLng = L.latLng(person.coordinate[0], person.coordinate[1]);

            const isFromZero =
              existingPerson.lastValidCoordinate &&
              isZeroCoordinate(existingPerson.lastValidCoordinate) &&
              !isZeroCoordinate(person.coordinate);

            const isToZero =
              existingPerson.lastValidCoordinate &&
              !isZeroCoordinate(existingPerson.lastValidCoordinate) &&
              isZeroCoordinate(person.coordinate);

            if (
              isZeroCoordinate(person.coordinate) !== isZeroCoordinate(existingPerson.coordinate)
            ) {
              updatePersonIcon(existingPerson);
            }

            marker.setLatLng(newLatLng);
            existingPerson.coordinate = [newLatLng.lat, newLatLng.lng];
            existingPerson.station = person.station;
            existingPerson.area = person.area;
            existingPerson.isOnline = person.isOnline;
            existingPerson.lastValidCoordinate = [...person.coordinate] as [number, number];
            existingPerson.hasValidCoordinate = !isZeroCoordinate(person.coordinate);
          }
        } else {
          addPersonToClusterGroup(person);
          persons.value.push(person);
        }
      }

      if (personClusterGroup && !resetInProgress.value) {
        personClusterGroup.refreshClusters();
      }
    } catch (error) {
      console.error('更新人员位置时发生错误:', error);
    } finally {
      isUpdatingPersons = false;

      if (personUpdateQueue.length > 0 && !resetInProgress.value) {
        const nextData = [...personUpdateQueue];
        personUpdateQueue = [];
        setTimeout(() => updatePersonPositions(nextData), 100);
      }
    }
  };

  /**
   * 绑定地图事件
   * 设置地图的缩放、旋转等交互事件
   */
  const bindMapEvents = (): void => {
    if (!map) return;

    try {
      map.on('zoomend', () => {
        const currentZoom = map!.getZoom();
        updateAllMarkersVisibility(currentZoom);
      });

      map.on('zoomstart', (e) => {
        if (e.originalEvent) map!.setZoomAround(map!.mouseEventToLatLng(e.originalEvent));
      });

      if (mapContainer.value) {
        mapContainer.value.addEventListener('mousedown', (e) => {
          if (e.button === 2) {
            isRotating = true;
            lastMouseX = e.clientX;
            map!.dragging.disable();
          }
        });

        mapContainer.value.addEventListener('contextmenu', (e) => e.preventDefault());
      }

      document.addEventListener('mousemove', (e) => {
        if (isRotating) map!.setBearing(map!.getBearing() + (e.clientX - lastMouseX) * 0.5);
        lastMouseX = e.clientX;
      });

      document.addEventListener('mouseup', (e) => {
        if (e.button === 2) {
          isRotating = false;
          map!.dragging.enable();
        }
      });
    } catch (error) {
      console.error('绑定地图事件失败:', error);
    }
  };

  /**
   * 更新所有标记的可见性
   * 根据缩放级别控制车站名称的显示
   * @param zoomLevel 当前缩放级别
   */
  const updateAllMarkersVisibility = (zoomLevel: number): void => {
    const showStationName = zoomLevel >= 7;
    Object.values(stationNameMarkers).forEach((marker) => {
      marker.setOpacity(showStationName ? 1 : 0);
    });
  };

  /**
   * 打开信息弹窗
   * @param coordinate 坐标位置
   * @param content 弹窗内容
   */
  const openPopup = (coordinate: [number, number], content: string): void => {
    if (!map) return;

    try {
      if (currentPopup && map.hasLayer(currentPopup)) {
        map.removeLayer(currentPopup);
      }
      currentPopup = L.popup({
        autoClose: false,
        closeButton: true,
        className: 'custom-popup',
        maxWidth: 300,
      })
        .setLatLng(coordinate)
        .setContent(content)
        .openOn(map);
    } catch (error) {
      console.error('打开弹窗失败:', error);
    }
  };

  const handleSearch = debounce((): void => {
    if (!searchQuery.value.trim() || resetInProgress.value || !map) return;

    const query = searchQuery.value.trim().toLowerCase();
    let found = false;

    if (currentPopup) {
      map.removeLayer(currentPopup);
    }

    // 搜索火车
    for (const train of trains.value) {
      if (train.isdn.toLowerCase().includes(query) && !found) {
        map.flyTo(train.coordinate, 10, { duration: 1 });
        openPopup(
          train.coordinate,
          `
          <div class="popup-content">
            <div class='title fontColor'>${t('view._cabRadio')}</div>
            <div class='content'>
              <div class='info'>
                <div>ISDN:</div>
                <div>${train.isdn}</div>
              </div>
              <div class='info'>
                <div>${t('view.kilometerMarker')}:</div>
                <div>${train.glb}</div>
              </div>
              <div class='info'>
                <div>${t('view.locationStation')}:</div>
                <div>${train.station}</div>
              </div>
              <div class='info'>
                <div>${t('view.affiliatedRegion')}:</div>
                <div>${train.area}</div>
              </div>
            </div>
          </div>
          `,
        );
        found = true;
        break;
      }
    }

    if (found) return;

    // 搜索人员
    for (const person of persons.value) {
      if (person.isdn.toLowerCase().includes(query) && !found) {
        map.flyTo(person.coordinate, 10, { duration: 1 });
        openPopup(
          person.coordinate,
          `
          <div class="popup-content">
            <div class='title fontColor'>${t('view.GPH')}</div>
            <div class='content'>
              <div class='info'>
                <div  class='min'>ISDN:</div>
                <div>${person.isdn}</div>
              </div>
              <div class='info'>
                <div  class='min'>${t('view.locationStation')}:</div>
                <div>${person.station}</div>
              </div>
              <div class='info'>
                <div  class='min'>${t('view.affiliatedRegion')}:</div>
                <div>${person.area}</div>
              </div>
            </div>
          </div>
          `,
        );
        found = true;
        break;
      }
    }

    if (!found) {
      message.info(`${t('view.queryResultIsEmpty')}`);
    }
  }, DEBOUNCE_DELAY);

  const toggleTrainsVisibility = (): void => {
    showTrains.value = !showTrains.value;
    if (trainLayerGroup && map) {
      if (showTrains.value) {
        map.addLayer(trainLayerGroup);
      } else {
        map.removeLayer(trainLayerGroup);
      }
    }
  };

  const togglePersonsVisibility = (): void => {
    showPersons.value = !showPersons.value;
    if (personClusterGroup && map) {
      if (showPersons.value) {
        map.addLayer(personClusterGroup);
      } else {
        map.removeLayer(personClusterGroup);
      }
    }
  };

  const resetMap = (): void => {
    if (!map) return;

    if (currentPopup) {
      map.removeLayer(currentPopup);
      currentPopup = null;
    }

    updateAllMarkersVisibility(initialMapState.zoom);

    map.flyTo(initialMapState.center, initialMapState.zoom, { duration: 1, easeLinearity: 0.3 });
    map.setBearing(initialMapState.bearing);
    searchQuery.value = '';
  };

  // 图表函数
  const setCirChart = (
    xAxisData: string[],
    leftData: number[],
    centerData: number[],
    rightData: number[],
  ): void => {
    if (resetInProgress.value) return;

    try {
      const option = {
        backgroundColor: 'transparent',
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '1%',
          top: '20%',
          containLabel: true,
        },
        legend: {
          data: legendDatas,
          right: 10,
          top: 0,
          textStyle: {
            color: '#fff',
          },
          itemWidth: 12,
          itemHeight: 10,
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            color: '#fff',
            fontStyle: 'normal',
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(77, 128, 254, 0.2)',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
            lineStyle: {
              color: 'white',
            },
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: '#1B2848',
            },
          },
          axisLabel: {},
        },
        dataZoom: [
          {
            type: 'inside',
            show: true,
            height: 15,
            start: 1,
            end: 10,
          },
        ],
        series: [
          {
            name: legendDatas[0],
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              color: new chartJiCir.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#12F7D0',
                },
                {
                  offset: 1,
                  color: '#65CFBD',
                },
              ]),
              borderRadius: 12,
            },
            data: leftData,
          },
          {
            name: legendDatas[1],
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              color: new chartJiCir.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#D94CE6',
                },
                {
                  offset: 1,
                  color: '#DE08FC',
                },
              ]),
              borderRadius: 11,
            },
            data: centerData,
          },
          {
            name: legendDatas[2],
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              color: new chartJiCir.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#3EC2EA',
                },
                {
                  offset: 1,
                  color: '#248ff7',
                },
              ]),
              borderRadius: 11,
            },
            data: rightData,
          },
        ],
      };

      chartJiCir.getInstance().setOption(isFirstCirE ? option : { series: option.series }, {
        notMerge: false,
        lazyUpdate: true,
      });
      isFirstCirE = false;
    } catch (error) {
      console.error('设置机车图表失败:', error);
    }
  };

  const setHandChart = (
    xAxisData: string[],
    leftData: number[],
    centerData: number[],
    rightData: number[],
  ): void => {
    if (resetInProgress.value) return;

    try {
      const option = {
        backgroundColor: 'transparent',
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '1%',
          top: '20%',
          containLabel: true,
        },
        legend: {
          data: legendDatas,
          right: 10,
          top: 0,
          textStyle: {
            color: '#fff',
          },
          itemWidth: 12,
          itemHeight: 10,
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            color: '#fff',
            fontStyle: 'normal',
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(77, 128, 254, 0.2)',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
            lineStyle: {
              color: 'white',
            },
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: '#1B2848',
            },
          },
          axisLabel: {},
        },
        dataZoom: [
          {
            type: 'inside',
            show: true,
            height: 15,
            start: 1,
            end: 10,
          },
        ],
        series: [
          {
            name: legendDatas[0],
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              color: new chartHand.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#12F7D0',
                },
                {
                  offset: 1,
                  color: '#65CFBD',
                },
              ]),
              borderRadius: 12,
            },
            data: leftData,
          },
          {
            name: legendDatas[1],
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              color: new chartHand.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#D94CE6',
                },
                {
                  offset: 1,
                  color: '#DE08FC',
                },
              ]),
              borderRadius: 11,
            },
            data: centerData,
          },
          {
            name: legendDatas[2],
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              color: new chartHand.echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#3EC2EA',
                },
                {
                  offset: 1,
                  color: '#248ff7',
                },
              ]),
              borderRadius: 11,
            },
            data: rightData,
          },
        ],
      };

      chartHand.getInstance().setOption(isFirstHandE ? option : { series: option.series }, {
        notMerge: false,
        lazyUpdate: true,
      });
      isFirstHandE = false;
    } catch (error) {
      console.error('设置手持终端图表失败:', error);
    }
  };

  const getDeviceCount = (): void => {
    if (resetInProgress.value) return;
    largeScreenApi
      .GetDeviceCount()
      .then((data) => {
        deviceCount.value = data;
        setTimeout(() => {
          getDeviceCount();
        }, 10 * 1000);
      })
      .catch((error) => {
        console.error('获取设备数量失败:', error);
        setTimeout(() => {
          getDeviceCount();
        }, 10 * 1000);
      });
  };

  const getDeviceLocationCount = (): void => {
    if (resetInProgress.value) return;

    largeScreenApi
      .GetDeviceLocationCount()
      .then((data) => {
        setHandChart(
          data.hand.stationName,
          data.hand.leftCount,
          data.hand.centerCount,
          data.hand.rightCount,
        );
        setCirChart(
          data.cir.stationName,
          data.cir.leftCount,
          data.cir.centerCount,
          data.cir.rightCount,
        );
        setTimeout(() => {
          getDeviceLocationCount();
        }, 11 * 1000);
      })
      .catch((error) => {
        console.error('获取设备位置数量失败:', error);
        setTimeout(() => {
          getDeviceLocationCount();
        }, 11 * 1000);
      });
  };

  const getMapLocation = (): void => {
    if (resetInProgress.value) return;

    largeScreenApi
      .GetMapLocation()
      .then((data) => {
        lines.value = data;
        initMap();
        setTimeout(() => {
          getCirHandLocation();
        }, 500);
      })
      .catch((error) => {
        console.error('获取地图位置失败:', error);
      });
  };

  const getCirHandLocation = (): void => {
    if (resetInProgress.value) return;

    largeScreenApi
      .GetCirHandLocation()
      .then((data) => {
        updateTrainPositions(data.cirData);
        updatePersonPositions(data.handData);
        setTimeout(() => {
          getCirHandLocation();
        }, 10 * 1000);
      })
      .catch((error) => {
        console.error('获取机车和人员位置失败:', error);
        setTimeout(() => {
          getCirHandLocation();
        }, 10 * 1000);
      });
  };

  const getServiceInfo = (): void => {
    if (resetInProgress.value) return;
    largeScreenApi
      .GetServiceInfo()
      .then((data) => {
        const datas = data.map((m) => ({
          id: m.id,
          name: m.name,
          color: m.color,
          alarmType: m.alarmType,
        }));
        alarmList.value = [...datas];
        nextTick(() => {
          setTimeout(() => {
            getCirHandLocation();
          }, 12 * 1000);
        });
      })
      .catch((error) => {
        console.error('getServiceInfo失败:', error);
        nextTick(() => {
          setTimeout(() => {
            getCirHandLocation();
          }, 12 * 1000);
        });
      });
  };

  const goIndex = (item: ScrollItem): void => {
    window.open(`${window.location.origin}/#/message/index/${item.id}`, '_blank');
  };

  /**
   * 初始化地图
   * 创建Leaflet地图实例，设置初始视图和图层
   */
  const initMap = (): void => {
    if (!mapContainer.value) {
      console.error('地图容器未找到');
      return;
    }

    try {
      if (map) {
        map.remove();
        map = null;
      }

      map = L.map(mapContainer.value, {
        crs: L.CRS.Simple,
        attributionControl: false,
        zoomControl: false,
        minZoom: 4,
        maxZoom: 30,
        zoomSnap: 0.5,
        dragging: true,
        tap: false,
        rotate: true,
        bearing: initialMapState.bearing,
      });

      map.setView(initialMapState.center, initialMapState.zoom);
      map.getContainer().style.backgroundColor = 'transparent';

      initLayerGroups();
      drawLines();
      addStations();

      setTimeout(() => {
        map!.flyTo(initialMapState.center, initialMapState.zoom, {
          duration: 2,
          easeLinearity: 0.2,
        });
      }, 200);

      bindMapEvents();
      updateAllMarkersVisibility(map.getZoom());

      isMapInitialized = true;

      nextTick(() => {
        processPendingData();
      });
    } catch (error) {
      console.error('初始化地图失败:', error);
    }
  };

  // 生命周期
  onMounted(() => {
    console.log('🚀 大屏页面初始化开始');
    logMemoryStats('页面初始化');
    // 启动重置计时器
    startResetTimer();

    // 初始化数据
    getServiceInfo();
    getDeviceCount();
    getDeviceLocationCount();
    getMapLocation();
  });

  onUnmounted(() => {
    console.log('🔚 大屏页面卸载，开始清理资源');
    logMemoryStats('页面卸载前');
    cleanup();
    console.log('✅ 大屏页面资源清理完成');
  });

  // 监听器
  watch(searchQuery, (newVal) => {
    if (!newVal.trim() && currentPopup && map) {
      map.removeLayer(currentPopup);
      currentPopup = null;
      updateAllMarkersVisibility(map.getZoom());
    }
  });
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-largeScreen-';

  .@{prefixCls} {
    width: 100%;
    height: 100%;
    overflow: scroll !important;
    background-image: url('@/assets/images/largeScreen/bj1.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .fontColor {
    color: #08d4fc;
  }

  .content {
    position: relative;
    width: 100%;
    min-width: 1140px !important;
    height: 100%;
    min-height: 610px !important;

    @media (max-width: 1999px) {
      .head {
        position: absolute;
        width: 100%;
        height: 150px;
        background-image: url('@/assets/images/largeScreen/top.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        color: #fff;
        font-size: 24px;
        line-height: 46px;
        text-align: center;
      }

      .wgdata {
        position: absolute;
        top: 40px;
        left: 4px;
        width: 384px;
        min-width: 310px;
        height: 168px;
        min-height: 136px;
        background-image: url('/src/assets/images/largeScreen/xbj7.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        .title {
          position: relative;
          top: 2%;
          left: 5%;
          font-size: 18px;
        }

        .data {
          display: flex;
          flex-direction: row;
          width: 92%;
          height: calc(100% - 32px);
          margin-top: 3%;
          margin-left: 4%;
          gap: 10px;

          > div {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 33%;
            height: 78%;
            background-image: url('/src/assets/images/largeScreen/xbj3.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;

            > div {
              width: 90%;
              height: 30%;
              text-align: center;

              > div.number {
                color: #fff;
              }

              > div.label {
                margin-top: 6px;
                font-size: 9px;
              }
            }
          }
        }
      }

      .jccir,
      .hand {
        position: absolute;
        bottom: 4px;
        width: 386px;
        height: 250px;
        background-image: url('/src/assets/images/largeScreen/xbj_12.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        .title {
          position: relative;
          top: 2%;
          left: 7%;
          width: 63%;
          font-size: 18px;
        }

        .data {
          width: 85%;
          height: 75%;
          margin-top: 6%;
          margin-left: 7%;
        }
      }

      .hand {
        left: 4px;
      }

      .jccir {
        right: 4px;
        background-image: url('/src/assets/images/largeScreen/xbj_1_1.png');

        .title {
          position: absolute;
          right: 6%;
          left: auto;
          width: 63%;
          text-align: right;
        }

        .data {
          margin-top: 11%;
        }
      }

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
      .head {
        position: relative;
        width: 100%;
        height: 150px;
        background-image: url('@/assets/images/largeScreen/top.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        color: #fff;
        font-size: 24px;
        line-height: 46px;
        text-align: center;
      }

      .wgdata {
        position: absolute;
        top: 40px;
        left: 4px;
        width: 494px;
        min-width: 310px;
        height: 217px;
        min-height: 136px;
        background-image: url('/src/assets/images/largeScreen/xbj7.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        .title {
          position: relative;
          top: 2%;
          left: 5%;
          font-size: 18px;
        }

        .data {
          display: flex;
          flex-direction: row;
          width: 92%;
          height: calc(100% - 32px);
          margin-top: 3%;
          margin-left: 4%;
          gap: 10px;

          > div {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 33%;
            height: 78%;
            background-image: url('/src/assets/images/largeScreen/xbj3.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;

            > div {
              width: 90%;
              height: 30%;
              text-align: center;

              > div.number {
                color: #fff;
              }

              > div.label {
                margin-top: 6px;
                font-size: 9px;
              }
            }
          }
        }
      }

      .jccir,
      .hand {
        position: absolute;
        bottom: 4px;
        width: 482px;
        min-width: 386px;
        height: 312px;
        min-height: 250px;
        background-image: url('/src/assets/images/largeScreen/xbj_12.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        .title {
          position: relative;
          top: 2%;
          left: 6%;
          width: 63%;
          font-size: 18px;
        }

        .data {
          width: 85%;
          height: 75%;
          margin-top: 6%;
          margin-left: 7%;
        }
      }

      .hand {
        left: 4px;
      }

      .jccir {
        right: 4px;
      }

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
  }

  /* 地图 */
  .map-container {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* 控制区样式 */
  .control-container {
    position: absolute;
    z-index: 1000;
    bottom: 4px;
    left: 50%;
    flex-direction: column;
    width: 280px;
    transform: translateX(-50%);
    gap: 10px;
  }

  .search-box {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .search-input {
    flex: 1;
    padding: 8px 12px;
    transition: all 0.3s;
    border: 1px solid #ac33c1;
    border-radius: 4px;
    background: transparent;
    color: #fff;
    font-size: 14px;
  }

  .search-input:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 2px rgb(52 152 219 / 20%);
  }

  /* 新增：显示/隐藏控制按钮样式 */
  .toggle-controls {
    display: flex;
    gap: 2px;
    width: 100%;
    margin-top: 4px;
  }

  .toggle-btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    border: 1px solid #ac33c1;
    border-radius: 4px;
    background: transparent;
    color: #fff;
    font-size: 10px;
    cursor: pointer;
  }

  .toggle-btn:hover {
    background: rgb(172 51 193 / 20%);
  }

  .toggle-btn.active {
    background: #ac33c1;
    color: #fff;
  }

  /* 地图容器 */
  .map {
    width: 100%;
    height: 100%;
  }

  /* 站点名称样式 */
  .station-name-wrapper {
    display: inline-block;
    position: relative;
  }

  .station-name-content {
    padding: 2px 8px;
    padding-left: 12px;
    border-radius: 4px;
    background-color: rgb(0 0 0 / 80%);
    box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .station-name-content::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    border-top: 5px solid transparent;
    border-right: 6px solid rgb(0 0 0 / 80%);
    border-bottom: 5px solid transparent;
  }

  /* 弹窗样式 */
  :deep(.custom-popup) {
    padding: 5px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 3px 14px rgb(0 0 0 / 20%);
  }

  :deep(.popup-content) {
    width: 330px;
    height: 200px;
    padding: 10px 0;
    background-image: url('@/assets/images/largeScreen/maptop.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    .title {
      position: relative;
      top: -13px;
      left: 133px;
      width: 107px;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
    }

    .content {
      display: flex;
      position: relative;
      top: 17px;
      left: 9px;
      flex-direction: column;
      width: 299px;
      height: 135px;
      font-size: 20px;
      gap: 9px;

      .info {
        display: flex;
        flex-direction: row;

        > div:first-child {
          width: 226px;
          overflow: hidden;
          color: #ad11a4;
          text-align: right;
          text-emphasis: inherit;
        }

        > div.min:first-child {
          width: 140px;
        }

        > div:last-child {
          width: 100%;
          padding-left: 2px;
          overflow: hidden;
          color: #fff;
          text-align: left;
          text-emphasis: inherit;
        }
      }

      .info_ {
        display: flex;
        flex-direction: row;
        gap: 4px;
        justify-content: center;
        color: #fff;
      }
    }

    img {
      width: 30px;
      height: 30px;
    }
  }

  :deep(.leaflet-container a.leaflet-popup-close-button) {
    top: 29px;
    right: 16px;
  }

  :deep(.leaflet-popup),
  :deep(.leaflet-popup-content-wrapper) {
    background-color: #fff0 !important;
    box-shadow: none;
  }
</style>

<style lang="less">
  /* 自定义标记样式 */
  .custom-train-marker {
    width: 30px;
    height: 30px;
    background-image: url('/largeScreen/huoche2.png');
    background-repeat: no-repeat;
    background-size: contain;
    filter: drop-shadow(0 0 2px rgb(0 0 0 / 70%));
  }

  .custom-person-marker {
    width: 30px;
    height: 30px;
    background-image: url('/largeScreen/zhibanyuan1.png');
    background-repeat: no-repeat;
    background-size: contain;
    filter: drop-shadow(0 0 2px rgb(0 0 0 / 70%));
  }

  .fontColor {
    color: #08d4fc;
  }

  .fontColorSelect {
    color: #fff;
  }

  .leaflet-control-container {
    display: none !important;
  }

  /* 确保标记的层级关系 */
  .leaflet-marker-pane {
    z-index: 1;
  }

  .leaflet-marker-icon {
    z-index: 1;
  }

  /* 自定义聚合标记样式 - 统一为40px圆形 */
  .cluster-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%; /* 圆形 */
    background-color: #07a343; /* 指定的背景色 */
    color: white; /* 白色字体 */
    font-size: 14px;
    font-weight: bold;
    line-height: 30px; /* 垂直居中 */
    text-align: center;
  }

  /* 确保聚合标记的样式正确 */
  .marker-cluster-custom {
    border-radius: 20px;
    background-clip: padding-box;
  }

  .marker-cluster-custom div {
    margin-top: 5px;
    margin-left: 5px;
    border-radius: 15px;
    font:
      12px 'Helvetica Neue',
      Arial,
      Helvetica,
      sans-serif;
    text-align: center;
  }

  .marker-cluster-custom span {
    line-height: 30px;
  }
</style>
