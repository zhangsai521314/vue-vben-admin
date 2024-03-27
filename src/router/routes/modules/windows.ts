import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const windows: AppRouteModule = {
  path: '/windows',
  name: 'windows',
  component: () => import('/@/views/windows/index.vue'),
  meta: {
    title: t('routes.windows.title'),
  },
};
export default windows;
