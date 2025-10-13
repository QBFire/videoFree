/**
 * 插件管理器
 * 负责插件的加载、注册、启用/禁用、配置等功能
 */

import type { Plugin } from '../types';
import { storageManager } from '../storage';

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private pluginConfigs: Map<string, Record<string, unknown>> = new Map();
  private pluginCache: Map<string, { timestamp: number; data: unknown; ttl: number }> = new Map();
  private static instance: PluginManager;

  // 单例模式
  private constructor() {
    this.loadEnabledPlugins();
    this.loadPluginConfigs();
  }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  // 加载已启用的插件列表
  private loadEnabledPlugins(): void {
    const enabled = storageManager.getItem<string[]>('enabledPlugins') || [];
    enabled.forEach(pluginId => this.enabledPlugins.add(pluginId));
  }

  // 加载插件配置
  private loadPluginConfigs(): void {
    const configs = storageManager.getItem<Record<string, Record<string, unknown>>>('pluginConfigs') || {};
    Object.keys(configs).forEach(pluginId => {
      this.pluginConfigs.set(pluginId, configs[pluginId]);
    });
  }

  // 保存已启用的插件列表
  private saveEnabledPlugins(): void {
    const enabled = Array.from(this.enabledPlugins);
    storageManager.setItem('enabledPlugins', enabled);
  }

  // 保存插件配置
  private savePluginConfigs(): void {
    const configs: Record<string, Record<string, unknown>> = {};
    this.pluginConfigs.forEach((config, pluginId) => {
      configs[pluginId] = config;
    });
    storageManager.setItem('pluginConfigs', configs);
  }

  // 注册插件
  async registerPlugin(plugin: Plugin): Promise<boolean> {
    try {
      const { id } = plugin.metadata;
      
      if (this.plugins.has(id)) {
        console.warn(`Plugin ${id} is already registered`);
        return false;
      }

      // 注意：Plugin接口中没有config属性，我们在插件管理器内部维护配置;

      // 初始化插件
      if (plugin.initialize) {
        await plugin.initialize();
      }

      this.plugins.set(id, plugin);
      
      // 如果插件之前是启用的，则启用它
      if (this.enabledPlugins.has(id)) {
        await this.enablePlugin(id);
      }

      console.log(`Plugin ${id} registered successfully`);
      return true;
    } catch (error) {
      console.error('Failed to register plugin:', error);
      return false;
    }
  }

  // 卸载插件
  async unregisterPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin ${pluginId} not found`);
        return false;
      }

      // 先禁用插件
      await this.disablePlugin(pluginId);

      // 销毁插件
      if (plugin.destroy) {
        await plugin.destroy();
      }

      this.plugins.delete(pluginId);
      this.enabledPlugins.delete(pluginId);
      this.pluginConfigs.delete(pluginId);
      this.clearPluginCache(pluginId);

      // 保存状态
      this.saveEnabledPlugins();
      this.savePluginConfigs();

      console.log(`Plugin ${pluginId} unregistered successfully`);
      return true;
    } catch (error) {
      console.error('Failed to unregister plugin:', error);
      return false;
    }
  }

  // 启用插件
  async enablePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin ${pluginId} not found`);
        return false;
      }

      if (this.enabledPlugins.has(pluginId)) {
        console.warn(`Plugin ${pluginId} is already enabled`);
        return false;
      }

      this.enabledPlugins.add(pluginId);
      this.saveEnabledPlugins();

      console.log(`Plugin ${pluginId} enabled successfully`);
      return true;
    } catch (error) {
      console.error('Failed to enable plugin:', error);
      return false;
    }
  }

  // 禁用插件
  async disablePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin ${pluginId} not found`);
        return false;
      }

      if (!this.enabledPlugins.has(pluginId)) {
        console.warn(`Plugin ${pluginId} is already disabled`);
        return false;
      }

      this.enabledPlugins.delete(pluginId);
      this.saveEnabledPlugins();
      this.clearPluginCache(pluginId);

      console.log(`Plugin ${pluginId} disabled successfully`);
      return true;
    } catch (error) {
      console.error('Failed to disable plugin:', error);
      return false;
    }
  }

  // 获取插件
  getPlugin(pluginId: string): Plugin | null {
    return this.plugins.get(pluginId) || null;
  }

  // 获取所有插件
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  // 获取已启用的插件
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(id => this.plugins.get(id))
      .filter((plugin): plugin is Plugin => plugin !== undefined);
  }

  // 检查插件是否已启用
  isPluginEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  // 获取插件配置
  getPluginConfig(pluginId: string): Record<string, unknown> {
    // 直接从插件管理器内部维护的配置中获取
    return { ...(this.pluginConfigs.get(pluginId) || {}) };
  }

  // 更新插件配置
  async updatePluginConfig(pluginId: string, config: Record<string, unknown>): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin ${pluginId} not found`);
        return false;
      }

      // 直接更新插件管理器内部维护的配置
      const oldConfig = { ...(this.pluginConfigs.get(pluginId) || {}) };
      const newConfig = { ...oldConfig, ...config };
      this.pluginConfigs.set(pluginId, newConfig);
      this.savePluginConfigs();

      // 注意：Plugin接口中没有onConfigUpdate方法

      console.log(`Plugin ${pluginId} config updated successfully`);
      return true;
    } catch (error) {
      console.error('Failed to update plugin config:', error);
      return false;
    }
  }



  // 搜索媒体
  async search(query: string, type?: string): Promise<Array<{ source: string; data: unknown[] }>> {
    const results: Array<{ source: string; data: unknown[] }> = [];
    const promises: Promise<void>[] = [];

    this.getEnabledPlugins().forEach(plugin => {
      const promise = plugin.search(query, type)
        .then(data => {
          results.push({ source: plugin.metadata.name, data });
        })
        .catch(error => {
          console.error(`Plugin ${plugin.metadata.id} search failed:`, error);
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    return results;
  }

  // 获取媒体详情
  async getMediaDetail(pluginId: string, mediaId: string): Promise<unknown | null> {
    try {
      const plugin = this.getPlugin(pluginId);
      if (!plugin || !this.isPluginEnabled(pluginId)) {
        console.warn(`Plugin ${pluginId} not found or not enabled`);
        return null;
      }

      const cacheKey = `${pluginId}_detail_${mediaId}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const data = await plugin.getMediaDetail(mediaId);
      this.saveToCache(cacheKey, data, 3600000); // 缓存1小时
      return data;
    } catch (error) {
      console.error(`Failed to get media detail from plugin ${pluginId}:`, error);
      return null;
    }
  }

  // 获取剧集列表
  async getEpisodes(pluginId: string, mediaId: string): Promise<unknown[] | null> {
    try {
      const plugin = this.getPlugin(pluginId);
      if (!plugin || !this.isPluginEnabled(pluginId)) {
        console.warn(`Plugin ${pluginId} not found or not enabled`);
        return null;
      }

      const cacheKey = `${pluginId}_episodes_${mediaId}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        // 添加类型检查，确保返回的是数组类型
        return Array.isArray(cachedData) ? cachedData : null;
      }

      const data = await plugin.getEpisodes(mediaId);
      this.saveToCache(cacheKey, data, 3600000); // 缓存1小时
      return data;
    } catch (error) {
      console.error(`Failed to get episodes from plugin ${pluginId}:`, error);
      return null;
    }
  }

  // 获取播放链接
  async getPlayUrl(pluginId: string, episodeId: string): Promise<string | null> {
    try {
      const plugin = this.getPlugin(pluginId);
      if (!plugin || !this.isPluginEnabled(pluginId)) {
        console.warn(`Plugin ${pluginId} not found or not enabled`);
        return null;
      }

      const url = await plugin.getPlayUrl(episodeId);
      return url;
    } catch (error) {
      console.error(`Failed to get play url from plugin ${pluginId}:`, error);
      return null;
    }
  }

  // 获取字幕
  async getSubtitles(pluginId: string, episodeId: string): Promise<unknown[] | null> {
    try {
      const plugin = this.getPlugin(pluginId);
      if (!plugin || !this.isPluginEnabled(pluginId) || !plugin.getSubtitles) {
        return null;
      }

      const subtitles = await plugin.getSubtitles(episodeId);
      return subtitles;
    } catch (error) {
      console.error(`Failed to get subtitles from plugin ${pluginId}:`, error);
      return null;
    }
  }

  // 获取推荐内容
  async getRecommendations(): Promise<Array<{ source: string; data: unknown[] }>> {
    const results: Array<{ source: string; data: unknown[] }> = [];
    // 注意：Plugin接口中没有getRecommendations方法
    return results;
  }

  // 缓存管理
  private saveToCache(key: string, data: unknown, ttl: number = 300000): void { // 默认缓存5分钟
    this.pluginCache.set(key, {
      timestamp: Date.now(),
      data,
      ttl
    });
    // 清理过期缓存
    this.cleanCache();
  }

  private getFromCache(key: string): unknown | null {
    const item = this.pluginCache.get(key);
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.pluginCache.delete(key);
      return null;
    }

    return item.data;
  }

  private clearPluginCache(pluginId: string): void {
    for (const key of this.pluginCache.keys()) {
      if (key.startsWith(pluginId)) {
        this.pluginCache.delete(key);
      }
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, item] of this.pluginCache.entries()) {
      if (now - item.timestamp > 300000) { // 5分钟过期
        this.pluginCache.delete(key);
      }
    }
  }

  // 从URL加载插件
  async loadPluginFromUrl(url: string): Promise<boolean> {
    try {
      console.log(`Loading plugin from URL: ${url}`);
      
      // 在实际应用中，这里应该使用fetch或其他方式从URL加载插件代码
      // 由于这是一个示例，我们将返回一个模拟的成功结果
      console.warn('This is a mock implementation. In a real application, you would fetch and execute the plugin code from the URL.');
      
      return true;
    } catch (error) {
      console.error('Failed to load plugin from URL:', error);
      return false;
    }
  }

  // 从本地文件加载插件
  async loadPluginFromFile(file: File): Promise<boolean> {
    try {
      console.log(`Loading plugin from file: ${file.name}`);
      
      // 在实际应用中，这里应该读取文件内容并执行插件代码
      // 由于这是一个示例，我们将返回一个模拟的成功结果
      console.warn('This is a mock implementation. In a real application, you would read and execute the plugin code from the file.');
      
      return true;
    } catch (error) {
      console.error('Failed to load plugin from file:', error);
      return false;
    }
  }
}

// 导出单例实例
export const pluginManager = PluginManager.getInstance();
export default PluginManager;