/**
 * 应用状态管理
 * 使用zustand实现状态管理
 */

import { create } from 'zustand';
import type { MediaInfo, EpisodeInfo, PlaybackState } from '../types';
import { PlaybackState as PlaybackStateConst } from '../types';
import { storageManager } from '../storage';

interface AppState {
  // 播放状态
  playbackState: PlaybackState;
  currentMedia: MediaInfo | null;
  currentEpisode: EpisodeInfo | null;
  playHistory: Array<{ media: MediaInfo; episode?: EpisodeInfo; timestamp: number }>;
  favorites: Array<{ media: MediaInfo; timestamp: number }>;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  quality: string;
  subtitles: Array<{ id: string; label: string; src: string; default?: boolean }>;
  selectedSubtitle: string | null;

  // 搜索状态
  searchQuery: string;
  searchResults: Array<{ source: string; data: MediaInfo[] }>;
  isSearching: boolean;

  // UI状态
  isPlayerOpen: boolean;
  currentView: 'home' | 'search' | 'history' | 'favorites' | 'plugins';
  theme: 'light' | 'dark' | 'system';

  // 操作方法
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentMedia: (media: MediaInfo | null) => void;
  setCurrentEpisode: (episode: EpisodeInfo | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setQuality: (quality: string) => void;
  setSubtitles: (subtitles: Array<{ id: string; label: string; src: string; default?: boolean }>) => void;
  setSelectedSubtitle: (subtitleId: string | null) => void;
  addToPlayHistory: (media: MediaInfo, episode?: EpisodeInfo) => void;
  toggleFavorite: (media: MediaInfo) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Array<{ source: string; data: MediaInfo[] }>) => void;
  setIsSearching: (searching: boolean) => void;
  setIsPlayerOpen: (open: boolean) => void;
  setCurrentView: (view: 'home' | 'search' | 'history' | 'favorites' | 'plugins') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  loadUserPreferences: () => void;
  saveUserPreferences: () => void;
}

const defaultUserConfig = {
  theme: 'system',
  volume: 80,
  playbackSpeed: 1,
  quality: 'auto'
};

export const useAppStore = create<AppState>((set, get) => ({
  // 播放状态初始化
    playbackState: PlaybackStateConst.IDLE,
  currentMedia: null,
  currentEpisode: null,
  playHistory: [],
  favorites: [],
  isPlaying: false,
  currentTime: 0,
  volume: 80,
  isMuted: false,
  playbackSpeed: 1,
  quality: 'auto',
  subtitles: [],
  selectedSubtitle: null,

  // 搜索状态初始化
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  // UI状态初始化
  isPlayerOpen: false,
  currentView: 'home',
  theme: 'system',

  // 操作方法实现
  setPlaybackState: (state) => set({ playbackState: state }),
  
  setCurrentMedia: (media) => set({ currentMedia: media }),
  
  setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setVolume: (volume) => set({ volume }),
  
  setIsMuted: (muted) => set({ isMuted: muted }),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  setQuality: (quality) => set({ quality }),
  
  setSubtitles: (subtitles) => set({ subtitles }),
  
  setSelectedSubtitle: (subtitleId) => set({ selectedSubtitle: subtitleId }),
  
  addToPlayHistory: (media, episode) => {
    const { playHistory } = get();
    // 检查是否已存在，存在则移除
    const filteredHistory = playHistory.filter(
      item => !(item.media.id === media.id && item.media.source === media.source)
    );
    // 添加到历史记录开头
    const newHistory = [
      { media, episode, timestamp: Date.now() },
      ...filteredHistory
    ].slice(0, 100); // 限制历史记录数量
    set({ playHistory: newHistory });
    // 同时保存到本地存储
      storageManager.addToHistory({
        id: media.id,
        title: media.title,
        source: media.source,
        cover: media.posterUrl
      });
  },
  
  toggleFavorite: (media) => {
    const { favorites } = get();
    const isFavorite = favorites.some(
      item => item.media.id === media.id && item.media.source === media.source
    );
    
    if (isFavorite) {
      // 移除收藏
      const newFavorites = favorites.filter(
        item => !(item.media.id === media.id && item.media.source === media.source)
      );
      set({ favorites: newFavorites });
      storageManager.removeFromFavorites(media.id, media.source);
    } else {
      // 添加收藏
      const newFavorites = [
        ...favorites,
        { media, timestamp: Date.now() }
      ];
      set({ favorites: newFavorites });
      storageManager.addToFavorites({
        id: media.id,
        title: media.title,
        source: media.source,
        cover: media.posterUrl
      });
    }
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSearchResults: (results) => set({ searchResults: results }),
  
  setIsSearching: (searching) => set({ isSearching: searching }),
  
  setIsPlayerOpen: (open) => set({ isPlayerOpen: open }),
  
  setCurrentView: (view) => set({ currentView: view }),
  
  setTheme: (theme) => {
    set({ theme });
    // 应用主题到DOM
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    if (theme === 'system') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');
    } else {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    // 保存主题设置
    get().saveUserPreferences();
  },
  
  loadUserPreferences: () => {
    try {
      const userConfig = storageManager.getUserConfig();
      const config = { ...defaultUserConfig, ...userConfig };
      
      set({
        theme: config.theme as 'light' | 'dark' | 'system',
        volume: config.volume,
        playbackSpeed: config.playbackSpeed,
        quality: config.quality
      });
      
      // 应用主题
      if (config.theme === 'system') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');
      } else {
        document.documentElement.classList.add(`theme-${config.theme}`);
      }
      
      // 加载收藏和历史记录
      const favoritesData = storageManager.getFavorites();
      const favorites = favoritesData.map(item => ({
        media: {
          id: item.id,
          title: item.title,
          source: item.source,
          cover: item.cover,
          type: 'movie', // 默认类型
          description: '',
          tags: [],
          rating: 0,
          year: 0,
          // 添加 MediaInfo 接口必需的属性
          posterUrl: item.cover || '',
          releaseYear: 0, // 从存储中加载的收藏项没有 year 属性
          genres: []
        },
        timestamp: item.timestamp
      }));
      
      set({ favorites });
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  },
  
  saveUserPreferences: () => {
    try {
      const { theme, volume, playbackSpeed, quality } = get();
      storageManager.saveUserConfig({
        theme,
        volume,
        playbackSpeed,
        quality
      });
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }
}));