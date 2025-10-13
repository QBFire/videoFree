/**
 * 示例插件
 * 用于展示插件系统的工作原理和接口实现
 */

import { MediaType } from '../types';
import type { Plugin, PluginMetadata, MediaInfo, EpisodeInfo, SearchResult } from '../types';

// 模拟媒体数据
const mockMovies: MediaInfo[] = [
  {
    id: 'movie1',
    title: '示例电影1',
    source: 'sample',
    type: MediaType.MOVIE,
    cover: 'https://picsum.photos/300/450?random=1',
    posterUrl: 'https://picsum.photos/300/450?random=1',
    description: '这是一部精彩的动作电影',
    tags: ['动作', '冒险', '科幻'],
    genres: ['动作', '冒险', '科幻'],
    rating: 8.5,
    year: 2023,
    releaseYear: 2023,
    directors: ['导演A'],
    actors: ['演员A', '演员B'],
    duration: 120,
    country: '美国',
    language: '英语',
    releaseDate: '2023-01-15',
    updateTime: '2023-10-01'
  },
  {
    id: 'movie2',
    title: '示例电影2',
    source: 'sample',
    type: MediaType.MOVIE,
    cover: 'https://picsum.photos/300/450?random=2',
    posterUrl: 'https://picsum.photos/300/450?random=2',
    description: '这是一部感人的剧情片',
    tags: ['剧情', '情感'],
    genres: ['剧情', '情感'],
    rating: 9.0,
    year: 2022,
    releaseYear: 2022,
    directors: ['导演B'],
    actors: ['演员C', '演员D'],
    duration: 135,
    country: '中国',
    language: '中文',
    releaseDate: '2022-11-20',
    updateTime: '2023-09-15'
  },
  {
    id: 'tv1',
    title: '示例电视剧1',
    source: 'sample',
    type: MediaType.TV_SHOW,
    cover: 'https://picsum.photos/300/450?random=3',
    posterUrl: 'https://picsum.photos/300/450?random=3',
    description: '这是一部热门电视剧',
    tags: ['悬疑', '犯罪'],
    genres: ['悬疑', '犯罪'],
    rating: 8.8,
    year: 2023,
    releaseYear: 2023,
    directors: ['导演C'],
    actors: ['演员E', '演员F'],
    duration: 45,
    country: '英国',
    language: '英语',
    releaseDate: '2023-03-10',
    updateTime: '2023-10-10',
    totalEpisodes: 12,
    currentEpisodes: 12
  }
];

// 模拟剧集数据
const mockEpisodes: Record<string, EpisodeInfo[]> = {
  'movie2': [
    {
      id: 'movie2_ep1',
      title: '示例剧集 第1集',
      description: '这是示例剧集的第一集',
      index: 1,
      mediaId: 'movie2',
      episodeNumber: 1,
      seasonNumber: 1,
      playUrl: 'https://example.com/video/movie2_ep1.mp4',
      duration: 45,
      size: 1024,
      quality: '1080p',
      subtitles: [
        {
          id: 'sub1',
          label: '中文字幕',
          src: 'https://example.com/subtitles/movie2_ep1_zh.srt',
          type: 'srt'
        },
        {
          id: 'sub2',
          label: '英文字幕',
          src: 'https://example.com/subtitles/movie2_ep1_en.srt',
          type: 'srt'
        }
      ],
      updateTime: '2023-09-15'
    }
  ],
  'tv1': [
    {
      id: 'tv1_ep1',
      title: '电视剧 第1季 第1集',
      description: '电视剧第1季第1集',
      index: 1,
      mediaId: 'tv1',
      episodeNumber: 1,
      seasonNumber: 1,
      playUrl: 'https://example.com/video/tv1_ep1.mp4',
      duration: 50,
      size: 1200,
      quality: '720p',
      subtitles: [
        {
          id: 'sub1',
          label: '中文字幕',
          src: 'https://example.com/subtitles/tv1_ep1_zh.srt',
          type: 'srt'
        }
      ],
      updateTime: '2023-09-10'
    },
    {
      id: 'tv1_ep2',
      title: '电视剧 第1季 第2集',
      description: '电视剧第1季第2集',
      index: 2,
      mediaId: 'tv1',
      episodeNumber: 2,
      seasonNumber: 1,
      playUrl: 'https://example.com/video/tv1_ep2.mp4',
      duration: 48,
      size: 1150,
      quality: '720p',
      subtitles: [
        {
          id: 'sub1',
          label: '中文字幕',
          src: 'https://example.com/subtitles/tv1_ep2_zh.srt',
          type: 'srt'
        }
      ],
      updateTime: '2023-09-11'
    }
  ]
};

// 插件元数据
const metadata: PluginMetadata = {
  id: 'sample-plugin',
  name: '示例插件',
  version: '1.0.0',
  description: '这是一个用于展示插件系统工作原理的示例插件',
  author: 'Videofree Team',
  homepage: 'https://github.com/videofree',
  icon: 'https://picsum.photos/32/32?random=10',
  settings: [
    {
      key: 'apiKey',
      type: 'string',
      label: 'API密钥',
      defaultValue: '',
      placeholder: '请输入API密钥',
      validation: /^[a-zA-Z0-9]{0,50}$/
    },
    {
      key: 'language',
      type: 'select',
      label: '语言偏好',
      defaultValue: 'zh',
      options: [
        { label: '中文', value: 'zh' },
        { label: '英文', value: 'en' },
        { label: '日文', value: 'ja' }
      ]
    },
    {
      key: 'debugMode',
      type: 'boolean',
      label: '调试模式',
      defaultValue: false
    }
  ],
};

// 插件实现
const SamplePlugin: Plugin = {
  metadata,

  // 搜索媒体
  async search(query: string, type?: MediaType | string, page: number = 1): Promise<SearchResult[]> {
    console.log(`SamplePlugin: 搜索媒体, 关键词: ${query}, 类型: ${type}, 页码: ${page}`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lowerQuery = query.toLowerCase();
    
    // 根据类型和关键词筛选
    let results: MediaInfo[] = [];
    if (type === MediaType.MOVIE || !type) {
      results = mockMovies.filter(movie => 
        (movie.title.toLowerCase().includes(lowerQuery) ||
         movie.description.toLowerCase().includes(lowerQuery) ||
         (movie.tags && Array.isArray(movie.tags) && movie.tags.some((tag: unknown) => typeof tag === 'string' && tag.toLowerCase().includes(lowerQuery)))) &&
        movie.type === MediaType.MOVIE
      );
    }
    
    if (type === MediaType.TV_SHOW || !type) {
      const tvShows = mockMovies.filter(movie => 
        (movie.title.toLowerCase().includes(lowerQuery) ||
         movie.description.toLowerCase().includes(lowerQuery) ||
         (movie.tags && Array.isArray(movie.tags) && movie.tags.some((tag: unknown) => typeof tag === 'string' && tag.toLowerCase().includes(lowerQuery)))) &&
        movie.type === MediaType.TV_SHOW
      );
      results = [...results, ...tvShows];
    }
    
    if (type === MediaType.ANIME || !type) {
      const animes = mockMovies.filter(movie => 
        (movie.title.toLowerCase().includes(lowerQuery) ||
         movie.description.toLowerCase().includes(lowerQuery) ||
         (movie.tags && Array.isArray(movie.tags) && movie.tags.some((tag: unknown) => typeof tag === 'string' && tag.toLowerCase().includes(lowerQuery)))) &&
        movie.type === MediaType.ANIME
      );
      results = [...results, ...animes];
    }
    
    if (type === MediaType.DOCUMENTARY || !type) {
      const documentaries = mockMovies.filter(movie => 
        (movie.title.toLowerCase().includes(lowerQuery) ||
         movie.description.toLowerCase().includes(lowerQuery) ||
         (movie.tags && Array.isArray(movie.tags) && movie.tags.some((tag: unknown) => typeof tag === 'string' && tag.toLowerCase().includes(lowerQuery)))) &&
        movie.type === MediaType.DOCUMENTARY
      );
      results = [...results, ...documentaries];
    }
    
    // 模拟分页
    const pageSize = 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = results.slice(startIndex, endIndex);
    
    // 转换为SearchResult类型
    return paginatedResults.map(media => ({
      media,
      pluginId: 'sample-plugin'
    }));
  },

  // 获取媒体详情
  async getMediaDetail(mediaId: string): Promise<MediaInfo> {
    console.log(`SamplePlugin: 获取媒体详情, ID: ${mediaId}`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const movie = mockMovies.find(m => m.id === mediaId);
    if (!movie) {
      throw new Error(`未找到媒体: ${mediaId}`);
    }
    
    return movie;
  },
  
  // 获取媒体剧集
  async getEpisodes(id: string): Promise<EpisodeInfo[]> {
    console.log(`SamplePlugin: 获取媒体剧集, ID: ${id}`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 根据ID获取剧集
    const episodes = mockEpisodes[id] || [];
    
    return episodes;
  },
  
  // 获取播放链接
  async getPlayUrl(id: string, episodeId?: string): Promise<string> {
    console.log(`SamplePlugin: 获取播放链接, ID: ${id}, 剧集ID: ${episodeId}`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (episodeId) {
      // 查找对应的剧集
      for (const mediaId in mockEpisodes) {
        const episode = mockEpisodes[mediaId].find(e => e.id === episodeId);
        if (episode) {
          return String(episode.playUrl);
        }
      }
      throw new Error(`未找到播放链接: ${episodeId}`);
    }
    
    // 如果没有指定episodeId，则返回第一个匹配的媒体的第一个剧集
    const media = mockMovies.find(m => m.id === id);
    if (media && mockEpisodes[id] && mockEpisodes[id].length > 0) {
        return String(mockEpisodes[id][0].playUrl);
      }
    
    throw new Error(`未找到播放链接: ${id}`);
  },

  // 获取字幕
  async getSubtitles(id: string, episodeId?: string): Promise<Array<{url: string; language: string}>> {
    console.log(`SamplePlugin: 获取字幕, 剧集ID: ${episodeId || id}`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 查找对应的剧集
    for (const mediaId in mockEpisodes) {
      const episode = mockEpisodes[mediaId].find(e => e.id === (episodeId || id));
      if (episode && episode.subtitles && Array.isArray(episode.subtitles)) {
          // 转换为接口要求的格式
          return episode.subtitles.map((sub: unknown) => {
            // 类型检查确保sub对象结构正确
            if (typeof sub === 'object' && sub !== null && 'src' in sub && 'label' in sub) {
              return {
                url: String((sub as any).src),
                language: String((sub as any).label)
              };
            }
            return { url: '', language: '' };
          }).filter(item => item.url && item.language);
        }
    }
    
    return [];
  },



  // 初始化插件
  async initialize(): Promise<void> {
    console.log('SamplePlugin: 初始化插件');
    
    // 这里可以进行插件的初始化操作，如连接API、加载配置等
  },
  
  // 销毁插件
  async destroy(): Promise<void> {
    console.log('SamplePlugin: 销毁插件');
    
    // 这里可以进行插件的清理操作，如断开连接、释放资源等
  }
};

export default SamplePlugin;