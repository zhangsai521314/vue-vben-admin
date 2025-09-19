<template>
  <MyContent style="background-image: url('/src/assets/images/largeScreen/bj1.png')">
    <div class="map-container">
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
          <button @click="handleSearch" class="search-button">搜索</button>
        </div>
        <!-- 重置按钮 -->
        <button @click="resetMap" class="reset-button">
          <i class="fas fa-redo-alt"></i> 重置地图
        </button>
      </div>

      <!-- 地图容器 -->
      <div ref="mapContainer" class="map"></div>

      <!-- 操作提示 -->
      <div class="map-hint">
        按住鼠标右键拖动可旋转地图 | 滚轮缩放地图 | 7级以上显示站点名称 | 9级以上显示ISDN号码
      </div>
    </div>
  </MyContent>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.marker.slideto';
  import 'leaflet-rotate';

  // 初始地图状态（默认缩放8级）
  const initialMapState = {
    center: [11.5, -10.0],
    zoom: 8, // 默认加载8级缩放
    bearing: 0,
  };

  // 线路A坐标
  const lineACoordinates = [
    [10.4, -14.0], // 马瑞巴亚港
    [10.6, -13.5],
    [10.9, -13.0],
    [11.2, -12.5],
    [11.5, -12.0], // 抛物线顶点
    [11.7, -11.5],
    [11.9, -11.0],
    [12.0, -10.5],
    [12.1, -10.0],
    [12.1, -9.5],
    [12.2, -9.0],
    [12.3, -8.5], // 西芒杜矿山（线路B起点）
  ];

  // 线路A车站
  const lineAStations = [
    {
      id: 'A1',
      name: '马瑞巴亚港',
      coordinate: [10.4, -14.0],
      photo: 'https://picsum.photos/id/1015/400/300',
    },
    {
      id: 'A2',
      name: '穆萨亚',
      coordinate: [10.7, -13.3],
      photo: 'https://picsum.photos/id/1016/400/300',
    },
    {
      id: 'A3',
      name: '科里巴',
      coordinate: [10.9, -12.9],
      photo: 'https://picsum.photos/id/1018/400/300',
    },
    {
      id: 'A4',
      name: '卡萨',
      coordinate: [11.2, -12.4],
      photo: 'https://picsum.photos/id/1019/400/300',
    },
    {
      id: 'A5',
      name: '乌尔卡巴',
      coordinate: [11.4, -12.1],
      photo: 'https://picsum.photos/id/1022/400/300',
    },
    {
      id: 'A6',
      name: '蒙加塔',
      coordinate: [11.6, -11.7],
      photo: 'https://picsum.photos/id/1023/400/300',
    },
    {
      id: 'A7',
      name: '法拉纳',
      coordinate: [11.8, -11.2],
      photo: 'https://picsum.photos/id/1024/400/300',
    },
    {
      id: 'A8',
      name: '杜瓦科',
      coordinate: [11.9, -10.7],
      photo: 'https://picsum.photos/id/1025/400/300',
    },
    {
      id: 'A9',
      name: '尼亚林科',
      coordinate: [12.0, -10.2],
      photo: 'https://picsum.photos/id/1026/400/300',
    },
    {
      id: 'A10',
      name: '迪安库亚',
      coordinate: [12.1, -9.7],
      photo: 'https://picsum.photos/id/1027/400/300',
    },
    {
      id: 'A11',
      name: '凯鲁阿内',
      coordinate: [12.2, -9.2],
      photo: 'https://picsum.photos/id/1028/400/300',
    },
    {
      id: 'A12',
      name: '西芒杜矿山',
      coordinate: [12.3, -8.5],
      photo: 'https://picsum.photos/id/1029/400/300',
    },
  ];

  // 线路B坐标
  const lineBCoordinates = [
    [12.3, -8.5], // 西芒杜矿山（起点）
    [12.0, -8.2],
    [11.7, -7.9],
    [11.4, -7.6],
    [11.1, -7.3], // 辛铁矿（终点）
  ];

  // 线路B车站
  const lineBStations = [
    {
      id: 'B1',
      name: '线路所',
      coordinate: [12.3, -8.5],
      photo: 'https://picsum.photos/id/1030/400/300',
    },
    {
      id: 'B2',
      name: 'siding0',
      coordinate: [12.2, -8.4],
      photo: 'https://picsum.photos/id/1031/400/300',
    },
    {
      id: 'B3',
      name: 'siding1',
      coordinate: [12.1, -8.3],
      photo: 'https://picsum.photos/id/1032/400/300',
    },
    {
      id: 'B4',
      name: 'siding2',
      coordinate: [12.0, -8.2],
      photo: 'https://picsum.photos/id/1033/400/300',
    },
    {
      id: 'B5',
      name: 'siding3',
      coordinate: [11.8, -8.0],
      photo: 'https://picsum.photos/id/1034/400/300',
    },
    {
      id: 'B6',
      name: 'siding4',
      coordinate: [11.6, -7.8],
      photo: 'https://picsum.photos/id/1035/400/300',
    },
    {
      id: 'B7',
      name: 'siding5',
      coordinate: [11.3, -7.5],
      photo: 'https://picsum.photos/id/1036/400/300',
    },
    {
      id: 'B8',
      name: '辛铁矿',
      coordinate: [11.1, -7.3],
      photo: 'https://picsum.photos/id/1037/400/300',
    },
  ];

  // 火车数据
  const trains = [
    {
      id: 'train1',
      isdn: 'TR-001',
      station: '马瑞巴亚港',
      area: '西部区域',
      isOnline: true,
      coordinate: [10.4, -14.0],
      line: 'A',
    },
    {
      id: 'train2',
      isdn: 'TR-002',
      station: '法拉纳',
      area: '中部区域',
      isOnline: true,
      coordinate: [11.8, -11.2],
      line: 'A',
    },
    {
      id: 'train3',
      isdn: 'TR-003',
      station: '西芒杜矿山',
      area: '矿区',
      isOnline: false,
      coordinate: [12.3, -8.5],
      line: 'A',
    },
    {
      id: 'train4',
      isdn: 'TR-004',
      station: 'siding3',
      area: '矿区',
      isOnline: true,
      coordinate: [11.8, -8.0],
      line: 'B',
    },
    {
      id: 'train5',
      isdn: 'TR-005',
      station: '辛铁矿',
      area: '矿区',
      isOnline: true,
      coordinate: [11.1, -7.3],
      line: 'B',
    },
  ];

  // 人员数据
  const persons = [
    {
      id: 'person1',
      role: '列车长',
      isdn: 'PS-001',
      station: '马瑞巴亚港',
      area: '西部区域',
      isOnline: true,
      coordinate: [10.4, -14.0],
    },
    {
      id: 'person2',
      role: '调度员',
      isdn: 'PS-002',
      station: '法拉纳',
      area: '中部区域',
      isOnline: true,
      coordinate: [11.8, -11.2],
    },
    {
      id: 'person3',
      role: '维修工程师',
      isdn: 'PS-003',
      station: '西芒杜矿山',
      area: '矿区',
      isOnline: false,
      coordinate: [12.3, -8.5],
    },
    {
      id: 'person4',
      role: '站长',
      isdn: 'PS-004',
      station: '辛铁矿',
      area: '矿区',
      isOnline: true,
      coordinate: [11.1, -7.3],
    },
    {
      id: 'person5',
      role: '信号员',
      isdn: 'PS-005',
      station: 'siding3',
      area: '矿区',
      isOnline: true,
      coordinate: [11.8, -8.0],
    },
  ];

  // 组件变量
  const mapContainer = ref(null);
  const searchQuery = ref('');
  let map = null;
  let currentPopup = null;
  let isRotating = false;
  let lastMouseX = 0;
  let stationPhotos = {};
  let lineLayers = { A: null, B: null };
  let stationNameMarkers = {}; // 站点名称标记管理
  let trainIsdnMarkers = {}; // 火车ISDN标签管理
  let personIsdnMarkers = {}; // 人员ISDN标签管理

  // 初始化地图
  onMounted(() => {
    // 创建地图实例
    map = L.map(mapContainer.value, {
      crs: L.CRS.Simple,
      attributionControl: false,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 12,
      zoomSnap: 0.5,
      dragging: true,
      tap: false,
      rotate: true,
      bearing: initialMapState.bearing,
    });

    // 设置初始视图（默认8级缩放）
    map.setView(initialMapState.center, initialMapState.zoom);
    map.getContainer().style.backgroundColor = 'transparent';

    // 添加缩放/旋转控制
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.rotate({ position: 'topright', closeOnZeroBearing: false }).addTo(map);

    // 绘制线路
    lineLayers.A = drawLine(lineACoordinates);
    lineLayers.B = drawLine(lineBCoordinates);

    // 添加车站、火车、人员
    addStations(lineAStations);
    addStations(lineBStations);
    addTrains();
    addPersons();

    // 页面进入动画
    setTimeout(() => {
      map.flyTo(initialMapState.center, initialMapState.zoom, { duration: 2, easeLinearity: 0.2 });
    }, 500);

    // 绑定事件
    bindMapEvents();
    // 初始化时根据缩放级别设置所有标签状态
    updateAllMarkersVisibility(map.getZoom());
  });

  // 绘制线路
  const drawLine = (coordinates) => {
    L.polyline(coordinates, { color: '#ffffff', weight: 8, opacity: 1, lineCap: 'square' }).addTo(
      map,
    );
    const line = L.polyline(coordinates, {
      color: '#09D4FC',
      weight: 8,
      opacity: 1,
      dashArray: '35, 35',
      lineCap: 'square',
    }).addTo(map);
    return line;
  };

  // 添加车站（7级以上显示名称）
  const addStations = (stations) => {
    stations.forEach((station) => {
      // 粉色圆圈标记
      const circleMarker = L.circleMarker(station.coordinate, {
        radius: 4,
        fillColor: '#FC09EF',
        color: '#FC09EF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        zIndexOffset: 50,
      }).addTo(map);

      // 车站名称标签
      const nameDom = document.createElement('div');
      nameDom.className = 'station-name-wrapper';
      const nameContent = document.createElement('div');
      nameContent.className = 'station-name-content';
      nameContent.textContent = station.name;
      nameContent.style.color = '#FC09EF'; // 车站名称颜色
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
        opacity: 0, // 初始隐藏
        interactive: true,
      }).addTo(map);

      // 点击事件
      const showStationInfo = () => {
        openPopup(
          station.coordinate,
          `
          <div class="popup-content">
            <h3>${station.name}</h3>
            <p>坐标: ${station.coordinate[0].toFixed(4)}, ${station.coordinate[1].toFixed(4)}</p>
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
    });
  };

  // 添加火车（9级以上显示ISDN）
  const addTrains = () => {
    trains.forEach((train) => {
      // 火车图标
      const icon = L.icon({
        iconUrl: train.isOnline
          ? '/src/assets/images/largeScreen/huoche2.png'
          : '/src/assets/images/largeScreen/huoche2.png',
        iconSize: [30, 30],
        iconAnchor: [15, 10],
        className: 'train-icon',
      });

      const trainMarker = L.marker(train.coordinate, {
        icon: icon,
        zIndexOffset: 200, // 层级高于ISDN标签
      }).addTo(map);

      // 火车ISDN标签（9级显示，#FC09EF色）
      const isdnDom = document.createElement('div');
      isdnDom.className = 'isdn-label';
      isdnDom.textContent = `ISDN: ${train.isdn}`;
      isdnDom.style.fontSize = 25;
      isdnDom.style.fontWeight = 700;
      isdnDom.style.color = '#FC09EF'; // isdn颜色
      const isdnIcon = L.divIcon({
        html: isdnDom,
        className: 'isdn-icon',
        iconSize: [100, 20],
        iconAnchor: [-10, 10], // 右侧对齐
      });

      const isdnMarker = L.marker(train.coordinate, {
        icon: isdnIcon,
        zIndexOffset: 190, // 层级低于火车图标
        opacity: 0, // 初始隐藏
        interactive: false,
      }).addTo(map);

      // 点击事件
      trainMarker.on('click', () => {
        openPopup(
          train.coordinate,
          `
        <div class="popup-content">
          <h3>火车信息</h3>
          <p>ISDN号码: ${train.isdn}</p>
          <p>所在车站: ${train.station}</p>
          <p>区域位置: ${train.area}</p>
          <p>状态: ${
            train.isOnline
              ? '<span class="status-online">在线</span>'
              : '<span class="status-offline">离线</span>'
          }</p>
        </div>
      `,
        );
      });

      // 存储引用
      train.marker = trainMarker;
      train.isdnMarker = isdnMarker;
      trainIsdnMarkers[train.id] = isdnMarker;

      // 火车移动逻辑
      startTrainMovement(train);
    });
  };

  // 添加人员（9级以上显示ISDN）
  const addPersons = () => {
    persons.forEach((person) => {
      // 人员图标
      const icon = L.icon({
        iconUrl: person.isOnline
          ? '/src/assets/images/largeScreen/zhibanyuan1.png'
          : '/src/assets/images/largeScreen/zhibanyuan1.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: 'person-icon',
      });

      const personMarker = L.marker(person.coordinate, {
        icon: icon,
        zIndexOffset: 150, // 层级高于ISDN标签
      }).addTo(map);

      // 人员ISDN标签（9级显示，#FC09EF色）
      const isdnDom = document.createElement('div');
      isdnDom.className = 'isdn-label';
      isdnDom.textContent = `ISDN: ${person.isdn}`;
      isdnDom.style.fontSize = 25;
      isdnDom.style.fontWeight = 700;
      isdnDom.style.color = '#FC09EF'; // 人员isdn颜色
      const isdnIcon = L.divIcon({
        html: isdnDom,
        className: 'isdn-icon',
        iconSize: [100, 20],
        iconAnchor: [-10, 15], // 右侧对齐
      });

      const isdnMarker = L.marker(person.coordinate, {
        icon: isdnIcon,
        zIndexOffset: 140, // 层级低于人员图标
        opacity: 0, // 初始隐藏
        interactive: false,
      }).addTo(map);

      // 点击事件
      personMarker.on('click', () => {
        openPopup(
          person.coordinate,
          `
        <div class="popup-content">
          <h3>人员信息</h3>
          <p>角色: ${person.role}</p>
          <p>ISDN号码: ${person.isdn}</p>
          <p>所在车站: ${person.station}</p>
          <p>区域位置: ${person.area}</p>
          <p>状态: ${
            person.isOnline
              ? '<span class="status-online">在线</span>'
              : '<span class="status-offline">离线</span>'
          }</p>
        </div>
      `,
        );
      });

      // 存储引用
      person.marker = personMarker;
      person.isdnMarker = isdnMarker;
      personIsdnMarkers[person.id] = isdnMarker;

      // 人员移动逻辑
      startPersonMovement(person);
    });
  };

  // 火车移动（ISDN标签同步移动）
  const startTrainMovement = (train) => {
    const linePoints = train.line === 'A' ? lineLayers.A.getLatLngs() : lineLayers.B.getLatLngs();
    let currentIndex =
      linePoints.findIndex(
        (p) =>
          p.lat.toFixed(4) === train.coordinate[0].toFixed(4) &&
          p.lng.toFixed(4) === train.coordinate[1].toFixed(4),
      ) || 0;

    const moveTrain = () => {
      const nextIndex = currentIndex === linePoints.length - 1 ? 0 : currentIndex + 1;
      const nextPoint = linePoints[nextIndex];
      // 同时移动火车图标和ISDN标签
      train.marker.slideTo(nextPoint, { duration: 4000 + Math.random() * 8, easeLinearity: 0.2 });
      train.isdnMarker.slideTo(nextPoint, {
        duration: 4000 + Math.random() * 8,
        easeLinearity: 0.2,
      });

      train.coordinate = [nextPoint.lat, nextPoint.lng];
      currentIndex = nextIndex;
      setTimeout(moveTrain, 4000 + Math.random() * 12000);
    };
    setTimeout(moveTrain, 2000 + Math.random() * 6000);
  };

  // 人员移动（ISDN标签同步移动）
  const startPersonMovement = (person) => {
    const movePerson = () => {
      const newPoint = L.latLng(
        person.coordinate[0] + (Math.random() - 0.5) * 0.08,
        person.coordinate[1] + (Math.random() - 0.5) * 0.08,
      );
      // 同时移动人员图标和ISDN标签
      person.marker.slideTo(newPoint, { duration: 4000 + Math.random() * 6, easeLinearity: 0.5 });
      person.isdnMarker.slideTo(newPoint, {
        duration: 4000 + Math.random() * 6,
        easeLinearity: 0.5,
      });

      person.coordinate = [newPoint.lat, newPoint.lng];
      setTimeout(movePerson, 3000 + Math.random() * 7000);
    };
    setTimeout(movePerson, 1000 + Math.random() * 3000);
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
    const zoomLevel = map.getZoom();
    if (zoomLevel >= 8) {
      [...lineAStations, ...lineBStations].forEach((station) => {
        if (!stationPhotos[station.id]) {
          const bounds = L.latLngBounds(
            [station.coordinate[0] - 0.05, station.coordinate[1] - 0.05],
            [station.coordinate[0] + 0.05, station.coordinate[1] + 0.05],
          );
          stationPhotos[station.id] = L.imageOverlay(station.photo, bounds, {
            opacity: 0.8,
            zIndex: 40,
          }).addTo(map);
        }
      });
    } else {
      Object.values(stationPhotos).forEach((layer) => map.removeLayer(layer));
      stationPhotos = {};
    }
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
    [...lineAStations, ...lineBStations].forEach((station) => {
      if (station.name.toLowerCase().includes(query) && !found) {
        map.flyTo(station.coordinate, 10, { duration: 1 });
        station.nameMarker.setOpacity(1);
        openPopup(
          station.coordinate,
          `
          <div class="popup-content">
            <h3>${station.name}</h3>
            <p>坐标: ${station.coordinate[0].toFixed(4)}, ${station.coordinate[1].toFixed(4)}</p>
          </div>
        `,
        );
        found = true;
      }
    });

    if (found) return;

    // 搜索火车
    trains.forEach((train) => {
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
            <h3>火车 ${train.isdn}</h3>
            <p>所在车站: ${train.station}</p>
            <p>状态: ${train.isOnline ? '<span class="status-online">在线</span>' : '<span class="status-offline">离线</span>'}</p>
          </div>
        `,
        );
        found = true;
      }
    });

    if (found) return;

    // 搜索人员
    persons.forEach((person) => {
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
            <h3>${person.role}</h3>
            <p>ISDN: ${person.isdn}</p>
            <p>状态: ${person.isOnline ? '<span class="status-online">在线</span>' : '<span class="status-offline">离线</span>'}</p>
          </div>
        `,
        );
        found = true;
      }
    });

    if (!found) alert(`未找到与"${query}"相关的信息`);
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
</script>

<style scoped>
  .map-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  /* 控制区样式 */
  .control-container {
    display: flex;
    position: absolute;
    z-index: 1000;
    top: 20px;
    left: 50%;
    flex-direction: column;
    width: 380px;
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
    border: 1px solid #ddd;
    border-radius: 4px;
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
    color: #fc09ef !important; /* 强制设置为#fc09ef */
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
    padding: 10px 0;
  }

  .status-online {
    color: #2ecc71;
    font-weight: 500;
  }

  .status-offline {
    color: #e74c3c;
    font-weight: 500;
  }

  :deep(.leaflet-popup-tip-container) {
    display: none;
  }

  :deep(.leaflet-control-rotate) {
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 1px 5px rgb(0 0 0 / 20%);
  }
</style>
