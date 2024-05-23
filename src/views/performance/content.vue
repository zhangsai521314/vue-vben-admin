<template>
  <div :class="`${prefixCls}content`" v-if="props.newDataInfo">
    <div>
      <div
        :class="{ 'content-echart': true, selectedChart: selectedMaxShowName == 'CPU' }"
        @click="changeMaxEchart('CPU')"
      >
        <echarts
          :isShowYX="false"
          :allData="cpuData"
          ref="cpuEchartRef"
          :class="`${prefixCls}min-echart`"
          color="#84C8DD"
        />
        <div>
          <div>
            <div :class="`${prefixCls}title`">CPU</div>
            <span> {{ props.newDataInfo.CpuUsage }}%</span>
          </div>
        </div>
      </div>
      <div
        :class="{ 'content-echart': true, selectedChart: selectedMaxShowName == '内存' }"
        @click="changeMaxEchart('内存')"
      >
        <echarts
          :isShowYX="false"
          :allData="memoryData"
          ref="memoryEchartRef"
          :class="`${prefixCls}min-echart`"
          color="#CB88DE"
        />
        <div>
          <div :class="`${prefixCls}title`">内存</div>
          <span> {{ props.newDataInfo.MemoryUsage }}%</span>
        </div>
      </div>
      <div
        :class="{
          'content-echart': true,
          selectedChart: selectedMaxShowName == `磁盘:${disk.DiskName}`,
        }"
        v-for="(disk, i) in props.newDataInfo.DiskList"
        :key="i"
        @click="changeMaxEchart(`磁盘:${disk.DiskName}`, i)"
      >
        <echarts
          :isShowYX="false"
          :allData="diskData[`a${i}`]"
          ref="diskEchartRefs"
          :class="`${prefixCls}min-echart`"
          color="#9ADC69"
        />
        <div>
          <div :class="`${prefixCls}title`">磁盘:{{ disk.DiskName }}</div>
          <span>{{ disk.DiskUsage }}% </span>
        </div>
      </div>
    </div>
    <div :class="`${prefixCls}div-max`">
      <div :class="`${prefixCls}div-max-title`">
        <div>{{ props.name }}</div>
        <div>%{{ selectedMaxShowName }}使用率</div>
      </div>
      <echarts
        :isShowYX="true"
        :allData="echartsAllData"
        :class="`${prefixCls}div-max-echart`"
        :color="
          selectedMaxShowName == 'CPU'
            ? '#84C8DD'
            : selectedMaxShowName == '内存'
              ? '#CB88DE'
              : '#9ADC69'
        "
      />
    </div>
  </div>
  <div :class="`${prefixCls}content`" v-else style="position: relative">
    <div style="position: absolute; margin-left: 4px; font-size: 24px">{{ props.name }}</div>
    <IconFontClass
      name="icon-baseui-zanwuneirong"
      :isSvg="true"
      title="暂无数据"
      style="margin: 0 auto; font-size: 176px"
    />
  </div>
</template>
<script setup>
  import echarts from './echarts.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { ref, reactive, watch } from 'vue';
  import dayjs from 'dayjs';

  const props = defineProps({
    //最新数据
    newDataInfo: {
      type: Object,
      default() {
        return null;
      },
    },
    //名称
    name: {
      type: String,
      default() {
        return '';
      },
    },
  });
  const { prefixCls } = useDesign('performance-content-');
  const cpuEchartRef = ref();
  const memoryEchartRef = ref();
  const diskEchartRefs = ref([]);

  const selectedMaxShowName = ref('CPU');
  let diskIndex = 0;

  //大echarts的数据
  const echartsAllData = ref([]);
  const cpuData = ref([]);
  const memoryData = ref([]);
  const diskData = reactive({});

  //改变大的图表显示
  function changeMaxEchart(name, di) {
    selectedMaxShowName.value = name;
    if (name == 'CPU') {
      echartsAllData.value = cpuData.value;
    } else if (name == '内存') {
      echartsAllData.value = memoryData.value;
    } else {
      echartsAllData.value = diskData[`a${di}`];
      diskIndex = di;
    }
  }

  watch(
    () => props.newDataInfo,
    () => {
      if (props.newDataInfo) {
        if (cpuData.value.length > 100) {
          cpuData.value.shift();
        }
        cpuData.value.push([
          dayjs(props.newDataInfo.DataTime).format('YYYY-MM-DD HH:mm:ss'),
          props.newDataInfo.CpuUsage,
        ]);
        if (memoryData.value.length > 100) {
          memoryData.value.shift();
        }
        memoryData.value.push([
          dayjs(props.newDataInfo.DataTime).format('YYYY-MM-DD HH:mm:ss'),
          props.newDataInfo.MemoryUsage,
        ]);
        props.newDataInfo.DiskList.forEach((m, i) => {
          if (!diskData[`a${i}`]) {
            diskData[`a${i}`] = [];
          }
          if (diskData[`a${i}`].length > 100) {
            diskData[`a${i}`].shift();
          }
          diskData[`a${i}`].push([
            dayjs(props.newDataInfo.DataTime).format('YYYY-MM-DD HH:mm:ss'),
            m.DiskUsage,
          ]);
        });
        changeMaxEchart(selectedMaxShowName.value, diskIndex);
      }
    },
    { deep: true, immediate: true },
  );
</script>
<style lang="less" scoped>
  @prefixCls: ~'@{namespace}-performance-content-';

  .@{prefixCls}content {
    display: flex;
    width: 100%;
    height: 100%;
    user-select: none;

    .@{prefixCls}min-echart {
      width: 180px;
      height: 70px;
      padding: 6px;
    }
    .@{prefixCls}div-max {
      position: relative;
      flex-grow: 1;

      .@{prefixCls}div-max-title {
        position: absolute;
        z-index: 2;
        left: 10px;

        > div:first-child {
          font-size: 24px;
        }

        > div:last-child {
          margin-top: 4px;
        }
      }

      .@{prefixCls}div-max-echart {
        width: 100%;
        height: 100%;
      }
    }

    .content-echart {
      display: flex;
      flex-direction: row;
      margin: 5px 0;
      transition-duration: 0.5s;
      // background-color: #e5f3fb;
      cursor: pointer;
      .@{prefixCls}title {
        font-size: 15px;
      }
    }

    .content-echart:hover {
      // background-color: #e5f3fb;
      box-shadow: 0 3px 3px #c8c8c8;
      cursor: pointer;
    }

    .selectedChart {
      background-color: #e5f3fb;
    }
  }
</style>
