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
                placeholder="搜索车站、火车或人员..."
                @keyup.enter="handleSearch"
                class="search-input"
              />
              <IconFontClass
                name="icon-baseui-zhizao"
                @click="resetMap"
                title="重置地图"
                :style="{ fontSize: '30px', color: 'rgb(219 78 244)' }"
              />
            </div>
          </div>
        </div>
        <div class="head">运行监控数据平台 </div>
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
                <div class="title" style="left: 48px; width: 90px">调度台/值班台</div>
                <div class="count" style="color: #b97fff">{{ deviceCount.optionCount }}</div>
              </div>
              <div class="headCenter2">
                <div class="icon">
                  <IconFontClass name="icon-baseui-zhinengwangguan" :style="{ fontSize: '34px' }"
                /></div>
                <div class="title" style="left: 47px; width: 60px">机车电台</div>
                <div class="count" style="color: #5ecdba">{{ deviceCount.cirCount }}</div></div
              >
              <div class="headCenter3">
                <div class="icon" style="top: 2px">
                  <IconFontClass name="icon-baseui-shouchidanbing" :style="{ fontSize: '36px' }"
                /></div>
                <div class="title" style="left: 46px; width: 60px">手持终端</div>
                <div class="count" style="left: 50px; color: #3ec2e9">{{
                  deviceCount.handCount
                }}</div></div
              >
            </div>
          </div>
        </div>
        <div class="wgdata fontColor">
          <div class="bottombg"></div>
          <div class="title">网管数据统计分析</div>
          <div class="data">
            <div>
              <div>
                <div class="number">{{ requestData.requestCount }}</div>
                <div class="label">今日请求</div>
              </div>
            </div>
            <div>
              <div>
                <div class="number">{{ requestData.onlineCount }}</div>
                <div class="label">在线人数</div>
              </div>
            </div>
            <div>
              <div>
                <div class="number">{{ requestData.userCount }}</div>
                <div class="label">用户总数</div>
              </div>
            </div>
          </div>
        </div>
        <div class="jccir fontColor">
          <div class="bottombg"></div>
          <div class="title">机车电台位置分析</div>
          <div class="data" ref="chartJiCirRef"> </div>
        </div>
        <div class="hand fontColor">
          <div class="bottombg"></div>
          <div class="title">手持终端位置分析</div>
          <div class="data" ref="chartHandRef"> </div>
        </div>
        <div class="alarm fontColor">
          <div class="bottombg"></div>
          <div class="title">服务状态</div>
          <div class="alarmNo" v-show="pendingAlarmData.length == 0">
            <div>无待处理告警</div>
          </div>
          <div v-show="pendingAlarmData.length > 0" class="data">
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
                  <div class="alarm_time">{{ item.time }}</div>
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
  import { ref, watch, onMounted } from 'vue';
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

  const go = useGo();
  const { t } = useI18n();
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

  // 初始地图状态（默认缩放8级）
  const initialMapState = {
    center: [10.5821, 9.1271],
    zoom: 7.4,
    bearing: 260,
  };

  // 定义线路接口
  interface Line {
    id: string;
    name: string;
    color: string;
    coordinates: [number, number][];
    stations: Station[];
  }

  // 定义站点接口
  interface Station {
    id: string;
    name: string;
    coordinate: [number, number];
    photo: string;
    circleMarker?: any;
    nameMarker?: any;
  }

  // 定义火车接口
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
    moving?: boolean; // 标记是否正在移动
  }

  // 定义人员接口
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
    moving?: boolean; // 标记是否正在移动
  }

  // 线路数据 - 支持多条线路
  const lines = ref<Line[]>([]);

  // 火车数据
  const trains = ref<Train[]>([]);

  // 人员数据
  const persons = ref<Person[]>([]);

  // 组件变量
  const mapContainer = ref(null);
  const searchQuery = ref('');
  let map = null;
  let currentPopup = null;
  let isRotating = false;
  let lastMouseX = 0;
  let stationPhotos = {};
  let lineLayers = {};
  let stationNameMarkers = {};
  let trainIsdnMarkers = {};
  let personIsdnMarkers = {};
  let trainMarkers = {};
  let personMarkers = {};

  // 绘制线路 - 支持多条线路
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
        const lineLayer = L.polyline(line.coordinates, {
          color: line.color,
          weight: 8,
          opacity: 1,
          dashArray: '35, 35',
          lineCap: 'square',
        }).addTo(map);

        // 存储线路图层
        lineLayers[line.id] = lineLayer;
      }
    });
  };

  // 添加车站（7级以上显示名称）
  const addStations = () => {
    lines.value.forEach((line) => {
      line.stations.forEach((station) => {
        if (station.coordinate.length == 2) {
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
          const nameDom = document.createElement('div');
          nameDom.className = 'station-name-wrapper';
          const nameContent = document.createElement('div');
          nameContent.className = 'station-name-content';
          nameContent.textContent = station.name;
          nameContent.style.color = '#FC09EF';
          nameDom.appendChild(nameContent);

          const nameIcon = L.divIcon({
            html: nameDom,
            className: 'station-name-icon',
            iconSize: [120, 24],
            iconAnchor: [-10, 12],
          });

          const nameMarker = L.marker(station.coordinate, {
            icon: nameIcon,
            zIndexOffset: 60,
            opacity: 0,
            interactive: true,
          }).addTo(map);

          // 点击事件
          const showStationInfo = () => {
            openPopup(
              station.coordinate,
              `
            <div class="popup-content">
        <div class='title fontColor'>车站</div>
        <div class='content'>
                  <div class='info'>
                     <div>ISDN:</div>
                     <div>${station.name}</div>
                   </div>
                  <div class='info'>
                     <div>车站名称:</div>
                     <div>${station.name}</div>
                   </div>

                  <div class='info_'>
                     <div><img src='/largeScreen/huoche2.png'/></div>
                     <div>5</div>
                     <div><img src='/largeScreen/zhibanyuan1.png'/></div>
                     <div>20</div>
                  </div>
          </div>
            </div>
          `,
            );
          };
          circleMarker.on('click', showStationInfo);
          nameMarker.on('click', showStationInfo);

          // 存储引用
          station.circleMarker = circleMarker;
          station.nameMarker = nameMarker;
          stationNameMarkers[station.id] = nameMarker;
        }
      });
    });
  };

  // 添加火车（9级以上显示ISDN）
  const addTrains = () => {
    trains.value.forEach((train) => {
      addTrainMarker(train);
    });
  };

  // 添加单个火车标记
  const addTrainMarker = (train: Train) => {
    // 火车图标
    const icon = L.icon({
      iconUrl: train.isOnline ? '/largeScreen/huoche2.png' : '/largeScreen/huoche2.png',
      iconSize: [30, 30],
      iconAnchor: [15, 10],
      className: 'train-icon',
    });

    const trainMarker = L.marker(train.coordinate, {
      icon: icon,
      zIndexOffset: 200,
    }).addTo(map);

    // 火车ISDN标签（9级显示，#FC09EF色）
    const isdnDom = document.createElement('div');
    isdnDom.className = 'isdn-label';
    isdnDom.textContent = `ISDN: ${train.isdn}`;
    isdnDom.style.fontSize = 25;
    isdnDom.style.fontWeight = 700;
    isdnDom.style.color = '#FC09EF';
    const isdnIcon = L.divIcon({
      html: isdnDom,
      className: 'isdn-icon',
      iconSize: [100, 20],
      iconAnchor: [-10, 10],
    });

    const isdnMarker = L.marker(train.coordinate, {
      icon: isdnIcon,
      zIndexOffset: 190,
      opacity: 0,
      interactive: false,
    }).addTo(map);

    // 点击事件
    trainMarker.on('click', () => {
      openPopup(
        train.coordinate,
        `
          <div class="popup-content">
        <div class='title fontColor'>列车</div>
        <div class='content'>
                  <div class='info'>
                     <div>ISDN:</div>
                     <div>${train.isdn}</div>
                   </div>
                  <div class='info'>
                     <div>机车号:</div>
                     <div>${train.isdn}</div>
                   </div>
                  <div class='info'>
                     <div>所在车站:</div>
                     <div>${train.station}</div>
                  </div>
                  <div class='info'>
                     <div>所属区域:</div>
                     <div>${train.area}</div>
                  </div>
          </div>
          </div>
        `,
      );
    });

    // 存储引用
    train.marker = trainMarker;
    train.isdnMarker = isdnMarker;
    trainIsdnMarkers[train.id] = isdnMarker;
    trainMarkers[train.id] = { marker: trainMarker, isdnMarker: isdnMarker };
  };

  // 添加人员（9级以上显示ISDN）
  const addPersons = () => {
    persons.value.forEach((person) => {
      addPersonMarker(person);
    });
  };

  // 添加单个人员标记
  const addPersonMarker = (person: Person) => {
    // 人员图标
    const icon = L.icon({
      iconUrl: person.isOnline ? '/largeScreen/zhibanyuan1.png' : '/largeScreen/zhibanyuan1.png',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: 'person-icon',
    });

    const personMarker = L.marker(person.coordinate, {
      icon: icon,
      zIndexOffset: 150,
    }).addTo(map);

    // 人员ISDN标签（9级显示，#FC09EF色）
    const isdnDom = document.createElement('div');
    isdnDom.className = 'isdn-label';
    isdnDom.textContent = `ISDN: ${person.isdn}`;
    isdnDom.style.fontSize = 25;
    isdnDom.style.fontWeight = 700;
    isdnDom.style.color = '#FC09EF';
    const isdnIcon = L.divIcon({
      html: isdnDom,
      className: 'isdn-icon',
      iconSize: [100, 20],
      iconAnchor: [-10, 15],
    });

    const isdnMarker = L.marker(person.coordinate, {
      icon: isdnIcon,
      zIndexOffset: 140,
      opacity: 0,
      interactive: false,
    }).addTo(map);

    // 点击事件
    personMarker.on('click', () => {
      openPopup(
        person.coordinate,
        `
          <div class="popup-content">
        <div class='title fontColor'>人员</div>
        <div class='content'>
                  <div class='info'>
                     <div>ISDN:</div>
                     <div>${person.isdn}</div>
                   </div>
                  <div class='info'>
                     <div>人员角色:</div>
                     <div>${person.role}</div>
                   </div>
                  <div class='info'>
                     <div>所在车站:</div>
                     <div>${person.station}</div>
                  </div>
                  <div class='info'>
                     <div>所属区域:</div>
                     <div>${person.area}</div>
                  </div>
          </div>
          </div>
        `,
      );
    });

    // 存储引用
    person.marker = personMarker;
    person.isdnMarker = isdnMarker;
    personIsdnMarkers[person.id] = isdnMarker;
    personMarkers[person.id] = { marker: personMarker, isdnMarker: isdnMarker };
  };

  // 平滑移动标记到新位置
  const smoothMoveTo = (marker: any, newLatLng: L.LatLng, duration: number = 3000) => {
    return new Promise<void>((resolve) => {
      marker.slideTo(newLatLng, {
        duration: duration,
        keepAtCenter: false,
      });

      // 在动画结束后解析 Promise
      setTimeout(() => {
        resolve();
      }, duration);
    });
  };

  // 更新火车位置
  const updateTrainPositions = async (newTrainData: Train[]) => {
    // 移除不存在的火车
    Object.keys(trainMarkers).forEach((id) => {
      if (!newTrainData.find((train) => train.id === id)) {
        const markers = trainMarkers[id];
        if (markers.marker && map.hasLayer(markers.marker)) {
          map.removeLayer(markers.marker);
        }
        if (markers.isdnMarker && map.hasLayer(markers.isdnMarker)) {
          map.removeLayer(markers.isdnMarker);
        }
        delete trainMarkers[id];
        delete trainIsdnMarkers[id];

        const index = trains.value.findIndex((t) => t.id === id);
        if (index !== -1) {
          trains.value.splice(index, 1);
        }
      }
    });

    // 更新或添加火车
    for (const train of newTrainData) {
      if (trainMarkers[train.id]) {
        // 更新现有火车位置
        const markers = trainMarkers[train.id];
        const existingTrain = trains.value.find((t) => t.id === train.id);

        if (existingTrain && !existingTrain.moving) {
          const newLatLng = L.latLng(train.coordinate[0], train.coordinate[1]);
          const currentLatLng = markers.marker.getLatLng();

          // 只有当位置确实发生变化时才移动
          if (newLatLng.distanceTo(currentLatLng) > 10) {
            // 10米阈值
            existingTrain.moving = true;

            try {
              // 同时移动火车图标和ISDN标签
              await Promise.all([
                smoothMoveTo(markers.marker, newLatLng, 3000),
                smoothMoveTo(markers.isdnMarker, newLatLng, 3000),
              ]);

              // 更新数据
              existingTrain.coordinate = [newLatLng.lat, newLatLng.lng];
              existingTrain.station = train.station;
              existingTrain.area = train.area;
              existingTrain.isOnline = train.isOnline;
            } catch (error) {
              console.error('移动火车时出错:', error);
            } finally {
              existingTrain.moving = false;
            }
          } else {
            // 小距离移动，直接设置位置
            markers.marker.setLatLng(newLatLng);
            markers.isdnMarker.setLatLng(newLatLng);
            existingTrain.coordinate = [newLatLng.lat, newLatLng.lng];
          }
        }
      } else {
        // 添加新火车
        addTrainMarker(train);
        trains.value.push(train);
      }
    }
  };

  // 更新人员位置
  const updatePersonPositions = async (newPersonData: Person[]) => {
    // 移除不存在的人员
    Object.keys(personMarkers).forEach((id) => {
      if (!newPersonData.find((person) => person.id === id)) {
        const markers = personMarkers[id];
        if (markers.marker && map.hasLayer(markers.marker)) {
          map.removeLayer(markers.marker);
        }
        if (markers.isdnMarker && map.hasLayer(markers.isdnMarker)) {
          map.removeLayer(markers.isdnMarker);
        }
        delete personMarkers[id];
        delete personIsdnMarkers[id];

        const index = persons.value.findIndex((p) => p.id === id);
        if (index !== -1) {
          persons.value.splice(index, 1);
        }
      }
    });

    // 更新或添加人员
    for (const person of newPersonData) {
      if (personMarkers[person.id]) {
        // 更新现有人员位置
        const markers = personMarkers[person.id];
        const existingPerson = persons.value.find((p) => p.id === person.id);

        if (existingPerson && !existingPerson.moving) {
          const newLatLng = L.latLng(person.coordinate[0], person.coordinate[1]);
          const currentLatLng = markers.marker.getLatLng();

          // 只有当位置确实发生变化时才移动
          if (newLatLng.distanceTo(currentLatLng) > 10) {
            // 10米阈值
            existingPerson.moving = true;

            try {
              // 同时移动人员图标和ISDN标签
              await Promise.all([
                smoothMoveTo(markers.marker, newLatLng, 2000),
                smoothMoveTo(markers.isdnMarker, newLatLng, 2000),
              ]);

              // 更新数据
              existingPerson.coordinate = [newLatLng.lat, newLatLng.lng];
              existingPerson.station = person.station;
              existingPerson.area = person.area;
              existingPerson.isOnline = person.isOnline;
            } catch (error) {
              console.error('移动人员时出错:', error);
            } finally {
              existingPerson.moving = false;
            }
          } else {
            // 小距离移动，直接设置位置
            markers.marker.setLatLng(newLatLng);
            markers.isdnMarker.setLatLng(newLatLng);
            existingPerson.coordinate = [newLatLng.lat, newLatLng.lng];
          }
        }
      } else {
        // 添加新人员
        addPersonMarker(person);
        persons.value.push(person);
      }
    }
  };

  // 绑定地图事件
  const bindMapEvents = () => {
    // 缩放结束时更新显示状态
    map.on('zoomend', () => {
      const currentZoom = map.getZoom();
      handleZoomEnd();
      updateAllMarkersVisibility(currentZoom);
    });

    // 缩放开始时的处理
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

  // 核心：控制所有标签的显示/隐藏
  const updateAllMarkersVisibility = (zoomLevel) => {
    // 1. 车站名称：7级或7级以上显示
    const showStationName = zoomLevel >= 7;
    Object.values(stationNameMarkers).forEach((marker) => {
      marker.setOpacity(showStationName ? 1 : 0);
    });

    // 2. ISDN标签：9级或9级以上显示
    const showIsdn = zoomLevel >= 9;
    // 火车ISDN标签
    Object.values(trainIsdnMarkers).forEach((marker) => {
      marker.setOpacity(showIsdn ? 1 : 0);
    });
    // 人员ISDN标签
    Object.values(personIsdnMarkers).forEach((marker) => {
      marker.setOpacity(showIsdn ? 1 : 0);
    });
  };

  // 车站照片显示逻辑
  const handleZoomEnd = () => {
    // 可以根据需要添加车站照片显示逻辑
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
  const handleSearch = () => {
    if (!searchQuery.value.trim()) return;
    const query = searchQuery.value.trim().toLowerCase();
    let found = false;
    if (currentPopup) map.removeLayer(currentPopup);

    // 搜索车站
    lines.value.forEach((line) => {
      line.stations.forEach((station) => {
        if (station.name.toLowerCase().includes(query) && !found) {
          map.flyTo(station.coordinate, 10, { duration: 1 });
          station.nameMarker.setOpacity(1);
          openPopup(
            station.coordinate,
            `
             <div class="popup-content">
        <div class='title fontColor'>车站</div>
        <div class='content'>
                  <div class='info'>
                     <div>ISDN:</div>
                     <div>${station.name}</div>
                   </div>
                  <div class='info'>
                     <div>车站名称:</div>
                     <div>${station.name}</div>
                   </div>
                  <div class='info_'>
                     <div><img src='/largeScreen/huoche2.png'/></div>
                     <div>5</div>
                     <div><img src='/largeScreen/zhibanyuan1.png'/></div>
                     <div>20</div>
                  </div>
          </div>
            </div>
          `,
          );
          found = true;
        }
      });
    });

    if (found) return;

    // 搜索火车
    trains.value.forEach((train) => {
      if (
        (train.isdn.toLowerCase().includes(query) || train.station.toLowerCase().includes(query)) &&
        !found
      ) {
        map.flyTo(train.coordinate, 10, { duration: 1 });
        train.isdnMarker.setOpacity(1);
        openPopup(
          train.coordinate,
          `
          <div class="popup-content">
        <div class='title fontColor'>列车</div>
        <div class='content'>
                  <div class='info'>
                     <div>ISDN:</div>
                     <div>${train.isdn}</div>
                   </div>
                  <div class='info'>
                     <div>机车号:</div>
                     <div>${train.isdn}</div>
                   </div>
                  <div class='info'>
                     <div>所在车站:</div>
                     <div>${train.station}</div>
                  </div>
                  <div class='info'>
                     <div>所属区域:</div>
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
      if (
        (person.isdn.toLowerCase().includes(query) || person.role.toLowerCase().includes(query)) &&
        !found
      ) {
        map.flyTo(person.coordinate, 10, { duration: 1 });
        person.isdnMarker.setOpacity(1);
        openPopup(
          person.coordinate,
          `
          <div class="popup-content">
        <div class='title fontColor'>人员</div>
        <div class='content'>
                  <div class='info'>
                     <div>ISDN:</div>
                     <div>${person.isdn}</div>
                   </div>
                  <div class='info'>
                     <div>人员角色:</div>
                     <div>${person.role}</div>
                   </div>
                  <div class='info'>
                     <div>所在车站:</div>
                     <div>${person.station}</div>
                  </div>
                  <div class='info'>
                     <div>所属区域:</div>
                     <div>${person.area}</div>
                  </div>
          </div>
          </div>
        `,
        );
        found = true;
      }
    });

    if (!found) message.info(`未找到与"${query}"相关的信息`);
  };

  // 重置地图
  const resetMap = () => {
    if (currentPopup) map.removeLayer(currentPopup);
    currentPopup = null;

    // 移除车站照片
    Object.values(stationPhotos).forEach((layer) => map.removeLayer(layer));
    stationPhotos = {};

    // 重置标签状态
    updateAllMarkersVisibility(initialMapState.zoom);

    // 恢复初始视图
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

  function initMap() {
    // // 修改CRS.Simple的变换参数，将原点移至左上角，Y轴向下为正
    // L.CRS.Simple.transformation = new L.Transformation(1, 0, 1, 0);
    // 初始化地图
    map = L.map(mapContainer.value, {
      crs: L.CRS.Simple,
      attributionControl: false,
      zoomControl: false,
      minZoom: 6,
      maxZoom: 14,
      zoomSnap: 0.5,
      dragging: true,
      tap: false,
      rotate: true,
      bearing: initialMapState.bearing,
    });

    // 设置初始视图
    map.setView(initialMapState.center, initialMapState.zoom);
    map.getContainer().style.backgroundColor = 'transparent';

    // 绘制所有线路
    drawLines();

    // 添加车站、火车、人员
    addStations();
    addTrains();
    addPersons();

    // 页面进入动画
    setTimeout(() => {
      map.flyTo(initialMapState.center, initialMapState.zoom, {
        duration: 2,
        easeLinearity: 0.2,
      });
    }, 200);

    // 绑定事件
    bindMapEvents();
    // 初始化时根据缩放级别设置所有标签状态
    updateAllMarkersVisibility(map.getZoom());
  }

  //机车图表
  function setCirChart(xAxisData, leftData, centerData, rightData) {
    try {
      const option = {
        backgroundColor: 'transparent', // 设置图表背景为透明
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
          data: ['左侧', '站内', '右侧'],
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
              fontSize: 14,
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
            name: '左侧',
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
            name: '站内',
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
            name: '右侧',
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

  //手持图表
  function setHandChart(xAxisData, leftData, centerData, rightData) {
    try {
      const option = {
        backgroundColor: 'transparent', // 设置图表背景为透明
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
          data: ['左侧', '站内', '右侧'],
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
            textStyle: {
              color: '#fff',
              fontStyle: 'normal',
              fontSize: 14,
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
            name: '左侧',
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
            name: '站内',
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
            name: '右侧',
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
        }, 60 * 1000);
      })
      .catch(() => {
        setTimeout(() => {
          getDeviceCount();
        }, 60 * 1000);
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
        getCirHandLocation();
        initMap();
      })
      .catch(() => {});
  }

  function getCirHandLocation() {
    largeScreenApi
      .GetCirHandLocation()
      .then((data) => {
        // 更新火车位置
        updateTrainPositions(data.cirData || []);
        // 更新人员位置
        updatePersonPositions(data.handData || []);
        setTimeout(() => {
          getCirHandLocation();
        }, 5 * 1000);
      })
      .catch(() => {
        setTimeout(() => {
          getCirHandLocation();
        }, 5 * 1000);
      });
  }

  function getServiceInfo() {
    largeScreenApi
      .GetServiceInfo()
      .then((data) => {
        pendingAlarmData.value = data;
      })
      .catch(() => {
        setTimeout(() => {
          getServiceInfo();
        }, 10 * 1000);
      });
  }

  function goIndex(item) {
    go(`/message/index/${item.id}`);
  }

  onMounted(() => {
    getServiceInfo();
    getSysRequest();
    getDeviceCount();
    getDeviceLocationCount();
    getMapLocation();
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
      width: 24.15%;
      min-width: 310px;
      height: 18.9%;
      min-height: 136px;
      background-image: url('/src/assets/images/largeScreen/xbj7.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      .title {
        position: relative;
        top: 2%;
        left: 5%;
        font-size: 20px;
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

    .servicedata {
      position: absolute;
      top: 40px;
      right: 4px;
      width: 24.15%;
      min-width: 310px;
      height: 18.9%;
      min-height: 136px;
      background-image: url('@/assets/images/largeScreen/xbj72.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      .title {
        position: relative;
        top: 2%;
        right: -71%;
        font-size: 20px;
      }

      .data {
        width: 92%;
        height: calc(100% - 32px);
        margin-top: 8px;
        margin-left: 7px;
        overflow: hidden;
      }
    }

    .jccir,
    .hand {
      position: absolute;
      top: 70%;
      width: 24.1%;
      min-width: 386px;
      height: 27.65%;
      min-height: 250px;
      background-image: url('/src/assets/images/largeScreen/xbj_12.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      .title {
        position: relative;
        top: 2%;
        left: 7%;
        font-size: 20px;
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

    .video {
      position: absolute;
      top: 33%;
      right: 4px;
      width: 24.1%;
      min-width: 386px;
      height: 27.65%;
      min-height: 250px;
      background-image: url('@/assets/images/largeScreen/xbj_1_1.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      @media (max-width: 1920px) {
        .player-wrapper {
          top: 7%;
        }
      }

      @media (min-width: 1921px) {
        .player-wrapper {
          top: 9%;
        }
      }

      .player-wrapper {
        position: relative;
        left: 4%;
        width: 91%;
        height: 76%;
      }

      .title {
        position: relative;
        top: 2%;
        right: -55%;
        width: 39%;
        overflow: hidden;
        font-size: 20px;
        text-align: right;
        text-emphasis: inherit;
        cursor: pointer;
      }

      .data {
        width: 85%;
        height: 75%;
        margin-top: 6%;
        margin-left: 7%;
      }

      :deep(.vjs-control-bar) {
        border-radius: 0 0 19px 19px !important;
      }

      .video-player {
        width: 100%;
        height: 100% !important;
        padding-top: 0 !important;
        background-color: #fc09f000;
      }
    }

    .alarm {
      position: absolute;
      top: 40px;
      right: 4px;
      width: 24.15%;
      min-width: 310px;
      height: 18.9%;
      min-height: 136px;
      background-image: url('@/assets/images/largeScreen/xbj72.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      .title {
        position: relative;
        top: 2%;
        right: -55%;
        width: 39%;
        overflow: hidden;
        font-size: 20px;
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
        width: 56%;
        overflow: hidden;
        font-size: 16px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .alarm_time {
        flex-grow: 1;
        overflow: hidden;
        font-size: 16px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
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
    bottom: 10px;
    left: 50%;
    flex-direction: column;
    width: 194px;
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

  .search-button {
    padding: 8px 16px;
    transition: background 0.3s;
    border: none;
    border-radius: 4px;
    background: #3498db;
    color: #fff;
    cursor: pointer;
  }

  .search-button:hover {
    background: #2980b9;
  }

  .reset-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    transition: all 0.3s;
    border: none;
    border-radius: 4px;
    background: #e74c3c;
    color: #fff;
    cursor: pointer;
    gap: 6px;
  }

  .reset-button:hover {
    transform: translateY(-2px);
    background: #c0392b;
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

  /* ISDN标签样式（#fc09ef色） */
  .isdn-label {
    padding: 2px 6px;
    border-radius: 3px;
    background-color: rgb(0 0 0 / 85%);
    box-shadow: 0 1px 4px rgb(0 0 0 / 40%);
    color: #fc09ef !important;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  /* 操作提示 */
  .map-hint {
    position: absolute;
    z-index: 900;
    bottom: 20px;
    left: 20px;
    padding: 6px 12px;
    border-radius: 4px;
    background: rgb(0 0 0 / 70%);
    box-shadow: 0 1px 5px rgb(0 0 0 / 20%);
    color: #fff;
    font-size: 12px;
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
      left: 33px;
      flex-direction: column;
      width: 260px;
      height: 135px;
      font-size: 20px;
      gap: 9px;

      .info {
        display: flex;
        flex-direction: row;

        > div:first-child {
          width: 200px;
          overflow: hidden;
          color: #ad11a4;
          text-align: right;
          text-emphasis: inherit;
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

  .status-online {
    color: #2ecc71;
    font-weight: 500;
  }

  .status-offline {
    color: #e74c3c;
    font-weight: 500;
  }

  :deep(.leaflet-popup),
  :deep(.leaflet-popup-content-wrapper) {
    background-color: #fff0 !important;
    box-shadow: none;
  }
</style>

<style lang="less">
  .fontColor {
    color: #08d4fc;
  }

  .fontColorSelect {
    color: #fff;
  }

  .zssssssssssssss > div {
    top: 15%;
    padding: 0;
  }

  .zssssssssssssss > div > div > div.ant-modal-content {
    padding: 0;
    background-color: #125ed000 !important;
  }

  .alarmOpenContent {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 72vh;
    padding: 2.4%;
    padding-bottom: 4%;
    border-radius: 4%;
    background-image: url('@/assets/images/largeScreen/alarmOpen.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    .alarmList {
      display: flex;
      position: relative;
      flex-direction: column;
      width: 400px;
      height: 100%;

      .title {
        position: relative;
        top: -7px;
        left: 0;
        height: 30px;
        font-size: 20px;
      }

      .alarmListDetail {
        height: 100%;
        overflow-y: auto;

        .alarmWai_for {
          width: 100%;
          height: 30px;
          line-height: 30px;
          cursor: pointer;
        }

        .alarmWai_content {
          display: flex;
          flex-direction: row;
          gap: 6px;
        }

        .alarm_title {
          width: 286px;
          overflow: hidden;
          font-size: 16px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .alarm_time {
          width: 140px;
          overflow: hidden;
          font-size: 13px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .alarmDetail {
      display: flex;
      position: relative;
      flex-direction: column;
      width: 100%;
      height: 100%;

      .title {
        height: 30px;
        font-size: 20px;
      }

      .alarmDetailContent {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
        gap: 6px;

        .text {
          height: 16%;
          padding: 0 10px;
          overflow-y: auto;
          font-size: 20px;
          text-indent: 40px;
        }

        .alarmSelectedContent {
          padding: 0 10px;

          :deep(.ant-radio-button-wrapper) {
            color: #fff !important;
          }
        }

        .multimedia {
          width: 100%;
          height: 100%;
          opacity: 1;

          > div {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;

            .video-player {
              width: 100%;
              height: 100% !important;
              padding-top: 0 !important;
            }
          }
        }
      }
    }
  }

  .videoOpenContent {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 72vh;
    padding: 2.4%;
    padding-bottom: 4%;
    border-radius: 4%;
    background-image: url('@/assets/images/largeScreen/alarmOpen.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    .videoList {
      display: flex;
      position: relative;
      flex-direction: column;
      width: 250px;
      height: 100%;

      .title {
        position: relative;
        top: -7px;
        left: 0;
        height: 30px;
        font-size: 20px;
      }

      .videoListDetail {
        height: 100%;
        overflow-y: auto;

        .videoWai_for {
          width: 100%;
          height: 30px;
          line-height: 30px;
          cursor: pointer;
        }

        .video_title {
          width: 100%;
          overflow: hidden;
          font-size: 16px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .video {
      width: 100%;
      height: 100%;
      overflow: hidden;
      opacity: 1;

      .video-player {
        width: 100%;
        height: 100% !important;
        padding-top: 0 !important;
      }
    }
  }

  .leaflet-control-container {
    display: none !important;
  }
</style>
