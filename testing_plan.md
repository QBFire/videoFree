# VideoFree 项目测试方案

## 1. 测试概述

本测试方案旨在确保 VideoFree 项目的所有核心功能正常工作，提高代码质量，减少潜在的缺陷和问题。测试将涵盖以下几个方面：

- 单元测试：测试各个独立组件和函数的功能
- 集成测试：测试组件之间的交互和集成
- 端到端测试：测试完整的用户流程

## 2. 测试环境配置

### 2.1 安装测试依赖

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest ts-jest
npm install --save-dev cypress # 用于端到端测试
```

### 2.2 创建测试配置文件

- `jest.config.ts`：Jest 配置文件
- `vitest.config.ts`：Vitest 配置文件
- `cypress.config.ts`：Cypress 配置文件

## 3. 测试范围与重点

### 3.1 核心功能测试

1. **插件系统**
   - 插件注册与卸载
   - 插件启用与禁用
   - 插件配置管理
   - 插件缓存机制

2. **状态管理**
   - 播放状态管理
   - 历史记录管理
   - 收藏功能
   - 用户配置更新
   - 搜索状态管理

3. **视频播放器**
   - 播放/暂停控制
   - 进度条拖动
   - 音量调节
   - 全屏切换
   - 最小化功能

4. **路由与页面**
   - 页面导航
   - 参数传递
   - 组件渲染

## 4. 测试用例设计

### 4.1 单元测试用例

#### PluginManager 测试

```typescript
// tests/unit/plugin/PluginManager.test.ts
import { pluginManager } from '../../src/plugin/PluginManager';
import SamplePlugin from '../../src/plugin/SamplePlugin';

// 测试插件注册
it('should register plugin successfully', async () => {
  const result = await pluginManager.registerPlugin(SamplePlugin);
  expect(result).toBe(true);
});

// 测试插件启用/禁用
it('should enable and disable plugin', async () => {
  await pluginManager.enablePlugin(SamplePlugin.metadata.id);
  expect(pluginManager.isPluginEnabled(SamplePlugin.metadata.id)).toBe(true);
  
  await pluginManager.disablePlugin(SamplePlugin.metadata.id);
  expect(pluginManager.isPluginEnabled(SamplePlugin.metadata.id)).toBe(false);
});

// 测试插件搜索功能
it('should search media through plugin', async () => {
  const results = await pluginManager.search('test');
  expect(results).toBeInstanceOf(Array);
});
```

#### AppStore 测试

```typescript
// tests/unit/store/AppStore.test.ts
import { useAppStore } from '../../src/store/AppStore';
import { PlaybackState } from '../../src/types';

// Mock zustand for testing
jest.mock('zustand');

// 测试播放状态设置
it('should set playback state correctly', () => {
  const store = useAppStore.getState();
  store.setPlaybackState(PlaybackState.PLAYING);
  expect(store.playbackState).toBe(PlaybackState.PLAYING);
});

// 测试历史记录添加
it('should add media to history', () => {
  const store = useAppStore.getState();
  const mockMedia = {
    id: 'test123',
    title: 'Test Media',
    type: 'movie',
    coverUrl: 'https://example.com/cover.jpg',
    description: 'Test description',
    year: 2023,
    duration: 120
  };
  
  store.addToHistory(mockMedia, 0);
  expect(store.history.length).toBe(1);
  expect(store.history[0].media.id).toBe('test123');
});

// 测试收藏功能
it('should add and remove from favorites', () => {
  const store = useAppStore.getState();
  const mockMedia = {
    id: 'test123',
    title: 'Test Media',
    type: 'movie',
    coverUrl: 'https://example.com/cover.jpg',
    description: 'Test description',
    year: 2023,
    duration: 120
  };
  
  store.addToFavorites(mockMedia);
  expect(store.isFavorite('test123')).toBe(true);
  
  store.removeFromFavorites('test123');
  expect(store.isFavorite('test123')).toBe(false);
});
```

#### Player 组件测试

```typescript
// tests/unit/components/Player.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useAppStore } from '../../src/store/AppStore';
import Player from '../../src/components/Player';

// Mock store and hooks
jest.mock('../../src/store/AppStore');

// 测试播放器渲染
it('should render player component', () => {
  (useAppStore as jest.Mock).mockReturnValue({
    currentMedia: { id: 'test', title: 'Test Video' },
    currentEpisode: { playUrl: 'https://example.com/video.mp4' },
    playbackState: 'idle',
    // 其他必要的mock属性
  });
  
  render(<Player />);
  expect(screen.getByTitle('Test Video')).toBeInTheDocument();
});

// 测试播放/暂停控制
it('should handle play/pause correctly', () => {
  const mockSetPlaybackState = jest.fn();
  (useAppStore as jest.Mock).mockReturnValue({
    currentMedia: { id: 'test', title: 'Test Video' },
    currentEpisode: { playUrl: 'https://example.com/video.mp4' },
    playbackState: 'idle',
    setPlaybackState: mockSetPlaybackState,
    // 其他必要的mock属性
  });
  
  render(<Player />);
  const playButton = screen.getByRole('button', { name: 'Play' });
  fireEvent.click(playButton);
  
  expect(mockSetPlaybackState).toHaveBeenCalledWith('playing');
});
```

### 4.2 集成测试用例

#### 搜索功能集成测试

```typescript
// tests/integration/search.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { useAppStore } from '../../src/store/AppStore';

// 测试搜索功能流程
it('should search media and display results', async () => {
  const mockSearchMedia = jest.fn().mockResolvedValue([
    { media: { id: 'test1', title: 'Search Result' }, pluginId: 'sample' }
  ]);
  
  (useAppStore as jest.Mock).mockReturnValue({
    searchMedia: mockSearchMedia,
    setSearchQuery: jest.fn(),
    // 其他必要的mock属性
  });
  
  render(<App />);
  const searchInput = screen.getByPlaceholderText('Search for movies, TV shows...');
  fireEvent.change(searchInput, { target: { value: 'test' } });
  fireEvent.submit(searchInput.form!);
  
  await waitFor(() => {
    expect(mockSearchMedia).toHaveBeenCalledWith('test');
  });
});
```

#### 媒体播放集成测试

```typescript
// tests/integration/player.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { useAppStore } from '../../src/store/AppStore';

// 测试媒体播放流程
it('should play media when selected', async () => {
  const mockSetCurrentMedia = jest.fn();
  
  (useAppStore as jest.Mock).mockReturnValue({
    currentMedia: null,
    setCurrentMedia: mockSetCurrentMedia,
    // 其他必要的mock属性
  });
  
  render(<App />);
  // 假设首页有一个媒体项可以点击
  const mediaItem = screen.getByText('Popular Movie');
  fireEvent.click(mediaItem);
  
  await waitFor(() => {
    expect(mockSetCurrentMedia).toHaveBeenCalled();
  });
});
```

### 4.3 端到端测试用例

#### 用户流程端到端测试

```typescript
// cypress/e2e/userFlow.cy.ts

// 测试完整的用户流程：打开应用 -> 搜索 -> 选择媒体 -> 播放
it('should complete full user flow successfully', () => {
  // 访问应用首页
  cy.visit('http://localhost:5173/');
  
  // 搜索媒体
  cy.get('input[placeholder="Search for movies, TV shows..."]').type('test{enter}');
  
  // 等待搜索结果加载
  cy.wait(1000);
  
  // 选择搜索结果
  cy.get('.search-results .media-item').first().click();
  
  // 验证详情页
  cy.url().should('include', '/detail/');
  
  // 播放媒体
  cy.get('.play-button').click();
  
  // 验证播放器出现
  cy.get('.player-container').should('be.visible');
});

// 测试收藏功能
it('should add and remove media from favorites', () => {
  cy.visit('http://localhost:5173/');
  
  // 进入收藏页面
  cy.get('nav a[href="/favorites"]').click();
  cy.url().should('include', '/favorites');
  
  // 返回首页并添加到收藏
  cy.get('nav a[href="/"]').click();
  cy.get('.media-item').first().find('.favorite-button').click();
  
  // 再次进入收藏页面验证
  cy.get('nav a[href="/favorites"]').click();
  cy.get('.favorites-list .media-item').should('have.length.greaterThan', 0);
});
```

## 5. 测试执行计划

### 5.1 本地开发测试

```bash
# 运行单元测试
npm run test

# 运行单元测试并生成覆盖率报告
npm run test -- --coverage

# 运行集成测试
npm run test:integration

# 运行端到端测试
npx cypress open
# 或无头模式
npx cypress run
```

### 5.2 CI/CD 集成

在 CI/CD 流程中添加测试步骤，确保每个提交和 PR 都经过测试验证。可以使用 GitHub Actions、GitLab CI 等工具。

## 6. 测试覆盖率目标

- 单元测试覆盖率：≥ 80%
- 集成测试覆盖率：≥ 60%
- 端到端测试覆盖率：覆盖核心用户流程

## 7. 缺陷跟踪与管理

- 使用 GitHub Issues 或其他缺陷跟踪系统记录和管理测试过程中发现的问题
- 每个缺陷应包含：描述、重现步骤、预期行为、实际行为、优先级和严重程度

## 8. 测试维护

- 随着项目功能的更新，及时更新和添加测试用例
- 定期运行测试套件，确保现有功能正常工作
- 代码重构后，确保相关测试用例仍然有效

## 9. 附录：相关资源

- [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest 文档](https://jestjs.io/docs/getting-started)
- [Cypress 文档](https://docs.cypress.io/guides/getting-started/opening-the-app)
- [Zustand 测试指南](https://github.com/pmndrs/zustand/blob/main/docs/testing.md)