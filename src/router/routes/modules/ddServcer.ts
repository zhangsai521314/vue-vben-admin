import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const ddServcer: AppRouteModule = {
  path: '/ddServcer',
  name: 'DDServcer',
  component: LAYOUT,
  redirect: '/ddServcer/black',
  meta: {
    //调度服务
    title: '',
  },
  children: [
    {
      path: 'black',
      name: 'DDServcerBlack',
      component: () => import('/@/views/ddServcer/black/index.vue'),
      meta: {
        //黑名单管理
        title: '',
      },
    },
    {
      path: 'cirStatus',
      name: 'DDServcerCirStatus',
      component: () => import('/@/views/ddServcer/cirStatus/index.vue'),
      meta: {
        //cir在线状态
        title: '',
      },
    },
    {
      path: 'dcStatus',
      name: 'DDServcerDCStatus',
      component: () => import('/@/views/ddServcer/dcStatus/index.vue'),
      meta: {
        //调度台/值班台在线状态
        title: '',
      },
    },
    {
      path: 'lacci',
      name: 'DDServcerLacci',
      component: () => import('/@/views/ddServcer/lacci/index.vue'),
      meta: {
        //ECI管理
        title: '',
      },
    },
    {
      path: 'stationLacci',
      name: 'DDServcerStationLacci',
      component: () => import('/@/views/ddServcer/stationLacci/index.vue'),
      meta: {
        //车站ECI管理
        title: '',
      },
    },
    {
      path: 'line',
      name: 'DDServcerLine',
      component: () => import('/@/views/ddServcer/line/index.vue'),
      meta: {
        //线路管理
        title: '',
      },
    },
    {
      path: 'mobileStatus',
      name: 'DDServcerMobileStatus',
      component: () => import('/@/views/ddServcer/mobileStatus/index.vue'),
      meta: {
        //手持台在线状态
        title: '',
      },
    },
    {
      path: 'registerHistory',
      name: 'DDServcerRegisterHistory',
      component: () => import('/@/views/ddServcer/registerHistory/index.vue'),
      meta: {
        //注册注销记录
        title: '',
      },
    },
    {
      path: 'station',
      name: 'DDServcerStation',
      component: () => import('/@/views/ddServcer/station/index.vue'),
      meta: {
        //车站管理
        title: '',
      },
    },
    {
      path: 'addressingHis',
      name: 'DDServcerAddressingHis',
      component: () => import('/@/views/ddServcer/addressingHis/index.vue'),
      meta: {
        //功能号寻址记录
        title: '',
      },
    },
    {
      path: 'lwLinkHis',
      name: 'DDServcerLwLinkHis',
      component: () => import('/@/views/ddServcer/lwLinkHis/index.vue'),
      meta: {
        //列尾寻址记录
        title: '',
      },
    },
    {
      path: 'lwStatusHis',
      name: 'DDServcerLwStatusHis',
      component: () => import('/@/views/ddServcer/lwStatusHis/index.vue'),
      meta: {
        //列尾身份上报记录
        title: '',
      },
    },
  ],
};
export default ddServcer;
