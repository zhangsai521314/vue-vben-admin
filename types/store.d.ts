import { ErrorTypeEnum } from '@/enums/exceptionEnum';
import { MenuModeEnum, MenuTypeEnum } from '@/enums/menuEnum';
import { RoleInfo } from '@/api/sys/model/userModel';

// Lock screen information
export interface LockInfo {
  // Password required
  pwd?: string | undefined;
  // Is it locked?
  isLock?: boolean;
}

export interface ApiAddress {
  key: string;
  val: string;
}

// Error-log information
export interface ErrorLogInfo {
  // Type of error
  type: ErrorTypeEnum;
  // Error file
  file: string;
  // Error name
  name?: string;
  // Error message
  message: string;
  // Error stack
  stack?: string;
  // Error detail
  detail: string;
  // Error url
  url: string;
  // Error time
  time?: string;
}

export interface UserInfo {
  //用户id
  userId: number;
  // 账户
  account: string;
  // 用户名
  userName: string;
  // 邮箱
  email: string;
  // 头像
  avatar: string;
  // 手机号
  phone?: string;
  //用户类型：1超级管理员、2租户管理员、3普通账号
  adminType: number;
  //用户登录后打开页面
  homePath: string;
  roleName: string;
  adminTypeName: string;
  //是否是管理员
  isAdmin: boolean;
  //部门名称
  orgName: string;

  desc?: string;
  roles: RoleInfo[];
}

export interface BeforeMiniState {
  menuCollapsed?: boolean;
  menuSplit?: boolean;
  menuMode?: MenuModeEnum;
  menuType?: MenuTypeEnum;
}

export interface TableSetting {
  size: Nullable<SizeType>;
  showIndexColumn: Recordable<Nullable<boolean>>;
  columns: Recordable<Nullable<Array<ColumnOptionsType>>>;
  showRowSelection: Recordable<Nullable<boolean>>;
}

//告警信息
export interface AlarmData {
  alarmId: string;
  joinId: string;
  alarmType?: string;
  alarmStatus?: number;
  alarmTitle?: string;
  alarmMsg?: string;
  alarmTime?: string;
  alarmTimeTnd?: string;
  alarmDuration?: number;
  createTime?: string;
  remark?: string;
  confirmTime?: string;
  confirmUser?: string;
}
