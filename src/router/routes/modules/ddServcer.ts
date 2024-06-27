import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const ddServcer: AppRouteModule = {
  path: '/ddServcer',
  name: 'DDServcer',
  component: LAYOUT,
  redirect: '/ddServcer/black',
  meta: {
    icon: 'ion:grid-outline',
    title: '调度服务',
  },
  children: [
    {
      path: 'black',
      name: 'DDServcerBlack',
      component: () => import('/@/views/ddServcer/black/index.vue'),
      meta: {
        title: '黑名单管理',
      },
    },
    {
      path: 'cirStatus',
      name: 'DDServcerCirStatus',
      component: () => import('/@/views/ddServcer/cirStatus/index.vue'),
      meta: {
        title: 'cir在线状态',
      },
    },
    {
      path: 'dcStatus',
      name: 'DDServcerDCStatus',
      component: () => import('/@/views/ddServcer/dcStatus/index.vue'),
      meta: {
        title: '调度台/值班台在线状态',
      },
    },
    {
      path: 'lacci',
      name: 'DDServcerLacci',
      component: () => import('/@/views/ddServcer/lacci/index.vue'),
      meta: {
        title: '小区管理',
      },
    },
    {
      path: 'stationLacci',
      name: 'DDServcerStationLacci',
      component: () => import('/@/views/ddServcer/stationLacci/index.vue'),
      meta: {
        title: '车站小区管理',
      },
    },
    {
      path: 'line',
      name: 'DDServcerLine',
      component: () => import('/@/views/ddServcer/line/index.vue'),
      meta: {
        title: '线路管理',
      },
    },
    {
      path: 'mobileStatus',
      name: 'DDServcerMobileStatus',
      component: () => import('/@/views/ddServcer/mobileStatus/index.vue'),
      meta: {
        title: '手持台在线状态',
      },
    },
    {
      path: 'registerHistory',
      name: 'DDServcerRegisterHistory',
      component: () => import('/@/views/ddServcer/registerHistory/index.vue'),
      meta: {
        title: '注册注销记录',
      },
    },
    {
      path: 'station',
      name: 'DDServcerStation',
      component: () => import('/@/views/ddServcer/station/index.vue'),
      meta: {
        title: '车站管理',
      },
    },
    {
      path: 'addressingHis',
      name: 'DDServcerAddressingHis',
      component: () => import('/@/views/ddServcer/addressingHis/index.vue'),
      meta: {
        title: '功能号寻址记录',
      },
    },
    {
      path: 'lwLinkHis',
      name: 'DDServcerLwLinkHis',
      component: () => import('/@/views/ddServcer/lwLinkHis/index.vue'),
      meta: {
        title: '列尾寻址记录',
      },
    },
    {
      path: 'lwStatusHis',
      name: 'DDServcerLwStatusHis',
      component: () => import('/@/views/ddServcer/lwStatusHis/index.vue'),
      meta: {
        title: '列尾身份上报记录',
      },
    },
  ],
};
export default ddServcer;
