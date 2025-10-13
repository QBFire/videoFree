import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import type { MediaInfo, EpisodeInfo } from '../types';

const DetailPage = () => {
  const params = useParams();
  // 从AppStore获取正确的方法
  const { setCurrentMedia, setCurrentEpisode, setIsPlayerOpen } = useAppStore();

  // 模拟媒体详情数据 - 使用默认值避免undefined问题
  const mockMediaDetail: MediaInfo = {
    id: params.id || 'default-id',
    title: '流浪地球3',
    description: '太阳即将毁灭，人类开启流浪地球计划第三部。在这一部中，人类面临着前所未有的挑战，不仅要应对太阳的异常活动，还要处理来自外太空的未知威胁。',
    posterUrl: 'https://picsum.photos/800/1200',
    type: 'movie',
    source: params.source || 'default-source',
    rating: 9.2,
    releaseYear: 2025,
    genres: ['科幻', '冒险', '动作'],
    director: '郭帆',
    actors: ['吴京', '刘德华', '李雪健'],
    duration: 170,
    country: '中国',
    language: '中文',
    episodes: [
      {
        id: 'episode-1',
        title: '流浪地球3 - 正片',
        description: '完整正片',
        index: 1,
        duration: 170,
        releaseDate: '2025-01-20'
      }
    ]
  };

  const mockEpisodes: EpisodeInfo[] = [
    {
      id: 'episode-1',
      title: '流浪地球3 - 正片',
      description: '完整正片',
      index: 1,
      duration: 170,
      releaseDate: '2025-01-20'
    }
  ];

  const handlePlayEpisode = (episode: EpisodeInfo) => {
    // 设置当前媒体和剧集并打开播放器
    setCurrentMedia(mockMediaDetail);
    setCurrentEpisode(episode);
    setIsPlayerOpen(true);
  };

  const handleAddToFavorites = () => {
    // 这里可以实现添加到收藏的逻辑
    console.log('添加到收藏:', mockMediaDetail);
  };

  const formatDuration = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}小时${mins}分钟`;
  };

  return (
    <div className="detail-page">
      <div className="detail-header">
        <img 
          src={mockMediaDetail.posterUrl} 
          alt={mockMediaDetail.title} 
          className="detail-poster"
        />
        
        <div className="detail-info">
          <h1>{mockMediaDetail.title}</h1>
          <div className="detail-meta">
            <span>{mockMediaDetail.releaseYear}</span>
            <span>•</span>
            <span>{mockMediaDetail.country}</span>
            <span>•</span>
            <span>{formatDuration(mockMediaDetail.duration || 0)}</span>
          </div>
          
          <div className="detail-rating">
            <span className="rating-score">{mockMediaDetail.rating}</span>
            <span className="rating-label">评分</span>
          </div>
          
          <div className="detail-genres">
            {mockMediaDetail.genres?.map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
          
          <p className="detail-description">
            {mockMediaDetail.description}
          </p>
          
          {mockMediaDetail.director && (
            <div className="detail-crew">
              <strong>导演:</strong> {mockMediaDetail.director}
            </div>
          )}
          
          {mockMediaDetail.actors && mockMediaDetail.actors.length > 0 && (
            <div className="detail-cast">
              <strong>主演:</strong> {mockMediaDetail.actors.join(', ')}
            </div>
          )}
          
          <div className="detail-actions">
            <button 
              className="action-button play-button"
              onClick={() => handlePlayEpisode(mockEpisodes[0])}
            >
              播放
            </button>
            <button 
              className="action-button favorite-button"
              onClick={handleAddToFavorites}
            >
              收藏
            </button>
          </div>
        </div>
      </div>
      
      <section className="episodes-section">
        <h2>剧集列表</h2>
        <div className="episodes-list">
          {mockEpisodes.map((episode) => (
            <div 
              key={episode.id} 
              className="episode-item"
              onClick={() => handlePlayEpisode(episode)}
            >
              <div className="episode-info">
                <h3>第{episode.index}集: {episode.title}</h3>
                <p>{episode.description}</p>
                <span>{formatDuration(episode.duration || 0)} • {episode.releaseDate}</span>
              </div>
              <button className="play-episode-button">播放</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DetailPage;