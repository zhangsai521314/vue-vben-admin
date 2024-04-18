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
  ],
};
export default dcOption;