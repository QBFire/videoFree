/**
 * 媒体播放集成测试
 * 测试用户选择媒体并开始播放的完整流程
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
import { useAppStore } from '../../src/store/AppStore';
import { pluginManager } from '../../src/plugin/PluginManager';

// Mock store, plugins and hooks
jest.mock('../../src/store/AppStore');
jest.mock('../../src/plugin/PluginManager');
jest.mock('../../src/plugin/SamplePlugin');
jest.mock('../../src/components/Player', () => {
  // Mock Player组件，只保留测试所需的功能
  const MockPlayer = () => {
    const { currentMedia, currentEpisode } = useAppStore();
    
    return (
      <div data-testid="mock-player">
        {currentMedia && (
          <div data-testid="current-media-title">{currentMedia.title}</div>
        )}
        {currentEpisode && (
          <div data-testid="current-episode-title">{currentEpisode.title}</div>
        )}
      </div>
    );
  };
  
  return MockPlayer;
});
jest.mock('../../src/pages/HomePage', () => {
  // Mock HomePage组件，提供可点击的媒体项
  const MockHomePage = () => {
    const { setCurrentMedia } = useAppStore();
    
    const handleMediaClick = () => {
      const mockMedia = {
        id: 'test123',
        title: 'Test Movie',
        type: 'movie',
        coverUrl: 'https://example.com/cover.jpg',
        posterUrl: 'https://example.com/poster.jpg',
        source: 'test',
        description: 'Test description',
        releaseYear: 2023,
        duration: 120,
        rating: 8.5,
        genres: ['Action', 'Adventure']
      };
      
      const mockEpisode = {
        id: 'ep1',
        title: 'Full Movie',
        playUrl: 'https://example.com/movie.mp4',
        duration: 120,
        index: 1,
        description: 'Full movie episode'
      };
      
      setCurrentMedia(mockMedia, mockEpisode);
    };
    
    return (
      <div data-testid="home-page">
        <h1>Home Page</h1>
        <div 
          data-testid="media-item" 
          className="media-item" 
          onClick={handleMediaClick}
        >
          Test Movie
        </div>
      </div>
    );
  };
  
  return MockHomePage;
});

describe('媒体播放集成测试', () => {
  const mockMedia = {
    id: 'test123',
    title: 'Test Movie',
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

  const mockEpisode = {
    id: 'ep1',
    title: 'Full Movie',
    description: 'Test episode description',
    playUrl: 'https://example.com/movie.mp4',
    duration: 120,
    index: 1,
  };

  const mockStore = {
    initializeApp: jest.fn().mockResolvedValue(undefined),
    currentMedia: null,
    currentEpisode: null,
    setCurrentMedia: jest.fn((media, episode) => {
      // 更新mock store的状态
      mockStore.currentMedia = media;
      mockStore.currentEpisode = episode;
    }),
    playbackState: 'idle',
    setPlaybackState: jest.fn(),
    playbackProgress: 0,
    setPlaybackProgress: jest.fn(),
    volume: 80,
    setVolume: jest.fn(),
    isMuted: false,
    toggleMute: jest.fn(),
    isFullscreen: false,
    toggleFullscreen: jest.fn(),
    isMinimized: false,
    toggleMinimized: jest.fn(),
    setSearchQuery: jest.fn(),
    searchMedia: jest.fn(),
    addToHistory: jest.fn(),
  };

  beforeEach(() => {
    // 清除所有mock调用
    jest.clearAllMocks();
    
    // 重置mock store状态
    mockStore.currentMedia = null;
    mockStore.currentEpisode = null;
    
    // Mock useAppStore hook
    (useAppStore as unknown as jest.Mock).mockReturnValue(mockStore);
    
    // Mock pluginManager
    (pluginManager.registerPlugin as jest.Mock).mockResolvedValue(true);
    (pluginManager.enablePlugin as jest.Mock).mockResolvedValue(true);
  });

  it('should play media when selected from home page', async () => {
    // 渲染App组件，并使用MemoryRouter模拟路由
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 验证首页加载完成
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    
    // 获取媒体项并点击
    const mediaItem = screen.getByTestId('media-item');
    fireEvent.click(mediaItem);
    
    // 等待播放器加载
    await waitFor(() => {
      expect(mockStore.setCurrentMedia).toHaveBeenCalledWith(mockMedia, mockEpisode);
      expect(mockStore.currentMedia).toBe(mockMedia);
      expect(mockStore.currentEpisode).toBe(mockEpisode);
    });
    
    // 验证播放器显示当前媒体和剧集
    expect(screen.getByTestId('mock-player')).toBeInTheDocument();
    expect(screen.getByTestId('current-media-title')).toHaveTextContent('Test Movie');
    expect(screen.getByTestId('current-episode-title')).toHaveTextContent('Full Movie');
  });

  it('should handle multiple media selections', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 第一次选择媒体
    const mediaItem = screen.getByTestId('media-item');
    fireEvent.click(mediaItem);
    
    // 等待播放器加载
    await waitFor(() => {
      expect(mockStore.setCurrentMedia).toHaveBeenCalledTimes(1);
      expect(mockStore.currentMedia).toBe(mockMedia);
    });
    
    // 第二次选择媒体（相同的媒体项，但应该创建新的播放会话）
    fireEvent.click(mediaItem);
    
    // 验证setCurrentMedia被调用第二次
    expect(mockStore.setCurrentMedia).toHaveBeenCalledTimes(2);
  });

  it('should handle navigation while playing media', async () => {
    // 先选择一个媒体开始播放
    mockStore.setCurrentMedia(mockMedia, mockEpisode);
    
    // 渲染App组件，并使用MemoryRouter模拟路由
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 验证播放器显示
    expect(screen.getByTestId('mock-player')).toBeInTheDocument();
    
    // 模拟导航到历史记录页面
    const historyLink = screen.getByText('History');
    if (historyLink) {
      fireEvent.click(historyLink);
      
      // 验证播放器仍然显示（因为当前有媒体在播放）
      expect(screen.getByTestId('mock-player')).toBeInTheDocument();
    }
  });

  it('should handle media playback after page refresh', async () => {
    // 模拟页面刷新后，currentMedia仍然存在
    mockStore.currentMedia = mockMedia;
    mockStore.currentEpisode = mockEpisode;
    
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 验证播放器显示并使用了正确的媒体
    expect(screen.getByTestId('mock-player')).toBeInTheDocument();
    expect(screen.getByTestId('current-media-title')).toHaveTextContent('Test Movie');
  });

  it('should handle media playback errors gracefully', async () => {
    // Mock setCurrentMedia方法抛出错误
    const mockError = new Error('Failed to set current media');
    (mockStore.setCurrentMedia as jest.Mock).mockImplementation(() => {
      throw mockError;
    });
    
    // Mock console.error以避免测试输出错误信息
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 获取媒体项并点击
    const mediaItem = screen.getByTestId('media-item');
    fireEvent.click(mediaItem);
    
    // 验证错误被正确处理（不会导致应用崩溃）
    expect(() => {
      screen.getByTestId('home-page');
    }).not.toThrow();
    
    // 恢复console.error
    consoleErrorSpy.mockRestore();
  });
});