/**
 * @file src/config/constants/error-messages.js
 * @description 错误消息和状态消息常量定义
 * 
 * 包含应用程序中所有错误消息、警告信息、成功提示等，
 * 确保错误处理的一致性和用户体验的统一性。
 */

/**
 * 通用错误消息
 */
export const GENERIC_ERRORS = {
  UNKNOWN_ERROR: '发生未知错误',
  NETWORK_ERROR: '网络连接错误',
  TIMEOUT_ERROR: '操作超时',
  PERMISSION_DENIED: '权限被拒绝',
  INVALID_INPUT: '输入无效',
  OPERATION_FAILED: '操作失败',
  SERVICE_UNAVAILABLE: '服务不可用',
};

/**
 * 剪贴板相关错误消息
 */
export const CLIPBOARD_ERRORS = {
  NO_CONTENT: '没有内容可复制',
  COPY_FAILED: '复制失败',
  PASTE_FAILED: '粘贴失败',
  CLIPBOARD_ACCESS_DENIED: '浏览器拒绝了剪贴板访问请求，请检查页面权限设置',
  CONTENT_TOO_LARGE: '内容过大，请尝试分段复制',
  TIMEOUT: '复制操作超时',
  BROWSER_NOT_SUPPORTED: '当前浏览器不支持此功能',
};



/**
 * 网络相关错误消息
 */
export const NETWORK_ERRORS = {
  CONNECTION_FAILED: '连接失败',
  REQUEST_TIMEOUT: '请求超时',
  SERVER_ERROR: '服务器错误',
  BAD_REQUEST: '请求格式错误',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '访问被禁止',
  NOT_FOUND: '资源未找到',
  RATE_LIMITED: '请求过于频繁',
};


