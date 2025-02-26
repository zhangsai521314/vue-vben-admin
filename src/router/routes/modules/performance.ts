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
    title: '',
  },
  children: [
    {
      path: 'index',
      name: 'Performance',
      component: () => import('/@/views/performance/index.vue'),
      meta: {
        //性能监测
        title: '',
        hideMenu: true,
      },
    },
    {
      path: 'his',
      name: 'PerformanceHis',
      component: () => import('/@/views/performance/his.vue'),
      meta: {
        //性能监测历史
        title: '',
        hideMenu: true,
      },
    },
  ],
};

export default performance;
