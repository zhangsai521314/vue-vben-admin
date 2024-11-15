import type { AppRouteRecordRaw, Menu } from '@/router/types';

import { defineStore } from 'pinia';
import { store } from '@/store';
import { useI18n } from '@/hooks/web/useI18n';
import { useUserStore } from './user';
import { useAppStoreWithOut } from './app';
import { toRaw, unref } from 'vue';
import { transformObjToRoute, flatMultiLevelRoutes } from '@/router/helper/routeHelper';
import { transformRouteToMenu } from '@/router/helper/menuHelper';

import projectSetting from '@/settings/projectSetting';

import { PermissionModeEnum } from '@/enums/appEnum';

import { asyncRoutes } from '@/router/routes';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic';

import { filter } from '@/utils/helper/treeHelper';

import { getMenuList } from '@/api/sys/menu';
import { getPermCode } from '@/api/sys/user';

import { useMessage } from '@/hooks/web/useMessage';
import { PageEnum } from '@/enums/pageEnum';

import { useAppStore } from '@/store/modules/app';
import { message } from 'ant-design-vue';
import { getAuthCache, setAuthCache } from '@/utils/auth';
import { POWER_MENU_KEY } from '@/enums/cacheEnum';

interface PermissionState {
  // Permission code list
  // 权限代码列表
  permCodeList: string[] | number[];
  // Whether the route has been dynamically added
  // 路由是否动态添加
  isDynamicAddedRoute: boolean;
  // To trigger a menu update
  // 触发菜单更新
  lastBuildMenuTime: number;
  // Backstage menu list
  // 后台菜单列表
  backMenuList: Menu[];
  // 菜单列表
  frontMenuList: Menu[];
  domAuthList: [];
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    // 权限代码列表
    permCodeList: [],
    // Whether the route has been dynamically added
    // 路由是否动态添加
    isDynamicAddedRoute: false,
    // To trigger a menu update
    // 触发菜单更新
    lastBuildMenuTime: 0,
    // Backstage menu list
    // 后台菜单列表
    backMenuList: [],
    // menu List
    // 菜单列表
    frontMenuList: [],
    //页面操作按钮权限
    domAuthList: [],
  }),
  getters: {
    getPermCodeList(state): string[] | number[] {
      return state.permCodeList;
    },
    getBackMenuList(state): Menu[] {
      return state.backMenuList;
    },
    getFrontMenuList(state): Menu[] {
      return state.frontMenuList;
    },
    getLastBuildMenuTime(state): number {
      return state.lastBuildMenuTime;
    },
    getIsDynamicAddedRoute(state): boolean {
      return state.isDynamicAddedRoute;
    },
    getDomAuthList(state) {
      return state.domAuthList;
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
      setAuthCache(POWER_MENU_KEY, list);
      list?.length > 0 && this.setLastBuildMenuTime();
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list;
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime();
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },
    setDomAuthList(list: []) {
      this.domAuthList = list;
    },
    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.lastBuildMenuTime = 0;
    },
    async changePermissionCode() {
      const codeList = await getPermCode();
      this.setPermCodeList(codeList);
    },

    // 构建路由
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n();
      const userStore = useUserStore();
      const appStore = useAppStoreWithOut();

      let routes: AppRouteRecordRaw[] = [];
      const roleList = toRaw(userStore.getRoleList) || [];
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;

      // 路由过滤器 在 函数filter 作为回调传入遍历使用
      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // 抽出角色
        const { roles } = meta || {};
        if (!roles) return true;
        // 进行角色权限判断
        return roleList.some((role) => roles.includes(role));
      };

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // ignoreRoute 为true 则路由仅用于菜单生成，不会在实际的路由表中出现
        const { ignoreRoute } = meta || {};
        // arr.filter 返回 true 表示该元素通过测试
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return;
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME;

        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/';
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true });
                throw new Error('end');
              }
            }
            children && children.length > 0 && patcher(children, currentPath);
          });
        }

        try {
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return;
      };

      switch (permissionMode) {
        // 角色权限
        case PermissionModeEnum.ROLE:
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由根据角色权限过滤
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        // 路由映射， 默认进入该case
        case PermissionModeEnum.ROUTE_MAPPING:
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由再次根据角色权限过滤
          routes = routes.filter(routeFilter);
          // 将路由转换成菜单
          const menuList = transformRouteToMenu(routes, true);
          // 移除掉 ignoreRoute: true 的路由 非一级路由
          routes = filter(routes, routeRemoveIgnoreFilter);
          // 移除掉 ignoreRoute: true 的路由 一级路由；
          routes = routes.filter(routeRemoveIgnoreFilter);
          // 对菜单进行排序
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          // 设置菜单列表
          this.setFrontMenuList(menuList);

          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        //  如果确定不需要做后台动态权限，请在下方注释整个判断
        case PermissionModeEnum.BACK:
          //zs增加，拿了PermissionModeEnum.ROUTE_MAPPING的获取文件路由代码
          routes = filter(asyncRoutes, routeFilter);
          routes = routes.filter(routeFilter);
          routes = filter(routes, routeRemoveIgnoreFilter);
          routes = routes.filter(routeRemoveIgnoreFilter);
          //zs更改增加，拿了PermissionModeEnum.ROUTE_MAPPING的获取文件路由代码
          //后台获取菜单路由
          const appStore = useAppStore();
          if (appStore.getProjectConfig.menuSetting.show) {
            const { createMessage } = useMessage();
            createMessage.loading({
              content: t('sys.app.menuLoading'),
              duration: 1,
            });
            // !Simulate to obtain permission codes from the background,
            // this function may only need to be executed once, and the actual project can be put at the right time by itself
            let routeList: AppRouteRecordRaw[] = [];
            try {
              // this.changePermissionCode();
              const datas = await getMenuList();
              routeList = datas.routers;
              //保存菜单信息
              this.setBackMenuList(datas.menus);
              this.setDomAuthList(datas.userAuths);
            } catch (error) {
              console.error(error);
            }

            // Dynamically introduce components
            routeList = transformObjToRoute(routeList);

            // remove meta.ignoreRoute item
            routeList = filter(routeList, routeRemoveIgnoreFilter);
            routeList = routeList.filter(routeRemoveIgnoreFilter);
            routeList = flatMultiLevelRoutes(routeList);
            // this.removeAttr(routeList)
            routes = [...routes, ...routeList];
          }
          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);
      return routes;
    },
    //zs更改（添加）
    checkMenuPower(url, isShowMsg = true) {
      url = decodeURIComponent(unref(url)).replace('/redirect/', '');
      if (url.length >= 10 && url.substring(0, 10) == '/redirect/') {
        url = url.substring(10);
      }
      if (url.split('/').length > 0 && url.split('/')[url.split('/').length - 1] == 'path') {
        url = url.substring(0, url.lastIndexOf('/'));
      }
      if (
        url.indexOf('/message/index') != -1 &&
        url.substring(0, 14).toLowerCase() == '/message/index'
      ) {
        url = '/message/index';
      }
      const userStore = useUserStore();
      const userData = userStore.getUserInfo;
      if (!userData.isAdmin) {
        //菜单白名单
        const whiteList = [
          '/DownVersion',
          '/userinfo',
          '/windows',
          '/nopower',
          '/userinfo/index',
          '/windows/index',
          '/nopower/index',
        ];
        if (!whiteList.includes(url.toLowerCase())) {
          const menuList = [];
          if (this.backMenuList.length == 0) {
            myCommon.generateList(menuList, getAuthCache(POWER_MENU_KEY), 'children');
          } else {
            myCommon.generateList(menuList, this.backMenuList, 'children');
          }
          if (menuList) {
            let menu = menuList.find((m) => m['path'] == url || m['menuurl'] == url);
            if (!menu) {
              let isUpUrl = false;
              const urlSP = url.split('/');
              if (urlSP[1].toLowerCase() == 'reportdesign') {
                urlSP[1] = 'reportView';
                isUpUrl = true;
              } else if (urlSP[1].toLowerCase() == 'formdesign') {
                urlSP[1] = 'formView';
                isUpUrl = true;
              }
              url = urlSP.join('/');
              menu = menuList.find((m) => m['path'] == url || m['menuurl'] == url);
              if (
                menu &&
                isUpUrl &&
                menu.powerType.indexOf('1') == -1 &&
                menu.powerType.indexOf('2') == -1
              ) {
                if (isShowMsg) {
                  message.warning('您没有打开该菜单的权限');
                }
                return false;
              }
            }
            if (!menu && isShowMsg) {
              message.warning('您没有打开该菜单的权限');
            }
            return menu != undefined ? true : false;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
  },
});

// Need to be used outside the setup
// 需要在设置之外使用
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
