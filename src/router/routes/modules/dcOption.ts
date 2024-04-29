import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const dcOption: AppRouteModule = {
  path: '/dcOption',
  name: 'DCOption',
  component: LAYOUT,
  redirect: '/dcOption/telephoneBook',
  meta: {
    icon: 'ion:grid-outline',
    title: '调度台',
  },
  children: [
    {
      path: 'telephoneBook',
      name: 'DCOptionTelephoneBook',
      component: () => import('/@/views/dcOption/telephoneBook/index.vue'),
      meta: {
        title: '电话薄管理',
      },
    },
    {
      path: 'callRecord',
      name: 'DCOptionCallRecord',
      component: () => import('/@/views/dcOption/callRecord/index.vue'),
      meta: {
        title: '通话记录',
      },
    },
    {
      path: 'keypadRecord',
      name: 'DCOptionKeypadRecord',
      component: () => import('/@/views/dcOption/keypadRecord/index.vue'),
      meta: {
        title: '按键记录',
      },
    },
    {
      path: 'serviceTest',
      name: 'DCOptionServiceTest',
      component: () => import('/@/views/dcOption/serviceTest/index.vue'),
      meta: {
        title: '服务自检',
      },
    },
  ],
};
export default dcOption;
