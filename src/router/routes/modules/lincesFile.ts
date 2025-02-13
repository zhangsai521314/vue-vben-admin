import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const Hand: AppRouteModule = {
  path: '/lincesFile',
  name: 'lincesFile',
  component: LAYOUT,
  redirect: '/lincesFile/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    title: '授权文件管理',
  },
  children: [
    {
      path: 'index',
      name: 'LincesFile',
      component: () => import('/@/views/lincesFile/index.vue'),
      meta: {
        title: '授权文件管理',
        hideMenu: true,
      },
    },
  ],
};

export default Hand;
