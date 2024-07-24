<template>
  <line_1
    v-if="options.chartType == 'line_1'"
    :class="prefixCls"
    ref="chartRef"
    :chartOption="props.chartOption"
    :options="options"
    :dataInfo="dataInfo"
    :filterData="filterData"
    :filterDataNull="filterDataNull"
  />
  <bar_1
    v-else-if="options.chartType == 'bar_1'"
    :class="prefixCls"
    ref="chartRef"
    :chartOption="props.chartOption"
    :options="options"
    :dataInfo="dataInfo"
    :filterData="filterData"
    :filterDataNull="filterDataNull"
  />
  <bar_2
    v-else-if="options.chartType == 'bar_2'"
    :class="prefixCls"
    ref="chartRef"
    :chartOption="props.chartOption"
    :options="options"
    :dataInfo="dataInfo"
    :filterData="filterData"
    :filterDataNull="filterDataNull"
  />
  <yewei_1
    v-else-if="options.chartType == 'yewei_1'"
    :class="prefixCls"
    ref="chartRef"
    :chartOption="props.chartOption"
    :options="options"
    :dataInfo="dataInfo"
    :filterData="filterData"
    :filterDataNull="filterDataNull"
  />
  <pie_1
    v-else-if="options.chartType == 'pie_1'"
    :class="prefixCls"
    ref="chartRef"
    :chartOption="props.chartOption"
    :options="options"
    :dataInfo="dataInfo"
    :filterData="filterData"
    :filterDataNull="filterDataNull"
  />
  <yibiao_1
    v-else-if="options.chartType == 'yibiao_1'"
    :class="prefixCls"
    ref="chartRef"
    :chartOption="props.chartOption"
    :options="options"
    :dataInfo="dataInfo"
    :filterData="filterData"
    :filterDataNull="filterDataNull"
  />
  <jindu_1
    v-else-if="options.chartType == 'jindu_1'"
    :class="prefixCls"
    ref="chartRef"
    :chartOption="props.chartOption"
    :options="options"
    :dataInfo="dataInfo"
    :filterData="filterData"
    :filterDataNull="filterDataNull"
  />
</template>
<script setup>
  import line_1 from './src/line_1.vue';
  import bar_1 from './src/bar_1.vue';
  import bar_2 from './src/bar_2.vue';
  import yewei_1 from './src/yewei_1.vue';
  import pie_1 from './src/pie_1.vue';
  import yibiao_1 from './src/yibiao_1.vue';
  import jindu_1 from './src/jindu_1.vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import { ref, onMounted, watch, unref } from 'vue';
  import commonApi from '@/api/common';
  import dayjs from 'dayjs';
  //定时器
  import { useUnmount } from '@/hooks/core/useTime_';

  const { prefixCls } = useDesign('charts');
  const props = defineProps({
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    dataInfo: {
      type: Object,
      default() {
        //source数据,tagInfos数据库现有tag信息，用于替换存储的旧tag信息
        return { source: [], tags: [] };
      },
    },
    //使用纯echat的配置。options和dataInfo就别传了
    chartOption: {
      type: Object,
      default() {
        return null;
      },
    },
    //是否加载真实数据
    isFormalSource: {
      type: Boolean,
      default() {
        return false;
      },
    },
    //是否支持本页代码获取数据，20221010新加
    isGetSource: {
      type: Boolean,
      default() {
        return false;
      },
    },
  });
  const options = ref({
    tagCount: 'multiple', //tag数量:single、multiple
    getSourceUrl: '/Data/GetDataHistory', //获取数据的地址
    chartType: 'line_1', //图表类型 line(单Y轴折线图)/ bar(单Y轴的柱状图)
    showTitle: true, //是否显示标题
    title: '演示数据', //图表的标题
    showLegend: true, //是否显示图例
    legendColor: '#333333', //图例颜色
    timeFrequency: 4, //查询数据的默认时间间隔
    timeInterval: 'h', //查询数据的默认时间间隔类型
    isRefresh: true, //是否刷新数据
    refreshFrequency: 5, //刷新的时间频率
    refreshInterval: 's', //刷新数据时间类型:s(秒)，m(分)
    rangeMin: '', //量程最小值
    rangeMax: '', //量程最大值
    alarmValue: '', //报警值
    alarmColor: '', //报警线的色
    warningValue: '', //预警值
    warningColor: '', //预警线的颜色
    dColor: '#ffffff', //底色
    tColor: '#42B8FA', //顶色
    bkcolor: '', //边框色
    yuanHuanColor: '', //圆环色
    fillColor: '', //填充色
    backgroundColor: '', //背景色
    titleColor: '#333333', //标题的颜色
    gradientColorStart: '#1badf9', //渐变色初始色
    gradientColorEnd: '#03fcfe', //渐变色结束色
    borderColor: '#ffffff', //边框颜色
    showXSplitLine: false, //x轴是否显示分割线
    xAxisLineColor: '#768b9b', //x轴线颜色
    xSplitLineColor: '#768b9b', //x轴分割线颜色
    xAxisLabelColor: '#768b9b', //x轴刻度色
    showYSplitLine: true, //y轴是否显示分割线
    yAxisLineColor: '#768b9b', //y轴线颜色
    ySplitLineColor: '#768b9b', //y轴分割线颜色
    yAxisLabelColor: '#768b9b', //y轴刻度色
    progressType: 'number', //进度值显示的方式：数值(number)、百分比(%)
    renderType: '2d', //渲染方式2d和3d
    render_3d: function (option) {
      //3d图表渲染
    },
    updateRender_3d: function (data) {
      //3d图表数据更新
    },
    chartServiseClick: function name(params, chart) {
      //图表上的数据点的点击
    },
  });
  const chartRef = ref(null);
  const dataInfo = ref({
    source: [],
    tags: [
      //{//数据点集合
      //    tagid: "", //数据点id
      //    tagname:"",//名称
      //    filtermin: null, //过滤最小值
      //    filtermax: null, //过滤最大值
      //    color: ""//颜色
      //    tagunit:"",//单位
      //    tagquantiles: node.tagquantiles//小数位
      //}
    ],
  });
  //图表最后的数据时间
  let lastSourceTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const timeKey = `MyEcharts_${myCommon.uniqueId()}`;

  //获取数据
  function getData() {
    if (props.isGetSource) {
      if (props.isFormalSource) {
        getSource();
      } else {
        getDemoSource();
      }
    } else {
      dataInfo.value = props.dataInfo;
    }
  }

  //获取演示数据
  function getDemoSource() {
    const data = [];
    switch (props.options.chartType) {
      case 'line_1':
      case 'bar_1':
      case 'zhexiantu3d':
      case 'zhuzhuang3d':
        for (var i = 31; i > 0; i--) {
          var rr = myCommon.getRandomNumber(1, 5);
          if (props.dataInfo.tags.length > 0) {
            const d = { tagtime: dayjs().subtract(i, 'd').format('YYYY-MM-DD') };
            props.dataInfo.tags.forEach((tag) => {
              d[tag.tagid] = myCommon.getRandomNumber(rr * 2, (rr + 1) * 10);
            });
            data.push(d);
          } else {
            data.push({
              tagtime: dayjs().subtract(i, 'd').format('YYYY-MM-DD'),
              a: myCommon.getRandomNumber(rr * 2, (rr + 1) * 10),
              b: myCommon.getRandomNumber(rr * 2, (rr + 1) * 10),
              c: myCommon.getRandomNumber(rr * 2, (rr + 1) * 10),
            });
          }
        }
        break;
      case 'bar_2':
      case 'limitsbar':
      case 'pie_1':
        if (props.dataInfo.tags.length > 0) {
          props.dataInfo.tags.forEach((tag) => {
            data.push({
              tagid: tag.tagid,
              tagvalue: (100 / props.dataInfo.tags.length).toFixed(2),
            });
          });
        } else {
          data.push({
            tagid: 'a',
            tagvalue: 30,
          });
          data.push({
            tagid: 'b',
            tagvalue: 25,
          });
          data.push({
            tagid: 'c',
            tagvalue: 45,
          });
        }
        break;
      case 'yibiao_1':
      case 'jindu_1':
      case 'yewei_1':
        if (props.dataInfo.tags.length > 0) {
          props.dataInfo.tags.forEach((tag) => {
            data.push({
              tagid: tag.tagid,
              tagvalue: 55,
            });
          });
        } else {
          data.push({
            tagid: 'a',
            tagvalue: 30,
          });
        }
        break;
      case 'table':
        data.push({
          tagtime: dayjs().format('YYYY/MM/dd'),
          tag_id: 'a',
          tag_name: 'a',
          tag_intro: 'a值过高',
        });
        data.push({
          tagtime: dayjs().format('YYYY/MM/dd'),
          tag_id: 'b',
          tag_name: 'b',
          tag_intro: 'b值过高',
        });
        data.push({
          tagtime: dayjs().format('YYYY/MM/dd'),
          tag_id: 'c',
          tag_name: 'c',
          tag_intro: 'c值过低',
        });
        break;
      case 'progress':
      case 'yewei_1':
        var rr = myCommon.getRandomNumber(1, 4);
        data.push({
          tagtime: dayjs().format('YYYY/MM/dd'),
          tag_id: 'a',
          tag_name: 'a',
          tag_value: myCommon.getRandomNumber(rr, rr + 30),
        });
        break;
    }
    dataInfo.value = {
      source: data,
      tags:
        props.dataInfo.tags.length > 0
          ? props.dataInfo.tags
          : [
              {
                tagid: 'a',
                filtermin: null,
                filtermax: null,
                color: '#2ae891',
                tagname: '数据1',
                tagunit: 'kg',
              },
              {
                tagid: 'b',
                filtermin: null,
                filtermax: null,
                color: '#0cdaef',
                tagname: '数据2',
                tagunit: '°',
              },
              {
                tagid: 'c',
                filtermin: null,
                filtermax: null,
                color: '#ef6b0d',
                tagname: '数据3',
                tagunit: 'ml',
              },
            ],
    };
  }

  //获取正式数据
  function getSource() {
    //历史值和最新值
    return new Promise((res, rej) => {
      const tagIds = props.dataInfo.tags.map((m) => {
        return m.tagid;
      });
      if (tagIds.length > 0) {
        const newTime = dayjs();
        let startTime = newTime
          .subtract(props.options.timeFrequency, props.options.timeInterval)
          .format('YYYY-MM-DD HH:mm:ss');
        let endTime = newTime.format('YYYY-MM-DD HH:mm:ss');
        // startTime = dayjs("2023-03-07 00:00:00").format('YYYY-MM-DD HH:mm:ss');
        // endTime = dayjs("2023-03-07 23:16:00").format('YYYY-MM-DD HH:mm:ss');
        commonApi
          .Request(props.options.getSourceUrl, {
            startTime,
            endTime,
            tagIds,
          })
          .then((data) => {
            if (data.source) {
              if (data.source.length > 0) {
                lastSourceTime = data.source[data.source.length - 1].tagtime;
              }
            } else {
              data.source = data;
            }
            data.tags = props.dataInfo.tags;
            dataInfo.value = data;
            res();
          })
          .catch((error) => {
            console.error(error);
            dataInfo.value = { source: [] };
            rej();
          });
      }
    });
  }

  //定时刷新数据
  function refreshData() {
    //历史值和最新值
    let refreshFrequency = props.options.refreshFrequency * 1000;
    if (props.options.refreshInterval == 'm') {
      refreshFrequency = refreshFrequency * 60;
    }
    useTimeFn(
      setTimeout(() => {
        const tagIds = props.dataInfo.tags.map((m) => {
          return m.tagid;
        });
        if (tagIds.length > 0) {
          let endTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          if (myCommon.dateDiff(lastSourceTime, endTime, 'h') > 2) {
            //超过俩小时按2小时取一次
            endTime = dayjs().subtract(2, 'h').format('YYYY-MM-DD HH:mm:ss');
          }
          commonApi
            .Request(props.options.getSourceUrl, {
              startTime: lastSourceTime,
              endTime: endTime,
              tagIds,
            })
            .then((data) => {
              if (data.source) {
                if (data.source.length > 0) {
                  lastSourceTime = data.source[data.source.length - 1].tagtime;
                }
                chartRef.value.refreshData(data.source);
              } else {
                chartRef.value.refreshData(data);
              }
              refreshData();
            })
            .catch(() => {
              refreshData();
            });
        } else {
          refreshData();
        }
      }, refreshFrequency),
      timeKey,
      'refreshData',
    );
  }

  //过滤数据最低值和最大值
  function filterData(value, tag, chartType) {
    let newValue = '';
    let defaultValue = '';
    if (chartType == 'bar_1' || chartType == 'bar_2' || chartType == 'zhuzhuang3d') {
      defaultValue = 0;
      newValue = 0;
    }
    if (!myCommon.isnull(value)) {
      if (tag && tag.tagquantiles) {
        newValue = parseFloat(parseFloat(value).toFixed(tag.tagquantiles));
      } else {
        newValue = parseFloat(parseFloat(value).toFixed(3));
      }
      if (!myCommon.isnull(tag.filtermin) || !myCommon.isnull(tag.filtermax)) {
        if (!myCommon.isnull(tag.filtermin) && newValue > tag.filtermin) {
          newValue = newValue;
        } else if (!myCommon.isnull(tag.filtermax) && newValue < tag.filtermax) {
          newValue = newValue;
        } else {
          newValue = defaultValue;
        }
      } else if (!myCommon.isnull(tag.filtermin) && !myCommon.isnull(tag.filtermax)) {
        if (newValue > tag.filtermin && newValue < tag.filtermax) {
          newValue = newValue;
        } else {
          newValue = defaultValue;
        }
      }
    }
    return newValue;
  }

  //指定图表类型的控制调整
  function filterDataNull(value, chartType) {
    let defaultValue = '';
    if (chartType == 'bar_1' || chartType == 'bar_2' || chartType == 'zhuzhuang3d') {
      defaultValue = 0;
    }
    if (myCommon.isnull(value)) {
      return defaultValue;
    }
    return parseFloat(parseFloat(value).toFixed(3));
  }

  onMounted(() => {
    getData();
    if (props.isFormalSource && props.isGetSource) {
      refreshData();
    }
  });

  //监控父级改变
  watch(
    () => props.dataInfo,
    () => {
      if (!props.chartOption) {
        getData();
      }
    },
    { deep: true },
  );

  watch(
    () => props.options,
    () => {
      if (!props.chartOption) {
        options.value = Object.assign(options.value, props.options);
      }
    },
    { deep: true, immediate: true },
  );

  defineExpose({
    chartRef: () => {
      return chartRef.value;
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-charts';

  .@{prefix-cls} {
    width: 100%;
    height: 100%;
  }
</style>
