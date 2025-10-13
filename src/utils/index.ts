/**
 * 通用工具函数集合
 */

// 格式化时间
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '00:00';
  }
  
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 防抖函数
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj as unknown as T;
  }
  
  return obj;
}

// 检测URL是否为有效视频链接
export function isValidVideoUrl(url: string): boolean {
  try {
    new URL(url);
    const extensions = ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.m3u8', '.mpd'];
    const lowerUrl = url.toLowerCase();
    return extensions.some(ext => lowerUrl.endsWith(ext));
  } catch {
    return false;
  }
}

// 检测媒体类型
export function getMediaType(url: string): string {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.endsWith('.mp4')) return 'video/mp4';
  if (lowerUrl.endsWith('.webm')) return 'video/webm';
  if (lowerUrl.endsWith('.mkv')) return 'video/x-matroska';
  if (lowerUrl.endsWith('.avi')) return 'video/x-msvideo';
  if (lowerUrl.endsWith('.mov')) return 'video/quicktime';
  if (lowerUrl.endsWith('.flv')) return 'video/x-flv';
  if (lowerUrl.endsWith('.wmv')) return 'video/x-ms-wmv';
  if (lowerUrl.endsWith('.m3u8')) return 'application/x-mpegURL';
  if (lowerUrl.endsWith('.mpd')) return 'application/dash+xml';
  
  return 'video/mp4'; // 默认类型
}

// 从URL中提取域名
export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return '';
  }
}

// 安全的JSON解析
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (err) {
      console.error('Failed to parse JSON:', err);
      return defaultValue;
    }
}

// 睡眠函数
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 检查网络连接
export async function checkNetworkConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// 下载文件
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 本地存储操作的包装器
export const storage = {
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Failed to set item in localStorage:', err);
    }
  },
  
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : defaultValue;
    } catch (err) {
      console.error('Failed to get item from localStorage:', err);
      return defaultValue;
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error('Failed to remove item from localStorage:', err);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
    }
  }
};