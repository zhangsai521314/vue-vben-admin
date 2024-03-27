<!-- 普通时序柱状图 -->
<template>
    <div :class="prefixCls" ref="chartRef"></div>
</template>
<script setup>
import { useDesign } from '@/hooks/web/useDesign';
import { ref, onMounted, watch, nextTick } from 'vue';
import { useECharts } from '@/hooks/web/useECharts';
import elementResizeDetectorMaker from "element-resize-detector";

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
            //source数据,tagInfos数据库现有tag信息，用于替换存储的旧tag信息
            return { datatable: [], tags: [] }
        }
    },
    filterData: Function,
    filterDataNull: Function,
    filterTags: Function,
    //纯echat的配置。options和dataInfo就别传了
    option: {
        type: Object,
        default() {
            return null;
        }
    },
});
const chartRef = ref(null);
const { prefixCls } = useDesign('charts-bar_2-');
const { setOptions, getInstance, resize, echarts, dispose } = useECharts(chartRef);
let option;
let tags;

//dataInfo数据信息
function upChart(dataInfo) {
    tags = dataInfo.tags;
    return new Promise((resolve, reject) => {
        if (props.options.renderType == "2d") {
            try {
                updateChart(dataInfo.datatable);
                setOptions(option);
                resolve();
            } catch (error) {
                console.error(error);
                reject();
            }
        } else {
            try {
                props.options.updateRender_3d(dataInfo.datatable)
                resolve();
            } catch (error) {
                console.error(error);
                reject();
            }
        }
    });
}

//渲染图表
function initChart(source, tagdatatable) {
    if (!source) {
        source = [];
    }
    const charColor = [];
    tags = props.options.tags;
    if (tagdatatable && tagdatatable.length > 0) {
        tags = props.filterTags(tagdatatable, props.options.tags);
    }
    const series = [];
    tags.forEach(function (tag) {
        charColor.push(tag.color);
        const name = tag.tagname + "(" + tag.tagunit + ")";
        const series_data = {
            name: name,
            type: 'bar',
            tagid: tag.tagid,
            nameBefore: "",
            showSymbol: false,
            smooth: true,
            minVal: "",
            maxVal: "",
            data: [],
        };
        source.forEach(function (item) {
            const value = props.filterData(item[tag.tagid], tag, props.options.chartType);
            if (!myCommon.isnull(value)) {
                series_data.data.push([item.tagtime, value]);
            }
        });
        series.push(series_data);
    });
    option = {
        backgroundColor: props.options._backgroundColor,
        title: {
            left: 'center',
            color: props.options.titleColor,
            text: props.options.title,
            top: 3
        },
        grid: [{
            top: "50",
            bottom: '40',
            left: "30",
            right: "30",
        }],
        tooltip: {
            trigger: "axis",
        },
        axisPointer: {
            link: {
                xAxisIndex: "all"
            }
        },
        legend: {
            textStyle: {
                color: props.options.legendColor,
            },
            top: '25',
        },
        xAxis: [{
            type: "category",
            gridIndex: 0,
            boundaryGap: false,
            axisLabel: {
                formatter: function (parm) {
                    if (parm.indexOf(" " != -1)) {
                        return parm.substring(5, 10) + "\r\n" + parm.substring(10, parm.length);
                    }
                    return parm;
                },
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: props.options.singleXYColor
                }
            },
        }],
        yAxis: [{
            axisLine: {
                show: true,
                lineStyle: {
                    color: props.options.singleXYColor
                }
            },
            name: "",
            type: "value",
            nameTextStyle: {
                fontSize: 14
            },
            max: props.options.rangeMax == "" ? null : parseFloat(props.options.rangeMax),
            min: props.options.rangeMin == "" ? null : parseFloat(props.options.rangeMin),
            gridIndex: 0,
            splitLine: {
                show: props.options.SYgridLineWidth ? true : false,
                lineStyle: {
                    type: "dashed"
                }
            }
        }],
        series: series
    };
};

//刷新更新图表
function updateChart(source) {
    if (source) {
        var series = [];
        tags.forEach(function (tag) {
            var name = tag.tagname + "(" + tag.tagunit + ")";
            var series_data = {
                name: name,
                type: 'bar',
                tagid: tag.tagid,
                nameBefore: "",
                showSymbol: false,
                smooth: true,
                minVal: "",
                maxVal: "",
                data: []
            };
            source.forEach(function (item) {
                var value = props.filterData(item[tag.tagid], tag, props.options.chartType);
                if (!myCommon.isnull(value)) {
                    series_data.data.push([item.tagtime, value]);
                }
            });
            series.push(series_data);
        });
        option.series = series;
    }
};

onMounted(() => {
    if (props.option == null) {
        initChart(props.dataInfo.datatable, props.dataInfo.tags);
        props.options.renderType == "2d" ? setOptions(option) : props.options.render_3d(option);
        setTimeout(() => {
            getInstance().on("click", (params) => {
                props.options.click(params, option, setOptions);
            });
            // window.addEventListener('resize', function () {
            //     getInstance().resize();
            // });
            let erd = elementResizeDetectorMaker();
            erd.listenTo(chartRef.value, () => {
                nextTick(() => {
                    getInstance().resize();
                });
            });
        }, 1000);
    }
});

//监控父级改变
watch(
    () => props.dataInfo,
    () => {
        if (props.option == null) {
            upChart(props.dataInfo);
        }
    },
    { deep: true }
);

//监控父级改变
watch(
    () => props.options,
    () => {
        if (props.option == null) {
            initChart(props.dataInfo.datatable, props.dataInfo.tags);
            props.options.renderType == "2d" ? setOptions(option) : props.options.render_3d(option);
        }
    },
    { deep: true }
);

//监控父级改变
watch(
    () => props.option,
    () => {
        setOptions(props.option);
    },
    { deep: true, immediate: true }
);

defineExpose({
    setOptions, getInstance, resize, echarts, dispose
});
</script>
<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-charts-bar_2-';

.@{prefix-cls} {
    width: 100%;
    height: 100%;
}
</style>