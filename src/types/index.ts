// 媒体类型枚举
export const MediaType = {
  MOVIE: 'movie',
  TV_SHOW: 'tv',
  ANIME: 'anime',
  DOCUMENTARY: 'documentary',
  OTHER: 'other'
} as const;

export type MediaType = typeof MediaType[keyof typeof MediaType];

export const PlaybackState = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  ENDED: 'ended',
  ERROR: 'error'
} as const;

export type PlaybackState = typeof PlaybackState[keyof typeof PlaybackState];

// 媒体信息接口
export interface MediaInfo {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  type: MediaType | string;
  source: string;
  rating: number;
  releaseYear: number;
  genres: string[];
  director?: string;
  actors?: string[];
  duration?: number;
  country?: string;
  language?: string;
  episodes?: EpisodeInfo[];
  [key: string]: unknown;
}

// 剧集信息接口
export interface EpisodeInfo {
  id: string;
  title: string;
  description: string;
  index: number;
  duration?: number;
  releaseDate?: string;
  [key: string]: unknown;
}

// 搜索结果接口
export interface SearchResult {
  media: MediaInfo;
  pluginId: string;
  score?: number;
}

// 插件设置项接口
export interface PluginSetting {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea';
  label: string;
  defaultValue: unknown;
  options?: Array<{label?: string; value: unknown}> | string[];
  placeholder?: string;
  validation?: RegExp | ((value: unknown) => boolean);
}

// 插件元数据接口
export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  homepage?: string;
  icon?: string;
  settings?: PluginSetting[];
}

// 插件接口
export interface Plugin {
  metadata: PluginMetadata;
  search(query: string, type?: MediaType | string): Promise<SearchResult[]>;
  getMediaDetail(id: string): Promise<MediaInfo>;
  getEpisodes(id: string): Promise<EpisodeInfo[]>;
  getPlayUrl(id: string, episodeId?: string): Promise<string>;
  getSubtitles?(id: string, episodeId?: string): Promise<Array<{url: string; language: string}>>;
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
  getSettings?(): Promise<unknown>;
  setSettings?(settings: unknown): Promise<void>;
}

// 用户配置接口
export interface UserConfig {
  theme: 'light' | 'dark' | 'system';
  language: string;
  playbackSpeed: number;
  defaultQuality: string;
  autoPlayNext: boolean;
  subtitleEnabled: boolean;
  [key: string]: unknown;
}

// 历史记录项接口
export interface HistoryItem {
  mediaId: string;
  source: string;
  timestamp: number;
  progress: number;
  episodeId?: string;
  title: string;
  posterUrl: string;
}

// 收藏项类型
export interface FavoriteItem {
  id: string;
  title: string;
  source: string;
  cover?: string;
  timestamp: number;
}

// 插件管理状态类型
export interface PluginManagerState {
  plugins: Plugin[];
  enabledPlugins: string[];
  pluginConfigs: Record<string, Record<string, unknown>>;
  isLoading: boolean;
  error: string | null;
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: number;
}

// 播放器配置类型
export interface PlayerConfig {
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  aspectRatio?: string;
  playsInline?: boolean;
}

// 路由参数类型
export interface RouteParams {
  id?: string;
  type?: string;
  source?: string;
  page?: string;
}

// 事件类型
export interface EventData<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}