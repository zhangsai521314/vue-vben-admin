<!-- 进度图 -->
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
    const dataMax = props.options.rangeMax == null ? 100 : parseInt(props.options.rangeMax);
    const optionData = getOptionData(props.dataInfo.source);
    let yuanValue = optionData.value;
    optionData.value = parseFloat((optionData.value / dataMax).toFixed(2));
    return {
        grid: {
            left: '0',
            right: '0',
            bottom: '0',
            top: '0',
        },
        //底色
        backgroundColor: '',
        xAxis: {
            show: false,
            type: 'value',
            max: 1,
        },
        yAxis: [
            {
                type: 'category',
                inverse: true,
                axisTick: 'none',
                axisLine: 'none',
                show: true,
            },
        ],
        series: [
            {
                type: 'bar',
                showBackground: true,
                label: {
                    show: props.options.showLegend,
                    // 相对的百分比。数据值比大于75%则把100%更改成75%。否则会看不到值
                    position: [optionData.left + '%', '35%'],
                    formatter: function (p) {
                        if (props.options.progressType == '%') {
                            var value = (p.value * 100).toFixed(2);
                            if (parseFloat(value.toString().split(".")[1]) == 0) {
                                value = parseInt(value);
                            }
                            return value + "%";
                        } else {
                            if (parseFloat(yuanValue.toString().split(".")[1]) == 0) {
                                yuanValue = parseInt(yuanValue);
                            }
                            return yuanValue;
                        }
                    },
                    textStyle: {
                        color: props.options.legendColor,
                        fontSize: optionData.fontSize,
                    },
                },
                itemStyle: {
                    normal: {
                        //圆角
                        barBorderRadius: 20,
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            //渐变色
                            {
                                offset: 0,
                                color: props.options.gradientColorStart == "" ? "#1badf9" : props.options.gradientColorStart
                            },
                            {
                                offset: 1,
                                color: props.options.gradientColorEnd == "" ? "#03fcfe" : props.options.gradientColorEnd
                            },
                        ]),
                    },
                },
                backgroundStyle: {
                    color: props.options.dColor,
                    borderColor: props.options.borderColor,
                    borderWidth: 1,
                    borderRadius: 20
                },
                //撑满
                barWidth: "100%",
                data: [optionData.value],
            },
        ],
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
    let value;
    let left = 100;
    let fontSize = 10;
    if (props.dataInfo.tags.length > 0) {
        let tagSource = source.find(m => m.tagid == props.dataInfo.tags[0].tagid);
        tagSource = tagSource == undefined ? "" : tagSource.tagvalue;
        value = props.filterData(tagSource, props.dataInfo.tags[0], props.options.chartType);
    }
    if (myCommon.isnull(value)) {
        value = props.options.rangeMin == null ? 0 : props.options.rangeMin;
    }
    if (value >= 0.85) {
        left = 85;
    }
    if (chartRef.value.offsetHeight > 30) {
        fontSize = 24;
    }
    else if (chartRef.value.offsetHeight < 10) {
        fontSize = 7;
    }
    return { value, left, fontSize };
}

//刷新数据
function refreshData(source) {
    if (source.length > 0 && props.dataInfo.tags.length > 0) {
        const dataMax = props.options.rangeMax == null ? 100 : parseInt(props.options.rangeMax);
        const option = getInstance().getOption();
        const option_ = getOptionData(source);
        let yuanValue = option_.value;
        option_.value = parseFloat((option_.value / dataMax).toFixed(2));
        option.series[0].label.position = [option_.left + '%', '35%'];
        option.series[0].label.textStyle.fontSize = option_.fontSize;
        option.series[0].data[0] = option_.value;
        option.series[0].label.formatter = function (p) {
            if (props.options.progressType == '%') {
                var value = (p.value * 100).toFixed(2);
                if (parseFloat(value.toString().split(".")[1]) == 0) {
                    value = parseInt(value);
                }
                return value + "%";
            } else {
                if (parseFloat(yuanValue.toString().split(".")[1]) == 0) {
                    yuanValue = parseInt(yuanValue);
                }
                return yuanValue;
            }
        };
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