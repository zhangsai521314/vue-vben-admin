<template>
  <MyContent :class="prefixCls">
    <a-spin :spinning="isRunLoading">
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
              <IconFontClass
                name="icon-baseui-zhizao"
                @click="resetMap"
                :title="t('view.resetMap')"
                :style="{ fontSize: '30px', color: 'rgb(219 78 244)' }"
              />
            </div>
          </div>
        </div>
        <div class="head">{{ t('view.operationMonitoringPlatform') }} </div>
        <div
          style="
            display: flex;
            position: absolute;
            top: 47px;
            justify-content: center;
            width: 100%;
            height: 70px;
          "
        >
          <div class="headCenter">
            <div>
              <div class="headCenter1">
                <div class="icon">
                  <IconFontClass name="icon-baseui-ziyuan" :style="{ fontSize: '30px' }"
                /></div>
                <div class="title" style="left: 48px; width: 90px; text-align: left">{{
                  t('view.dutyDesk')
                }}</div>
                <div class="count" style="left: 50px; color: #b97fff; text-align: left">{{
                  deviceCount.optionCount
                }}</div>
              </div>
              <div class="headCenter2">
                <div class="icon">
                  <IconFontClass name="icon-baseui-zhinengwangguan" :style="{ fontSize: '34px' }"
                /></div>
                <div class="title" style="left: 48px; width: 60px; text-align: left">{{
                  t('view._cabRadio')
                }}</div>
                <div class="count" style="left: 50px; color: #5ecdba; text-align: left">{{
                  deviceCount.cirCount
                }}</div></div
              >
              <div class="headCenter3">
                <div class="icon" style="top: 2px">
                  <IconFontClass name="icon-baseui-shouchidanbing" :style="{ fontSize: '36px' }"
                /></div>
                <div class="title" style="left: 48px; width: 60px; text-align: left">{{
                  t('view.handheldRadio')
                }}</div>
                <div class="count" style="left: 50px; color: #3ec2e9; text-align: left">{{
                  deviceCount.handCount
                }}</div></div
              >
            </div>
          </div>
        </div>
        <div class="wgdata fontColor">
          <div class="bottombg"></div>
          <div class="title">{{ t('view.requestStatistics') }}</div>
          <div class="data">
            <div>
              <div>
                <div class="number">{{ requestData.requestCount }}</div>
                <div class="label">{{ t('view.request') }}</div>
              </div>
            </div>
            <div>
              <div>
                <div class="number">{{ requestData.onlineCount }}</div>
                <div class="label">{{ t('view.onlineUser') }}</div>
              </div>
            </div>
            <div>
              <div>
                <div class="number">{{ requestData.userCount }}</div>
                <div class="label">{{ t('view.totalUsersCount') }}</div>
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
            <vue3-seamless-scroll
              class="scroll"
              :list="pendingAlarmData"
              :hover="true"
              :limitScrollNum="7"
              :isWatch="true"
              :step="0.5"
            >
              <div class="alarmWai_for" v-for="(item, i) in pendingAlarmData" :key="i">
                <div class="alarmWai_content" :style="{ color: item.color }" @click="goIndex(item)">
                  <div class="alarm_title">{{ item.name }}</div>
                  <div class="alarm_time">{{ t('view.' + item.alarmType) }}</div>
                </div>
              </div>
            </vue3-seamless-scroll>
          </div>
        </div>
      </div>
    </a-spin>
  </MyContent>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';
  import { useECharts } from '@/hooks/web/useECharts';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.marker.slideto';
  import 'leaflet-rotate';
  import { message } from 'ant-design-vue';
  import largeScreenApi from '@/api/largeScreen';
  import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
  import { useGo } from '/@/hooks/web/usePage';

  const { t } = useI18n();
  const go = useGo();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  defineOptions({ name: 'LargeScreen' });
  const { prefixCls } = useDesign('largeScreen-');
  const isRunLoading = ref(false);
  const chartJiCirRef = ref(null);
  const chartJiCir = useECharts(chartJiCirRef);
  const chartHandRef = ref(null);
  const chartHand = useECharts(chartHandRef);
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
  let isFirstHandE = true;
  let isFirstCirE = true;

  const pendingAlarmData = ref([]);

  // 初始地图状态
  const initialMapState = {
    center: [9.2271, -10.9921],
    zoom: 8,
    bearing: -10,
  };

  // 定义接口
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
    circleMarker?: any;
    nameMarker?: any;
  }

  interface Train {
    id: string;
    isdn: string;
    station: string;
    area: string;
    isOnline: boolean;
    coordinate: [number, number];
    marker?: any;
    isdnMarker?: any;
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
    marker?: any;
    isdnMarker?: any;
    moving?: boolean;
    lastValidCoordinate?: [number, number];
    hasValidCoordinate?: boolean;
  }

  // 数据
  const lines = ref<Line[]>([]);
  const trains = ref<Train[]>([]);
  const persons = ref<Person[]>([]);

  // 组件变量
  const mapContainer = ref(null);
  const searchQuery = ref('');
  let map = null;
  let currentPopup = null;
  let isRotating = false;
  let lastMouseX = 0;

  // 使用简单的 LayerGroup 替代聚合图层
  let trainLayerGroup = null;
  let personLayerGroup = null;

  // 标记存储 - 简化的管理方式
  let stationNameMarkers = {};
  const trainMarkers = new Map();
  const personMarkers = new Map();

  // 性能优化变量
  let updateInterval = null;
  let lastTrainUpdateTime = 0;
  let lastPersonUpdateTime = 0;
  const UPDATE_INTERVAL = 5000;
  const DEBOUNCE_DELAY = 300;

  // 地图初始化状态
  let isMapInitialized = false;
  let pendingPersonData: Person[] = [];
  let pendingTrainData: Train[] = [];

  // 执行队列控制
  let isUpdatingTrains = false;
  let isUpdatingPersons = false;
  let personUpdateQueue: Person[] = [];
  let trainUpdateQueue: Train[] = [];

  // 检查是否为0点坐标
  const isZeroCoordinate = (coord: [number, number]): boolean => {
    return coord[0] === 0 && coord[1] === 0;
  };

  // 检查是否为有效坐标
  const isValidCoordinate = (coord: [number, number]): boolean => {
    return (
      !isNaN(coord[0]) && !isNaN(coord[1]) && Math.abs(coord[0]) < 90 && Math.abs(coord[1]) < 180
    );
  };

  // 创建火车图标
  const createTrainIcon = (isOnline: boolean, isZeroCoord: boolean = false) => {
    const className = `custom-train-marker ${isOnline ? 'online' : 'offline'} ${isZeroCoord ? 'zero-coord' : ''}`;
    return L.divIcon({
      html: `<div class="${className}"></div>`,
      className: 'custom-train-marker-container',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // 创建人员图标
  const createPersonIcon = (isOnline: boolean, isZeroCoord: boolean = false) => {
    const className = `custom-person-marker ${isOnline ? 'online' : 'offline'} ${isZeroCoord ? 'zero-coord' : ''}`;
    return L.divIcon({
      html: `<div class="${className}"></div>`,
      className: 'custom-person-marker-container',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // 创建车站名称标签
  const createStationNameLabel = (name: string) => {
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

  // 绘制线路
  const drawLines = () => {
    lines.value.forEach((line) => {
      if (line.coordinates.length > 0) {
        // 绘制线路底色
        L.polyline(line.coordinates, {
          color: '#ffffff',
          weight: 8,
          opacity: 1,
          lineCap: 'square',
        }).addTo(map);

        // 绘制线路主色
        L.polyline(line.coordinates, {
          color: line.color,
          weight: 8,
          opacity: 1,
          dashArray: '35, 35',
          lineCap: 'square',
        }).addTo(map);
      }
    });
  };

  // 添加车站
  const addStations = () => {
    lines.value.forEach((line) => {
      line.stations.forEach((station) => {
        if (station.coordinate.length === 2 && isValidCoordinate(station.coordinate)) {
          // 粉色圆圈标记
          const circleMarker = L.circleMarker(station.coordinate, {
            radius: 4,
            fillColor: '#FC09EF',
            color: '#FC09EF',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map);

          // 车站名称标签
          const nameMarker = L.marker(station.coordinate, {
            icon: createStationNameLabel(station.name),
            zIndexOffset: 60,
            opacity: 0,
            interactive: true,
          }).addTo(map);

          station.circleMarker = circleMarker;
          station.nameMarker = nameMarker;
          stationNameMarkers[station.id] = nameMarker;
        }
      });
    });
  };

  // 初始化图层组
  const initLayerGroups = () => {
    // 火车图层组
    trainLayerGroup = L.layerGroup();
    // 人员图层组
    personLayerGroup = L.layerGroup();

    map.addLayer(personLayerGroup);
    map.addLayer(trainLayerGroup);
  };

  // 添加单个火车到图层组
  const addTrainToLayerGroup = (train: Train) => {
    if (trainMarkers.has(train.id)) {
      return;
    }

    const isZeroCoord = isZeroCoordinate(train.coordinate);
    const marker = L.marker(train.coordinate, {
      icon: createTrainIcon(train.isOnline, isZeroCoord),
      zIndexOffset: 1000,
    });

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
  };

  // 添加单个人员到图层组
  const addPersonToLayerGroup = (person: Person) => {
    if (personMarkers.has(person.id)) {
      return;
    }

    const isZeroCoord = isZeroCoordinate(person.coordinate);
    const marker = L.marker(person.coordinate, {
      icon: createPersonIcon(person.isOnline, isZeroCoord),
      zIndexOffset: 500,
    });

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

    personLayerGroup.addLayer(marker);
    person.marker = marker;
    person.lastValidCoordinate = [...person.coordinate] as [number, number];
    person.hasValidCoordinate = !isZeroCoord;
    personMarkers.set(person.id, marker);
  };

  // 更新火车图标状态
  const updateTrainIcon = (train: Train) => {
    if (train.marker) {
      const isZeroCoord = isZeroCoordinate(train.coordinate);
      const newIcon = createTrainIcon(train.isOnline, isZeroCoord);
      train.marker.setIcon(newIcon);
    }
  };

  // 更新人员图标状态
  const updatePersonIcon = (person: Person) => {
    if (person.marker) {
      const isZeroCoord = isZeroCoordinate(person.coordinate);
      const newIcon = createPersonIcon(person.isOnline, isZeroCoord);
      person.marker.setIcon(newIcon);
    }
  };

  // 平滑移动标记
  const smoothMoveTo = (marker: any, newLatLng: L.LatLng, duration: number = 3000) => {
    return new Promise<void>((resolve) => {
      marker.slideTo(newLatLng, {
        duration: duration,
        keepAtCenter: false,
      });

      setTimeout(() => {
        resolve();
      }, duration);
    });
  };

  // 防抖函数
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // 处理待处理数据
  const processPendingData = () => {
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

  // 更新火车位置 - 简化版本
  const updateTrainPositions = async (newTrainData: Train[]) => {
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
      const trainsToRemove = [];
      for (const [id, marker] of trainMarkers.entries()) {
        if (!currentTrainIds.has(id)) {
          trainsToRemove.push({ id, marker });
        }
      }

      if (trainsToRemove.length > 0) {
        trainsToRemove.forEach((item) => {
          trainLayerGroup.removeLayer(item.marker);
          trainMarkers.delete(item.id);
          const index = trains.value.findIndex((t) => t.id === item.id);
          if (index !== -1) {
            trains.value.splice(index, 1);
          }
        });
      }

      const updatePromises = [];

      for (const train of newTrainData) {
        if (!isValidCoordinate(train.coordinate)) {
          continue;
        }

        if (trainMarkers.has(train.id)) {
          const marker = trainMarkers.get(train.id);
          const existingTrain = trains.value.find((t) => t.id === train.id);

          if (existingTrain) {
            const newLatLng = L.latLng(train.coordinate[0], train.coordinate[1]);
            const currentLatLng = marker.getLatLng();

            // 检查是否涉及0点坐标变化
            const isFromZero =
              existingTrain.lastValidCoordinate &&
              isZeroCoordinate(existingTrain.lastValidCoordinate) &&
              !isZeroCoordinate(train.coordinate);

            const isToZero =
              existingTrain.lastValidCoordinate &&
              !isZeroCoordinate(existingTrain.lastValidCoordinate) &&
              isZeroCoordinate(train.coordinate);

            // 更新图标状态
            if (isZeroCoordinate(train.coordinate) !== isZeroCoordinate(existingTrain.coordinate)) {
              updateTrainIcon(existingTrain);
            }

            // 如果是从0点到非0点，或从非0点到0点，直接设置位置，不使用动画
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

            // 如果移动距离较大，使用平滑移动
            if (distance > 100 && !isZeroCoordinate(train.coordinate) && !existingTrain.moving) {
              existingTrain.moving = true;

              updatePromises.push(
                smoothMoveTo(marker, newLatLng, 3000)
                  .then(() => {
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
              // 小距离移动，直接设置位置
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
          // 添加新火车
          addTrainToLayerGroup(train);
          trains.value.push(train);
        }
      }

      // 限制并发数量
      const batchSize = 10;
      for (let i = 0; i < updatePromises.length; i += batchSize) {
        const batch = updatePromises.slice(i, i + batchSize);
        await Promise.all(batch);
      }
    } catch (error) {
      console.error('更新火车位置时发生错误:', error);
    } finally {
      isUpdatingTrains = false;

      if (trainUpdateQueue.length > 0) {
        const nextData = [...trainUpdateQueue];
        trainUpdateQueue = [];
        setTimeout(() => updateTrainPositions(nextData), 100);
      }
    }
  };

  // 更新人员位置 - 简化版本
  const updatePersonPositions = async (newPersonData: Person[]) => {
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

      // 移除不存在的人员
      const personsToRemove = [];
      for (const [id, marker] of personMarkers.entries()) {
        if (!currentPersonIds.has(id)) {
          personsToRemove.push({ id, marker });
        }
      }

      if (personsToRemove.length > 0) {
        personsToRemove.forEach((item) => {
          personLayerGroup.removeLayer(item.marker);
          personMarkers.delete(item.id);
          const index = persons.value.findIndex((p) => p.id === item.id);
          if (index !== -1) {
            persons.value.splice(index, 1);
          }
        });
      }

      const updatePromises = [];

      for (const person of newPersonData) {
        if (!isValidCoordinate(person.coordinate)) {
          continue;
        }

        if (personMarkers.has(person.id)) {
          const marker = personMarkers.get(person.id);
          const existingPerson = persons.value.find((p) => p.id === person.id);

          if (existingPerson) {
            const newLatLng = L.latLng(person.coordinate[0], person.coordinate[1]);
            const currentLatLng = marker.getLatLng();

            // 检查是否涉及0点坐标变化
            const isFromZero =
              existingPerson.lastValidCoordinate &&
              isZeroCoordinate(existingPerson.lastValidCoordinate) &&
              !isZeroCoordinate(person.coordinate);

            const isToZero =
              existingPerson.lastValidCoordinate &&
              !isZeroCoordinate(existingPerson.lastValidCoordinate) &&
              isZeroCoordinate(person.coordinate);

            // 更新图标状态
            if (
              isZeroCoordinate(person.coordinate) !== isZeroCoordinate(existingPerson.coordinate)
            ) {
              updatePersonIcon(existingPerson);
            }

            // 如果是从0点到非0点，或从非0点到0点，直接设置位置，不使用动画
            if (isFromZero || isToZero) {
              marker.setLatLng(newLatLng);
              existingPerson.coordinate = [newLatLng.lat, newLatLng.lng];
              existingPerson.station = person.station;
              existingPerson.area = person.area;
              existingPerson.isOnline = person.isOnline;
              existingPerson.lastValidCoordinate = [...person.coordinate] as [number, number];
              existingPerson.hasValidCoordinate = !isZeroCoordinate(person.coordinate);
              continue;
            }

            const distance = newLatLng.distanceTo(currentLatLng);

            if (distance > 100 && !isZeroCoordinate(person.coordinate) && !existingPerson.moving) {
              existingPerson.moving = true;

              updatePromises.push(
                smoothMoveTo(marker, newLatLng, 2000)
                  .then(() => {
                    existingPerson.coordinate = [newLatLng.lat, newLatLng.lng];
                    existingPerson.station = person.station;
                    existingPerson.area = person.area;
                    existingPerson.isOnline = person.isOnline;
                    existingPerson.lastValidCoordinate = [...person.coordinate] as [number, number];
                    existingPerson.hasValidCoordinate = true;
                    existingPerson.moving = false;
                  })
                  .catch((error) => {
                    console.error('移动人员时出错:', error);
                    existingPerson.moving = false;
                  }),
              );
            } else if (!existingPerson.moving) {
              marker.setLatLng(newLatLng);
              existingPerson.coordinate = [newLatLng.lat, newLatLng.lng];
              existingPerson.station = person.station;
              existingPerson.area = person.area;
              existingPerson.isOnline = person.isOnline;
              existingPerson.lastValidCoordinate = [...person.coordinate] as [number, number];
              existingPerson.hasValidCoordinate = !isZeroCoordinate(person.coordinate);
            }
          }
        } else {
          // 添加新人员
          addPersonToLayerGroup(person);
          persons.value.push(person);
        }
      }

      const batchSize = 20;
      for (let i = 0; i < updatePromises.length; i += batchSize) {
        const batch = updatePromises.slice(i, i + batchSize);
        await Promise.all(batch);
      }
    } catch (error) {
      console.error('更新人员位置时发生错误:', error);
    } finally {
      isUpdatingPersons = false;

      if (personUpdateQueue.length > 0) {
        const nextData = [...personUpdateQueue];
        personUpdateQueue = [];
        setTimeout(() => updatePersonPositions(nextData), 100);
      }
    }
  };

  // 绑定地图事件
  const bindMapEvents = () => {
    map.on('zoomend', () => {
      const currentZoom = map.getZoom();
      updateAllMarkersVisibility(currentZoom);
    });

    map.on('zoomstart', (e) => {
      if (e.originalEvent) map.setZoomAround(map.mouseEventToLatLng(e.originalEvent));
    });

    // 旋转控制
    mapContainer.value.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        isRotating = true;
        lastMouseX = e.clientX;
        map.dragging.disable();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isRotating) map.setBearing(map.getBearing() + (e.clientX - lastMouseX) * 0.5);
      lastMouseX = e.clientX;
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        isRotating = false;
        map.dragging.enable();
      }
    });

    mapContainer.value.addEventListener('contextmenu', (e) => e.preventDefault());
  };

  // 控制标签显示/隐藏
  const updateAllMarkersVisibility = (zoomLevel) => {
    const showStationName = zoomLevel >= 7;
    Object.values(stationNameMarkers).forEach((marker) => {
      marker.setOpacity(showStationName ? 1 : 0);
    });
  };

  // 打开弹窗
  const openPopup = (coordinate, content) => {
    if (currentPopup && map.hasLayer(currentPopup)) map.removeLayer(currentPopup);
    currentPopup = L.popup({
      autoClose: false,
      closeButton: true,
      className: 'custom-popup',
      maxWidth: 300,
    })
      .setLatLng(coordinate)
      .setContent(content)
      .openOn(map);
  };

  // 搜索功能
  const handleSearch = debounce(() => {
    if (!searchQuery.value.trim()) return;
    const query = searchQuery.value.trim().toLowerCase();
    let found = false;
    if (currentPopup) map.removeLayer(currentPopup);

    // 搜索火车
    trains.value.forEach((train) => {
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
      }
    });

    if (found) return;

    // 搜索人员
    persons.value.forEach((person) => {
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
      }
    });

    if (!found) message.info(`${t('view.queryResultIsEmpty')}`);
  }, DEBOUNCE_DELAY);

  // 重置地图
  const resetMap = () => {
    if (currentPopup) map.removeLayer(currentPopup);
    currentPopup = null;

    updateAllMarkersVisibility(initialMapState.zoom);

    map.flyTo(initialMapState.center, initialMapState.zoom, { duration: 1, easeLinearity: 0.3 });
    map.setBearing(initialMapState.bearing);
    searchQuery.value = '';
  };

  // 监听搜索框
  watch(searchQuery, (newVal) => {
    if (!newVal.trim() && currentPopup) {
      map.removeLayer(currentPopup);
      currentPopup = null;
      updateAllMarkersVisibility(map.getZoom());
    }
  });

  // 初始化地图
  function initMap() {
    if (map) {
      map.remove();
      map = null;
    }

    map = L.map(mapContainer.value, {
      crs: L.CRS.Simple,
      attributionControl: false,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 20,
      zoomSnap: 0.5,
      dragging: true,
      tap: false,
      rotate: true,
      bearing: initialMapState.bearing,
    });

    // 设置初始视图
    map.setView(initialMapState.center, initialMapState.zoom);
    map.getContainer().style.backgroundColor = 'transparent';

    // 初始化图层组
    initLayerGroups();

    // 绘制所有元素
    drawLines();
    addStations();

    // 页面进入动画
    setTimeout(() => {
      map.flyTo(initialMapState.center, initialMapState.zoom, {
        duration: 2,
        easeLinearity: 0.2,
      });
    }, 200);

    // 绑定事件
    bindMapEvents();
    updateAllMarkersVisibility(map.getZoom());

    // 标记地图初始化完成
    isMapInitialized = true;

    // 处理待处理数据
    nextTick(() => {
      processPendingData();
    });
  }

  // 清理资源
  const cleanup = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    if (map) {
      map.remove();
      map = null;
    }

    trainMarkers.clear();
    personMarkers.clear();
    stationNameMarkers = {};
    isMapInitialized = false;
    pendingPersonData = [];
    pendingTrainData = [];
    isUpdatingTrains = false;
    isUpdatingPersons = false;
    personUpdateQueue = [];
    trainUpdateQueue = [];
  };

  // 机车图表
  function setCirChart(xAxisData, leftData, centerData, rightData) {
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
          data: [t('view.leftSide'), t('view.inStation'), t('view.rightSide')],
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
            textStyle: {
              color: '#fff',
              fontStyle: 'normal',
              fontSize: 12,
            },
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
            name: t('view.leftSide'),
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              normal: {
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
                barBorderRadius: 12,
              },
            },
            data: leftData,
          },
          {
            name: t('view.inStation'),
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              normal: {
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
                barBorderRadius: 11,
              },
            },
            data: centerData,
          },
          {
            name: t('view.rightSide'),
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              normal: {
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
                barBorderRadius: 11,
              },
            },
            data: rightData,
          },
        ],
      };
      chartJiCir.getInstance().setOption(isFirstCirE ? option : { series: option.series });
      isFirstCirE = false;
    } catch (error) {
      console.error(error);
    }
  }

  // 手持图表
  function setHandChart(xAxisData, leftData, centerData, rightData) {
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
          data: [t('view.leftSide'), t('view.inStation'), t('view.rightSide')],
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
            textStyle: {
              color: '#fff',
              fontStyle: 'normal',
              fontSize: 12,
            },
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
            name: t('view.leftSide'),
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              normal: {
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
                barBorderRadius: 12,
              },
            },
            data: leftData,
          },
          {
            name: t('view.inStation'),
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              normal: {
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
                barBorderRadius: 11,
              },
            },
            data: centerData,
          },
          {
            name: t('view.rightSide'),
            type: 'bar',
            barWidth: '20%',
            label: {
              show: true,
              position: 'top',
              color: '#fff',
            },
            itemStyle: {
              normal: {
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
                barBorderRadius: 11,
              },
            },
            data: rightData,
          },
        ],
      };
      chartHand.getInstance().setOption(isFirstHandE ? option : { series: option.series });
      isFirstHandE = false;
    } catch (error) {
      console.error(error);
    }
  }

  function getSysRequest() {
    largeScreenApi
      .GetSysRequest()
      .then((data) => {
        requestData.value = data;
        setTimeout(() => {
          getSysRequest();
        }, 60 * 1000);
      })
      .catch(() => {
        setTimeout(() => {
          getSysRequest();
        }, 60 * 1000);
      });
  }

  function getDeviceCount() {
    largeScreenApi
      .GetDeviceCount()
      .then((data) => {
        deviceCount.value = data;
        setTimeout(() => {
          getDeviceCount();
        }, 10 * 1000);
      })
      .catch(() => {
        setTimeout(() => {
          getDeviceCount();
        }, 10 * 1000);
      });
  }

  function getDeviceLocationCount() {
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
        }, 10 * 1000);
      })
      .catch(() => {
        setTimeout(() => {
          getDeviceLocationCount();
        }, 10 * 1000);
      });
  }

  function getMapLocation() {
    largeScreenApi
      .GetMapLocation()
      .then((data) => {
        lines.value = data;
        initMap();
        // 确保地图初始化完成后再获取人员数据
        setTimeout(() => {
          getCirHandLocation();
        }, 500);
      })
      .catch((error) => {
        console.error('获取地图位置失败:', error);
      });
  }

  function getCirHandLocation() {
    largeScreenApi
      .GetCirHandLocation()
      .then((data) => {
        // 分离处理火车和人员数据
        setTimeout(() => {
          if (data.cirData) {
            updateTrainPositions(data.cirData);
          }
        }, 0);

        setTimeout(() => {
          if (data.handData) {
            updatePersonPositions(data.handData);
          }
        }, 500);

        setTimeout(() => {
          getCirHandLocation();
        }, 20 * 1000);
      })
      .catch((error) => {
        console.error('获取机车和人员位置失败:', error);
        setTimeout(() => {
          getCirHandLocation();
        }, 20 * 1000);
      });
  }

  function getServiceInfo() {
    largeScreenApi
      .GetServiceInfo()
      .then((data) => {
        pendingAlarmData.value = data;
        setTimeout(() => {
          getServiceInfo();
        }, 10 * 1000);
      })
      .catch(() => {
        setTimeout(() => {
          getServiceInfo();
        }, 10 * 1000);
      });
  }

  function goIndex(item) {
    window.open(`${window.location.origin}/#/message/index/${item.id}`, '_blank');
  }

  onMounted(() => {
    getServiceInfo();
    getSysRequest();
    getDeviceCount();
    getDeviceLocationCount();
    getMapLocation();
  });

  onUnmounted(() => {
    cleanup();
  });
</script>

<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-largeScreen-';

  .@{prefixCls} {
    width: 100%;
    min-width: 1224px !important;
    height: 100%;
    min-height: 760px !important;
    overflow: auto;
    overflow: hidden;
    background-image: url('@/assets/images/largeScreen/bj1.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .fontColor {
    color: #08d4fc;
  }

  .content {
    width: 100%;
    height: 100%;

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

      .headCenter {
        display: flex;
        justify-content: center;
        width: 38%;
        padding-top: 10px;
        background-image: url('/src/assets/images/largeScreen/xbj2.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        > div {
          display: flex;
          flex-direction: row;
          width: 400px;
          margin-left: 54px;
          color: #fff;
          font-size: 24px;
          line-height: 46px;
          text-align: center;
          gap: 90px;
        }

        > div > div {
          width: 50px;
          height: 50px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
        }

        .icon {
          position: relative;
          top: 4px;
          left: 5px;
          width: 40px;
          height: 42px;
        }

        .title {
          position: relative;
          top: -52px;
          font-size: 13px;
        }

        .count {
          position: relative;
          top: -73px;
          left: 38px;
          font-size: 26px;
        }

        .headCenter1 {
          background-image: url('@/assets/images/largeScreen/xbj6.png');
        }

        .headCenter2 {
          background-image: url('@/assets/images/largeScreen/xbj4.png');
        }

        .headCenter3 {
          background-image: url('@/assets/images/largeScreen/xbj5.png');
        }
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
        width: 386px;
        height: 250px;
        background-image: url('/src/assets/images/largeScreen/xbj_12.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        @media (min-height: 850px) {
          bottom: 14px;
        }

        @media (max-height: 800px) {
          bottom: 64px;
        }

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

      .headCenter {
        display: flex;
        justify-content: center;
        width: 38%;
        padding-top: 10px;
        background-image: url('/src/assets/images/largeScreen/xbj2.png');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        > div {
          display: flex;
          flex-direction: row;
          width: 400px;
          margin-left: 54px;
          color: #fff;
          font-size: 24px;
          line-height: 46px;
          text-align: center;
          gap: 90px;
        }

        > div > div {
          width: 50px;
          height: 50px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
        }

        .icon {
          position: relative;
          top: 4px;
          left: 5px;
          width: 40px;
          height: 42px;
        }

        .title {
          position: relative;
          top: -52px;
          font-size: 13px;
        }

        .count {
          position: relative;
          top: -73px;
          left: 38px;
          font-size: 26px;
        }

        .headCenter1 {
          background-image: url('@/assets/images/largeScreen/xbj6.png');
        }

        .headCenter2 {
          background-image: url('@/assets/images/largeScreen/xbj4.png');
        }

        .headCenter3 {
          background-image: url('@/assets/images/largeScreen/xbj5.png');
        }
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
        bottom: 14px;
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
    @media (min-height: 850px) {
      position: absolute;
      z-index: 1000;
      bottom: 10px;
      left: 50%;
      flex-direction: column;
      width: 194px;
      transform: translateX(-50%);
      gap: 10px;
    }

    @media (max-height: 800px) {
      position: absolute;
      z-index: 1000;
      bottom: 70px;
      left: 50%;
      flex-direction: column;
      width: 194px;
      transform: translateX(-50%);
      gap: 10px;
    }
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
    z-index: 600;
  }

  .leaflet-marker-icon {
    z-index: auto;
  }
</style>
