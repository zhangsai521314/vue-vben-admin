import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const IFrame = () => import('/@/views/largeScreen/index.vue');

const largeScreen: AppRouteModule = {
  path: '/largeScreen/index',
  name: 'LargeScreen',
  component: IFrame,
  meta: {
    title: t('routes.demo.iframe.doc'),
  },
};

export default largeScreen;
