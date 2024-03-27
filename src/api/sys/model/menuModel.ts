import type { AppRouteRecordRaw } from '@/router/types';

export interface RouteItem {
  userAuths: [];
  menus: [];
  routers: AppRouteRecordRaw[];
}

/**
 * @description: Get menu return value
 */
export type getMenuListResultModel = RouteItem[];
