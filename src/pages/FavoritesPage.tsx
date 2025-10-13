import { useState, useEffect } from 'react';
import type { MediaInfo } from '../types';

const FavoritesPage = () => {
  // FavoritesPage组件
  const [favoriteItems, setFavoriteItems] = useState<MediaInfo[]>([]);

  // 模拟收藏数据
  const mockFavoritesData: MediaInfo[] = [
    {
      id: 'movie-1',
      title: '流浪地球3',
      description: '太阳即将毁灭，人类开启流浪地球计划第三部',
      posterUrl: 'https://picsum.photos/400/600?random=1',
      type: 'movie',
      source: 'sample-plugin',
      rating: 9.2,
      releaseYear: 2025,
      genres: ['科幻', '冒险']
    },
    {
      id: 'tv-1',
      title: '三体',
      description: '根据刘慈欣同名小说改编',
      posterUrl: 'https://picsum.photos/400/600?random=3',
      type: 'tv',
      source: 'sample-plugin',
      rating: 8.8,
      releaseYear: 2024,
      genres: ['科幻', '悬疑']
    },
    {
      id: 'anime-1',
      title: '你的名字2',
      description: '新海诚最新力作',
      posterUrl: 'https://picsum.photos/400/600?random=4',
      type: 'anime',
      source: 'sample-plugin',
      rating: 9.5,
      releaseYear: 2025,
      genres: ['动画', '爱情']
    }
  ];

  useEffect(() => {
    // 使用模拟数据
    setFavoriteItems(mockFavoritesData);
  }, []);

  const handleMediaClick = (media: MediaInfo) => {
    // 这里可以实现点击收藏项的逻辑
    console.log('Favorite item clicked:', media);
  };

  const handleRemoveFromFavorites = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    // 这里可以实现从收藏中移除的逻辑
    console.log('Remove from favorites:', mediaId);
    setFavoriteItems(prev => prev.filter(media => media.id !== mediaId));
  };

  return (
    <div className="favorites-page">
      <h1>我的收藏</h1>
      
      {favoriteItems.length > 0 ? (
        <div className="media-grid">
          {favoriteItems.map((media) => (
            <div 
              key={media.id} 
              className="media-card"
              onClick={() => handleMediaClick(media)}
            >
              <div className="media-card-actions">
                <button 
                  className="remove-favorite-button"
                  onClick={(e) => handleRemoveFromFavorites(e, media.id)}
                  title="从收藏中移除"
                >
                  ★
                </button>
              </div>
              <img 
                src={media.posterUrl} 
                alt={media.title} 
                className="media-poster"
              />
              <div className="media-info">
                <h3 className="media-title">{media.title}</h3>
                <div className="media-meta">
                  <span>{media.releaseYear}</span>
                  <span>•</span>
                  <span>{media.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-favorites">
          <p>暂无收藏内容</p>
          <p>在影视详情页点击收藏按钮，内容将显示在这里</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;