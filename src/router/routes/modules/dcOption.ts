import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const dcOption: AppRouteModule = {
  path: '/dcOption',
  name: 'DCOption',
  component: LAYOUT,
  redirect: '/dcOption/telephoneBook',
  meta: {
    //调度台
    title: '',
  },
  children: [
    {
      path: 'telephoneBook',
      name: 'DCOptionTelephoneBook',
      component: () => import('/@/views/dcOption/telephoneBook/index.vue'),
      meta: {
        //电话薄管理
        title: '',
      },
    },
    {
      path: 'callRecord',
      name: 'DCOptionCallRecord',
      component: () => import('/@/views/dcOption/callRecord/index.vue'),
      meta: {
        //通话记录
        title: '',
      },
    },
    {
      path: 'keypadRecord',
      name: 'DCOptionKeypadRecord',
      component: () => import('/@/views/dcOption/keypadRecord/index.vue'),
      meta: {
        //按键记录
        title: '',
      },
    },
    {
      path: 'serviceTest',
      name: 'DCOptionServiceTest',
      component: () => import('/@/views/dcOption/serviceTest/index.vue'),
      meta: {
        //服务自检
        title: '',
      },
    },
  ],
};
export default dcOption;
