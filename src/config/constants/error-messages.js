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
 * 文件操作错误消息
 */
export const FILE_ERRORS = {
  FILE_NOT_FOUND: '文件未找到',
  FILE_READ_ERROR: '文件读取失败',
  FILE_WRITE_ERROR: '文件写入失败',
  FILE_TOO_LARGE: '文件过大',
  INVALID_FILE_TYPE: '不支持的文件类型',
  FILE_CORRUPTED: '文件已损坏',
  DISK_FULL: '磁盘空间不足',
  ACCESS_DENIED: '文件访问被拒绝',
};

/**
 * 编辑器相关错误消息
 */
export const EDITOR_ERRORS = {
  INIT_FAILED: '编辑器初始化失败',
  CONTENT_LOAD_FAILED: '内容加载失败',
  SAVE_FAILED: '保存失败',
  UNDO_FAILED: '撤销操作失败',
  REDO_FAILED: '重做操作失败',
  INVALID_SELECTION: '无效的选择区域',
  OPERATION_NOT_SUPPORTED: '不支持的操作',
};

/**
 * 主题相关错误消息
 */
export const THEME_ERRORS = {
  THEME_NOT_FOUND: '主题未找到',
  THEME_LOAD_FAILED: '主题加载失败',
  INVALID_THEME_CONFIG: '无效的主题配置',
  THEME_APPLY_FAILED: '主题应用失败',
  CUSTOM_THEME_ERROR: '自定义主题错误',
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

/**
 * 验证错误消息
 */
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: '此字段为必填项',
  INVALID_EMAIL: '邮箱格式无效',
  INVALID_URL: 'URL 格式无效',
  PASSWORD_TOO_SHORT: '密码长度不足',
  PASSWORD_TOO_WEAK: '密码强度不够',
  INVALID_FORMAT: '格式无效',
  VALUE_TOO_LONG: '值过长',
  VALUE_TOO_SHORT: '值过短',
  INVALID_RANGE: '值超出有效范围',
};

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  COPY_SUCCESS: '复制成功',
  EXPORT_SUCCESS: '导出成功',
  IMPORT_SUCCESS: '导入成功',
  THEME_APPLIED: '主题已应用',
  SETTINGS_SAVED: '设置已保存',
  OPERATION_COMPLETED: '操作完成',
  FILE_UPLOADED: '文件上传成功',
  SYNC_COMPLETED: '同步完成',
};

/**
 * 警告消息
 */
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: '有未保存的更改',
  LARGE_FILE_WARNING: '文件较大，可能影响性能',
  BROWSER_COMPATIBILITY: '浏览器兼容性警告',
  FEATURE_DEPRECATED: '此功能即将废弃',
  STORAGE_ALMOST_FULL: '存储空间即将用完',
  SLOW_CONNECTION: '网络连接较慢',
  BETA_FEATURE: '这是测试功能',
};

/**
 * 信息提示消息
 */
export const INFO_MESSAGES = {
  LOADING_CONTENT: '正在加载内容...',
  SAVING_CHANGES: '正在保存更改...',
  PROCESSING: '正在处理...',
  CONNECTING: '正在连接...',
  SYNCING: '正在同步...',
  UPDATING: '正在更新...',
  INITIALIZING: '正在初始化...',
  PREPARING: '正在准备...',
};

/**
 * 确认对话框消息
 */
export const CONFIRMATION_MESSAGES = {
  DELETE_CONFIRM: '确定要删除吗？',
  CLEAR_CONFIRM: '确定要清空所有内容吗？',
  RESET_CONFIRM: '确定要重置设置吗？',
  OVERWRITE_CONFIRM: '文件已存在，是否覆盖？',
  DISCARD_CHANGES: '确定要放弃更改吗？',
  LOGOUT_CONFIRM: '确定要退出登录吗？',
  PERMANENT_ACTION: '此操作不可撤销，确定继续吗？',
};
