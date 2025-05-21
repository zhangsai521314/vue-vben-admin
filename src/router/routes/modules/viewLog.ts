import type { AppRouteModule } from '@/router/types';
import { LAYOUT } from '@/router/constant';

const versionsManage: AppRouteModule = {
  path: '/viewLog',
  name: 'viewLog',
  component: LAYOUT,
  redirect: '/viewLog/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    // 版本管理
    title: '',
  },
  children: [
    {
      path: 'index',
      name: 'ViewLog',
      component: () => import('/@/views/viewLog/index.vue'),
      meta: {
        title: '',
        hideMenu: true,
      },
    },
  ],
};

export default versionsManage;
