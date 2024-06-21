import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const GplotRouter: AppRouteModule = {
  path: '/gplot',
  name: 'gplot',
  component: LAYOUT,
  redirect: '/gplot/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
  },
  children: [
    {
      path: 'manage',
      name: 'GplotManage',
      component: () => import('/@/views/gplot/manage.vue'),
      meta: {
        title: '拓扑配置',
        hideMenu: true,
      },
    },
    {
      path: 'index/:gplotId',
      name: 'Gplot',
      component: () => import('/@/views/gplot/index.vue'),
      meta: {
        title: t('网元监控'),
        hideMenu: true,
      },
    },
  ],
};

export default GplotRouter;
