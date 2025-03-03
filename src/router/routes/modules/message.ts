import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const message: AppRouteModule = {
  path: '/message',
  name: 'message',
  component: LAYOUT,
  redirect: '/message/index',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: true,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    //告警管理
    title: '',
  },
  children: [
    {
      path: 'index',
      name: 'Message',
      component: () => import('/@/views/message/index.vue'),
      meta: {
        //告警管理
        title: '',
        hideMenu: true,
      },
    },
    {
      path: 'index/:serverId',
      name: 'message_server',
      component: () => import('/@/views/message/index.vue'),
      meta: {
        title: '',
        hideMenu: true,
      },
    },
    {
      path: 'index/:msgId/:dataTime',
      name: 'message_',
      component: () => import('/@/views/message/index.vue'),
      meta: {
        title: '',
        hideMenu: true,
      },
    },
  ],
};

export default message;
