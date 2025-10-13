/**
 * 搜索功能集成测试
 * 测试搜索功能的完整流程
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
import { useAppStore } from '../../src/store/AppStore';
import { pluginManager } from '../../src/plugin/PluginManager';

// Mock store and pluginManager
jest.mock('../../src/store/AppStore');
jest.mock('../../src/plugin/PluginManager');
jest.mock('../../src/plugin/SamplePlugin');

describe('搜索功能集成测试', () => {
  const mockSearchResults = [
    {
      media: {
        id: 'test1',
        title: 'Search Result 1',
        type: 'movie',
        coverUrl: 'https://example.com/cover1.jpg',
        description: 'Test description 1',
        year: 2023,
        duration: 120,
      },
      pluginId: 'sample',
    },
    {
      media: {
        id: 'test2',
        title: 'Search Result 2',
        type: 'tv',
        coverUrl: 'https://example.com/cover2.jpg',
        description: 'Test description 2',
        year: 2023,
        duration: 30,
      },
      pluginId: 'sample',
    },
  ];

  const mockStore = {
    initializeApp: jest.fn().mockResolvedValue(undefined),
    currentMedia: null,
    setSearchQuery: jest.fn(),
    searchMedia: jest.fn().mockImplementation(async (query: string) => {
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 调用mock的setSearchResults方法
      mockStore.setSearchResults(mockSearchResults);
    }),
    setSearchResults: jest.fn(),
    searchResults: [],
    isSearching: false,
    setIsSearching: jest.fn(),
  };

  beforeEach(() => {
    // 清除所有mock调用
    jest.clearAllMocks();
    
    // Mock useAppStore hook
    (useAppStore as unknown as jest.Mock).mockReturnValue(mockStore);
    
    // Mock pluginManager
    (pluginManager.registerPlugin as jest.Mock).mockResolvedValue(true);
    (pluginManager.enablePlugin as jest.Mock).mockResolvedValue(true);
  });

  it('should search media and display results correctly', async () => {
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
    
    // 获取搜索输入框
    const searchInput = screen.getByPlaceholderText('Search for movies, TV shows...');
    
    // 输入搜索关键词并提交
    const searchQuery = 'test query';
    fireEvent.change(searchInput, { target: { value: searchQuery } });
    fireEvent.submit(searchInput.closest('form')!);
    
    // 等待搜索完成
    await waitFor(() => {
      expect(mockStore.setSearchQuery).toHaveBeenCalledWith(searchQuery);
      expect(mockStore.searchMedia).toHaveBeenCalledWith(searchQuery);
      expect(mockStore.setSearchResults).toHaveBeenCalledWith(mockSearchResults);
    });
  });

  it('should handle empty search query', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 获取搜索输入框
    const searchInput = screen.getByPlaceholderText('Search for movies, TV shows...');
    
    // 输入空字符串并提交
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.submit(searchInput.closest('form')!);
    
    // 验证searchMedia没有被调用
    expect(mockStore.searchMedia).not.toHaveBeenCalled();
  });

  it('should handle search with special characters', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 获取搜索输入框
    const searchInput = screen.getByPlaceholderText('Search for movies, TV shows...');
    
    // 输入包含特殊字符的搜索关键词并提交
    const searchQuery = 'movie: test 123!@#';
    fireEvent.change(searchInput, { target: { value: searchQuery } });
    fireEvent.submit(searchInput.closest('form')!);
    
    // 等待搜索完成
    await waitFor(() => {
      expect(mockStore.setSearchQuery).toHaveBeenCalledWith(searchQuery);
      expect(mockStore.searchMedia).toHaveBeenCalledWith(searchQuery);
    });
  });

  it('should handle search error gracefully', async () => {
    // Mock searchMedia方法抛出错误
    const mockError = new Error('Search failed');
    (mockStore.searchMedia as jest.Mock).mockRejectedValue(mockError);
    
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
    
    // 获取搜索输入框
    const searchInput = screen.getByPlaceholderText('Search for movies, TV shows...');
    
    // 输入搜索关键词并提交
    const searchQuery = 'test query';
    fireEvent.change(searchInput, { target: { value: searchQuery } });
    fireEvent.submit(searchInput.closest('form')!);
    
    // 等待搜索完成
    await waitFor(() => {
      expect(mockStore.setSearchQuery).toHaveBeenCalledWith(searchQuery);
      expect(mockStore.searchMedia).toHaveBeenCalledWith(searchQuery);
    });
    
    // 恢复console.error
    consoleErrorSpy.mockRestore();
  });

  it('should handle navigation to search page', async () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <App />
      </MemoryRouter>
    );
    
    // 等待应用初始化完成
    await waitFor(() => {
      expect(mockStore.initializeApp).toHaveBeenCalled();
    });
    
    // 验证搜索页面组件被渲染
    // 注意：这里假设SearchPage组件有一个特定的测试ID或文本
    expect(screen.getByTestId('search-page')).toBeInTheDocument();
  });
});