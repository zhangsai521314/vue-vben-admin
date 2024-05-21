import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const performance: AppRouteModule = {
  path: '/performance',
  name: 'performance',
  component: LAYOUT,
  redirect: '/performance/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    title: '性能监测',
  },
  children: [
    {
      path: 'index',
      name: 'performance',
      component: () => import('/@/views/performance/index.vue'),
      meta: {
        title: '性能监测',
        hideMenu: true,
      },
    },
  ],
};

export default performance;
