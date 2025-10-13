# videoFree - 开源视频播放应用

videoFree 是一个基于现代 Web 技术构建的开源视频播放应用，提供丰富的媒体内容浏览、搜索和播放功能。该应用采用插件化架构设计，可以轻松扩展内容来源。

## 项目概述

videoFree 是一个功能完整的视频播放器应用，具有以下特点：
- 插件化架构，支持多种内容源
- 现代化 UI 设计，响应式布局
- 完整的视频播放功能，包括进度控制、音量调节、全屏等
- 用户数据管理，包括历史记录和收藏夹
- 支持多种媒体类型，如电影、电视剧、动漫等

## 技术栈

- **前端框架**：React 19
- **编程语言**：TypeScript
- **构建工具**：Vite
- **路由管理**：React Router
- **状态管理**：Zustand
- **样式方案**：Styled-components
- **视频播放**：video.js
- **HTTP 请求**：Axios

## 项目结构

```
src/
├── components/     # React 组件
│   ├── Navbar.tsx  # 导航栏组件
│   ├── Player.tsx  # 视频播放器组件
│   └── SearchBar.tsx # 搜索栏组件
├── pages/          # 页面组件
│   ├── HomePage.tsx      # 首页
│   ├── SearchPage.tsx    # 搜索页面
│   ├── DetailPage.tsx    # 媒体详情页
│   ├── HistoryPage.tsx   # 历史记录页面
│   ├── FavoritesPage.tsx # 收藏页面
│   └── PluginsPage.tsx   # 插件页面
├── plugin/         # 插件系统
│   ├── PluginManager.ts  # 插件管理器
│   └── SamplePlugin.ts   # 示例插件
├── store/          # 状态管理
│   ├── AppStore.ts # 应用状态存储
│   └── index.ts    # 导出文件
├── types/          # 类型定义
│   └── index.ts    # 所有类型定义
├── player/         # 播放器相关代码
│   └── index.ts    # 播放器入口
├── storage/        # 存储管理
│   └── index.ts    # 存储工具
├── utils/          # 工具函数
│   ├── helpers.ts  # 辅助函数
│   └── index.ts    # 导出文件
├── App.tsx         # 应用入口组件
├── App.css         # 应用样式
├── main.tsx        # 主入口文件
└── index.css       # 全局样式
```

## 核心功能

### 1. 插件系统

插件系统是 videoFree 的核心特性，允许通过插件扩展内容来源。每个插件都需要实现 `Plugin` 接口，提供搜索、获取媒体详情、获取播放链接等功能。

**插件接口主要功能**：
- `search(query: string, type?: MediaType)`: 根据关键词和类型搜索媒体
- `getMediaDetail(id: string)`: 获取媒体详细信息
- `getEpisodes(id: string)`: 获取剧集列表
- `getPlayUrl(id: string, episodeId?: string)`: 获取播放链接
- `getSubtitles(id: string, episodeId?: string)`: 获取字幕（可选）
- `initialize()`: 插件初始化（可选）
- `destroy()`: 插件销毁（可选）

**插件管理器**：`PluginManager` 负责插件的注册、启用/禁用、配置等功能，采用单例模式实现。

### 2. 视频播放器

播放器组件 `Player` 提供完整的视频播放功能，包括：
- 播放/暂停控制
- 进度条拖动
- 音量调节和静音切换
- 全屏切换
- 最小化模式
- 自动隐藏控制栏
- 播放状态显示（缓冲、播放、暂停等）

### 3. 状态管理

项目使用 Zustand 进行状态管理，主要管理以下状态：
- 播放状态（当前媒体、播放进度、音量等）
- 用户数据（历史记录、收藏夹）
- 用户配置
- 搜索状态（搜索查询、搜索结果）

Zustand 的状态持久化功能用于保存用户的历史记录、收藏夹和配置。

### 4. 页面功能

- **首页**：展示热门推荐内容，提供搜索入口
- **搜索页**：显示搜索结果，支持筛选和排序
- **详情页**：展示媒体详细信息，提供播放入口和剧集列表
- **历史记录**：记录用户观看历史，支持清除
- **收藏夹**：管理用户收藏的媒体
- **插件页**：管理插件的启用/禁用和配置

## 类型定义

项目使用 TypeScript 提供类型安全，主要类型定义包括：

- **MediaType**: 媒体类型枚举（电影、电视剧、动漫等）
- **PlaybackState**: 播放状态枚举
- **MediaInfo**: 媒体信息接口
- **EpisodeInfo**: 剧集信息接口
- **Plugin**: 插件接口
- **UserConfig**: 用户配置接口
- **HistoryItem**: 历史记录项接口
- **FavoriteItem**: 收藏项接口

## 使用方法

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 插件开发

开发者可以通过实现 `Plugin` 接口来开发自定义插件。示例插件 `SamplePlugin.ts` 提供了一个完整的插件实现参考。

**插件开发步骤**：
1. 创建插件元数据，包含插件 ID、名称、版本等信息
2. 实现 `Plugin` 接口的所有必需方法
3. 在应用中注册并启用插件

## 存储管理

项目使用本地存储来保存用户数据，包括：
- 历史记录
- 收藏夹
- 用户配置
- 插件配置
- 启用的插件列表

## 特色功能

1. **插件化架构**：通过插件系统轻松扩展内容来源
2. **响应式设计**：适配不同屏幕尺寸的设备
3. **用户体验优化**：自动隐藏控制栏、播放状态指示等
4. **数据持久化**：保存用户的观看历史和偏好设置
5. **模块化设计**：代码结构清晰，便于维护和扩展

## License

[MIT](https://opensource.org/licenses/MIT)

## 致谢

感谢所有为项目做出贡献的开发者和用户！