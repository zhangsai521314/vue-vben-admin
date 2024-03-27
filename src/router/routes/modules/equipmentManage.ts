import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const equipmentManage: AppRouteModule = {
    path: '/equipmentManage',
    name: 'equipmentManage',
    component: LAYOUT,
    redirect: '/equipmentManage/index',
    meta: {
        // 隐藏所有子菜单
        hideChildrenInMenu: true,
        // 菜单排序，只对第一级有效
        orderNo: 1,
        icon: 'ion:grid-outline',
        //配置名称，可直接输入字符串，也可使用
        title: '硬件管理',
    },
    children: [
        {
            path: 'index',
            name: 'equipmentManage',
            component: () => import('/@/views/equipmentManage/index.vue'),
            meta: {
                title: '硬件管理',
                hideMenu: true,
            },
        },
    ],
};

export default equipmentManage;


