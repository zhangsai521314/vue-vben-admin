import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
const IFRAME = () => import('/@/views/sys/iframe/FrameBlank.vue');
const reportDesign: AppRouteModule = {
  path: '/demo',
  name: 'demo',
  component: LAYOUT,
  redirect: '/demo/demo1',
  meta: {
    // 隐藏所有子菜单
    hideChildrenInMenu: false,
    // 菜单排序，只对第一级有效
    orderNo: 1,
    icon: 'ion:grid-outline',
    //配置名称，可直接输入字符串，也可使用
    title: 'demo',
  },
  children: [
    {
      path: 'demo1',
      name: 'demo1',
      component: () => import('../../../views/mydemo/demo1.vue'),
      meta: {
        title: 'demo1',
        hideMenu: false,
      },
    },
    {
      path: 'demo2',
      name: 'demo2',
      component: () => import('../../../views/mydemo/demo2.vue'),
      meta: {
        title: 'demo2',
        hideMenu: false,
      },
    },
    {
      path: 'demo3',
      name: 'demo3',
      component: () => import('../../../views/mydemo/demo3.vue'),
      meta: {
        title: 'demo3',
        hideMenu: false,
      },
    },
    {
      path: 'doc',
      name: 'Doc',
      component: IFRAME,
      meta: {
        frameSrc: 'http://analysis.datains.cn/finance-admin/index.html#/chartLib/all',
        title: "内嵌",
      },
    },
    {
      path: 'http://www.baidu.com/',
      name: 'DocExternal',
      component: IFRAME,
      meta: {
        title: '外链',
      },
    }
  ],
};

export default reportDesign;
