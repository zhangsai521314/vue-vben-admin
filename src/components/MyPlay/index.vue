<template>
  <div :class="`${prefixCls}`" ref="contentDomRef">
    <div style="width: 100%; height: 100%">
      <div ref="waveSurferTimeline" style="height: 30px; margin-top: 20px">
        <!--时间轴 -->
      </div>
      <div ref="playDomRef" style="width: 100%; background: #000"> </div>
      <div style="height: 44px; padding: 6px" :class="`${prefixCls}option`">
        <a-space :size="16">
          <AuthDom auth="myPlay_beisu">
            <label>{{ t('view.speedMultiple') }}：</label>
            <a-select
              v-model:value="selectDoubleSpeedPlay"
              :placeholder="t('view.playbackWithSpeedMultiplier')"
              @change="doublePlay"
              style="width: 80px"
            >
              <a-select-option :value="2.0">2.0X</a-select-option>
              <a-select-option :value="1.5">1.5X</a-select-option>
              <a-select-option :value="1.25">1.25X</a-select-option>
              <a-select-option :value="1">1.0X</a-select-option>
              <a-select-option :value="0.5">0.5X</a-select-option>
              <a-select-option :value="0.75">0.75X</a-select-option>
            </a-select>
          </AuthDom>
          <AuthDom auth="myPlay_yinliang">
            <a-space>
              <IconFontClass
                @click="mute"
                :name="isMute ? 'icon-baseui-jingyin01' : 'icon-baseui-yinliang'"
                :title="t('view.volumeLevel')"
              />
              <a-slider
                :class="`${prefixCls}slider`"
                v-model:value="volume"
                @change="setVolume"
                input-size="mini"
                style="width: 100px"
              />
            </a-space>
          </AuthDom>
          <AuthDom auth="myPlay_kuaitui">
            <IconFontClass
              @click="retreat"
              name="icon-baseui-kuaitui"
              :title="t('view.fastBackward')"
              @mousedown="retreatMousedown"
              @mouseout="retreatMouseout"
            />
          </AuthDom>
          <AuthDom auth="myPlay_bofang">
            <IconFontClass
              @click="clickPlay"
              :name="isPaly ? 'icon-baseui-zanting' : 'icon-baseui-bofang'"
              :title="t('view.playPause')"
            />
          </AuthDom>
          <AuthDom auth="myPlay_kuaijin">
            <IconFontClass
              @click="advance"
              name="icon-baseui-kuaijin"
              :title="t('view.fastForward')"
              @mousedown="retreatMousedown('advance')"
              @mouseout="retreatMouseout('advance')"
            />
          </AuthDom>
          <AuthDom auth="myPlay_refresh">
            <IconFontClass
              @click="replay"
              name="icon-baseui-refresh"
              :title="t('view.replayAgain')"
            />
          </AuthDom>
        </a-space>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, createVNode, nextTick, onMounted, watch, onUpdated } from 'vue';
  import WaveSurfer from 'wavesurfer.js';
  import Timeline from 'wavesurfer.js/dist/plugins/timeline';
  import { tryOnUnmounted } from '@vueuse/core';
  import { useDesign } from '@/hooks/web/useDesign';
  // import CursorPlugin from 'wavesurfer.js/dist/plugins/cursor';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();
  const { prefixCls } = useDesign('MyPlay-');
  // 播放倍速
  const selectDoubleSpeedPlay = ref(1.0);
  const playDomRef = ref(null);
  const waveSurferTimeline = ref(null);
  const contentDomRef = ref(null);
  let wavesurferOb;
  // 设置音量
  const volume = ref(100);
  const isPaly = ref(true);
  const isMute = ref(false);
  let timeId = null;

  // 后退，
  function retreat() {
    wavesurferOb?.skip(-3);
    retreatMouseout();
  }
  // 前进，
  function advance() {
    wavesurferOb.skip(3);
    retreatMouseout();
  }
  /* 播放时暂停,暂停时播放 */
  function clickPlay() {
    wavesurferOb.playPause();
    isPaly.value = !isPaly.value;
  }
  // 重放
  function replay() {
    wavesurferOb.stop();
    wavesurferOb.play();
  }
  // 设置音量：
  function setVolume(val) {
    wavesurferOb.setVolume(val / 100);
  }
  //静音|接触静音
  function mute() {
    isMute.value ? wavesurferOb.setVolume(volume.value / 100) : wavesurferOb.setVolume(0);
    isMute.value = !isMute.value;
  }
  //倍速播放
  function doublePlay(rate) {
    wavesurferOb.setPlaybackRate(rate);
  }

  function retreatMousedown(type) {
    timeId = setTimeout(() => {
      isPaly.value = false;
      wavesurferOb.pause();
      if (type == 'advance') {
        advance();
      } else {
        retreat();
      }
      isPaly.value = false;
      wavesurferOb.pause();
      retreatMousedown(type);
    }, 700);
  }
  function retreatMouseout() {
    isPaly.value = true;
    wavesurferOb.play();
    if (timeId != null) {
      clearTimeout(timeId);
    }
    timeId = null;
  }

  //页面卸载后
  tryOnUnmounted(() => {
    isPaly.value = false;
    if (wavesurferOb != null) {
      wavesurferOb.stop();
    }
  });

  defineExpose({
    //更改播放信息
    changePaly: (playData) => {
      isPaly.value = false;
      if (wavesurferOb == null) {
        nextTick(() => {
          // wavesurferOb = WaveSurfer.create({
          //   container: '#waveform',
          //   // 已播放波形的颜色
          //   // progressColor: "red",
          //   // 未播放波形的颜色
          //   waveColor: 'violet',
          //   // 波形图的高度，单位为px
          //   // height: 10,
          //   // 是否显示滚动条，默认为false
          //   // scrollParent: true,
          //   // 波形的振幅（高度），默认为1
          //   // barHeight: 0.8,
          //   // 波形条的圆角
          //   // barRadius: 2,
          //   // 波形条的宽度
          //   // barWidth: 1,
          //   // 波形条间的间距
          //   // barGap: 3
          //   // 播放进度光标条的颜色
          //   // cursorColor: "red",
          //   // 播放进度光标条的宽度，默认为1
          //   // cursorWidth: 10,
          //   // 播放进度颜色
          //   progressColor: 'blue',
          //   //  波形容器的背景颜色
          //   // backgroundColor: "yellow",
          //   // 音频的播放速度
          //   // audioRate: "1",
          //   // （与区域插件一起使用）启用所选区域的循环
          //   // loopSelection:false
          // });
          wavesurferOb = WaveSurfer.create({
            // 应该在其中绘制波形的CSS选择器或HTML元素。这是唯一必需的参数。
            container: playDomRef.value,
            height: contentDomRef.value.offsetHeight - 30 - 44,
            // 更改波形容器的背景颜色。
            backgroundColor: '#000000',
            backend: 'MediaElement',
            //走动指针线颜色
            cursorColor: 'red',
            //频率背景颜色
            waveColor: '#42d995',
            //走动颜色
            progressColor: '#42d995',
            // 音频播放时间轴
            mediaControls: false,
            // 播放音频的速度
            audioRate: 1,
            // 插件：此教程配置了光标插件和时间轴插件
            plugins: [
              // // 光标插件
              // CursorPlugin.create({
              //   showTime: true,
              //   opacity: 0,
              //   customShowTimeStyle: {
              //     'background-color': '#000',
              //     color: '#fff',
              //     padding: '2px',
              //     'font-size': '10px',
              //   },
              // }),
              // 时间轴插件
              Timeline.create({
                container: waveSurferTimeline.value,
              }),
            ],
          });
          wavesurferOb.on('ready', function (e) {
            //加载完成
            wavesurferOb.setVolume(volume.value / 100);
            isPaly.value = true;
            wavesurferOb.play(1);
          });
          wavesurferOb.on('finish', function (e) {
            isPaly.value = false;
          });
          wavesurferOb.on('error', function (e) {
            console.error(e);
          });
          wavesurferOb.on('interaction', function (e) {
            //点击波形图触发
            isPaly.value = true;
            wavesurferOb.play();
          });
          wavesurferOb.load(playData.src);
        });
      } else {
        wavesurferOb.stop();
        wavesurferOb.load(playData.src);
      }
    },
    //释放
    dispose: () => {
      if (wavesurferOb != null) {
        wavesurferOb.stop();
      }
      isPaly.value = false;
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-MyPlay-';

  .@{prefix-cls} {
    width: 100%;
    height: 100%;

    .@{prefix-cls}slider {
      // :deep(.ant-slider-track) {
      //   background-color: #f00; /* 红色背景 */
      // }

      :deep(.ant-slider-rail) {
        background-color: #ccc; /* 灰色背景 */
      }
    }

    .@{prefix-cls}option {
      i {
        font-size: 25px;
        cursor: pointer;
      }
    }
  }

  :deep(.el-input__inner) {
    border: 1px solid #797979;
    background-color: #363740;
    color: #aeafc8;
  }
</style>
