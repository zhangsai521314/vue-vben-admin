import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const Hand: AppRouteModule = {
  path: '/hand',
  name: 'hand',
  component: LAYOUT,
  redirect: '/hand/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    title: '手持台',
  },
  children: [
    {
      path: 'index',
      name: 'hand',
      component: () => import('/@/views/hand/index.vue'),
      meta: {
        title: '手持台',
        hideMenu: true,
      },
    },
  ],
};

export default Hand;
