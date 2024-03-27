<template>
    <MyContent> <iframe ref="inarmRef" style="width:100%;height: 100%;" src="#/serviceDriver/index?menuid=2"></iframe></MyContent>
</template>
<script  setup>
//权限扫描测试，误删
import { ref, reactive, onMounted } from 'vue';

const timeKey = `power_${myCommon.uniqueId()}`;
const inarmRef = ref({});
//加载时间，页面可设置，避免
const loadTime = ref(3000);
var doms = reactive([]);

function getPower() {
    ///判断是否本站点链接
    let locSrc = window.location.href;
    //ifm加载的链接域名
    var ifmhost = inarmRef.value.src.split('://')[1].split('/')[0];
    //本站点域名
    var lochost = locSrc.split('://')[1].split('/')[0];
    if (ifmhost !== lochost) {
        message.warn('非本站点页面功能，不能进行配置！');
        _this.setState({
            data: [],
            loading: false,
        });
        return;
    }
    //获取iframe对象
    var obj = inarmRef.value.contentWindow;
    //获取加载页面内需要权限控制的按钮
    var ifmObj = obj.document.getElementsByClassName('auth');
    ///获取元素数组
    if (ifmObj) {
        for (let index = 0; index < ifmObj.length; index++) {
            const $element = $(ifmObj[index]);
            if (doms.filter((m) => { if (m.dom == $element.attr('auth')) { return m; } }).length == 0) {
                doms.push({
                    dom: $element.attr('auth'),
                    name: "",
                    ispower: true
                });
            }
        }
    }
}

onMounted(() => {
    inarmRef.value.onload = function () {
        setTimeout(() => {
            getPower();
        }, loadTime.value)
    };
})
</script>
  