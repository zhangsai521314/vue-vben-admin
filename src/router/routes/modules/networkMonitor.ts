import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const networkMonitor: AppRouteModule = {
  path: '/networkMonitor',
  name: 'networkMonitor',
  component: LAYOUT,
  redirect: '/networkMonitor/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    //网元监控
    title: '',
  },
  children: [
    {
      path: 'index',
      name: 'networkMonitor',
      component: () => import('/@/views/networkMonitor/index.vue'),
      meta: {
        // 是否固定标签
        // affix: true,
        //网元监控
        title: '',
        hideMenu: true,
      },
    },
  ],
};

export default networkMonitor;
