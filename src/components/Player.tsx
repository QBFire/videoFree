import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store/AppStore';
import { PlaybackState } from '../types';
import { formatTime } from '../utils/helpers';

const Player = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number | NodeJS.Timeout | null>(null);
  
  const { 
    currentMedia, 
    currentEpisode,
    playbackState, 
    setPlaybackState,
    playbackProgress,
    setPlaybackProgress,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isFullscreen,
    toggleFullscreen,
    isMinimized,
    toggleMinimized
  } = useAppStore();

  const [showControls, setShowControls] = useState(true);
  
  // 视频源 - 添加类型检查确保是字符串
  const videoSource = typeof currentEpisode?.playUrl === 'string' ? currentEpisode.playUrl : 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4';

  // 处理视频播放/暂停
  const handleTogglePlay = () => {
    if (!videoRef.current) return;

    if (playbackState === PlaybackState.PLAYING) {
      videoRef.current.pause();
      setPlaybackState(PlaybackState.PAUSED);
    } else {
      videoRef.current.play();
      setPlaybackState(PlaybackState.PLAYING);
    }
  };

  // 处理时间更新
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setPlaybackProgress(progress);
  };

  // 处理进度条拖动
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
  };

  // 处理音量变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // 自动隐藏控制栏
  const hideControlsAutomatically = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // 控制条显示/隐藏逻辑
  useEffect(() => {
    let timeout: number | NodeJS.Timeout | null = null;

    const hideControls = () => {
      if (!isMinimized && showControls) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    hideControls();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isMinimized, showControls]);

  // 监听视频事件
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setPlaybackState(PlaybackState.PLAYING);
    const handlePause = () => setPlaybackState(PlaybackState.PAUSED);
    const handleEnded = () => setPlaybackState(PlaybackState.ENDED);
    const handleWaiting = () => setPlaybackState(PlaybackState.BUFFERING);
    const handleCanPlay = () => setPlaybackState(PlaybackState.PLAYING);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // 当视频源变化时，重置播放状态
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setPlaybackProgress(0);
      setPlaybackState(PlaybackState.IDLE);
    }
  }, [videoSource, setPlaybackProgress]);

  // 监听鼠标移动，显示控制栏
  useEffect(() => {
    const videoContainer = document.querySelector('.player-video-wrapper');
    if (!videoContainer) return;

    const handleMouseMove = () => {
      setShowControls(true);
      hideControlsAutomatically();
    };

    videoContainer.addEventListener('mousemove', handleMouseMove);

    return () => {
      videoContainer.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // 同步状态到视频元素
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // 处理关闭播放器
  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  if (!currentMedia) return null;

  return (
    <div 
      className={`player-container ${isMinimized ? 'player-minimized' : ''} ${isFullscreen ? 'player-fullscreen' : ''}`}
      data-testid="player-container"
      onClick={() => setShowControls(!showControls)}
    >
      <div className="player-content">
        {/* 视频播放区域 */}
        <div className="player-video-wrapper">
          {currentMedia && (
            <>
              <video
                ref={videoRef}
                src={videoSource}
                onTimeUpdate={handleTimeUpdate}
                onClick={handleTogglePlay}
                className="video-element"
                data-testid="video-element"
              />
              
              {/* 加载指示器 */}
              {playbackState === PlaybackState.BUFFERING && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                </div>
              )}
              
              {/* 视频信息 */}
              <div className="player-placeholder-info">
                <h3>{currentMedia.title}</h3>
                <p>{currentEpisode?.title || currentMedia.description}</p>
              </div>
            </>
          )}
        </div>
        
        {/* 控制条 */}
        {(showControls || !isMinimized) && (
          <div className="player-controls" data-testid="controls-container">
            <button 
                className="player-control-btn"
                data-testid="play-pause-button"
                onClick={(e) => { e.stopPropagation(); handleTogglePlay(); }}
                title={playbackState === PlaybackState.PLAYING ? '暂停' : '播放'}
              >
              {playbackState === PlaybackState.PLAYING ? '⏸️' : '▶️'}
            </button>
            
            <div className="player-progress">
              <input
                type="range"
                className="player-progress-slider"
                data-testid="progress-bar"
                min="0"
                max="100"
                value={playbackProgress}
                onChange={(e) => handleTimeChange(e)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="player-time">
                {formatTime((videoRef.current?.duration || 0) * playbackProgress / 100)} / {formatTime(videoRef.current?.duration || 0)}
              </span>
            </div>
            
            <div className="player-volume">
              <button 
                className="player-control-btn"
                data-testid="mute-button"
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                title={isMuted ? '取消静音' : '静音'}
              >
                {isMuted ? '🔇' : volume < 50 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                className="player-volume-slider"
                data-testid="volume-slider"
                min="0"
                max="100"
                step="1"
                value={volume}
                onChange={(e) => handleVolumeChange(e)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <button 
                className="player-control-btn"
                data-testid="minimize-button"
                onClick={(e) => { e.stopPropagation(); toggleMinimized(); }}
                title={isMinimized ? '展开' : '收起'}
              >
              {isMinimized ? '🠕' : '🠗'}
            </button>
            
            <button 
                className="player-control-btn"
                data-testid="fullscreen-button"
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                title={isFullscreen ? '退出全屏' : '全屏'}
              >
              {isFullscreen ? '🔽' : '🔼'}
            </button>
            
            <button 
              className="player-control-btn player-close"
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              title="关闭"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;