import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const softwareManage: AppRouteModule = {
  path: '/softwareManage',
  name: 'softwareManage',
  component: LAYOUT,
  redirect: '/softwareManage/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    //软件管理
    title: '',
  },
  children: [
    {
      path: 'index',
      name: 'SoftwareManage',
      component: () => import('/@/views/softwareManage/index.vue'),
      meta: {
        //软件管理
        title: '',
        hideMenu: true,
      },
    },
  ],
};

export default softwareManage;
