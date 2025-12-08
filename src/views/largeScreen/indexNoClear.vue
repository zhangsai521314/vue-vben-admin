<template>
  <MyContent :class="prefixCls">
    <div class="content">
      <div class="map-container">
        <div ref="mapContainer" class="map"></div>
        <div class="control-container">
          <div class="search-box">
            <a-space direction="horizontal" size="small">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('view.integratedServicesDigitalNetworkSearch')"
                @keyup.enter="handleSearch"
                class="search-input"
              />
              <a-button
                @click="handleSearch"
                style="border: none; background-color: #ac33c1; color: #fff"
              >
                {{ t('view.query') }}</a-button
              >
            </a-space>
          </div>
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
            <!-- <div class="toggle-btn" @click="manualReset" title="手动刷新资源">
              <IconFontClass
                name="icon-baseui-zhizao"
                :style="{ fontSize: '20px', marginRight: '5px' }"
              />
              刷新资源
            </div> -->
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
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
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

  // --- 类型定义 (优化后：移除了 Marker 引用) ---
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
  }

  interface Train {
    id: string;
    isdn: string;
    station: string;
    area: string;
    isOnline: boolean;
    coordinate: [number, number];
    lineId?: string;
    moving?: boolean;
    lastValidCoordinate?: [number, number];
    hasValidCoordinate?: boolean;
    glb?: number;
    roleName: string;
  }

  interface Person {
    id: string;
    roleName: string;
    isdn: string;
    station: string;
    area: string;
    isOnline: boolean;
    coordinate: [number, number];
    moving?: boolean;
    lastValidCoordinate?: [number, number];
    hasValidCoordinate?: boolean;
  }

  defineOptions({ name: 'LargeScreenNoClear' });
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
  const deviceCount = ref({
    cirCount: 0,
    handCount: 0,
    optionCount: 0,
  });

  const alarmList = ref<ScrollItem[]>([]);
  const lines = ref<Line[]>([]);
  const trains = ref<Train[]>([]);
  const persons = ref<Person[]>([]);

  // 配置常量
  const UPDATE_INTERVAL = 5000;
  const DEBOUNCE_DELAY = 300;

  const initialMapState = {
    center: [9.2271, -10.9921] as [number, number],
    zoom: 8,
    bearing: -10,
  };

  // --- 核心修复：资源管理注册表 ---
  // 1. 定时器注册表
  const timerRegistry = new Set<NodeJS.Timeout>();

  // 2. Leaflet 对象存储 (不放入 Vue 响应式系统)
  let map: L.Map | null = null;
  let currentPopup: L.Popup | null = null;
  let trainLayerGroup: L.LayerGroup | null = null;
  let personClusterGroup: L.MarkerClusterGroup | null = null;

  // 3. 标记查找表
  const trainMarkersMap = new Map<string, L.Marker>();
  const personMarkersMap = new Map<string, L.Marker>();
  // 存储车站的 圆点 和 文字标签
  const stationMarkersMap = new Map<string, { circle: L.CircleMarker; label: L.Marker }>();

  // 状态变量
  let isRotating = false;
  let lastMouseX = 0;
  let isMapInitialized = false;
  let isFirstHandE = true;
  let isFirstCirE = true;
  let lastTrainUpdateTime = 0;
  let lastPersonUpdateTime = 0;

  // --- 辅助功能函数 ---

  /**
   * 安全的定时器，会自动注册以便销毁
   */
  const setSafeTimeout = (callback: () => void, delay: number): void => {
    if (resetInProgress.value) return;
    const id = setTimeout(() => {
      timerRegistry.delete(id);
      callback();
    }, delay);
    timerRegistry.add(id);
  };

  /**
   * 清除所有注册的定时器
   */
  const clearAllTimers = () => {
    timerRegistry.forEach((id) => clearTimeout(id));
    timerRegistry.clear();
    console.log('⏹️ 所有定时器已清除');
  };

  /**
   * 坐标验证
   */
  const isZeroCoordinate = (coord: [number, number]): boolean => {
    return coord[0] === 0 && coord[1] === 0;
  };

  const isValidCoordinate = (coord: [number, number]): boolean => {
    return (
      !isNaN(coord[0]) && !isNaN(coord[1]) && Math.abs(coord[0]) < 90 && Math.abs(coord[1]) < 180
    );
  };

  /**
   * 防抖函数
   */
  const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    }) as T;
  };

  // --- 业务逻辑函数 ---

  const manualReset = async (): Promise<void> => {
    if (resetInProgress.value) return;
    message.loading(t('view.resourceCleaning'), 0);
    resetInProgress.value = true;

    try {
      console.log('🔄 开始手动刷新...');

      // 1. 停止所有定时器
      clearAllTimers();

      // 2. 清理地图资源
      destroyMapResources();

      // 3. 清理图表
      if (chartJiCir.getInstance()) {
        chartJiCir.getInstance().clear();
      }
      if (chartHand.getInstance()) {
        chartHand.getInstance().clear();
      }
      isFirstCirE = true;
      isFirstHandE = true;

      // 4. 重置数据
      trains.value = [];
      persons.value = [];
      lines.value = [];
      alarmList.value = [];
      deviceCount.value = { cirCount: 0, handCount: 0, optionCount: 0 };

      await nextTick();

      // 5. 重新初始化
      resetInProgress.value = false;
      initializePage();

      message.success('刷新成功');
    } catch (error) {
      console.error('重置失败:', error);
      resetInProgress.value = false;
      message.destroy();
    } finally {
      message.destroy();
    }
  };

  const destroyMapResources = (): void => {
    if (!map) return;

    console.log('🧹 清理地图资源...');

    // 解绑全局事件
    unbindGlobalEvents();

    // 移除图层
    if (trainLayerGroup) {
      trainLayerGroup.clearLayers();
      trainLayerGroup = null;
    }
    if (personClusterGroup) {
      personClusterGroup.clearLayers();
      personClusterGroup = null;
    }

    // 清理标记引用
    trainMarkersMap.forEach((marker) => {
      marker.off();
      marker.remove();
    });
    trainMarkersMap.clear();

    personMarkersMap.forEach((marker) => {
      marker.off();
      marker.remove();
    });
    personMarkersMap.clear();

    stationMarkersMap.forEach((item) => {
      item.circle.remove();
      item.label.off();
      item.label.remove();
    });
    stationMarkersMap.clear();

    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }

    // 销毁地图
    map.off();
    map.remove();
    map = null;
    isMapInitialized = false;
  };

  // --- 全局事件具名化 (便于移除) ---
  const handleDocumentMouseMove = (e: MouseEvent): void => {
    if (isRotating && map) {
      map.setBearing(map.getBearing() + (e.clientX - lastMouseX) * 0.5);
    }
    lastMouseX = e.clientX;
  };

  const handleDocumentMouseUp = (e: MouseEvent): void => {
    if (e.button === 2) {
      isRotating = false;
      map?.dragging.enable();
    }
  };

  const bindGlobalEvents = (): void => {
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  };

  const unbindGlobalEvents = (): void => {
    document.removeEventListener('mousemove', handleDocumentMouseMove);
    document.removeEventListener('mouseup', handleDocumentMouseUp);
  };

  // --- 数据获取API ---

  const getDeviceCount = (): void => {
    if (resetInProgress.value) return;
    largeScreenApi
      .GetDeviceCount()
      .then((data) => {
        deviceCount.value = data;
        setSafeTimeout(getDeviceCount, 10 * 1000);
      })
      .catch((error) => {
        console.error('获取设备数量失败:', error);
        setSafeTimeout(getDeviceCount, 10 * 1000);
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
        setSafeTimeout(getDeviceLocationCount, 11 * 1000);
      })
      .catch((error) => {
        console.error('获取设备位置数量失败:', error);
        setSafeTimeout(getDeviceLocationCount, 11 * 1000);
      });
  };

  const getMapLocation = (): void => {
    if (resetInProgress.value) return;
    largeScreenApi
      .GetMapLocation()
      .then((data) => {
        lines.value = data;
        initMap();
        setSafeTimeout(getCirHandLocation, 500);
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
        setSafeTimeout(getCirHandLocation, 10 * 1000);
      })
      .catch((error) => {
        console.error('获取机车和人员位置失败:', error);
        setSafeTimeout(getCirHandLocation, 10 * 1000);
      });
  };

  const getServiceInfo = (): void => {
    if (resetInProgress.value) return;
    largeScreenApi
      .GetServiceInfo()
      .then((data) => {
        const datas = data.map((m: any) => ({
          id: m.id,
          name: m.name,
          color: m.color,
          alarmType: m.alarmType,
        }));
        alarmList.value = [...datas];
        nextTick(() => {
          setSafeTimeout(getServiceInfo, 12 * 1000);
        });
      })
      .catch((error) => {
        console.error('getServiceInfo失败:', error);
        nextTick(() => {
          setSafeTimeout(getServiceInfo, 12 * 1000);
        });
      });
  };

  const goIndex = (item: ScrollItem): void => {
    window.open(`${window.location.origin}/#/message/index/${item.id}`, '_blank');
  };

  // --- 地图相关逻辑 ---

  const initMap = (): void => {
    if (!mapContainer.value) {
      console.error('地图容器未找到');
      return;
    }

    // 确保清理旧资源
    destroyMapResources();

    try {
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

      // 初始化图层
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

      trainLayerGroup = L.layerGroup();

      if (showPersons.value) {
        map.addLayer(personClusterGroup);
      }
      if (showTrains.value) {
        map.addLayer(trainLayerGroup);
      }

      drawLines();
      addStations();

      // 绑定地图缩放事件
      map.on('zoomend', () => {
        if (!map) return;
        const currentZoom = map.getZoom();
        const showStationName = currentZoom >= 7;
        stationMarkersMap.forEach((item) => {
          item.label.setOpacity(showStationName ? 1 : 0);
        });
      });

      map.on('zoomstart', (e) => {
        if (e.originalEvent && map) map.setZoomAround(map.mouseEventToLatLng(e.originalEvent));
      });

      // 绑定容器事件
      if (mapContainer.value) {
        mapContainer.value.addEventListener('mousedown', (e) => {
          if (e.button === 2 && map) {
            isRotating = true;
            lastMouseX = e.clientX;
            map.dragging.disable();
          }
        });
        mapContainer.value.addEventListener('contextmenu', (e) => e.preventDefault());
      }

      // 绑定全局事件
      bindGlobalEvents();

      // 初始动画
      setSafeTimeout(() => {
        if (map) {
          map.flyTo(initialMapState.center, initialMapState.zoom, {
            duration: 2,
            easeLinearity: 0.2,
          });
        }
      }, 200);

      isMapInitialized = true;
    } catch (error) {
      console.error('初始化地图失败:', error);
    }
  };

  const drawLines = (): void => {
    if (!map) return;
    try {
      lines.value.forEach((line) => {
        if (line.coordinates.length > 0) {
          // 白色背景线
          L.polyline(line.coordinates, {
            color: '#ffffff',
            weight: 8,
            opacity: 1,
            lineCap: 'square',
          }).addTo(map!);

          // 彩色虚线
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

  const addStations = (): void => {
    if (!map) return;
    try {
      lines.value.forEach((line) => {
        line.stations.forEach((station) => {
          if (isValidCoordinate(station.coordinate)) {
            const circleMarker = L.circleMarker(station.coordinate, {
              radius: 4,
              fillColor: '#FC09EF',
              color: '#FC09EF',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8,
            }).addTo(map!);

            const nameMarker = L.marker(station.coordinate, {
              icon: createStationNameLabel(station.name),
              zIndexOffset: 60,
              opacity: 0,
              interactive: true,
            }).addTo(map!);

            stationMarkersMap.set(station.id, { circle: circleMarker, label: nameMarker });
          }
        });
      });
    } catch (error) {
      console.error('添加车站失败:', error);
    }
  };

  // --- 标记创建与更新 ---

  const createTrainIcon = (isOnline: boolean, isZeroCoord: boolean = false): L.DivIcon => {
    const className = `custom-train-marker ${isOnline ? 'online' : 'offline'} ${isZeroCoord ? 'zero-coord' : ''}`;
    return L.divIcon({
      html: `<div class="${className}"></div>`,
      className: 'custom-train-marker-container',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const createPersonIcon = (isOnline: boolean, isZeroCoord: boolean = false): L.DivIcon => {
    const className = `custom-person-marker ${isOnline ? 'online' : 'offline'} ${isZeroCoord ? 'zero-coord' : ''}`;
    return L.divIcon({
      html: `<div class="${className}"></div>`,
      className: 'custom-person-marker-container',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

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

  const updateTrainPositions = async (newTrainData: Train[]): Promise<void> => {
    if (!map || !trainLayerGroup || resetInProgress.value) return;

    const now = Date.now();
    if (now - lastTrainUpdateTime < UPDATE_INTERVAL) return;
    lastTrainUpdateTime = now;

    // 1. 清除不在新数据中的标记
    const currentIds = new Set(newTrainData.map((t) => t.id));
    const toRemove: string[] = [];
    for (const [id, marker] of trainMarkersMap) {
      if (!currentIds.has(id)) {
        trainLayerGroup.removeLayer(marker);
        marker.off();
        toRemove.push(id);
      }
    }
    toRemove.forEach((id) => {
      trainMarkersMap.delete(id);
      const idx = trains.value.findIndex((t) => t.id === id);
      if (idx !== -1) trains.value.splice(idx, 1);
    });

    // 2. 更新或创建标记
    for (const train of newTrainData) {
      if (!isValidCoordinate(train.coordinate)) continue;

      const isZero = isZeroCoordinate(train.coordinate);
      let marker = trainMarkersMap.get(train.id);
      const existingTrain = trains.value.find((t) => t.id === train.id);

      if (marker && existingTrain) {
        const newLatLng = L.latLng(train.coordinate);

        // 状态改变更新图标
        if (
          existingTrain.isOnline !== train.isOnline ||
          isZero !== isZeroCoordinate(existingTrain.coordinate)
        ) {
          marker.setIcon(createTrainIcon(train.isOnline, isZero));
        }

        const dist = newLatLng.distanceTo(marker.getLatLng());

        // 平滑移动逻辑
        if (dist > 100 && !isZero && !existingTrain.moving) {
          existingTrain.moving = true;
          (marker as any).slideTo(newLatLng, { duration: 3000, keepAtCenter: false });

          setSafeTimeout(() => {
            if (existingTrain) existingTrain.moving = false;
          }, 3000);
        } else if (!existingTrain.moving) {
          marker.setLatLng(newLatLng);
        }

        // 同步数据到 Vue
        Object.assign(existingTrain, train);
        existingTrain.lastValidCoordinate = [...train.coordinate] as [number, number];
      } else {
        // 新增
        const newMarker = L.marker(train.coordinate, {
          icon: createTrainIcon(train.isOnline, isZero),
          zIndexOffset: 60,
        });

        newMarker.on('click', () => showPopup(train.coordinate, train, 'cab'));

        trainLayerGroup.addLayer(newMarker);
        trainMarkersMap.set(train.id, newMarker);
        trains.value.push(train);
      }
    }
  };

  const updatePersonPositions = async (newPersonData: Person[]): Promise<void> => {
    if (!map || !personClusterGroup || resetInProgress.value) return;

    const now = Date.now();
    if (now - lastPersonUpdateTime < UPDATE_INTERVAL) return;
    lastPersonUpdateTime = now;

    const currentIds = new Set(newPersonData.map((p) => p.id));
    const toRemove: string[] = [];

    for (const [id, marker] of personMarkersMap) {
      if (!currentIds.has(id)) {
        personClusterGroup.removeLayer(marker);
        marker.off();
        toRemove.push(id);
      }
    }
    toRemove.forEach((id) => {
      personMarkersMap.delete(id);
      const idx = persons.value.findIndex((p) => p.id === id);
      if (idx !== -1) persons.value.splice(idx, 1);
    });

    for (const person of newPersonData) {
      if (!isValidCoordinate(person.coordinate)) continue;

      const isZero = isZeroCoordinate(person.coordinate);
      let marker = personMarkersMap.get(person.id);
      const existingPerson = persons.value.find((p) => p.id === person.id);

      if (marker && existingPerson) {
        const newLatLng = L.latLng(person.coordinate);
        if (
          existingPerson.isOnline !== person.isOnline ||
          isZero !== isZeroCoordinate(existingPerson.coordinate)
        ) {
          marker.setIcon(createPersonIcon(person.isOnline, isZero));
        }
        marker.setLatLng(newLatLng);
        Object.assign(existingPerson, person);
      } else {
        const newMarker = L.marker(person.coordinate, {
          icon: createPersonIcon(person.isOnline, isZero),
          zIndexOffset: 50,
        });
        newMarker.on('click', () => showPopup(person.coordinate, person, 'hand'));
        personClusterGroup.addLayer(newMarker);
        personMarkersMap.set(person.id, newMarker);
        persons.value.push(person);
      }
    }

    if (personClusterGroup) personClusterGroup.refreshClusters();
  };

  // --- 交互功能 ---

  const showPopup = (coord: [number, number], data: any, type: 'cab' | 'hand'): void => {
    if (!map) return;
    if (currentPopup) {
      map.removeLayer(currentPopup);
      currentPopup = null;
    }

    const title = type === 'cab' ? t('view._cabRadio') : t('view.handheldRadio');
    const label1 = type === 'cab' ? t('view._kilometerMarker') : 'ISDN';
    const val1 = type === 'cab' ? data.glb : data.isdn;
    const content = `
        <div class="popup-content">
            <div class='title fontColor'>${title}</div>
            <div class='content'>
                <div class='roleName' style='display:${data.roleName == '' ? 'none' : 'block'}'>${data.roleName}</div>
                <div class='info' style='display:${type == 'hand' ? 'none' : 'flex'}'><div class='min'>ISDN:</div><div>${data.isdn}</div></div>
                <div class='info'><div class='min'>${label1}:</div><div>${val1}</div></div>
                <div class='info'><div class='min'>${t('view.locationStation')}:</div><div>${data.station}</div></div>
                <div class='info'><div class='min'>${t('view.affiliatedRegion')}:</div><div>${data.area}</div></div>
            </div>
        </div>`;

    currentPopup = L.popup({
      autoClose: false,
      closeButton: true,
      className: 'custom-popup',
      maxWidth: 300,
    })
      .setLatLng(coord)
      .setContent(content)
      .openOn(map);
  };

  const handleSearch = debounce((): void => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query || !map || resetInProgress.value) return;

    if (currentPopup) {
      map.removeLayer(currentPopup);
      currentPopup = null;
    }

    const train = trains.value.find(
      (t) => t.isdn.toLowerCase().includes(query) || t.roleName.toLowerCase().includes(query),
    );
    if (train) {
      map.flyTo(train.coordinate, 10);
      showPopup(train.coordinate, train, 'cab');
      return;
    }

    const person = persons.value.find(
      (p) => p.isdn.toLowerCase().includes(query) || p.roleName.toLowerCase().includes(query),
    );
    if (person) {
      map.flyTo(person.coordinate, 10);
      showPopup(person.coordinate, person, 'hand');
      return;
    }

    message.info(t('view.queryResultIsEmpty'));
  }, DEBOUNCE_DELAY);

  const toggleTrainsVisibility = (): void => {
    showTrains.value = !showTrains.value;
    if (trainLayerGroup && map) {
      showTrains.value ? map.addLayer(trainLayerGroup) : map.removeLayer(trainLayerGroup);
    }
  };

  const togglePersonsVisibility = (): void => {
    showPersons.value = !showPersons.value;
    if (personClusterGroup && map) {
      showPersons.value ? map.addLayer(personClusterGroup) : map.removeLayer(personClusterGroup);
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

  const updateAllMarkersVisibility = (zoomLevel: number): void => {
    const showStationName = zoomLevel >= 7;
    stationMarkersMap.forEach((item) => {
      item.label.setOpacity(showStationName ? 1 : 0);
    });
  };

  // --- 图表配置 ---

  const getChartOption = (
    xAxisData: string[],
    left: number[],
    center: number[],
    right: number[],
  ) => {
    const echarts = chartJiCir.echarts; // 获取 echarts 引用用于创建渐变
    return {
      backgroundColor: 'transparent',
      title: { show: false },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '1%', right: '1%', bottom: '1%', top: '20%', containLabel: true },
      legend: {
        data: legendDatas,
        right: 10,
        top: 0,
        textStyle: { color: '#fff' },
        itemWidth: 12,
        itemHeight: 10,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: { interval: 0, color: '#fff', fontStyle: 'normal', fontSize: 12 },
        axisLine: { lineStyle: { color: 'rgba(77, 128, 254, 0.2)' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false, lineStyle: { color: 'white' } },
        splitLine: { show: false, lineStyle: { color: '#1B2848' } },
        axisLabel: {},
      },
      dataZoom: [{ type: 'inside', show: true, height: 15, start: 1, end: 10 }],
      series: [
        {
          name: legendDatas[0],
          type: 'bar',
          barWidth: '20%',
          label: { show: true, position: 'top', color: '#fff' },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#12F7D0' },
              { offset: 1, color: '#65CFBD' },
            ]),
            borderRadius: 12,
          },
          data: left,
        },
        {
          name: legendDatas[1],
          type: 'bar',
          barWidth: '20%',
          label: { show: true, position: 'top', color: '#fff' },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#D94CE6' },
              { offset: 1, color: '#DE08FC' },
            ]),
            borderRadius: 11,
          },
          data: center,
        },
        {
          name: legendDatas[2],
          type: 'bar',
          barWidth: '20%',
          label: { show: true, position: 'top', color: '#fff' },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3EC2EA' },
              { offset: 1, color: '#248ff7' },
            ]),
            borderRadius: 11,
          },
          data: right,
        },
      ],
    };
  };

  const setCirChart = (x: string[], l: number[], c: number[], r: number[]) => {
    if (resetInProgress.value) return;
    const option = getChartOption(x, l, c, r);
    chartJiCir.getInstance()?.setOption(isFirstCirE ? option : { series: option.series }, {
      notMerge: false,
      lazyUpdate: true,
    });
    isFirstCirE = false;
  };

  const setHandChart = (x: string[], l: number[], c: number[], r: number[]) => {
    if (resetInProgress.value) return;
    const option = getChartOption(x, l, c, r);
    chartHand.getInstance()?.setOption(isFirstHandE ? option : { series: option.series }, {
      notMerge: false,
      lazyUpdate: true,
    });
    isFirstHandE = false;
  };

  // --- 生命周期 ---

  const initializePage = (): void => {
    getServiceInfo();
    getDeviceCount();
    getDeviceLocationCount();
    getMapLocation();
  };

  onMounted(() => {
    console.log('🚀 页面加载');
    initializePage();
  });

  onUnmounted(() => {
    console.log('👋 页面卸载，开始清理');
    clearAllTimers();
    destroyMapResources();
    chartJiCir.getInstance()?.dispose();
    chartHand.getInstance()?.dispose();
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
        height: 54px;
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
        height: 74px;
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
    width: 210px;
    height: 32px;
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
    width: 390px;
    height: 240px;
    padding: 10px 0;
    background-image: url('@/assets/images/largeScreen/maptop.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    .title {
      position: relative;
      top: -13px;
      left: 157px;
      width: 126px;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
    }

    .content {
      display: flex;
      position: relative;
      top: 22px;
      left: 9px;
      flex-direction: column;
      width: 355px;
      height: 170px;
      font-size: 20px;
      gap: 9px;

      .roleName {
        width: 100%;
        overflow: hidden;
        color: #fff;
        text-align: center;
        text-overflow: ellipsis; // 文本溢出添加省略号
        white-space: nowrap; // 碰到有边界不要折行
      }

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
          width: 170px;
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
    right: -40px;
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
    background-image: url('@/assets/images/largeScreen/huoche2.png');
    background-repeat: no-repeat;
    background-size: contain;
    filter: drop-shadow(0 0 2px rgb(0 0 0 / 70%));
  }

  .custom-person-marker {
    width: 30px;
    height: 30px;
    background-image: url('@/assets/images/largeScreen/zhibanyuan1.png');
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
