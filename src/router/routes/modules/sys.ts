import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const userInfo: AppRouteModule = {
    path: '/noPower',
    name: 'noPower',
    component: LAYOUT,
    redirect: '/noPower/index',
    meta: {
        // 隐藏所有子菜单
        hideChildrenInMenu: true,
        // 菜单排序，只对第一级有效
        orderNo: 1,
        icon: 'ion:grid-outline',
        //配置名称，可直接输入字符串，也可使用
        title: '无权限',
    },
    children: [
        {
            path: 'index',
            name: 'noPower',
            component: () => import('/@/views/sys/exception/noPower.vue'),
            meta: {
                title: '无权限',
                hideMenu: true,
            },
        },
    ],
};

export default userInfo;
