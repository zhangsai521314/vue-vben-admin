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
                <div class="count" style="color: #b97fff">19</div>
              </div>
              <div class="headCenter2">
                <div class="icon">
                  <IconFontClass name="icon-baseui-zhinengwangguan" :style="{ fontSize: '34px' }"
                /></div>
                <div class="title" style="left: 47px; width: 60px">机车电台</div>
                <div class="count" style="color: #5ecdba">60</div></div
              >
              <div class="headCenter3">
                <div class="icon" style="top: 2px">
                  <IconFontClass name="icon-baseui-shouchidanbing" :style="{ fontSize: '36px' }"
                /></div>
                <div class="title" style="left: 46px; width: 60px">手持终端</div>
                <div class="count" style="left: 50px; color: #3ec2e9">1020</div></div
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
                <div class="number">989968</div>
                <div class="label">今日请求</div>
              </div>
            </div>
            <div>
              <div>
                <div class="number">20</div>
                <div class="label">在线人数</div>
              </div>
            </div>
            <div>
              <div>
                <div class="number">120</div>
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
        <div class="servicedata fontColor" style="right: 4px; left: initial">
          <div class="bottombg"></div>
          <div class="title">服务状态</div>
          <div class="data">
            <Carousel3D
              :perspective="130"
              :items="carouselData"
              :showControls="false"
              :showIndicators="false"
              :baseTiltAngle="-12"
              :cardCountRatio="0.36"
              :cardWidthRatio="0.35"
              :autoPlayTime="2000"
            />
          </div>
        </div>
        <div class="video fontColor">
          <div class="bottombg"></div>
          <div class="title" @click="videoOpenClick(null)">马瑞巴亚港</div>
          <div class="player-wrapper">
            <video-player
              ref="playerRefMin"
              class="video-player vjs-custom-theme"
              :options="playerOptionsMin"
              :language="currentLang"
              @ready="onPlayerReadyMin"
              @play="onPlayMin"
              @pause="onPauseMin"
              @ended="onEndedMin"
              @error="onErrorMin"
            />
          </div>
        </div>
        <div class="alarm fontColor">
          <div class="bottombg"></div>
          <div class="title" @click="alarmOpenClick(null)">告警信息</div>
          <div class="alarmNo" v-show="pendingAlarmData.length == 0">
            <div>无待处理告警</div>
          </div>
          <div v-show="pendingAlarmData.length > 0" class="data">
            <vue3-seamless-scroll
              class="scroll"
              :list="pendingAlarmData"
              :hover="true"
              :limitScrollNum="13"
              :isWatch="true"
              :step="0.5"
            >
              <div
                @click="alarmOpenClick(item)"
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
      </div>
    </a-spin>
    <a-modal
      v-model:open="alarmOpen"
      title=""
      :closable="false"
      :footer="null"
      wrapClassName="zssssssssssssss"
      width="84%"
      @cancel="closeAlarmOpen"
    >
      <div class="alarmOpenContent fontColor">
        <div class="alarmList">
          <div class="title">告警列表</div>
          <div class="alarmListDetail">
            <div
              :class="{ fontColorSelect: item.id == selectedAlarm?.id }"
              @click="alarmOpenClick(item)"
              class="alarmWai_for"
              v-for="(item, i) in pendingAlarmData"
              :key="i"
            >
              <div class="alarmWai_content">
                <div class="alarm_title">{{ item.title }}</div>
                <div class="alarm_time">{{ item.time }}</div>
              </div>
            </div>
          </div>
        </div>
        <div
          style="
            position: absolute;
            z-index: 2;
            top: 13px;
            right: -23px;
            width: 100px;
            color: rgb(255 255 255);
            cursor: pointer;
          "
        >
          <IconFontClass
            name="icon-baseui-guanbicuowu"
            @click="closeAlarmOpen"
            :style="{ fontSize: '30px' }"
          />
        </div>
        <div style="width: 30px"></div>
        <div class="alarmDetail">
          <div class="title">告警内容</div>
          <div class="alarmDetailContent">
            <div class="text">
              请注意，请注意，
              请注意，在科里巴至卡萨公里处出现落石，现场正在进行施工抢修工作，抢修施工预计的完成时间为2025.09.1815:30:00。
              请注意，请注意，
              请注意，在科里巴至卡萨公里处出现落石，现场正在进行施工抢修工作，抢修施工预计的完成时间为方法2025.09.1815:30:00
              请注意，请注意，
              请注意，在科里巴至卡萨公里处出现落石，现场正在进行施工抢修工作，抢修施工预计的完成时间为方法2025.09.1815:30:00
            </div>
            <div class="alarmSelectedContent">
              <a-radio-group size="small" v-model:value="alarmSelectedContent" button-style="solid">
                <a-radio-button value="0">视频</a-radio-button>
                <a-radio-button value="1">图片1</a-radio-button>
                <a-radio-button value="2">图片2</a-radio-button>
                <a-radio-button value="3">图片3</a-radio-button>
              </a-radio-group>
            </div>
            <div class="multimedia">
              <div v-show="alarmSelectedContent == '0'" class="video">
                <video-player
                  ref="playerRefAlarm"
                  class="video-player vjs-custom-theme"
                  :options="playerOptionsAlarm"
                  :language="currentLang"
                  @ready="onPlayerReadyAlarm"
                  @play="onPlayAlarm"
                  @pause="onPauseAlarm"
                  @ended="onEndedAlarm"
                  @error="onErrorAlarm"
                />
              </div>
              <div v-show="alarmSelectedContent != '0'" class="img">
                <img :src="selectedAlarm?.data[alarmSelectedContent]?.src" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
    <a-modal
      v-model:open="videoOpen"
      title=""
      :closable="false"
      :footer="null"
      wrapClassName="zssssssssssssss"
      width="84%"
      @cancel="closeVideoOpen"
    >
      <div class="videoOpenContent fontColor">
        <div class="videoList">
          <div class="title">视频线路列表</div>
          <div class="videoListDetail">
            <div
              :class="{ fontColorSelect: item.name == selectedVideo?.name }"
              @click="videoOpenClick(item)"
              class="videoWai_for"
              v-for="(item, i) in pendingVideoData"
              :key="i"
            >
              <div class="videoWai_content">
                <div class="video_title">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
        <div
          style="
            position: absolute;
            z-index: 2;
            top: 13px;
            right: -23px;
            width: 100px;
            color: rgb(255 255 255);
            cursor: pointer;
          "
        >
          <IconFontClass
            name="icon-baseui-guanbicuowu"
            @click="closeVideoOpen"
            :style="{ fontSize: '30px' }"
          />
        </div>
        <div style="width: 10px"></div>
        <div class="video">
          <video-player
            ref="playerRefVideo"
            class="video-player vjs-custom-theme"
            :options="playerOptionsVideo"
            :language="currentLang"
            @ready="onPlayerReadyVideo"
            @play="onPlayVideo"
            @pause="onPauseVideo"
            @ended="onEndedVideo"
            @error="onErrorVideo"
          />
        </div>
      </div>
    </a-modal>
  </MyContent>
</template>
<script setup lang="ts">
  import Carousel3D from './Carousel3D.vue';
  import {
    ref,
    reactive,
    createVNode,
    nextTick,
    watch,
    onMounted,
    onUnmounted,
    computed,
  } from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';
  import { useECharts } from '@/hooks/web/useECharts';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.marker.slideto';
  import 'leaflet-rotate';
  import { VideoPlayer } from '@videojs-player/vue';
  import 'video.js/dist/video-js.css';
  import videojs from 'video.js';
  import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
  import { message } from 'ant-design-vue';

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
  const alarmOpen = ref(false);
  const alarmSelectedContent = ref('0');

  //待处理告警数据
  const pendingAlarmData = ref([
    {
      id: 166,
      title: '1距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 1,
      title: '2距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 2,
      title: '3距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 3,
      title: '4距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 4,
      title: '5距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 5,
      title: '6距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 6,
      title: '7距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 7,
      title: '8距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 8,
      title: '9距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 9,
      title: '10距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 10,
      title: '11距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 11,
      title: '6距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 12,
      title: '12距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 13,
      title: '13距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 14,
      title: '14距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 15,
      title: '15距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 16,
      title: '16距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 14,
      title: '14距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 15,
      title: '15距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 16,
      title: '16距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 14,
      title: '14距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 15,
      title: '15距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 16,
      title: '16距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 14,
      title: '14距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 15,
      title: '15距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
    {
      id: 30,
      title: '30距离马瑞巴亚港100公里发生告警',
      content: '具体告警内容',
      time: '2025.10.14 15:20:15',
      data: [
        { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
        { dateType: 'img', src: '@/assets/images/largeScreen/9OvS3Pyr.jpg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/222.jpeg' },
        { dateType: 'img', src: '@/assets/images/largeScreen/huoche.png' },
      ],
    },
  ]);
  const selectedAlarm = ref({
    id: 1,
    title: '1距离马瑞巴亚港100公里发生告警',
    content: '具体告警内容',
    time: '2025.10.14 15:20:15',
    data: [
      { dateType: 'video', src: 'http://vjs.zencdn.net/v/oceans.mp4' },
      { dateType: 'img', src: 'src/assets/images/largeScreen/9OvS3Pyr.jpg' },
      { dateType: 'img', src: 'src/assets/images/largeScreen/222.jpeg' },
      { dateType: 'img', src: 'src/assets/images/largeScreen/huoche.png' },
    ],
  });

  const videoOpen = ref(false);
  const pendingVideoData = ref([
    {
      name: '马西线路1',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路2',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路3',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路4',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路5',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路6',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路7',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路8',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路9',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路10',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路11',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路12',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路13',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路14',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路15',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路16',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路17',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    {
      name: '马西线路18',
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
  ]);
  const selectedVideo = ref({
    name: '马西线路1',
    type: 'application/x-mpegURL',
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  });

  function alarmOpenClick(item) {
    if (!item) {
      if (pendingAlarmData.value.length <= 0) {
        message.info('不存在告警');
      } else {
        selectedAlarm.value = pendingAlarmData.value[0];
      }
    } else {
      selectedAlarm.value = item;
    }
    alarmOpen.value = true;
  }

  function videoOpenClick(item) {
    if (!item) {
      if (pendingVideoData.value.length <= 0) {
        message.info('不存在视频列表');
      } else {
        selectedVideo.value = pendingVideoData.value[0];
      }
    } else {
      selectedVideo.value = item;
    }
    videoOpen.value = true;
  }

  // 初始地图状态（默认缩放8级）
  const initialMapState = {
    center: [11.5, -10.7],
    zoom: 6.7, // 默认加载8级缩放
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
    const showStationName = zoomLevel >= 6.7;
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

  function initMap() {
    // 初始化地图
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
      map.flyTo(initialMapState.center, initialMapState.zoom, {
        duration: 2,
        easeLinearity: 0.2,
      });
    }, 500);

    // 绑定事件
    bindMapEvents();
    // 初始化时根据缩放级别设置所有标签状态
    updateAllMarkersVisibility(map.getZoom());
  }

  //视频
  const isMuted = ref(true); // 初始静音（满足浏览器自动播放条件）
  // Video.js 播放器多语言配置
  const videojsLanguages = {
    'zh-CN': {
      Play: '播放',
      Pause: '暂停',
      Mute: '静音',
      Unmute: '取消静音',
      Fullscreen: '全屏',
      'Exit Fullscreen': '退出全屏',
      'Picture-in-Picture': '画中画',
      'Exit Picture-in-Picture': '退出画中画',
      'Playback Rate': '播放速度',
      Subtitles: '字幕',
      'subtitles off': '关闭字幕',
      Quality: '质量',
      'Live Broadcast': '直播',
      Loaded: '已加载',
      Progress: '进度',
      'Progress Bar': '进度条',
      'volume level': '音量级别',
      'Use Up/Down Arrow keys to increase or decrease volume.': '使用上下方向键调节音量',
      'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.':
        '使用左右方向键前进一秒，上下方向键前进十秒',
    },
    en: {
      // 英语使用默认值
    },
    fr: {
      Play: 'Lecture',
      Pause: 'Pause',
      Mute: 'Muet',
      Unmute: 'Son activé',
      Fullscreen: 'Plein écran',
      'Exit Fullscreen': 'Fenêtré',
      'Picture-in-Picture': "Image dans l'image",
      'Exit Picture-in-Picture': "Quitter l'image dans l'image",
      'Playback Rate': 'Vitesse de lecture',
      Subtitles: 'Sous-titres',
      'subtitles off': 'Sous-titres désactivés',
      Quality: 'Qualité',
      'Live Broadcast': 'Diffusion en direct',
      Loaded: 'Chargé',
      Progress: 'Progression',
      'Progress Bar': 'Barre de progression',
      'volume level': 'niveau du volume',
      'Use Up/Down Arrow keys to increase or decrease volume.':
        'Utilisez les touches fléchées haut/bas pour augmenter ou diminuer le volume.',
      'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.':
        "Utilisez les touches fléchées gauche/droite pour avancer d'une seconde, haut/bas pour avancer de dix secondes.",
    },
  };

  // 小窗口视频
  const currentLang = ref('zh-CN');
  const currentSourceMin = ref('video');
  const playerRefMin = ref();
  const playerStatusMin = ref('ready');

  //告警视频
  const playerRefAlarm = ref();
  const playerStatusAlarm = ref('ready');

  //监控视频
  const playerRefVideo = ref();
  const playerStatusVideo = ref('ready');

  // 视频源配置
  const videoSources = {
    video: {
      type: 'video/mp4',
      src: 'https://vjs.zencdn.net/v/oceans.mp4',
      poster: 'https://vjs.zencdn.net/v/oceans.png',
    },
    live: {
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
    customLive: {
      type: 'application/x-mpegURL',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
  };

  // 播放器配置
  const playerOptionsMin = computed(() => ({
    autoplay: true,
    controls: false,
    responsive: true,
    fluid: true,
    liveui: currentSourceMin.value !== 'video', // 直播模式启用实时控件
    fill: true,
    muted: isMuted.value,
    sources: [videoSources[currentSourceMin.value]],
    poster: currentSourceMin.value === 'video' ? videoSources.video.poster : undefined,
    userActions: {
      hotkeys: true,
    },
    html5: {
      vhs: {
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        overrideNative: true,
      },
    },
    controlBar: {
      children: [
        'playToggle',
        'volumePanel',
        'currentTimeDisplay',
        'timeDivider',
        'durationDisplay',
        'progressControl',
        'liveDisplay',
        'remainingTimeDisplay',
        'playbackRateMenuButton',
        'fullscreenToggle',
      ],
    },
  }));

  const changeLanguage = (lang) => {
    currentLang.value = lang;
    if (playerRefMin.value?.player) {
      playerRefMin.value.player.language(lang);
    }
  };

  const changeSource = (source) => {
    currentSourceMin.value = source;
    playerStatusMin.value = 'ready';
  };

  // 播放器事件处理
  const onPlayerReadyMin = (player) => {
    console.log('播放器准备就绪');
    // 注册所有语言
    Object.keys(videojsLanguages).forEach((lang) => {
      videojs.addLanguage(lang, videojsLanguages[lang]);
    });
    playerStatusMin.value = 'ready';
  };

  // 新增：重播视频核心逻辑（重置进度 + 播放）
  const replayVideo = (player) => {
    if (!player) return;
    player.currentTime(0); // 重置播放进度到开头
    player.play(); // 重新播放
    playerStatusMin.value = 'playing';
  };
  const onPlayMin = () => {
    playerStatusMin.value = 'playing';
    console.log('开始播放');
  };

  const onPauseMin = () => {
    playerStatusMin.value = 'paused';
    console.log('播放暂停');
  };

  const onEndedMin = () => {
    playerStatusMin.value = 'ended';
    console.log('播放结束');
    replayVideo(playerRefMin.value?.player);
  };

  const onErrorMin = (error) => {
    playerStatusMin.value = 'error';
    console.error('播放器错误:', error);
  };

  // 监听视频源变化
  watch(currentSourceMin, (newSource) => {
    if (playerRefMin.value?.player) {
      const player = playerRefMin.value.player;
      player.src(videoSources[newSource]);
      playerStatusMin.value = 'ready';
    }
  });

  function closeAlarmOpen() {
    alarmOpen.value = false;
    debugger;
    if (playerRefAlarm.value) {
      playerRefAlarm.value.player.dispose();
    }
  }

  // 播放器配置
  const playerOptionsAlarm = computed(() => ({
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    liveui: currentSourceMin.value !== 'video', // 直播模式启用实时控件
    fill: true,
    muted: isMuted.value,
    sources: [videoSources[currentSourceMin.value]],
    poster: currentSourceMin.value === 'video' ? videoSources.video.poster : undefined,
    userActions: {
      hotkeys: true,
    },
    html5: {
      vhs: {
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        overrideNative: true,
      },
    },
    controlBar: {
      children: [
        'playToggle',
        'volumePanel',
        'currentTimeDisplay',
        'timeDivider',
        'durationDisplay',
        'progressControl',
        'liveDisplay',
        'remainingTimeDisplay',
        'playbackRateMenuButton',
        'fullscreenToggle',
      ],
    },
  }));

  // 播放器事件处理
  const onPlayerReadyAlarm = (player) => {
    console.log('播放器准备就绪');
    // 注册所有语言
    Object.keys(videojsLanguages).forEach((lang) => {
      videojs.addLanguage(lang, videojsLanguages[lang]);
    });
    playerStatusMin.value = 'ready';
  };

  const onPlayAlarm = () => {
    playerStatusAlarm.value = 'playing';
    console.log('开始播放');
  };

  const onPauseAlarm = () => {
    playerStatusAlarm.value = 'paused';
    console.log('播放暂停');
  };

  const onEndedAlarm = () => {
    playerStatusAlarm.value = 'ended';
    console.log('播放结束');
    replayVideo(playerRefAlarm.value?.player);
  };

  const onErrorAlarm = (error) => {
    playerStatusAlarm.value = 'error';
    console.error('播放器错误:', error);
  };

  // 监听视频源变化
  watch(selectedAlarm, (newSource) => {
    if (playerRefAlarm.value?.player) {
      const player = playerRefAlarm.value.player;
      player.src(videoSources[newSource]);
      playerStatusAlarm.value = 'ready';
    }
  });

  function closeVideoOpen() {
    videoOpen.value = false;
    debugger;
    if (playerRefVideo.value) {
      playerRefVideo.value.player.dispose();
    }
  }

  // 播放器配置
  const playerOptionsVideo = computed(() => ({
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    liveui: currentSourceMin.value !== 'video', // 直播模式启用实时控件
    fill: true,
    muted: isMuted.value,
    sources: [videoSources[currentSourceMin.value]],
    poster: currentSourceMin.value === 'video' ? videoSources.video.poster : undefined,
    userActions: {
      hotkeys: true,
    },
    html5: {
      vhs: {
        enableLowInitialPlaylist: true,
        smoothQualityChange: true,
        overrideNative: true,
      },
    },
    controlBar: {
      children: [
        'playToggle',
        'volumePanel',
        'currentTimeDisplay',
        'timeDivider',
        'durationDisplay',
        'progressControl',
        'liveDisplay',
        'remainingTimeDisplay',
        'playbackRateMenuButton',
        'fullscreenToggle',
      ],
    },
  }));

  // 播放器事件处理
  const onPlayerReadyVideo = (player) => {
    console.log('播放器准备就绪');
    // 注册所有语言
    Object.keys(videojsLanguages).forEach((lang) => {
      videojs.addLanguage(lang, videojsLanguages[lang]);
    });
    playerStatusVideo.value = 'ready';
  };

  const onPlayVideo = () => {
    playerStatusVideo.value = 'playing';
    console.log('开始播放');
  };

  const onPauseVideo = () => {
    playerStatusVideo.value = 'paused';
    console.log('播放暂停');
  };

  const onEndedVideo = () => {
    playerStatusVideo.value = 'ended';
    console.log('播放结束');
    replayVideo(playerRefVideo.value?.player);
  };

  const onErrorVideo = (error) => {
    playerStatusVideo.value = 'error';
    console.error('播放器错误:', error);
  };

  // 监听视频源变化
  watch(selectedVideo, (newSource) => {
    if (playerRefVideo.value?.player) {
      const player = playerRefVideo.value.player;
      player.src(videoSources[newSource]);
      playerStatusplayerRefVideo.value = 'ready';
    }
  });

  onUnmounted(() => {
    console.log('播放器卸载');
    if (playerRefMin.value?.player) {
      playerRefMin.value.player.dispose();
    }
    if (playerRefAlarm.value?.player) {
      playerRefAlarm.value.player.dispose();
    }
    if (playerRefMonitor.value?.player) {
      playerRefMonitor.value.player.dispose();
    }
  });

  //服务状态
  const carouselData = ref([
    {
      imgUrl: 'https://picsum.photos/id/1/300/200',
      title: '马瑞巴亚港',
      alt: '第1张',
      bColor: '#D7D7D7',
    },
    { imgUrl: 'https://picsum.photos/id/2/300/200', title: '穆萨亚', alt: '第2张', bColor: 'red' },
    {
      imgUrl: 'https://picsum.photos/id/3/300/200',
      title: '科里巴',
      alt: '第3张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/4/300/200',
      title: '乌尔卡巴',
      alt: '第4张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/5/300/200',
      title: '蒙加塔',
      alt: '第5张',
      bColor: 'yellow',
    },
    {
      imgUrl: 'https://picsum.photos/id/6/300/200',
      title: '法拉纳',
      alt: '第6张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/7/300/200',
      title: '杜瓦科',
      alt: '第7张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/8/300/200',
      title: '尼 亚林科',
      alt: '第8张',
      bColor: '#D7D7D7',
    },
    {
      imgUrl: 'https://picsum.photos/id/9/300/200',
      title: '迪安库亚',
      alt: '第9张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/10/300/200',
      title: '凯鲁阿内',
      alt: '第10张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/1/300/200',
      title: '西芒杜矿山',
      alt: '第1张',
      bColor: 'red',
    },
    {
      imgUrl: 'https://picsum.photos/id/2/300/200',
      title: '辛铁矿',
      alt: '第2张',
      bColor: 'yellow',
    },
    {
      imgUrl: 'https://picsum.photos/id/3/300/200',
      title: '线路所',
      alt: '第3张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/4/300/200',
      title: 'siding1',
      alt: '第4张',
      bColor: 'green',
    },
    {
      imgUrl: 'https://picsum.photos/id/5/300/200',
      title: 'siding2',
      alt: '第5张',
      bColor: '#D7D7D7',
    },
    {
      imgUrl: 'https://picsum.photos/id/6/300/200',
      title: 'siding3',
      alt: '第6张',
      bColor: 'yellow',
    },
    {
      imgUrl: 'https://picsum.photos/id/7/300/200',
      title: 'siding4',
      alt: '第7张',
      bColor: '#D7D7D7',
    },
    {
      imgUrl: 'https://picsum.photos/id/8/300/200',
      title: 'siding5',
      alt: '第8张',
      bColor: 'yellow',
    },
  ]);

  //机车图表
  function setCirChart() {
    try {
      const option = {
        backgroundColor: '#031939',
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '10',
          top: '60',
          containLabel: true,
        },
        legend: {
          data: ['左侧', '站内', '右侧'],
          right: 10,
          top: 12,
          textStyle: {
            color: '#fff',
          },
          itemWidth: 12,
          itemHeight: 10,
          // itemGap: 35
        },
        xAxis: {
          type: 'category',
          data: [
            '马瑞巴亚港',
            '穆萨亚',
            '科里巴',
            '卡萨',
            '乌尔卡巴',
            '蒙加塔',
            '法拉纳',
            '杜瓦科',
          ],
          axisLabel: {
            textStyle: {
              color: '#fff',
              fontStyle: 'normal',
              fontSize: 14,
            },
          },
          axisLine: {
            //坐标轴轴线相关设置
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
            show: true,
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
            end: 35,
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
            data: [10, 20, 50, 10, 30, 40, 10, 20, 40],
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
            data: [30, 40, 20, 10, 20, 30, 40, 50, 60],
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
            data: [30, 40, 20, 30, 10, 20, 10, 20, 30],
          },
        ],
      };
      chartJiCir.setOptions(option, true);
    } catch (error) {
      console.error(error);
    }
  }

  //手持图表
  function setHandChart() {
    try {
      const option = {
        backgroundColor: '#031939',
        title: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '10',
          top: '60',
          containLabel: true,
        },
        legend: {
          data: ['左侧', '站内', '右侧'],
          right: 10,
          top: 12,
          textStyle: {
            color: '#fff',
          },
          itemWidth: 12,
          itemHeight: 10,
          // itemGap: 35
        },
        xAxis: {
          type: 'category',
          data: [
            '马瑞巴亚港',
            '穆萨亚',
            '科里巴',
            '卡萨',
            '乌尔卡巴',
            '蒙加塔',
            '法拉纳',
            '杜瓦科',
          ],
          axisLabel: {
            textStyle: {
              color: '#fff',
              fontStyle: 'normal',
              fontSize: 14,
            },
          },
          axisLine: {
            //坐标轴轴线相关设置
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
            show: true,
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
            end: 35,
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
            data: [10, 20, 50, 10, 30, 40, 10, 20, 40],
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
            data: [30, 40, 20, 10, 20, 30, 40, 50, 60],
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
            data: [30, 40, 20, 30, 10, 20, 10, 20, 30],
          },
        ],
      };
      chartHand.setOptions(option, true);
    } catch (error) {
      console.error(error);
    }
  }

  onMounted(() => {
    setCirChart();
    setHandChart();
    initMap();
  });
</script>
<style lang="less" scoped>
  :deep(.ant-modal .ant-modal-content) {
    padding: 0;
    background-color: #3498db !important;
  }
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
      width: 16.15%;
      min-width: 310px;
      height: 14.59%;
      min-height: 136px;
      background-image: url('@/assets/images/largeScreen/xbj7.png');
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
        margin-top: 8px;
        margin-left: 12px;
        gap: 10px;

        > div {
          width: 90px;
          height: 90px;
          background-image: url('@/assets/images/largeScreen/xbj3.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;

          > div {
            width: 90%;
            margin-top: 36px;
            margin-left: 5px;
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
      left: 4px;
      width: 16.15%;
      min-width: 310px;
      height: 14.59%;
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
      top: 25%;
      left: 4px;
      width: 24.1%;
      min-width: 386px;
      height: 32.15%;
      min-height: 250px;
      background-image: url('@/assets/images/largeScreen/xbj_12.png');
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
      top: 59%;
    }

    .video {
      position: absolute;
      top: 25%;
      right: 4px;
      width: 24.1%;
      min-width: 386px;
      height: 32.15%;
      min-height: 250px;
      background-image: url('@/assets/images/largeScreen/xbj_1_1.png');
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

      .data {
        width: 85%;
        height: 75%;
        margin-top: 6%;
        margin-left: 7%;
      }

      .player-wrapper {
        position: relative;
        top: 9%;
        left: 4%;
        width: 91%;
        height: 76%;
      }

      :deep(.vjs-control-bar) {
        border-radius: 0 0 19px 19px !important;
      }

      .video-player {
        width: 100%;
        height: 100% !important;
        border-radius: 19px !important;
      }
    }

    .alarm {
      position: absolute;
      top: 59%;
      right: 4px;
      width: 24.1%;
      min-width: 386px;
      height: 32.15%;
      min-height: 250px;
      background-image: url('@/assets/images/largeScreen/xbj_1_1.png');
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
        align-items: center; /* 垂直居中 */
        justify-content: center; /* 水平居中 */
        width: 89%;
        height: 74%;
      }

      .data {
        width: 89%;
        height: 74%;
        margin-top: 6%;
        margin-left: 4%;
        overflow: hidden;
        cursor: pointer;
      }

      .alarmWai_content {
        display: flex;
        flex-direction: row;
        gap: 6px;
      }

      .alarm_title {
        width: 64%;
        overflow: hidden; /* 隐藏超出容器的文本 */
        font-size: 13px;
        font-weight: 600;
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        white-space: nowrap; /* 防止文本换行 */
      }

      .alarm_time {
        width: 35%;
        overflow: hidden; /* 隐藏超出容器的文本 */
        font-size: 13px;
        font-weight: 600;
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        white-space: nowrap; /* 防止文本换行 */
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
    display: flex;
    position: absolute;
    z-index: 1000;
    bottom: 20px;
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
<style lang="less">
  .fontColor {
    color: #08d4fc;
  }

  .fontColorSelect {
    color: #fff;
  }

  .zssssssssssssss > div {
    top: 55px;
    padding: 0;
  }

  .zssssssssssssss > div > div > div.ant-modal-content {
    padding: 0;
    // opacity: 0.9 !important;
    background-color: #125ed000 !important;
  }

  .alarmOpenContent {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 88vh;
    padding: 30px;
    padding-bottom: 45px;
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
          overflow: hidden; /* 隐藏超出容器的文本 */
          font-size: 13px;
          font-weight: 600;
          text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
          white-space: nowrap; /* 防止文本换行 */
        }

        .alarm_time {
          width: 140px;
          overflow: hidden; /* 隐藏超出容器的文本 */
          font-size: 13px;
          font-weight: 600;
          text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
          white-space: nowrap; /* 防止文本换行 */
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
        width: 100%;
        height: 100%;
        gap: 6px;

        .text {
          height: 16%;
          padding: 0 10px;
          overflow-y: auto;
          font-size: 20px;
          text-indent: 40px; /* 首行缩进20像素 */
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
            align-items: center; /* 垂直居中 */
            justify-content: center; /* 水平居中 */
            width: 100%;
            height: 100%;
            overflow: hidden;

            img {
              max-width: 800px;
              max-height: 400px;
            }

            .video-player {
              width: 100%;
              height: 100% !important;
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
    height: 88vh;
    padding: 30px;
    padding-bottom: 45px;
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
          overflow: hidden; /* 隐藏超出容器的文本 */
          font-size: 13px;
          font-weight: 600;
          text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
          white-space: nowrap; /* 防止文本换行 */
        }
      }
    }

    .video {
      width: 100%;
      height: 100%;
      padding: 24px;
      overflow: hidden;
      opacity: 1;

      .video-player {
        width: 100%;
        height: 100% !important;
      }
    }
  }

  .leaflet-control-container {
    display: none !important;
  }
</style>
