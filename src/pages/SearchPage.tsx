import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import type { MediaInfo } from '../types';

const SearchPage = () => {
  const params = useParams();
  const { searchQuery } = useAppStore();
  const queryFromParams = params.query as string || '';
  const effectiveSearchQuery = searchQuery || queryFromParams;

  // 模拟搜索结果数据
  const mockSearchResults: MediaInfo[] = [
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
      id: 'movie-2',
      title: '星际穿越2',
      description: '探索宇宙深处的未知领域',
      posterUrl: 'https://picsum.photos/400/600?random=2',
      type: 'movie',
      source: 'sample-plugin',
      rating: 9.0,
      releaseYear: 2024,
      genres: ['科幻', '剧情']
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
    },
    {
      id: 'movie-3',
      title: '复仇者联盟6',
      description: '超级英雄们再次集结',
      posterUrl: 'https://picsum.photos/400/600?random=5',
      type: 'movie',
      source: 'sample-plugin',
      rating: 8.5,
      releaseYear: 2025,
      genres: ['动作', '科幻']
    },
    {
      id: 'tv-2',
      title: '绝命毒师',
      description: '经典美剧',
      posterUrl: 'https://picsum.photos/400/600?random=6',
      type: 'tv',
      source: 'sample-plugin',
      rating: 9.7,
      releaseYear: 2023,
      genres: ['剧情', '犯罪']
    }
  ];

  // 根据搜索查询过滤结果
  const filteredResults = effectiveSearchQuery
    ? mockSearchResults.filter(media => 
        media.title.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        media.description.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        media.genres.some(genre => genre.toLowerCase().includes(effectiveSearchQuery.toLowerCase()))
      )
    : [];

  const handleMediaClick = (media: MediaInfo) => {
    // 这里可以实现点击媒体卡片的逻辑
    console.log('Media clicked:', media);
  };

  return (
    <div className="search-page">
      <h1>搜索结果</h1>
      
      {effectiveSearchQuery && (
        <p className="search-query-info">
          关于 "{effectiveSearchQuery}" 的搜索结果 ({filteredResults.length})
        </p>
      )}
      
      {effectiveSearchQuery && (
        <div className="media-grid">
          {filteredResults.length > 0 ? (
            filteredResults.map((media) => (
              <div 
                key={`${media.source}-${media.id}`} 
                className="media-card"
                onClick={() => handleMediaClick(media)}
              >
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
            ))
          ) : (
            <div className="no-results">
              <p>没有找到相关结果</p>
              <p>请尝试其他搜索词</p>
            </div>
          )}
        </div>
      )}
      
      {!effectiveSearchQuery && (
        <div className="search-placeholder">
          <p>请在搜索框中输入关键词</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;