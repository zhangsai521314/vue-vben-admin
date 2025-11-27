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
  },
  children: [
    {
      path: 'index',
      name: 'NPower',
      component: () => import('/@/views/sys/exception/noPower.vue'),
      meta: {
        titleCn: '无权限',
        titleEn: 'NPower',
        titleFr: 'Aucune autorisation',
        hideMenu: true,
      },
    },
  ],
};

export default userInfo;
