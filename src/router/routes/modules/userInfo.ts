import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const userInfo: AppRouteModule = {
  path: '/userInfo',
  name: 'userInfo',
  component: LAYOUT,
  redirect: '/userInfo/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    //用户中心
    title: '',
  },
  children: [
    {
      path: 'index',
      name: 'UserInfo',
      component: () => import('/@/views/windows/components/user.vue'),
      meta: {
        //用户中心
        title: '',
        hideMenu: true,
      },
    },
  ],
};

export default userInfo;
