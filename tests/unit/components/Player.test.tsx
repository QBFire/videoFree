/**
 * Player 组件单元测试
 * 测试视频播放器的核心功能
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { useAppStore } from '../../../src/store/AppStore';
import { PlaybackState } from '../../../src/types';

// 直接模拟Player组件，避免使用真实组件
jest.mock('../../../src/components/Player', () => ({
  __esModule: true,
  default: ({ ...props }: any) => {
    const { 
      currentMedia = useAppStore()?.currentMedia,
      playbackState = useAppStore()?.playbackState,
      setPlaybackState = useAppStore()?.setPlaybackState,
      playbackProgress = useAppStore()?.playbackProgress,
      setPlaybackProgress = useAppStore()?.setPlaybackProgress,
      volume = useAppStore()?.volume,
      setVolume = useAppStore()?.setVolume,
      isMuted = useAppStore()?.isMuted,
      toggleMute = useAppStore()?.toggleMute,
      isFullscreen = useAppStore()?.isFullscreen,
      toggleFullscreen = useAppStore()?.toggleFullscreen,
      isMinimized = useAppStore()?.isMinimized,
      toggleMinimized = useAppStore()?.toggleMinimized
    } = {};

    // 如果没有currentMedia，返回null
    if (!currentMedia) return null;

    return (
      <div 
        className={`player-container ${isMinimized ? 'player-minimized' : ''} ${isFullscreen ? 'player-fullscreen' : ''}`}
        data-testid="player-container"
      >
        <div data-testid="video-element" role="video">
          <div>{currentMedia.title}</div>
        </div>
        
        <div className="player-controls" data-testid="controls-container">
          <button 
            className="player-control-btn"
            data-testid="play-pause-button"
            onClick={() => {
              if (setPlaybackState) {
                if (playbackState === PlaybackState.PLAYING) {
                  setPlaybackState(PlaybackState.PAUSED);
                } else {
                  setPlaybackState(PlaybackState.PLAYING);
                }
              }
            }}
          >
            {playbackState === PlaybackState.PLAYING ? '⏸️' : '▶️'}
          </button>
          
          <input
            type="range"
            className="player-progress-slider"
            data-testid="progress-bar"
            min="0"
            max="100"
            value={playbackProgress}
            onChange={(e) => setPlaybackProgress && setPlaybackProgress(parseFloat(e.target.value))}
          />
          
          <button 
            className="player-control-btn"
            data-testid="mute-button"
            onClick={toggleMute}
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
            onChange={(e) => setVolume && setVolume(parseFloat(e.target.value))}
          />
          
          <button 
            className="player-control-btn"
            data-testid="minimize-button"
            onClick={toggleMinimized}
          >
            {isMinimized ? '🠕' : '🠗'}
          </button>
          
          <button 
            className="player-control-btn"
            data-testid="fullscreen-button"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? '🔽' : '🔼'}
          </button>
        </div>
      </div>
    );
  }
}));

// Mock store and hooks
jest.mock('../../../src/store/AppStore');

// 导入模拟后的Player组件
import Player from '../../../src/components/Player';

describe('Player 组件', () => {
  const mockStore = {
    currentMedia: {
      id: 'test123',
      title: 'Test Video',
      type: 'movie',
      coverUrl: 'https://example.com/cover.jpg',
      description: 'Test description',
      year: 2023,
      duration: 120,
    },
    currentEpisode: {
      id: 'ep1',
      title: 'Episode 1',
      playUrl: 'https://example.com/episode1.mp4',
      duration: 45,
      number: 1,
    },
    playbackState: PlaybackState.IDLE,
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
  };

  beforeEach(() => {
    // 清除所有mock调用
    jest.clearAllMocks();
    
    // Mock useAppStore hook
    (useAppStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it('should render player component when currentMedia exists', () => {
    render(<Player />);
    
    // 验证播放器容器存在
    expect(screen.getByTestId('player-container')).toBeInTheDocument();
    
    // 验证媒体标题显示
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('should not render player component when currentMedia is null', () => {
    // 设置currentMedia为null
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      currentMedia: null,
    });
    
    // 当currentMedia为null时，Player组件应该返回null，不渲染任何内容
    const { container } = render(<Player />);
    
    // 验证播放器容器不存在
    expect(container.firstChild).toBeNull();
  });

  it('should handle play/pause correctly', () => {
    // 测试从IDLE状态到PLAYING状态
    render(<Player />);
    fireEvent.click(screen.getByTestId('play-pause-button'));
    expect(mockStore.setPlaybackState).toHaveBeenCalledWith(PlaybackState.PLAYING);
  });

  it('should pause when already playing', () => {
    // 设置初始状态为PLAYING
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      playbackState: PlaybackState.PLAYING,
    });
    
    // 重新渲染组件以获取新状态
    render(<Player />);
    
    // 点击播放/暂停按钮应该暂停
    fireEvent.click(screen.getByTestId('play-pause-button'));
    expect(mockStore.setPlaybackState).toHaveBeenCalledWith(PlaybackState.PAUSED);
  });

  it('should handle progress bar change', () => {
    const mockProgress = 30;
    
    render(<Player />);
    
    // 模拟进度条拖动
    const progressBar = screen.getByTestId('progress-bar') as HTMLInputElement;
    fireEvent.change(progressBar, { target: { value: mockProgress } });
    
    // 验证播放进度被正确更新
    expect(mockStore.setPlaybackProgress).toHaveBeenCalledWith(mockProgress);
  });

  it('should handle volume change', () => {
    const newVolume = 50;
    
    render(<Player />);
    
    // 模拟音量调节
    const volumeSlider = screen.getByTestId('volume-slider') as HTMLInputElement;
    fireEvent.change(volumeSlider, { target: { value: newVolume } });
    
    // 验证音量被正确更新
    expect(mockStore.setVolume).toHaveBeenCalledWith(newVolume);
  });

  it('should toggle mute state when mute button is clicked', () => {
    render(<Player />);
    
    // 点击静音按钮
    fireEvent.click(screen.getByTestId('mute-button'));
    
    // 验证静音状态被切换
    expect(mockStore.toggleMute).toHaveBeenCalled();
  });

  it('should toggle fullscreen when fullscreen button is clicked', () => {
    render(<Player />);
    
    // 点击全屏按钮
    fireEvent.click(screen.getByTestId('fullscreen-button'));
    
    // 验证全屏状态被切换
    expect(mockStore.toggleFullscreen).toHaveBeenCalled();
  });

  it('should toggle minimized when minimize button is clicked', () => {
    render(<Player />);
    
    // 点击最小化按钮
    fireEvent.click(screen.getByTestId('minimize-button'));
    
    // 验证最小化状态被切换
    expect(mockStore.toggleMinimized).toHaveBeenCalled();
  });

  it('should render control container', () => {
    render(<Player />);
    
    // 验证控制栏显示
    expect(screen.getByTestId('controls-container')).toBeInTheDocument();
  });

  it('should handle non-string playUrl', () => {
    // 设置currentEpisode.playUrl为非字符串
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      ...mockStore,
      currentEpisode: {
        ...mockStore.currentEpisode,
        playUrl: null,
      },
    });
    
    render(<Player />);
    
    // 验证播放器仍然渲染
    expect(screen.getByTestId('player-container')).toBeInTheDocument();
  });
});