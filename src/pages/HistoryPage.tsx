import { useState, useEffect } from 'react';
import type { MediaInfo } from '../types';

const HistoryPage = () => {
  // HistoryPage组件
  const [historyItems, setHistoryItems] = useState<Array<{media: MediaInfo, timestamp: number}>>([]);

  // 模拟历史记录数据
  const mockHistoryData: Array<{media: MediaInfo, timestamp: number}> = [
    {
      media: {
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
      timestamp: Date.now() - 86400000 // 24小时前
    },
    {
      media: {
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
      timestamp: Date.now() - 172800000 // 48小时前
    },
    {
      media: {
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
      timestamp: Date.now() - 259200000 // 72小时前
    },
    {
      media: {
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
      timestamp: Date.now() - 604800000 // 一周前
    }
  ];

  useEffect(() => {
    // 使用模拟数据
    setHistoryItems(mockHistoryData);
  }, []);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`;
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const handleMediaClick = (media: MediaInfo) => {
    // 这里可以实现点击历史记录项的逻辑
    console.log('History item clicked:', media);
  };

  const handleClearHistory = () => {
    // 这里可以实现清除历史记录的逻辑
    if (window.confirm('确定要清除所有观看历史吗？')) {
      console.log('清除历史记录');
      setHistoryItems([]);
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>观看历史</h1>
        <button 
          className="clear-history-button"
          onClick={handleClearHistory}
          disabled={historyItems.length === 0}
        >
          清除历史
        </button>
      </div>
      
      {historyItems.length > 0 ? (
        <div className="history-list">
          {historyItems.map((item, index) => (
            <div 
              key={index} 
              className="history-item"
              onClick={() => handleMediaClick(item.media)}
            >
              <img 
                src={item.media.posterUrl} 
                alt={item.media.title} 
                className="history-item-poster"
              />
              <div className="history-item-info">
                <h3>{item.media.title}</h3>
                <p>{item.media.description}</p>
                <div className="history-item-meta">
                  <span>{item.media.releaseYear}</span>
                  <span>•</span>
                  <span>{item.media.type}</span>
                  <span>•</span>
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-history">
          <p>暂无观看历史</p>
          <p>开始观看影视内容，历史记录将显示在这里</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;