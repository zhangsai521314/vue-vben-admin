import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';

const largeScreen: AppRouteModule = {
  path: '/largeScreen',
  name: 'largeScreen',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
  },
  children: [
    {
      path: 'index',
      name: 'LargeScreen',
      component: () => import('/@/views/largeScreen/index.vue'),
      meta: {
        hideMenu: true,
      },
    },
    {
      path: 'noClear',
      name: 'LargeScreenNoClear',
      component: () => import('/@/views/largeScreen/indexNoClear.vue'),
      meta: {
        hideMenu: true,
      },
    },
  ],
};

export default largeScreen;
