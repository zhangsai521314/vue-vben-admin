<!-- 饼图 -->
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
            left: '0%',
            right: '0%',
            bottom: '0%',
            top: '0%',
            containLabel: true,
            borderWidth: '0'
        }],
        title: {
            show: props.options.showTitle,
            left: 'center',
            text: props.options.title,
            top: 3,
            textStyle: {
                color: props.options.titleColor,
            },
        },
        legend: {
            show: props.options.showLegend,
            data: option.legendData,
            top: props.options.showTitle ? 25 : 0,
            type: 'scroll',
        },
        tooltip: {
            trigger: 'item',
            formatter: ' {b}:{c} ({d}%) '
        },
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
    const colors = [];
    const series_data = {
        label: {
            formatter: ' {b|{b}:}{c} {per|{d}%} ',
            backgroundColor: '#F6F8FC',
            borderColor: '#8C8D8E',
            borderWidth: 1,
            borderRadius: 4,
            rich: {
                a: {
                    color: '#6E7079',
                    lineHeight: 22,
                    align: 'center',
                    fontSize: 12,
                },
                hr: {
                    borderColor: '#8C8D8E',
                    width: '100%',
                    borderWidth: 1,
                    height: 0,
                    fontSize: 12,
                },
                b: {
                    color: '#4C5058',
                    fontSize: 12,
                    fontWeight: 'bold',
                    lineHeight: 33,
                },
                per: {
                    color: '#fff',
                    backgroundColor: '#4C5058',
                    padding: [3, 4],
                    borderRadius: 4,
                    fontSize: 12,
                }
            },
        },
        type: 'pie',
        radius: '70%',
        center: ['50%', '58%'],
        emphasis: {
            itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        },
        itemStyle: {
            normal: {
                color: function (params) {
                    return colors[params.dataIndex]
                }
            }
        },
        data: [],
    };
    props.dataInfo.tags.forEach(function (tag) {
        const name = tag.tagname + "(" + tag.tagunit + ")";
        legendData.push({
            name: name,
            textStyle: { color: tag.color }
        });
        colors.push(tag.color);
        let tagSource = source.find(m => m.tagid == tag.tagid);
        tagSource = tagSource == undefined ? "" : tagSource.tagvalue;
        const value = props.filterData(tagSource, tag, props.options.chartType);
        const data = series_data.data.find(m => m.tagid == tag.tagid);
        if (data) {
            data.value = value;
        } else {
            series_data.data.push({ tagid: tag.tagid, value, name },);
        }
    });
    series.push(series_data);
    return { series, legendData };
}

//刷新数据
function refreshData(source) {
    if (source.length > 0) {
        const option = getInstance().getOption();
        props.dataInfo.tags.forEach(function (tag) {
            const name = tag.tagname + "(" + tag.tagunit + ")";
            const tagSeries = option.series[0].data.find(m => m.tagid == tag.tagid);
            let tagSource = source.find(m => m.tagid == tag.tagid);
            tagSource = tagSource == undefined ? "" : tagSource.tagvalue;
            const value = props.filterData(tagSource, tag, props.options.chartType);
            if (tagSeries) {
                tagSeries.value = value;
            } else {
                option.series[0].data.push({ tagid: tag.tagid, value, name });
            }
        });
        getInstance().setOption(option, true);
    }
}

onMounted(() => {
    if (!props.chartOption) {
        const o = getOption();
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