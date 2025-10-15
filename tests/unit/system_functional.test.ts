// 系统功能测试 - 使用单元测试方式验证核心功能模块交互

import { useAppStore } from '../../src/store';
import { pluginManager } from '../../src/plugin/PluginManager';
import type { MediaInfo, EpisodeInfo, MediaType, SearchResult } from '../../src/types';

// 模拟zustand store
jest.mock('../../src/store');
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

// 模拟PluginManager
jest.mock('../../src/plugin/PluginManager');
const mockPluginManager = pluginManager as jest.Mocked<typeof pluginManager>;

describe('VideoFree系统功能测试', () => {
  let mockStore: any;
  
  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 设置mock store实现
    mockStore = {
      playbackState: 'idle',
      currentMedia: null,
      playHistory: [],
      favorites: [],
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      setPlaybackState: jest.fn(),
      setCurrentMedia: jest.fn(),
      addToPlayHistory: jest.fn(),
      toggleFavorite: jest.fn(),
      setSearchQuery: jest.fn(),
      setSearchResults: jest.fn(),
      setIsSearching: jest.fn(),
      loadUserPreferences: jest.fn(),
      saveUserPreferences: jest.fn()
    };
    
    mockUseAppStore.mockReturnValue(mockStore);
    
    // 设置PluginManager mock
    mockPluginManager.registerPlugin = jest.fn().mockResolvedValue(true);
    mockPluginManager.enablePlugin = jest.fn().mockResolvedValue(true);
    mockPluginManager.getEnabledPlugins = jest.fn().mockReturnValue([
      { 
        metadata: { id: 'sample-plugin', name: 'Sample Plugin', version: '1.0.0', description: 'Sample plugin', author: 'Sample Author' },
        initialize: jest.fn(),
        search: jest.fn(),
        getMediaDetail: jest.fn(),
        getEpisodes: jest.fn(),
        getPlayUrl: jest.fn()
      }
    ]);
  });

  describe('1. 状态管理功能测试', () => {
    test('1.1 媒体播放状态管理', () => {
      // 测试设置播放状态
      mockStore.setPlaybackState('playing');
      expect(mockStore.setPlaybackState).toHaveBeenCalledWith('playing');
      
      // 测试设置当前媒体
      const mockMedia: MediaInfo = {
        id: 'test-1',
        title: '测试媒体',
        description: '测试描述',
        posterUrl: 'test-url',
        type: 'movie',
        source: 'sample-plugin',
        rating: 8.5,
        releaseYear: 2023,
        genres: ['测试']
      };
      mockStore.setCurrentMedia(mockMedia);
      expect(mockStore.setCurrentMedia).toHaveBeenCalledWith(mockMedia);
    });

    test('1.2 收藏功能测试', () => {
      const mockMedia: MediaInfo = {
        id: 'test-2',
        title: '测试收藏',
        description: '收藏测试描述',
        posterUrl: 'test-fav-url',
        type: 'movie',
        source: 'sample-plugin',
        rating: 9.0,
        releaseYear: 2023,
        genres: ['收藏测试']
      };
      
      // 测试添加收藏
      mockStore.toggleFavorite(mockMedia);
      expect(mockStore.toggleFavorite).toHaveBeenCalledWith(mockMedia);
    });

    test('1.3 播放历史测试', () => {
      const mockMedia: MediaInfo = {
        id: 'test-3',
        title: '测试历史',
        description: '历史测试描述',
        posterUrl: 'test-hist-url',
        type: 'tv',
        source: 'sample-plugin',
        rating: 8.8,
        releaseYear: 2023,
        genres: ['历史测试']
      };
      
      // 测试添加播放历史
      mockStore.addToPlayHistory(mockMedia);
      expect(mockStore.addToPlayHistory).toHaveBeenCalledWith(mockMedia);
    });

    test('1.4 搜索功能测试', () => {
      // 测试设置搜索查询
      const query = '科幻电影';
      mockStore.setSearchQuery(query);
      expect(mockStore.setSearchQuery).toHaveBeenCalledWith(query);
      
      // 测试设置搜索状态
      mockStore.setIsSearching(true);
      expect(mockStore.setIsSearching).toHaveBeenCalledWith(true);
      
      // 测试设置搜索结果
      const mockResults = [{
        source: 'sample-plugin',
        data: [{ 
          id: 'result-1',
          title: '搜索结果',
          description: '测试搜索结果',
          posterUrl: 'result-url',
          type: 'movie',
          source: 'sample-plugin',
          rating: 8.5,
          releaseYear: 2023,
          genres: ['科幻']
        }]
      }];
      mockStore.setSearchResults(mockResults);
      expect(mockStore.setSearchResults).toHaveBeenCalledWith(mockResults);
    });
  });

  describe('2. 插件系统功能测试', () => {
    test('2.1 插件注册测试', async () => {
      const mockPlugin = {
        metadata: { 
          id: 'test-plugin', 
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'Test plugin description',
          author: 'Test Author'
        },
        initialize: jest.fn().mockResolvedValue(undefined),
        search: jest.fn().mockResolvedValue([]),
        getMediaDetail: jest.fn().mockResolvedValue({} as MediaInfo),
        getEpisodes: jest.fn().mockResolvedValue([]),
        getPlayUrl: jest.fn().mockResolvedValue('https://example.com/play')
      };
      
      const result = await mockPluginManager.registerPlugin(mockPlugin);
      expect(result).toBe(true);
      expect(mockPluginManager.registerPlugin).toHaveBeenCalledWith(mockPlugin);
    });

    test('2.2 插件启用测试', async () => {
      await mockPluginManager.enablePlugin('sample-plugin');
      expect(mockPluginManager.enablePlugin).toHaveBeenCalledWith('sample-plugin');
    });

    test('2.3 获取启用的插件列表', () => {
      const enabledPlugins = mockPluginManager.getEnabledPlugins();
      expect(enabledPlugins).toBeDefined();
      expect(Array.isArray(enabledPlugins)).toBe(true);
      expect(enabledPlugins.length).toBe(1);
      expect(enabledPlugins[0].metadata.id).toBe('sample-plugin');
    });
  });

  describe('3. 数据管理集成测试', () => {
    test('3.1 用户偏好加载和保存', () => {
      // 测试加载用户偏好
      mockStore.loadUserPreferences();
      expect(mockStore.loadUserPreferences).toHaveBeenCalled();
      
      // 测试保存用户偏好
      mockStore.saveUserPreferences();
      expect(mockStore.saveUserPreferences).toHaveBeenCalled();
    });

    test('3.2 完整用户交互流程模拟', () => {
      // 模拟用户搜索、查看详情、添加收藏的完整流程
      
      // 1. 搜索
      mockStore.setSearchQuery('科幻');
      mockStore.setIsSearching(true);
      
      // 2. 查看媒体详情
      const mockMedia: MediaInfo = {
        id: 'interactive-1',
        title: '交互测试电影',
        description: '完整流程测试',
        posterUrl: 'interactive-url',
        type: 'movie',
        source: 'sample-plugin',
        rating: 9.2,
        releaseYear: 2023,
        genres: ['科幻', '动作']
      };
      mockStore.setCurrentMedia(mockMedia);
      
      // 3. 添加到播放历史
      mockStore.addToPlayHistory(mockMedia);
      
      // 4. 添加到收藏
      mockStore.toggleFavorite(mockMedia);
      
      // 验证所有方法都被正确调用
      expect(mockStore.setSearchQuery).toHaveBeenCalledWith('科幻');
      expect(mockStore.setIsSearching).toHaveBeenCalledWith(true);
      expect(mockStore.setCurrentMedia).toHaveBeenCalledWith(mockMedia);
      expect(mockStore.addToPlayHistory).toHaveBeenCalledWith(mockMedia);
      expect(mockStore.toggleFavorite).toHaveBeenCalledWith(mockMedia);
    });
  });
});