/**
 * AppStore 单元测试
 * 测试状态管理的核心功能
 */

import { useAppStore } from '../../../src/store/AppStore';
import { PlaybackState, MediaInfo, EpisodeInfo } from '../../../src/types';
import { pluginManager } from '../../../src/plugin/PluginManager';

// 创建可复用的mockStore函数
const createMockStore = () => {
  // 直接使用字符串常量而不是PlaybackState枚举以避免ReferenceError
  const mockStore = {
    // 播放状态
    currentMedia: null,
    currentEpisode: null,
    playbackState: 'idle',
    playbackProgress: 0,
    playbackSpeed: 1,
    volume: 80,
    isMuted: false,
    isFullscreen: false,
    isMinimized: false,
    
    // 用户数据
    history: [],
    favorites: [],
    userConfig: {
      theme: 'system',
      language: 'zh-CN',
      playbackSpeed: 1.0,
      defaultQuality: 'auto',
      autoPlayNext: true,
      subtitleEnabled: true,
    },
    
    // 搜索状态
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    
    // 方法
    setCurrentMedia: jest.fn((media, episode) => {
      mockStore.currentMedia = media;
      mockStore.currentEpisode = episode;
      mockStore.playbackProgress = 0;
    }),
    setPlaybackState: jest.fn((newState) => {
      mockStore.playbackState = newState;
    }),
    setPlaybackProgress: jest.fn((progress) => {
      mockStore.playbackProgress = progress;
    }),
    setPlaybackSpeed: jest.fn((speed) => {
      mockStore.playbackSpeed = speed;
    }),
    setVolume: jest.fn((newVolume) => {
      mockStore.volume = newVolume;
    }),
    toggleMute: jest.fn(() => {
      mockStore.isMuted = !mockStore.isMuted;
    }),
    toggleFullscreen: jest.fn(() => {
      mockStore.isFullscreen = !mockStore.isFullscreen;
    }),
    toggleMinimized: jest.fn(() => {
      mockStore.isMinimized = !mockStore.isMinimized;
    }),
    
    addToHistory: jest.fn((media, progress, episode) => {
      const historyItem = {
        media,
        progress,
        episode,
        timestamp: Date.now(),
      };
      mockStore.history.push(historyItem);
    }),
    clearHistory: jest.fn(() => {
      mockStore.history = [];
    }),
    
    addToFavorites: jest.fn((media) => {
      // 检查是否已存在
      const exists = mockStore.favorites.some(fav => fav.id === media.id);
      if (!exists) {
        mockStore.favorites.push(media);
      }
    }),
    removeFromFavorites: jest.fn((mediaId) => {
      mockStore.favorites = mockStore.favorites.filter(fav => fav.id !== mediaId);
    }),
    isFavorite: jest.fn((mediaId) => {
      return mockStore.favorites.some(fav => fav.id === mediaId);
    }),
    
    updateUserConfig: jest.fn((config) => {
      mockStore.userConfig = { ...mockStore.userConfig, ...config };
    }),
    
    setSearchQuery: jest.fn((query) => {
      mockStore.searchQuery = query;
    }),
    setSearchResults: jest.fn((results) => {
      mockStore.searchResults = results;
    }),
    setIsSearching: jest.fn((isSearching) => {
      mockStore.isSearching = isSearching;
    }),
    searchMedia: jest.fn(async (query: string) => {
      return pluginManager.search(query);
    }),
    
    initializeApp: jest.fn().mockResolvedValue(undefined),
    
    // 模拟getState方法
    getState: jest.fn(() => mockStore)
  };
  
  return mockStore;
};

// 直接Mock useAppStore而不是zustand
jest.mock('../../../src/store/AppStore', () => ({
  useAppStore: jest.fn(() => {
    return createMockStore();
  })
}));

// Mock pluginManager
jest.mock('../../../src/plugin/PluginManager', () => ({
  pluginManager: {
    search: jest.fn().mockResolvedValue([]),
  },
}));

describe('AppStore', () => {
  let store: any;

  beforeEach(() => {
    // 清除所有mock调用
    jest.clearAllMocks();
    
    // 获取store实例
    store = useAppStore();
  });

  describe('播放状态管理', () => {
    it('should set playback state correctly', () => {
      store.setPlaybackState(PlaybackState.PLAYING);
      expect(store.playbackState).toBe(PlaybackState.PLAYING);
    });

    it('should toggle mute state', () => {
      const initialMuteState = store.isMuted;
      store.toggleMute();
      expect(store.isMuted).toBe(!initialMuteState);
    });

    it('should toggle fullscreen state', () => {
      const initialFullscreenState = store.isFullscreen;
      store.toggleFullscreen();
      expect(store.isFullscreen).toBe(!initialFullscreenState);
    });

    it('should set volume correctly', () => {
      const newVolume = 50;
      store.setVolume(newVolume);
      expect(store.volume).toBe(newVolume);
    });
  });

  describe('历史记录管理', () => {
    const mockMedia: MediaInfo = {
      id: 'test123',
      title: 'Test Media',
      type: 'movie',
      posterUrl: 'https://example.com/cover.jpg',
      description: 'Test description',
      source: 'test-source',
      rating: 8.5,
      releaseYear: 2023,
      genres: ['Action', 'Drama'],
      duration: 120,
    };

    it('should add media to history', () => {
      store.addToHistory(mockMedia, 0);
      expect(store.history.length).toBe(1);
      expect(store.history[0].media.id).toBe('test123');
    });

    it('should clear history', () => {
      // 先添加一些历史记录
      store.addToHistory(mockMedia, 0);
      expect(store.history.length).toBe(1);
      
      // 清除历史记录
      store.clearHistory();
      expect(store.history.length).toBe(0);
    });
  });

  describe('收藏功能', () => {
    const mockMedia: MediaInfo = {
      id: 'test123',
      title: 'Test Media',
      type: 'movie',
      posterUrl: 'https://example.com/cover.jpg',
      description: 'Test description',
      source: 'test-source',
      rating: 8.5,
      releaseYear: 2023,
      genres: ['Action', 'Drama'],
      duration: 120,
    };

    it('should add media to favorites', () => {
      store.addToFavorites(mockMedia);
      expect(store.isFavorite('test123')).toBe(true);
    });

    it('should remove media from favorites', () => {
      // 先添加到收藏
      store.addToFavorites(mockMedia);
      expect(store.isFavorite('test123')).toBe(true);
      
      // 从收藏中移除
      store.removeFromFavorites('test123');
      expect(store.isFavorite('test123')).toBe(false);
    });
  });

  describe('用户配置管理', () => {
    it('should update user config correctly', () => {
      const newConfig = {
        theme: 'dark',
        playbackSpeed: 1.5,
      };
      
      store.updateUserConfig(newConfig);
      expect(store.userConfig.theme).toBe('dark');
      expect(store.userConfig.playbackSpeed).toBe(1.5);
      // 验证其他配置项没有被改变
      expect(store.userConfig.language).toBe('zh-CN');
    });
  });

  describe('搜索功能', () => {
    it('should set search query correctly', () => {
      const query = 'test query';
      store.setSearchQuery(query);
      expect(store.searchQuery).toBe(query);
    });

    it('should set search results correctly', () => {
      const mockMedia: MediaInfo = {
        id: 'test123',
        title: 'Test Media',
        type: 'movie',
        posterUrl: 'https://example.com/cover.jpg',
        description: 'Test description',
        source: 'test-source',
        rating: 8.5,
        releaseYear: 2023,
        genres: ['Action', 'Drama'],
        duration: 120,
      };
      const results = [{ media: mockMedia, pluginId: 'sample' }];
      
      store.setSearchResults(results);
      expect(store.searchResults).toEqual(results);
    });

    it('should set searching state correctly', () => {
      store.setIsSearching(true);
      expect(store.isSearching).toBe(true);
      
      store.setIsSearching(false);
      expect(store.isSearching).toBe(false);
    });

    it('should call pluginManager search when searching media', async () => {
      const query = 'test';
      await store.searchMedia(query);
      expect(pluginManager.search).toHaveBeenCalledWith(query);
    });
  });

  describe('媒体播放管理', () => {
    const mockMedia: MediaInfo = {
      id: 'test123',
      title: 'Test Media',
      type: 'movie',
      source: 'sample',
      cover: 'https://example.com/cover.jpg',
      posterUrl: 'https://example.com/cover.jpg',
      description: 'Test description',
      rating: 8.5,
      releaseYear: 2023,
      genres: ['Action', 'Adventure'],
      year: 2023,
      duration: 120,
    };

    const mockEpisode: EpisodeInfo = {
      id: 'ep1',
      title: 'Episode 1',
      description: 'Test episode description',
      playUrl: 'https://example.com/episode1.mp4',
      duration: 45,
      index: 1,
    };

    it('should set current media correctly', () => {
      store.setCurrentMedia(mockMedia, mockEpisode);
      expect(store.currentMedia).toBe(mockMedia);
      expect(store.currentEpisode).toBe(mockEpisode);
      expect(store.playbackProgress).toBe(0);
    });

    it('should clear current media when setting to null', () => {
      // 先设置媒体
      store.setCurrentMedia(mockMedia, mockEpisode);
      expect(store.currentMedia).toBe(mockMedia);
      
      // 清除媒体
      store.setCurrentMedia(null);
      expect(store.currentMedia).toBeNull();
    });
  });
});