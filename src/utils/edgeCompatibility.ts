// Edge浏览器兼容性工具类

/**
 * 检测当前浏览器是否为Microsoft Edge
 * @returns boolean - 当前是否为Edge浏览器
 */
export const isEdgeBrowser = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // 检测Edge浏览器的多种方式
  const isChromiumEdge = /edg\/([\d.]+)/.test(userAgent);
  const isLegacyEdge = /trident\/.*rv:([\d.]+)/.test(userAgent);
  
  return isChromiumEdge || isLegacyEdge;
};

/**
 * 检测当前Edge浏览器的版本号
 * @returns number | null - Edge版本号，如果不是Edge则返回null
 */
export const getEdgeVersion = (): number | null => {
  const userAgent = navigator.userAgent.toLowerCase();
  let version = null;
  
  // 检测Chromium Edge
  const chromiumEdgeMatch = userAgent.match(/edg\/([\d.]+)/);
  if (chromiumEdgeMatch && chromiumEdgeMatch[1]) {
    version = parseInt(chromiumEdgeMatch[1].split('.')[0], 10);
  }
  
  // 检测Legacy Edge
  const legacyEdgeMatch = userAgent.match(/trident\/.*rv:([\d.]+)/);
  if (legacyEdgeMatch && legacyEdgeMatch[1]) {
    version = parseInt(legacyEdgeMatch[1].split('.')[0], 10);
  }
  
  return version;
};

/**
 * 针对Edge浏览器的CSS修复
 * 在组件挂载后调用此函数应用Edge特定的样式修复
 * @param element - 可选的目标DOM元素，如果不提供则应用于document.body
 */
export const applyEdgeCssFixes = (element?: HTMLElement): void => {
  if (!isEdgeBrowser()) return;
  
  const targetElement = element || document.body;
  const edgeVersion = getEdgeVersion();
  
  // 为Edge添加特定的CSS类
  targetElement.classList.add('edge-browser');
  
  if (edgeVersion && edgeVersion < 90) {
    // 针对旧版Edge的特定修复
    targetElement.classList.add('legacy-edge');
    
    // 修复Edge 12-18中的Flexbox问题
    const flexContainers = targetElement.querySelectorAll('[style*="display: flex"], [style*="display:flex"], .flex-container');
    flexContainers.forEach((container) => {
      (container as HTMLElement).style.display = '-ms-flexbox';
      setTimeout(() => {
        (container as HTMLElement).style.display = 'flex';
      }, 0);
    });
  }
};

/**
 * Edge浏览器中使用的防抖函数实现
 * 解决Edge中某些版本的setTimeout行为不一致问题
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounceForEdge = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    // Edge中setTimeout的特殊处理
    if (isEdgeBrowser()) {
      // 使用requestAnimationFrame确保在Edge中的稳定性
      timeout = window.setTimeout(later, wait) as unknown as number;
    } else {
      timeout = window.setTimeout(later, wait) as unknown as number;
    }
  };
};

/**
 * Edge浏览器中的Fetch API兼容性封装
 * 解决Edge中某些版本的fetch行为不一致问题
 * @param url - 请求URL
 * @param options - fetch选项
 * @returns Promise<Response>
 */
export const fetchForEdge = async (url: string, options?: RequestInit): Promise<Response> => {
  if (!isEdgeBrowser()) {
    return fetch(url, options);
  }
  
  // 创建兼容Edge的选项
  const edgeOptions = {
    ...options,
    cache: options?.cache || 'no-cache', // Edge中缓存行为可能不一致
  };
  
  try {
    const response = await fetch(url, edgeOptions);
    
    // 检查响应是否成功
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Fetch failed in Edge:', error);
    
    // 降级处理：如果fetch失败，尝试使用XMLHttpRequest作为备选
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(edgeOptions.method || 'GET', url, true);
      
      // 设置请求头
      if (edgeOptions.headers) {
        Object.entries(edgeOptions.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value.toString());
        });
      }
      
      // 添加超时处理
      xhr.timeout = 10000; // 10 seconds timeout
      
      // 处理成功响应
      xhr.onload = () => {
        const headers = new Headers();
        // 解析响应头
        if (xhr.getAllResponseHeaders()) {
          xhr
            .getAllResponseHeaders()
            .split('\r\n')
            .forEach((header) => {
              const [key, value] = header.split(': ');
              if (key) {
                headers.append(key, value);
              }
            });
        }
        
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers,
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          reject(new Error(`HTTP error! Status: ${xhr.status} ${xhr.statusText}`));
        }
      };
      
      // 处理网络错误
      xhr.onerror = () => {
        reject(new Error('Network error: Failed to connect to the server. Please check your internet connection and try again.'));
      };
      
      // 处理超时
      xhr.ontimeout = () => {
        reject(new Error('Request timeout: The server did not respond in time. Please try again later.'));
      };
      
      // 发送请求
      try {
        if (edgeOptions.body) {
          // 处理不同类型的body - 确保类型兼容
          if (typeof edgeOptions.body === 'string') {
            xhr.send(edgeOptions.body);
          } else if (edgeOptions.body instanceof Blob) {
            xhr.send(edgeOptions.body);
          } else if (edgeOptions.body instanceof FormData) {
            xhr.send(edgeOptions.body);
          } else if (edgeOptions.body instanceof ArrayBuffer) {
            xhr.send(edgeOptions.body);
          } else if (typeof edgeOptions.body === 'object') {
            // 对于其他对象类型，尝试转换为JSON字符串
            try {
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.send(JSON.stringify(edgeOptions.body));
            } catch (jsonError: any) {
              reject(new Error(`Failed to process request body: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`));
              return;
            }
          } else {
            reject(new Error('Unsupported body type for XMLHttpRequest fallback'));
            return;
          }
        } else {
          xhr.send();
        }
      } catch (sendError) {
        reject(new Error(`Failed to send request to ${url}: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`));
      }
    });
  }
};

/**
 * 初始化Edge浏览器兼容性处理
 * 在应用启动时调用一次
 */
export const initializeEdgeCompatibility = (): void => {
  if (isEdgeBrowser()) {
    console.log('Edge浏览器检测到，应用兼容性修复');
    
    // 修复Edge中的某些事件处理问题
    const edgeVersion = getEdgeVersion();
    
    if (edgeVersion && edgeVersion < 88) {
      // 旧版Edge中的Promise处理可能不稳定
      if (typeof Promise.prototype.finally !== 'function') {
        Promise.prototype.finally = function (onFinally) {
          const promise = this;
          // 处理Promise链中的finally回调
          if (typeof onFinally === 'function') {
            return promise.then(
              (value) => Promise.resolve().then(() => {
                onFinally();
                return value;
              }),
              (reason) => Promise.resolve().then(() => {
                onFinally();
                throw reason;
              })
            );
          }
          return promise;
        };
      }
    }
    
    // 添加全局CSS类到body
    document.body.classList.add('edge-browser');
  }
};

// 导出所有工具函数
export default {
  isEdgeBrowser,
  getEdgeVersion,
  applyEdgeCssFixes,
  debounceForEdge,
  fetchForEdge,
  initializeEdgeCompatibility,
};