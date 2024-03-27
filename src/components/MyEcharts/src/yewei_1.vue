<!-- 液位图 -->
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
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px"
        },
        series: [{
            // 液位图
            type: 'liquidFill',
            //显示文字
            label: {
                show: props.options.showLegend,
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
                fontSize: optionData.fontSize,
                position: ["50%", optionData.top + "%"],
                //文字色
                color: props.options.legendColor,
            },
            //鼠标放上显示
            tooltip: {
                show: true
            },
            backgroundStyle: {
                //边框宽度
                borderWidth: 1,
                borderColor: '#ced4da',
                //背景色
                color: props.options.dColor,
            },
            data: [{
                value: optionData.value,
                direction: 'right',
                itemStyle: {
                    //波浪色
                    color: props.options.tColor,
                    opacity: 1,
                    //阴影
                    shadowBlur: 0
                }
            }],
            // 液位图类型container 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow',svg路径
            shape: 'container',
            name: '',
            outline: {
                //边框
                show: false
            },
            ////半径
            //radius: "100%",
            //初始动画加载时间，毫秒
            animationDuration: 0,
            //数据更改加载时间，毫秒
            animationDurationUpdate: 2000,
            //数据更改样式
            animationEasingUpdate: "cubicOut",
            //波浪坡度
            amplitude: 5,
            //液体滚动速度
            period: function (value, index) {
                // 滚动毫秒
                return 2000;
            }
        }]
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
    const dataMax = props.options.rangeMax == null ? 100 : parseFloat(props.options.rangeMax);
    if (myCommon.isnull(value)) {
        value = props.options.rangeMin == null ? 0 : props.options.rangeMin;
    }
    let top = dataMax - parseFloat((value / dataMax).toFixed(2)) * 100;
    if (top > 85) {
        top = 85;
    } else if (top < 20) {
        top = 20;
    }
    if (value >= 0.85) {
        left = 85;
    }
    if (chartRef.value.offsetHeight > 30) {
        fontSize = 24;
    }
    if (chartRef.value.offsetWidth < 10) {
        fontSize = 7;
    }
    return { value, left, fontSize, top };
}

//刷新数据
function refreshData(source) {
    if (source.length > 0 && props.dataInfo.tags.length > 0) {
        const dataMax = props.options.rangeMax == null ? 100 : parseInt(props.options.rangeMax);
        const option = getInstance().getOption();
        const option_ = getOptionData(source);
        let yuanValue = option_.value;
        option_.value = parseFloat((option_.value / dataMax).toFixed(2));
        option.series[0].label.position = ["50%", option_.top + "%"];
        option.series[0].label.fontSize = option_.fontSize;
        option.series[0].data[0].value = option_.value;
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