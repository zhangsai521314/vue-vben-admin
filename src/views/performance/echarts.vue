<template>
  <div :class="prefixCls" ref="chartRef"></div>
</template>
<script setup>
  import { useDesign } from '@/hooks/web/useDesign';
  import { ref, onMounted, watch } from 'vue';
  import { useECharts } from '@/hooks/web/useECharts';
  import dayjs from 'dayjs';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLocaleStore } from '@/store/modules/locale';

  const { t } = useI18n();
  const localeStore = useLocaleStore();
  const locale = localeStore.getLocale;
  const props = defineProps({
    //全部数据，直接更新
    allData: {
      type: Array,
      default() {
        return null;
      },
    },
    //是否显示y轴和x轴
    isShowYX: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //颜色
    color: {
      type: String,
      default() {
        return '';
      },
    },
  });
  const chartRef = ref(null);
  const { prefixCls } = useDesign('performance-charts-');
  const { getInstance, resize, setOptions, echarts } = useECharts(chartRef);
  //渲染图表
  function getOption() {
    return {
      // backgroundColor: '#fff',
      // grid: [
      //   {
      //     top: '50',
      //     bottom: '40',
      //     // left: "2%",
      //     // right: "30",
      //   },
      // ],
      tooltip: {
        trigger: 'axis',
        // show: false,
      },
      title: {
        // align: 'left',
        // left: '6%',
        // text: 'CPU',
        // subtext: '使用率',
        show: false,
      },
      xAxis: {
        // type: 'time',
        show: props.isShowYX,
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          formatter: function (parm) {
            let time = dayjs(parm).format('YYYY-MM-DD HH:mm:ss');
            if (time.indexOf(' ' != -1)) {
              return time.substring(5, 10) + '\r\n' + time.substring(10, parm.length);
            }
            return time;
          },
        },
      },
      yAxis: {
        show: props.isShowYX,
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value} %',
        },
      },
      series: [
        {
          type: 'line',
          symbol: 'none',
          areaStyle: {},
          data: props.allData ? props.allData : [],
          color: props.color,
          // smooth: 0.2,
        },
      ],
    };
  }

  //更新图表
  function upChart() {
    getInstance().setOption(getOption(), true);
    resize();
  }

  onMounted(() => {
    upChart();
  });

  //监控父级改变
  watch(
    () => props.allData,
    () => {
      upChart();
    },
    { deep: true },
  );

  defineExpose({
    getInstance,
    resize,
    echarts,
    setOptions,
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-performance-charts-';

  .@{prefix-cls} {
    width: 100%;
    height: 100%;
  }
</style>
