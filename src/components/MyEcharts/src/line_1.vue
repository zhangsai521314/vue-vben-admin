<!-- 普通时序折线图 -->
<template>
    <div :class="prefixCls" ref="chartRef"></div>
</template>
<script setup>
import { useDesign } from '@/hooks/web/useDesign';
import { ref, onMounted, watch, nextTick, unref } from 'vue';
import { useECharts } from '@/hooks/web/useECharts';

const props = defineProps({
    options: {
        type: Object,
        default() {
            return {}
        },
    },
    dataInfo: {
        type: Object,
        default() {
            //source为数据
            return {
                source: [], tags: [
                    //{//数据点集合
                    //    tagid: "", //数据点id
                    //    tagname:"",//名称
                    //    filtermin: "", //过滤最小值
                    //    filtermax: "", //过滤最大值
                    //    color: ""//颜色
                    //    tagunit:"",//单位
                    //    tagquantiles: node.tagquantiles//小数位
                    //}
                ]
            }
        }
    },
    filterData: Function,
    filterDataNull: Function,
    filterTags: Function,
    //使用纯echat的配置。options和dataInfo就别传了
    chartOption: {
        type: Object,
        default() {
            return null;
        }
    },
});
const chartRef = ref(null);
const { prefixCls } = useDesign('charts-line1-');
const { getInstance, resize, dispose, echarts } = useECharts(chartRef);

//渲染图表
function getOption() {
    const option = getOptionData(props.dataInfo.source);
    return {
        backgroundColor: props.options.backgroundColor,
        grid: [{
            top: "50",
            bottom: '40',
            // left: "2%",
            // right: "30",
        }],
        title: {
            show: props.options.showTitle,
            left: 'center',
            text: props.options.title,
            top: 3,
            textStyle: {
                color: props.options.titleColor,
            }
        },
        legend: {
            show: props.options.showLegend,
            data: option.legendData,
            top: props.options.showTitle ? 25 : 0,
            type: 'scroll',
        },
        tooltip: {
            trigger: "axis",
        },
        axisPointer: {
            link: {
                xAxisIndex: "all"
            }
        },
        dataZoom: [
            {
                show: false,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        xAxis: [{
            type: "category",
            gridIndex: 0,
            //X轴刻度标签的设置
            axisLabel: {
                color: props.options.xAxisLabelColor,
                formatter: function (parm) {
                    if (parm.indexOf(" " != -1)) {
                        return parm.substring(5, 10) + "\r\n" + parm.substring(10, parm.length);
                    }
                    return parm;
                },
            },
            //X轴线设置
            axisLine: {
                show: true,
                lineStyle: {
                    color: props.options.xAxisLineColor
                }
            },
            //X轴分隔线。
            splitLine: {
                show: props.options.showXSplitLine,
                lineStyle: {
                    type: "dashed",
                    color: props.options.xSplitLineColor,
                }
            }
        }],
        yAxis: [{
            name: "",
            type: "value",
            nameTextStyle: {
                fontSize: 14
            },
            max: myCommon.isnull(props.options.rangeMax) ? null : parseFloat(props.options.rangeMax),
            min: myCommon.isnull(props.options.rangeMin) ? null : parseFloat(props.options.rangeMin),
            gridIndex: 0,
            //Y轴刻度标签的设置
            axisLabel: {
                color: props.options.yAxisLabelColor,
            },
            //Y轴线设置
            axisLine: {
                show: true,
                lineStyle: {
                    color: props.options.yAxisLineColor
                }
            },
            //Y轴分隔线。
            splitLine: {
                show: props.options.showYSplitLine,
                lineStyle: {
                    type: "dashed",
                    color: props.options.ySplitLineColor,
                }
            }
        }],
        series: option.series
    };
};

//更新图表
function upChart() {
    try {
        if (props.options.renderType == "2d") {
            getInstance().setOption(getOption(), true);
        } else {
            props.options.render_3d(getOption())
        }
    } catch (error) {
        console.error(error);
    }
}

//获取图表数据
function getOptionData(source) {
    const series = [];
    const legendData = [];
    props.dataInfo.tags.forEach(function (tag) {
        const name = tag.tagname + "(" + tag.tagunit + ")";
        legendData.push({
            name: name,
            itemStyle: {
                color: tag.color,
            },
            textStyle: { color: tag.color }
        });
        const series_data = {
            name: name,
            type: 'line',
            tagid: tag.tagid,
            showSymbol: false,
            smooth: true,
            connectNulls: true,
            lineStyle: {
                color: tag.color,
            },
            data: []
        };
        source.forEach(function (item) {
            const value = props.filterData(item[tag.tagid], tag, props.options.chartType);
            series_data.data.push([item.tagtime, value]);
        });
        series.push(series_data);
    });
    return { series, legendData };
}

//刷新数据
function refreshData(source) {
    if (source.length > 0) {
        const option = getInstance().getOption();
        let tagSource;
        props.dataInfo.tags.forEach(function (tag) {
            // const name = tag.tagname + "(" + tag.tagunit + ")";
            tagSource = option.series.find(m => m.tagid == tag.tagid).data;
            source.forEach(function (data) {
                const value = props.filterData(data[tag.tagid], tag, props.options.chartType);
                tagSource.shift();
                // tagSource.push({ name, value: [data.tagtime, value] });
                tagSource.push([data.tagtime, value]);
            });
        });
        getInstance().setOption(option, true);
    }
}

onMounted(() => {
    const o = getOption();
    if (!props.chartOption) {
        props.options.renderType == "2d" ? getInstance().setOption(o, true) : props.options.render_3d(o);
    } else {
        getInstance().setOption(props.chartOption, true);
    }
    //数据点击事件
    getInstance().on("click", 'series', (params) => {
        props.options.chartServiseClick(params, getInstance());
    });

});

//监控父级改变
watch(
    () => [props.dataInfo, props.options],
    () => {
        if (!props.chartOption) {
            upChart();
        }
    },
    { deep: true }
);

//监控父级改变
watch(
    () => props.chartOption,
    () => {
        if (props.chartOption) {
            getInstance().setOption(props.chartOption, true);
        }
    },
    { deep: true }
);

defineExpose({
    getInstance, resize, echarts, dispose, refreshData
});
</script>
<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-charts-line1-';

.@{prefix-cls} {
    width: 100%;
    height: 100%;
}
</style>