import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import SearchPage from '../../../src/pages/SearchPage';
import { useAppStore } from '../../../src/store';

// Mock store and hooks
jest.mock('../../../src/store');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn()
}));

const mockedUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockedUseParams = useParams as jest.MockedFunction<typeof useParams>;

// Mock console.log
console.log = jest.fn();

describe('SearchPage组件CT测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 测试场景1: 初始状态 - 无搜索查询
  test('当没有搜索查询时，显示提示信息', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({} as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByText('请在搜索框中输入关键词')).toBeInTheDocument();
    expect(screen.queryByText('搜索结果')).toBeInTheDocument();
    expect(screen.queryByText('关于')).not.toBeInTheDocument();
  });

  // 测试场景2: 从URL参数获取搜索查询
  test('从URL参数获取搜索查询并显示结果', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({ query: '流浪地球' } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByText('关于 "流浪地球" 的搜索结果 (1)')).toBeInTheDocument();
    expect(screen.getByText('流浪地球3')).toBeInTheDocument();
    expect(screen.getByAltText('流浪地球3')).toBeInTheDocument();
  });

  // 测试场景3: 从应用状态获取搜索查询
  test('从应用状态获取搜索查询并显示结果', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '科幻',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({} as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByText('关于 "科幻" 的搜索结果 (4)')).toBeInTheDocument();
    // 检查是否有4个媒体卡片
    expect(screen.getAllByRole('img', { hidden: false })).toHaveLength(4);
  });

  // 测试场景4: 应用状态优先于URL参数
  test('当同时存在应用状态和URL参数时，应用状态优先', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '星际穿越',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({ query: '三体' } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByText('关于 "星际穿越" 的搜索结果 (1)')).toBeInTheDocument();
    expect(screen.getByText('星际穿越2')).toBeInTheDocument();
  });

  // 测试场景5: 无搜索结果
  test('当搜索查询没有匹配结果时，显示无结果提示', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '不存在的电影',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({} as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByText('关于 "不存在的电影" 的搜索结果 (0)')).toBeInTheDocument();
    expect(screen.getByText('没有找到相关结果')).toBeInTheDocument();
    expect(screen.getByText('请尝试其他搜索词')).toBeInTheDocument();
  });

  // 测试场景6: 媒体卡片点击事件
  test('点击媒体卡片时调用handleMediaClick函数', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '流浪地球',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({} as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    const mediaCard = screen.getByText('流浪地球3').closest('.media-card');
    fireEvent.click(mediaCard!);

    expect(console.log).toHaveBeenCalledWith(
      'Media clicked:',
      expect.objectContaining({
        id: 'movie-1',
        title: '流浪地球3'
      })
    );
  });

  // 测试场景7: 渲染媒体卡片的完整信息
  test('正确渲染媒体卡片的所有信息（标题、年份、评分、海报）', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '三体',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({} as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    const mediaCard = screen.getByText('三体').closest('.media-card');
    expect(mediaCard).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.8')).toBeInTheDocument();
    expect(screen.getByAltText('三体')).toHaveAttribute('src', expect.stringContaining('picsum.photos'));
  });

  // 测试场景8: 搜索查询为空字符串
  test('当搜索查询为空字符串时，显示占位符', () => {
    mockedUseAppStore.mockReturnValue({
      searchQuery: '',
      setSearchQuery: jest.fn()
    } as any);
    mockedUseParams.mockReturnValue({ query: '' } as any);

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getByText('请在搜索框中输入关键词')).toBeInTheDocument();
    expect(screen.queryByText('关于')).not.toBeInTheDocument();
  });
});