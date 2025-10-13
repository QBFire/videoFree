/**
 * 播放器核心逻辑
 * 负责处理视频播放、控制和事件管理
 */

import videojs from 'video.js';
import type { EpisodeInfo, MediaInfo } from '../types';

interface PlayerOptions {
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  aspectRatio?: string;
}

export class VideoPlayerCore {
  private player: unknown | null = null;
  private elementId: string;
  private options: PlayerOptions;
  private eventHandlers: Map<string, Array<(event: Event) => void>> = new Map();

  constructor(elementId: string, options: PlayerOptions = {}) {
    this.elementId = elementId;
    this.options = {
      autoplay: false,
      controls: true,
      muted: false,
      loop: false,
      preload: 'metadata',
      aspectRatio: '16:9',
      ...options
    };
    
    // 初始化播放器
    this.initPlayer();
  }

  private initPlayer(): void {
    try {
      const videoElement = document.getElementById(this.elementId);
      if (videoElement) {
        this.player = videojs(videoElement, this.options);
        this.setupEventListeners();
      }
    } catch (error) {
      console.error('Failed to initialize video player:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.player) return;

    // 类型断言
    const player = this.player as any;

    // 监听播放器事件并转发给注册的回调函数
    const events = ['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'error', 'loadedmetadata', 'waiting', 'playing'];
    
    events.forEach(event => {
      player.on(event, (e: Event) => {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => handler(e));
      });
    });
  }

  // 加载媒体资源
  loadMedia(media: MediaInfo, episode: EpisodeInfo): void {
    if (!this.player) return;

    // 类型检查确保playUrl是字符串
    const playUrl = typeof episode.playUrl === 'string' ? episode.playUrl : '';
    if (!playUrl) return;

    try {
      // 类型断言
      const player = this.player as any;

      // 设置视频源
      player.src({
        src: playUrl,
        type: this.detectMediaType(playUrl)
      });

      // 添加字幕 - 添加类型检查
      if (episode.subtitles && Array.isArray(episode.subtitles) && episode.subtitles.length > 0) {
        // 确保每个字幕项都有正确的结构
        const validSubtitles = episode.subtitles.filter((sub: unknown) => 
          typeof sub === 'object' && 
          sub !== null && 
          'id' in sub && 
          'label' in sub && 
          'src' in sub &&
          typeof (sub as any).id === 'string' &&
          typeof (sub as any).label === 'string' &&
          typeof (sub as any).src === 'string'
        ).map((sub: unknown) => ({
          id: String((sub as any).id),
          label: String((sub as any).label),
          src: String((sub as any).src),
          type: typeof (sub as any).type === 'string' ? (sub as any).type : undefined
        }));
        
        this.addSubtitles(validSubtitles);
      }

      // 设置标题
      player.poster(media.cover || '');
      player.title(episode.title || media.title);
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  }

  // 检测媒体类型
  private detectMediaType(url: string): string {
    if (url.endsWith('.mp4')) return 'video/mp4';
    if (url.endsWith('.webm')) return 'video/webm';
    if (url.endsWith('.m3u8')) return 'application/x-mpegURL';
    if (url.endsWith('.mpd')) return 'application/dash+xml';
    return 'video/mp4'; // 默认类型
  }

  // 添加字幕
  addSubtitles(subtitles: Array<{ id: string; label: string; src: string; type?: string }>): void {
    if (!this.player) return;

    try {
      // 类型断言
      const player = this.player as any;

      // 清除现有字幕
      const tracks = player.textTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === 'subtitles') {
          player.removeRemoteTextTrack(track);
        }
      }

      // 添加新字幕
      subtitles.forEach(sub => {
        const track = player.addRemoteTextTrack({
          kind: 'subtitles',
          label: sub.label,
          src: sub.src,
          srclang: sub.id.split('-')[0] || 'en'
        }, false);
        
        // 设置默认字幕
        if (sub.id === 'default') {
          track.mode = 'showing';
        } else {
          track.mode = 'hidden';
        }
      });
    } catch (error) {
      console.error('Failed to add subtitles:', error);
    }
  }

  // 选择字幕
  selectSubtitle(subtitleId: string): void {
    if (!this.player) return;

    try {
      // 类型断言
      const player = this.player as any;

      const tracks = player.textTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.kind === 'subtitles') {
          track.mode = track.label === subtitleId ? 'showing' : 'hidden';
        }
      }
    } catch (error) {
      console.error('Failed to select subtitle:', error);
    }
  }

  // 播放控制方法
  play(): void {
    const player = this.player as any;
    player?.play();
  }

  pause(): void {
    const player = this.player as any;
    player?.pause();
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  // 进度控制
  seek(time: number): void {
    if (this.player) {
      const player = this.player as any;
      player.currentTime(time);
    }
  }

  // 音量控制
  setVolume(volume: number): void {
    if (this.player) {
      const player = this.player as any;
      player.volume(volume / 100);
    }
  }

  toggleMute(): void {
    if (this.player) {
      const player = this.player as any;
      player.muted(!player.muted());
    }
  }

  // 播放速度控制
  setPlaybackRate(rate: number): void {
    if (this.player) {
      const player = this.player as any;
      player.playbackRate(rate);
    }
  }

  // 全屏控制
  toggleFullscreen(): void {
    if (!this.player) return;

    try {
      const player = this.player as any;
      
      if (player.isFullscreen()) {
        player.exitFullscreen();
      } else {
        player.requestFullscreen();
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  }

  // 获取播放器状态
  isPlaying(): boolean {
    const player = this.player as any;
    return player?.paused() === false;
  }

  getCurrentTime(): number {
    const player = this.player as any;
    return player?.currentTime() || 0;
  }

  getDuration(): number {
    const player = this.player as any;
    return player?.duration() || 0;
  }

  getVolume(): number {
    const player = this.player as any;
    return (player?.volume() || 0) * 100;
  }

  isMuted(): boolean {
    const player = this.player as any;
    return player?.muted() || false;
  }

  getPlaybackRate(): number {
    const player = this.player as any;
    return player?.playbackRate() || 1;
  }

  // 事件处理
  on(event: string, handler: (event: Event) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  off(event: string, handler?: (event: Event) => void): void {
    if (handler) {
      // 移除特定的处理函数
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    } else {
      // 移除所有处理函数
      this.eventHandlers.delete(event);
    }
  }

  // 销毁播放器
  destroy(): void {
    try {
      // 移除所有事件监听器
      this.eventHandlers.clear();
      
      // 销毁播放器实例
      if (this.player) {
        // 类型断言，确保可以调用dispose方法
        (this.player as any).dispose();
        this.player = null;
      }
    } catch (error) {
      console.error('Failed to destroy player:', error);
    }
  }
}

// 导出默认实例创建函数
export function createPlayer(elementId: string, options: PlayerOptions = {}): VideoPlayerCore {
  return new VideoPlayerCore(elementId, options);
}

export default VideoPlayerCore;