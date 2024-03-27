<template>
    <div :class="`${prefixCls}`">
        <div style="margin-bottom:2px;width:100%;height: 24px;">
            <a-button style="float:right;right: -4px;" size="small" @click="allClear">清除全部选中</a-button>
        </div>
        <span v-for="(item, index) in props.checkedKeys" :key="index" style="margin-right: 8px;">
            <a-tag @dblclick="tagClear($event, item)">{{
                props.dataList.find(m => m.key == item) ? props.dataList.find(m => m.key == item).title : ""
            }}</a-tag>
            <IconFontClass
                @click="tagClear($event, item)"
                style="border-radius: 2px;cursor: pointer;position: absolute;display: inline-block;width: 20px;font-size: 13px;background: #fafafa;height: 22px;text-align: center;margin-left: -14px;border: 1px solid #d9d9d9;border-left: none; color: #00000073;"
                name="icon-baseui-guanbicuowu" title="删除" />
        </span>
    </div>
</template>
<script setup>
import { useDesign } from '@/hooks/web/useDesign';
import { ref, onMounted, watch, onUpdated } from 'vue';
const props = defineProps({
    //tree数据源
    dataList: {
        type: Array,
        default() {
            return [];
        }
    },
    //选中的节点
    checkedKeys: {
        type: Array,
        default() {
            return [];
        }
    },
});
const emits = defineEmits(['clear']);
const { prefixCls } = useDesign('myTreeCheck-');

//标签点击删除
function tagClear(dom, tag) {
    emits('clear', false, tag);
}

function allClear() {
    emits('clear', true);
}

</script>
<style lang="less" scoped>
@prefixCls: ~'@{namespace}-myTreeCheck-';

.@{prefixCls} {
    width: 100%;
    height: 100%;
    padding: 5px;
    overflow: auto;
}

:deep(.ant-tag) {
    border-right: none;
    max-width: calc(100% - 25px);
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>