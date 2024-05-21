/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  account: string;
  passWord: string;
}

export interface RoleInfo {
  roleName: string;
  value: string;
}

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  userId: string | number;
  accessToken: string;
  refreshToken: string;
  roles: RoleInfo[];
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoModel {
  roles: RoleInfo[];
  // 介绍
  desc?: string;
  //用户id
  userId: number;
  // 账户
  userAccount: string;
  // 用户名
  userName: string;
  // 邮箱
  email: string;
  // 头像
  avatar: string;
  // 手机号
  mobile?: string;
  //用户类型：1超级管理员、2租户管理员、3普通账号
  adminType: number;
  //用户登录后打开页面
  homePath: string;
  roleName: string;
  adminTypeName: string;
  //是否是管理员
  isAdmin: boolean;
}
