import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const menuManage: AppRouteModule = {
  path: '/menuManage',
  name: 'menuManage',
  component: LAYOUT,
  redirect: '/menuManage/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    //菜单管理
    title: '',
  },
  children: [
    {
      path: 'index',
      name: 'MenuManage',
      component: () => import('/@/views/menuManage/index.vue'),
      meta: {
        //菜单管理
        title: '',
        hideMenu: true,
      },
    },
  ],
};

export default menuManage;
