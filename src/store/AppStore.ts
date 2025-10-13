import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MediaInfo, EpisodeInfo, HistoryItem, UserConfig } from '../types';
import { PlaybackState } from '../types';
import { pluginManager } from '../plugin/PluginManager';

// 应用状态接口
export interface AppState {
  // 播放状态
  currentMedia: MediaInfo | null;
  currentEpisode: EpisodeInfo | null;
  playbackState: PlaybackState;
  playbackProgress: number;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isMinimized: boolean;
  
  // 用户数据
  history: HistoryItem[];
  favorites: MediaInfo[];
  userConfig: UserConfig;
  
  // 搜索状态
  searchQuery: string;
  searchResults: { media: MediaInfo; pluginId: string }[];
  isSearching: boolean;
  
  // 方法
  setCurrentMedia: (media: MediaInfo | null, episode?: EpisodeInfo) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setPlaybackProgress: (progress: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  toggleMinimized: () => void;
  
  addToHistory: (media: MediaInfo, progress: number, episode?: EpisodeInfo) => void;
  clearHistory: () => void;
  
  addToFavorites: (media: MediaInfo) => void;
  removeFromFavorites: (mediaId: string) => void;
  isFavorite: (mediaId: string) => boolean;
  
  updateUserConfig: (config: Partial<UserConfig>) => void;
  
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: { media: MediaInfo; pluginId: string }[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  searchMedia: (query: string) => Promise<void>;
  
  initializeApp: () => Promise<void>;
}

// 默认用户配置
const defaultUserConfig: UserConfig = {
  theme: 'system',
  language: 'zh-CN',
  playbackSpeed: 1.0,
  defaultQuality: 'auto',
  autoPlayNext: true,
  subtitleEnabled: true,
};

// 创建应用状态store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 播放状态初始化
      currentMedia: null,
      currentEpisode: null,
      playbackState: PlaybackState.IDLE,
      playbackProgress: 0,
      playbackSpeed: 1,
      volume: 80,
      isMuted: false,
      isFullscreen: false,
      isMinimized: false,
      
      // 用户数据初始化
      history: [],
      favorites: [],
      userConfig: defaultUserConfig,
      
      // 搜索状态初始化
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      
      // 设置当前播放媒体
      setCurrentMedia: (media, episode) => {
        set({ currentMedia: media, currentEpisode: episode, playbackProgress: 0 });
        
        // 如果有媒体，添加到历史记录
        if (media) {
          get().addToHistory(media, 0, episode);
        }
      },
      
      // 设置播放状态
      setPlaybackState: (state) => set({ playbackState: state }),
      
      // 设置播放进度
      setPlaybackProgress: (progress) => set({ playbackProgress: progress }),
      
      // 设置播放速度
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      
      // 设置音量
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      
      // 切换静音
      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }));
      },
      
      // 切换全屏
      toggleFullscreen: () => {
        set((state) => ({ isFullscreen: !state.isFullscreen }));
      },
      
      // 切换最小化
      toggleMinimized: () => {
        set((state) => ({ isMinimized: !state.isMinimized }));
      },
      
      // 添加到历史记录
      addToHistory: (media, progress, episode) => {
        set((state) => {
          const now = Date.now();
          const newHistoryItem: HistoryItem = {
            mediaId: media.id,
            source: media.source,
            timestamp: now,
            progress,
            title: media.title,
            posterUrl: media.posterUrl,
            episodeId: episode?.id,
          };
          
          // 移除已存在的相同媒体记录
          const filteredHistory = state.history.filter(
            (item) => item.mediaId !== media.id || item.episodeId !== episode?.id
          );
          
          // 添加新记录到开头，保持最新的在前
          const newHistory = [newHistoryItem, ...filteredHistory].slice(0, 100); // 限制历史记录数量
          
          return { history: newHistory };
        });
      },
      
      // 清空历史记录
      clearHistory: () => set({ history: [] }),
      
      // 添加到收藏夹
      addToFavorites: (media) => {
        set((state) => {
          // 检查是否已存在
          if (!state.favorites.some((fav) => fav.id === media.id && fav.source === media.source)) {
            return { favorites: [...state.favorites, media] };
          }
          return {};
        });
      },
      
      // 从收藏夹移除
      removeFromFavorites: (mediaId) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== mediaId)
        }));
      },
      
      // 检查是否在收藏夹
      isFavorite: (mediaId) => {
        return get().favorites.some((fav) => fav.id === mediaId);
      },
      
      // 更新用户配置
      updateUserConfig: (config) => {
        set((state) => ({
          userConfig: { ...state.userConfig, ...config }
        }));
      },
      
      // 设置搜索查询
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // 设置搜索结果
      setSearchResults: (results) => set({ searchResults: results }),
      
      // 设置搜索状态
      setIsSearching: (isSearching) => set({ isSearching }),
      
      // 搜索媒体
      searchMedia: async (query) => {
        if (!query.trim()) return;
        
        set({ searchQuery: query, isSearching: true, searchResults: [] });
        
        try {
          const plugins = pluginManager.getEnabledPlugins();
          const allResults: { media: MediaInfo; pluginId: string }[] = [];
          
          // 从每个启用的插件获取搜索结果
          const searchPromises = plugins.map(async (plugin) => {
            try {
              const results = await plugin.search(query);
              allResults.push(...results);
            } catch (error) {
              console.error(`Error searching with plugin ${plugin.metadata.id}:`, error);
            }
          });
          
          await Promise.all(searchPromises);
          
          // 按相关性排序（这里简单按标题匹配度排序）
          const sortedResults = allResults.sort((a, b) => {
            // 使用媒体标题进行简单排序
            return a.media.title.localeCompare(b.media.title);
          });
          
          set({ searchResults: sortedResults });
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          set({ isSearching: false });
        }
      },
      
      // 初始化应用
      initializeApp: async () => {
        try {
          // 插件管理器是单例模式，构造函数已处理初始化
          // 注册示例插件
          // 在实际应用中，这里会从配置或插件目录加载插件
          
          console.log('App initialized successfully');
        } catch (error) {
          console.error('Failed to initialize app:', error);
        }
      },
    }),
    {
      name: 'videofree-app-storage',
      // 持久化的状态
      partialize: (state) => ({
        history: state.history,
        favorites: state.favorites,
        userConfig: state.userConfig,
      }),
    }
  )
);