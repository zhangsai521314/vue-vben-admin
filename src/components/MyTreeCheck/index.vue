<template>
    <div :class="`${prefixCls}`">
        <div style="width:100%;height: 24px;margin-bottom:2px;">
            <a-button style="right: -4px;float:right;" size="small" @click="allClear">清除全部选中</a-button>
        </div>
        <span v-for="(item, index) in props.checkedKeys" :key="index" style="margin-right: 8px;">
            <a-tag @dblclick="tagClear($event, item)">{{
                props.dataList.find(m => m.key == item) ? props.dataList.find(m => m.key == item).title : ""
            }}</a-tag>
            <IconFontClass
                @click="tagClear($event, item)"
                style="display: inline-block;position: absolute;width: 20px;height: 22px;margin-left: -14px;border: 1px solid #d9d9d9;border-left: none;border-radius: 2px;background: #fafafa; color: #00000073;font-size: 13px;text-align: center;cursor: pointer;"
                name="icon-baseui-guanbicuowu" :title="t('view.delete')" />
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
    max-width: calc(100% - 25px);
    overflow: hidden;
    border-right: none;
    text-overflow: ellipsis;
}
</style>