// memoryManager.ts

// Vue 3 插件
import { type App, inject } from 'vue';

/**
 * 浏览器内存信息接口
 * 通过 performance.memory API 获取的 JavaScript 堆内存信息
 */
export interface MemoryInfo {
  /**
   * 当前已使用的 JavaScript 堆内存大小（字节）
   * 表示 JavaScript 对象实际占用的内存量
   */
  usedJSHeapSize: number;

  /**
   * 当前分配的 JavaScript 堆内存总大小（字节）
   * 包含已使用和空闲的内存，反映浏览器为 JS 分配的总堆大小
   */
  totalJSHeapSize: number;

  /**
   * JavaScript 堆内存的最大限制（字节）
   * 浏览器允许 JavaScript 使用的最大内存量
   */
  jsHeapSizeLimit: number;
}

/**
 * 内存管理器配置选项接口
 * 用于自定义内存监控和清理行为
 */
export interface MemoryManagerOptions {
  /**
   * 内存泄漏阈值（MB）
   * 当已使用内存超过此阈值时触发自动清理
   * @default 800 (MB)
   */
  leakThreshold?: number;

  /**
   * 内存检查间隔（毫秒）
   * 定时检查内存使用情况的时间间隔
   * @default 60000 (1分钟)
   */
  checkInterval?: number;

  /**
   * 自动清理阈值（MB）
   * 紧急情况下触发强制清理的内存阈值
   * @default 1500 (MB)
   */
  autoCleanupThreshold?: number;

  /**
   * 最大清理尝试次数
   * 在一定时间窗口内允许的最大清理次数，防止过度清理
   * @default 5
   */
  maxCleanupAttempts?: number;

  /**
   * 是否启用 GC API
   * 是否使用 Chrome/Edge 的 gc() 函数进行垃圾回收
   * 需要浏览器以 --js-flags="--expose-gc" 参数启动
   * @default true
   */
  enableGCApi?: boolean;

  /**
   * 是否自动启动内存监控
   * 内存管理器实例化后是否立即开始监控内存使用
   * @default false
   */
  autoStartMonitoring?: boolean;

  /**
   * 是否使用全局实例
   * 在 Vue 插件中决定使用全局实例还是创建新实例
   * @default true
   */
  useGlobalInstance?: boolean;

  /**
   * 清理计数重置时间窗口（毫秒）
   * 清理尝试计数自动重置的时间窗口
   * @default 1800000 (30分钟)
   */
  cleanupResetWindow?: number;
}

export class MemoryManager {
  private cleanupCallbacks: Set<() => void | Promise<void>>;
  private leakThreshold: number;
  private autoCleanupThreshold: number;
  private checkInterval: number;
  private maxCleanupAttempts: number;
  private cleanupAttempts: number;
  private enableGCApi: boolean;
  private autoStartMonitoring: boolean;
  private cleanupResetWindow: number;

  private lastMemoryCheck: number;
  private lastUsedMemory: number;
  private monitoringInterval: number | null;
  private gcAvailable: boolean;
  private cleanupTimestamps: number[];

  constructor(options: MemoryManagerOptions = {}) {
    this.cleanupCallbacks = new Set();
    this.leakThreshold = (options.leakThreshold || 700) * 1024 * 1024;
    this.autoCleanupThreshold = (options.autoCleanupThreshold || 1000) * 1024 * 1024;
    this.checkInterval = options.checkInterval || 60000;
    this.maxCleanupAttempts = options.maxCleanupAttempts || 2;
    this.enableGCApi = options.enableGCApi ?? true;
    this.autoStartMonitoring = options.autoStartMonitoring ?? false; // 默认不自动启动
    this.cleanupResetWindow = options.cleanupResetWindow || 1800000;

    this.cleanupAttempts = 0;
    this.cleanupTimestamps = [];
    this.lastMemoryCheck = Date.now();
    this.lastUsedMemory = 0;
    this.monitoringInterval = null;

    this.gcAvailable = this.enableGCApi && typeof (window as any).gc === 'function';

    if (!this.isMemoryAPISupported()) {
      console.warn('当前浏览器不支持 performance.memory API，仅支持手动清理');
    }

    console.log('🧠 内存管理器初始化完成', {
      泄漏阈值: `${this.leakThreshold / 1024 / 1024}MB`,
      检查间隔: `${this.checkInterval}ms`,
      自动启动: this.autoStartMonitoring,
    });
  }

  public isMemoryAPISupported(): boolean {
    return !!(performance as any).memory;
  }

  public getMemoryInfo(): MemoryInfo | null {
    const perf = performance as any;
    return perf.memory
      ? {
          usedJSHeapSize: perf.memory.usedJSHeapSize,
          totalJSHeapSize: perf.memory.totalJSHeapSize,
          jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
        }
      : null;
  }

  public registerCleanup(callback: () => void | Promise<void>): () => boolean {
    this.cleanupCallbacks.add(callback);
    return () => this.cleanupCallbacks.delete(callback);
  }

  /**
   * 更新清理尝试计数
   * 移除超过时间窗口的旧记录
   */
  private updateCleanupAttempts(): void {
    const now = Date.now();
    const windowStart = now - this.cleanupResetWindow;

    // 移除时间窗口之外的记录
    const validTimestamps = this.cleanupTimestamps.filter((timestamp) => timestamp > windowStart);

    // 更新数组和计数
    this.cleanupTimestamps = validTimestamps;
    this.cleanupAttempts = validTimestamps.length;
  }

  /**
   * 记录一次清理尝试
   */
  private recordCleanupAttempt(): void {
    const now = Date.now();
    this.cleanupTimestamps.push(now);
    this.updateCleanupAttempts();

    console.log(
      `📝 记录清理尝试，当前时间窗口内尝试次数: ${this.cleanupAttempts}/${this.maxCleanupAttempts}`,
    );
  }

  /**
   * 检查是否允许清理
   */
  private canCleanup(): boolean {
    this.updateCleanupAttempts();

    if (this.cleanupAttempts >= this.maxCleanupAttempts) {
      const oldestTimestamp = Math.min(...this.cleanupTimestamps);
      const nextAvailable = oldestTimestamp + this.cleanupResetWindow;
      const remainingTime = nextAvailable - Date.now();
      const remainingMinutes = Math.ceil(remainingTime / 60000);

      console.warn(
        `已达到最大清理尝试次数 (${this.maxCleanupAttempts})，` +
          `请在 ${remainingMinutes} 分钟后再试`,
      );
      return false;
    }

    return true;
  }

  public async forceCleanup(): Promise<boolean> {
    // 检查是否允许清理
    if (!this.canCleanup()) {
      return false;
    }

    console.log('🚀 开始内存清理...');
    this.recordCleanupAttempt();

    const startTime = Date.now();
    let success = true;

    try {
      // 执行所有注册的清理回调
      const callbacks = Array.from(this.cleanupCallbacks);
      for (let i = 0; i < callbacks.length; i++) {
        try {
          await callbacks[i]();
          console.log(`✅ 清理回调 ${i + 1}/${callbacks.length} 执行成功`);
        } catch (error) {
          console.warn(`❌ 清理回调 ${i + 1}/${callbacks.length} 执行失败:`, error);
          success = false;
        }
      }

      // Chrome/Edge 专用垃圾回收
      if (this.gcAvailable) {
        try {
          (window as any).gc();
          console.log('🔧 已触发 Chrome/Edge 垃圾回收');
        } catch (error) {
          console.warn('Chrome/Edge 垃圾回收失败:', error);
          success = false;
        }
      } else {
        console.log('⚠️ GC API 不可用，请使用 --js-flags="--expose-gc" 启动浏览器');
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ 内存清理完成，耗时 ${executionTime}ms`);

      return success;
    } catch (error) {
      console.error('内存清理过程中发生错误:', error);
      return false;
    }
  }

  public startMonitoring(): boolean {
    // 如果已经在监控中，直接返回
    if (this.monitoringInterval) {
      console.log('ℹ️ 内存监控已在运行');
      return true;
    }

    try {
      this.monitoringInterval = window.setInterval(() => {
        this.checkMemoryUsage();
      }, this.checkInterval);

      console.log(`🔄 内存监控已启动，检查间隔: ${this.checkInterval}ms`);
      return true;
    } catch (error) {
      console.error('启动内存监控失败:', error);
      return false;
    }
  }

  public stopMonitoring(): boolean {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ 内存监控已停止');
      return true;
    }
    return false;
  }

  private checkMemoryUsage(): void {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return;

    const currentMemory = memoryInfo.usedJSHeapSize;
    const currentTime = Date.now();

    // 计算内存增长速率（小时）
    const timeDiffMs = currentTime - this.lastMemoryCheck;
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    const memoryDiff = currentMemory - this.lastUsedMemory;

    // 确保时间差有效
    if (timeDiffHours > 0 && timeDiffMs > 5000) {
      // 至少5秒间隔，避免初始波动
      const leakRateMB = memoryDiff / (1024 * 1024) / timeDiffHours;
      const usedMB = Math.round(currentMemory / 1024 / 1024);

      // 如果泄漏速率超过20MB/小时，自动清理
      if (leakRateMB > 20 && memoryDiff > 10 * 1024 * 1024) {
        // 确保有实际增长
        console.warn(`🚨 检测到内存泄漏 ${leakRateMB.toFixed(2)}MB/小时，触发自动清理`);
        this.forceCleanup();
        return;
      }

      // 如果总内存超过泄漏阈值，触发清理
      if (currentMemory > this.leakThreshold) {
        const thresholdMB = Math.round(this.leakThreshold / 1024 / 1024);
        console.warn(`⚠️ 内存使用 ${usedMB}MB 超过阈值 ${thresholdMB}MB，触发清理`);
        this.forceCleanup();
        return;
      }

      // 紧急清理阈值
      if (currentMemory > this.autoCleanupThreshold) {
        const thresholdMB = Math.round(this.autoCleanupThreshold / 1024 / 1024);
        console.error(`🚨 紧急: 内存使用 ${usedMB}MB 超过紧急阈值 ${thresholdMB}MB，立即清理`);
        this.forceCleanup();
        return;
      }
    }

    this.lastMemoryCheck = currentTime;
    this.lastUsedMemory = currentMemory;
  }

  public getMemoryStats(): {
    usedMB: number;
    totalMB: number;
    limitMB: number;
    usagePercent: number;
    gcAvailable: boolean;
  } | null {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return null;

    const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1048576);
    const totalMB = Math.round(memoryInfo.totalJSHeapSize / 1048576);
    const limitMB = Math.round(memoryInfo.jsHeapSizeLimit / 1048576);
    const usagePercent = totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0;

    return {
      usedMB,
      totalMB,
      limitMB,
      usagePercent,
      gcAvailable: this.gcAvailable,
    };
  }

  public getCleanupStatus(): {
    registeredCallbacks: number;
    cleanupAttempts: number;
    maxCleanupAttempts: number;
    isMonitoring: boolean;
    nextResetIn: number;
    cleanupResetWindow: number;
    cleanupTimestamps: number[];
  } {
    this.updateCleanupAttempts();

    const now = Date.now();
    const nextReset =
      this.cleanupTimestamps.length > 0
        ? Math.min(...this.cleanupTimestamps) + this.cleanupResetWindow
        : now;

    return {
      registeredCallbacks: this.cleanupCallbacks.size,
      cleanupAttempts: this.cleanupAttempts,
      maxCleanupAttempts: this.maxCleanupAttempts,
      isMonitoring: this.monitoringInterval !== null,
      nextResetIn: Math.max(0, nextReset - now),
      cleanupResetWindow: this.cleanupResetWindow,
      cleanupTimestamps: [...this.cleanupTimestamps],
    };
  }

  public updateConfig(newConfig: Partial<MemoryManagerOptions>): void {
    const wasMonitoring = this.monitoringInterval !== null;

    // 先停止监控（如果正在运行）
    if (wasMonitoring) {
      this.stopMonitoring();
    }

    if (newConfig.leakThreshold !== undefined) {
      this.leakThreshold = newConfig.leakThreshold * 1024 * 1024;
    }

    if (newConfig.autoCleanupThreshold !== undefined) {
      this.autoCleanupThreshold = newConfig.autoCleanupThreshold * 1024 * 1024;
    }

    if (newConfig.checkInterval !== undefined) {
      this.checkInterval = newConfig.checkInterval;
    }

    if (newConfig.maxCleanupAttempts !== undefined) {
      this.maxCleanupAttempts = newConfig.maxCleanupAttempts;
    }

    if (newConfig.autoStartMonitoring !== undefined) {
      this.autoStartMonitoring = newConfig.autoStartMonitoring;
    }

    if (newConfig.cleanupResetWindow !== undefined) {
      this.cleanupResetWindow = newConfig.cleanupResetWindow;
      this.updateCleanupAttempts();
    }

    // 根据新的 autoStartMonitoring 设置决定是否重新启动监控
    if (this.autoStartMonitoring) {
      this.startMonitoring();
    }

    console.log('✅ 内存管理器配置已更新', {
      泄漏阈值: `${this.leakThreshold / 1024 / 1024}MB`,
      检查间隔: `${this.checkInterval}ms`,
      自动启动: this.autoStartMonitoring,
      监控状态: this.monitoringInterval !== null ? '运行中' : '已停止',
    });
  }

  /**
   * 手动重置清理计数
   */
  public resetCleanupAttempts(): void {
    this.cleanupAttempts = 0;
    this.cleanupTimestamps = [];
    console.log('🔄 清理尝试计数已手动重置');
  }

  public destroy(): void {
    this.stopMonitoring();
    this.cleanupCallbacks.clear();
    console.log('🧹 内存管理器已销毁');
  }
}

// 创建全局内存管理器实例（默认不自动启动监控）
export const memoryManager = new MemoryManager({
  autoStartMonitoring: false, // 全局实例默认不启动
});

const MemoryManagerSymbol = Symbol('MemoryManager');

export const memoryManagerPlugin = {
  install(app: App, options: MemoryManagerOptions = {}) {
    const useGlobalInstance = options.useGlobalInstance ?? true;
    let manager: MemoryManager;

    if (useGlobalInstance) {
      manager = memoryManager;
      console.log('🔗 使用全局内存管理器实例');

      // 更新配置但不自动启动监控
      manager.updateConfig({
        ...options,
        autoStartMonitoring: false, // 确保配置更新时不自动启动
      });

      // 根据用户配置决定是否启动监控
      if (options.autoStartMonitoring) {
        console.log('🚀 根据配置启动内存监控');
        manager.startMonitoring();
      }
    } else {
      console.log('🆕 创建新的内存管理器实例');
      manager = new MemoryManager({
        ...options,
        autoStartMonitoring: false, // 创建时不自动启动
      });

      // 根据用户配置决定是否启动监控
      if (options.autoStartMonitoring) {
        console.log('🚀 根据配置启动内存监控');
        manager.startMonitoring();
      }
    }

    // 全局提供
    app.provide(MemoryManagerSymbol, manager);
    app.config.globalProperties.$memoryManager = manager;

    // 应用卸载时清理
    const originalUnmount = app.unmount;
    app.unmount = function () {
      if (manager !== memoryManager) {
        manager.destroy();
      }
      originalUnmount();
    };

    console.log('✅ 内存管理器插件安装完成', {
      监控状态: manager.getCleanupStatus().isMonitoring ? '运行中' : '已停止',
    });

    return manager;
  },
};

// Composition API
export function useMemoryManager(): MemoryManager {
  const manager = inject<MemoryManager>(MemoryManagerSymbol);
  if (!manager) {
    throw new Error('请先安装 memoryManagerPlugin');
  }
  return manager;
}

export default memoryManager;
