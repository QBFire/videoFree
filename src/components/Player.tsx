import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { PlaybackState } from '../types';
import { formatTime } from '../utils/helpers';
import { isEdgeBrowser, applyEdgeCssFixes } from '../utils/edgeCompatibility';

const Player = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  const { 
    currentMedia, 
    currentEpisode,
    playbackState, 
    setPlaybackState,
    currentTime,
    setCurrentTime,
    volume,
    setVolume,
    isMuted,
    setIsMuted
  } = useAppStore();

  const [showControls, setShowControls] = useState(true);
  
  // 视频源 - 添加类型检查确保是字符串
  const videoSource = typeof currentEpisode?.playUrl === 'string' ? currentEpisode.playUrl : 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4';
  
  // 组件挂载后应用Edge特定的CSS修复
  useEffect(() => {
    if (isEdgeBrowser()) {
      const playerContainer = document.querySelector('.player-container');
      if (playerContainer) {
        applyEdgeCssFixes(playerContainer as HTMLElement);
      }
    }
  }, []);



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

  // 监听视频时间更新
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
  };

  // 处理进度条拖动
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newTime = parseFloat(e.target.value);
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
    let timeout: number | null = null;

    const hideControls = () => {
      if (showControls) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    hideControls();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls]);

  // 监听视频事件
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Edge兼容的事件处理器
    const handlePlay = () => {
      // 修复Edge中播放状态可能的闪烁问题
      requestAnimationFrame(() => setPlaybackState(PlaybackState.PLAYING));
    };
    
    const handlePause = () => {
      requestAnimationFrame(() => setPlaybackState(PlaybackState.PAUSED));
    };
    
    const handleEnded = () => {
      requestAnimationFrame(() => setPlaybackState(PlaybackState.ENDED));
    };
    
    const handleWaiting = () => {
      requestAnimationFrame(() => setPlaybackState(PlaybackState.BUFFERING));
    };
    
    const handleCanPlay = () => {
      requestAnimationFrame(() => setPlaybackState(PlaybackState.PLAYING));
    };

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
        setCurrentTime(0);
        setPlaybackState(PlaybackState.IDLE);
      }
  }, [videoSource]);

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

    video.volume = isMuted ? 0 : volume / 100;
    video.muted = isMuted;
    
    // Edge浏览器中的特殊处理
    if (isEdgeBrowser()) {
      // 修复Edge中某些版本的视频音量同步问题
      setTimeout(() => {
        video.volume = isMuted ? 0 : volume / 100;
        video.muted = isMuted;
      }, 100);
    }
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
      className="player-container"
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
        {showControls && (
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
                value={currentTime}
                onChange={(e) => handleTimeChange(e)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="player-time">
                {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 0)}
              </span>
            </div>
            
            <div className="player-volume">
              <button 
                className="player-control-btn"
                data-testid="mute-button"
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
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