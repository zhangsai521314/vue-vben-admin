<!-- 仪表盘 --> 
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
        color: '#fff',
        tooltip: {
            show: false
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '0%',
            top: '0%',
            containLabel: true,
            borderWidth: '0'
        },
        title: {
            //数据点名称
            text: option.name,
            //单位
            subtext: option.subtext,
            bottom: '10%',
            left: 'center',
            textStyle: {
                fontSize: '10',
                color: '#fff',
            },
            subtextStyle: {
                color: '#fff',
            }
        },
        series: [
            //值
            {
                name: '',
                type: 'gauge',
                radius: '80%',
                splitNumber: 10, // 分割段数，默认为5
                z: 8,
                //最小值
                min: props.options.rangeMin == null ? 0 : props.options.rangeMin,
                //最大值
                max: props.options.rangeMax == null ? 100 : props.options.rangeMax,
                axisLine: { // 坐标轴线
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: [
                            [1, '#fff']
                        ],
                        width: 0
                    }
                },
                axisTick: { // 坐标轴小标记
                    splitNumber: 5, // 每份split细分多少段
                    length: 15, // 属性length控制线长
                    lineStyle: { // 属性lineStyle控制线条样式
                        color: '#fff',
                        width: 1,
                    }
                },
                axisLabel: { // 坐标轴文本标签，详见axis.axisLabel
                    formatter: function (v) {
                        return v.toFixed();
                    },
                    textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                        color: '#fff',
                        fontSize: "0.8vw",
                    }
                },
                splitLine: { // 分隔线
                    show: true, // 默认显示，属性show控制显示与否
                    length: 20, // 属性length控制线长
                    lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
                        color: 'auto',
                        width: 4,
                    }
                },
                pointer: {
                    show: true,
                    width: 10,
                    length: '80%',
                    color: '#fff'
                },
                detail: {
                    show: false,
                },
                title: {
                    show: false,
                },
                data: option.data
            },
            //白色刻度
            {
                type: "gauge",
                radius: "55%",
                pointer: {
                    show: false,
                },
                detail: {
                    textStyle: {
                        fontSize: 25,
                        color: '#fff'
                    },
                },
                //中间值
                data: option.data,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#fff',
                        width: 10,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        opacity: 1,
                    },
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                animationDuration: 4000,
            },
            //黄色
            {
                type: "gauge",
                radius: "84%",
                startAngle: "225",
                endAngle: "-45",
                splitNumber: "120",
                pointer: {
                    show: false,
                },
                detail: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [
                            [1, "yellow"]
                        ],
                        width: 2,
                        opacity: 1,
                    },
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: false,

                },
                axisLabel: {
                    show: false,
                },
            },
            //白色环线
            {

                type: "gauge",
                z: 2,
                radius: "80%",
                startAngle: "225",
                endAngle: "-45",
                axisLine: {
                    // 坐标轴线
                    lineStyle: {
                        // 属性lineStyle控制线条样式
                        color: [
                            [1, "#fff"]
                        ],
                        fontSize: 40,
                        width: 1,
                        opacity: 1, //刻度背景宽度
                    },
                },
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                    formatter: function (v) {
                        return v.toFixed(0);
                    },
                },
                pointer: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                detail: {
                    show: false,
                },
            },
            //中间蓝色
            {
                type: 'pie',
                sttartAngle: 90,
                radius: "80%",
                hoverAnimation: false,
                legendHoverLink: false,
                lable: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                center: ['50%', '50%'],
                z: -10,
                data: [{
                    value: 0,
                    itemStyle: {
                        normal: {
                            color: {
                                type: 'radial',
                                x: 0.5,
                                y: 0.5,
                                r: 0.5,
                                colorStops: [{
                                    offset: 0,
                                    color: '#00C2EB'
                                }, {
                                    offset: 0.80,
                                    color: '#037495'
                                }, {
                                    offset: 1,
                                    color: '#094461'
                                }]
                            },
                            opacity: 0.5
                        }
                    }
                }]
            },
            //底灰色
            {
                type: 'pie',
                sttartAngle: 90,
                radius: "88%",
                hoverAnimation: false,
                legendHoverLink: false,
                lable: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                center: ['50%', '50%'],
                z: -15,
                data: [{
                    value: 0,
                    itemStyle: {
                        color: '#333333'
                    }
                }]
            },
        ]
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
    const data = [{ value: 0 }];
    let name = "";
    let subtext = "";
    if (props.dataInfo.tags.length > 0) {
        name = props.dataInfo.tags[0].tagname;
        subtext = props.dataInfo.tags[0].tagunit;
        let tagSource = source.find(m => m.tagid == props.dataInfo.tags[0].tagid);
        tagSource = tagSource == undefined ? "" : tagSource.tagvalue;
        const value = props.filterData(tagSource, props.dataInfo.tags[0], props.options.chartType);
        data[0].value = value;
    }
    return { data, name, subtext };
}

//刷新数据
function refreshData(source) {
    if (source.length > 0 && props.dataInfo.tags.length > 0) {
        const option = getInstance().getOption();
        const option_ = getOptionData(source);
        option.series[0].data = option_.data;
        option.series[1].data = option_.data;
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