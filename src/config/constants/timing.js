/**
 * @file src/config/constants/timing.js
 * @description 时间和超时相关的常量定义
 * 
 * 包含应用程序中所有与时间、延迟、超时相关的常量，
 * 用于替换代码中的魔法数字，提高可维护性。
 */

/**
 * 超时配置常量（毫秒）
 */
export const TIMEOUTS = {
  // 剪贴板操作超时
  CLIPBOARD_OPERATION: 10000, // 10秒
  
  // 网络请求超时
  NETWORK_REQUEST: 5000, // 5秒
  
  // 文件操作超时
  FILE_OPERATION: 3000, // 3秒
  
  // 主题切换动画超时
  THEME_TRANSITION: 300, // 300毫秒
  
  // 自动保存间隔
  AUTO_SAVE: 30000, // 30秒
  
  // 防抖延迟
  DEBOUNCE_DELAY: 300, // 300毫秒
  
  // 节流延迟
  THROTTLE_DELAY: 100, // 100毫秒
};

/**
 * 动画持续时间常量（毫秒）
 */
export const ANIMATION_DURATION = {
  // 快速动画
  FAST: 150,
  
  // 标准动画
  NORMAL: 300,
  
  // 慢速动画
  SLOW: 500,
  
  // 页面转场
  PAGE_TRANSITION: 400,
  
  // 模态框动画
  MODAL: 250,
  
  // 工具提示
  TOOLTIP: 200,
};

/**
 * 延迟配置常量（毫秒）
 */
export const DELAYS = {
  // 编辑器初始化延迟
  EDITOR_INIT: 0,
  
  // 工具提示显示延迟
  TOOLTIP_SHOW: 500,
  
  // 工具提示隐藏延迟
  TOOLTIP_HIDE: 100,
  
  // 搜索建议延迟
  SEARCH_SUGGESTION: 300,
  
  // 错误消息自动隐藏延迟
  ERROR_AUTO_HIDE: 5000,
  
  // 成功消息自动隐藏延迟
  SUCCESS_AUTO_HIDE: 3000,
};

/**
 * 重试配置常量
 */
export const RETRY_CONFIG = {
  // 最大重试次数
  MAX_ATTEMPTS: 3,
  
  // 重试间隔（毫秒）
  RETRY_DELAY: 1000,
  
  // 指数退避因子
  BACKOFF_FACTOR: 2,
};

/**
 * 缓存过期时间常量（毫秒）
 */
export const CACHE_EXPIRY = {
  // 主题缓存
  THEME_CACHE: 24 * 60 * 60 * 1000, // 24小时
  
  // 用户设置缓存
  USER_SETTINGS: 7 * 24 * 60 * 60 * 1000, // 7天
  
  // 临时数据缓存
  TEMP_DATA: 60 * 60 * 1000, // 1小时
};
