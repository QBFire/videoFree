/**
 * 存储管理模块
 * 负责处理本地存储、历史记录和用户配置等功能
 */

interface StorageItem {
  key: string;
  value: unknown;
  timestamp: number;
}

class StorageManager {
  private readonly PREFIX = 'videofree_';
  private readonly MAX_HISTORY_ITEMS = 100;

  // 通用存储方法
  setItem(key: string, value: unknown): void {
    try {
      const storageKey = this.PREFIX + key;
      const storageItem: StorageItem = {
        key: storageKey,
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(storageItem));
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const storageKey = this.PREFIX + key;
      const item = localStorage.getItem(storageKey);
      if (item) {
        const parsedItem: StorageItem = JSON.parse(item);
        return parsedItem.value as T;
      }
      return null;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      const storageKey = this.PREFIX + key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }

  // 历史记录管理
  addToHistory(mediaInfo: { id: string; title: string; source: string; cover?: string }): void {
    try {
      const history = this.getHistory();
      // 检查是否已存在，存在则移除
      const existingIndex = history.findIndex(item => item.id === mediaInfo.id && item.source === mediaInfo.source);
      if (existingIndex > -1) {
        history.splice(existingIndex, 1);
      }
      // 添加到历史记录开头
      history.unshift({
        ...mediaInfo,
        timestamp: Date.now()
      });
      // 限制历史记录数量
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.splice(this.MAX_HISTORY_ITEMS);
      }
      this.setItem('history', history);
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  }

  getHistory(): Array<{ id: string; title: string; source: string; cover?: string; timestamp: number }> {
    return this.getItem<Array<{ id: string; title: string; source: string; cover?: string; timestamp: number }>>('history') || [];
  }

  clearHistory(): void {
    this.removeItem('history');
  }

  // 收藏管理
  addToFavorites(mediaInfo: { id: string; title: string; source: string; cover?: string }): void {
    try {
      const favorites = this.getFavorites();
      // 检查是否已存在
      const exists = favorites.some(item => item.id === mediaInfo.id && item.source === mediaInfo.source);
      if (!exists) {
        favorites.push({
          ...mediaInfo,
          timestamp: Date.now()
        });
        this.setItem('favorites', favorites);
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  }

  getFavorites(): Array<{ id: string; title: string; source: string; cover?: string; timestamp: number }> {
    return this.getItem<Array<{ id: string; title: string; source: string; cover?: string; timestamp: number }>>('favorites') || [];
  }

  removeFromFavorites(mediaId: string, source: string): void {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(item => !(item.id === mediaId && item.source === source));
      this.setItem('favorites', filtered);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  }

  // 插件配置管理
  getPluginConfig(pluginId: string): Record<string, unknown> {
    const configs = this.getItem<Record<string, Record<string, unknown>>>('pluginConfigs') || {};
    return configs[pluginId] || {};
  }

  savePluginConfig(pluginId: string, config: Record<string, unknown>): void {
    try {
      const configs = this.getItem<Record<string, Record<string, unknown>>>('pluginConfigs') || {};
      configs[pluginId] = config;
      this.setItem('pluginConfigs', configs);
    } catch (error) {
      console.error(`Failed to save plugin config for ${pluginId}:`, error);
    }
  }

  // 用户配置管理
  getUserConfig(): Record<string, unknown> {
    return this.getItem<Record<string, unknown>>('userConfig') || {
      theme: 'light',
      playerQuality: 'auto',
      autoPlayNext: true,
      rememberPosition: true
    };
  }

  saveUserConfig(config: Record<string, unknown>): void {
    try {
      const currentConfig = this.getUserConfig();
      const newConfig = { ...currentConfig, ...config };
      this.setItem('userConfig', newConfig);
    } catch (error) {
      console.error('Failed to save user config:', error);
    }
  }

  // 清除所有数据
  clearAllData(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }
}

// 导出单例实例
export const storageManager = new StorageManager();
export default StorageManager;