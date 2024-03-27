<!-- antvue 菜单导航子菜单 -->
<template>
    <a-sub-menu :key="menuInfo.key" v-bind="props">
        <template #title>
            <IconFontClass
                :name="menuInfo.menuicon"
                style="{ flontSize: '14px' }" />
            <span :title="menuInfo.title" :style="{ marginLeft: '5px' }">{{ menuInfo.title }}</span>
        </template>
        <template v-for="item in menuInfo.children">
            <a-menu-item v-if="!item.children" :key="item.key" @click="rightClickMenu('open', item)" @contextmenu="rightClick('windows_menu', item)">
                <IconFontClass
                    :name="item.menuicon"
                    style="{ flontSize: '14px' }" />
                <span :title="item.title" :style="{ marginLeft: '5px' }">{{ item.title }}</span>
            </a-menu-item>
            <!-- 组件自己调用自己 -->
            <sub-menu v-else :rightClickMenu="rightClickMenu_" :rightClick="rightClick_" :key="item.key" :menu-info="item" />
        </template>
    </a-sub-menu>
</template>
<script>
import { Menu } from 'ant-design-vue';
export default {
    name: 'SubMenu',
    props: {
        ...Menu.SubMenu.props,
        rightClick: Function,
        rightClickMenu: Function,
        menuInfo: {
            type: Object,
            default: () => ({}),
        }
    },
    methods: {
        rightClick_: function (type_, data) {
            this.rightClick(type_, data);
        },
        rightClickMenu_: function (type_, data) {
            this.rightClickMenu(type_, data);
        },
    }

}
</script>
<style >

</style>