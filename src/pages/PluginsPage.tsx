import { useState, useEffect } from 'react';

import type { PluginMetadata } from '../types';

const PluginsPage = () => {
  const [plugins, setPlugins] = useState<Array<{metadata: PluginMetadata, enabled: boolean}>>([]);

  // 模拟插件数据
  const mockPluginsData: Array<{metadata: PluginMetadata, enabled: boolean}> = [
    {
      metadata: {
        id: 'sample-plugin',
        name: '示例插件',
        description: '这是一个示例插件，用于展示插件系统的工作原理',
        version: '1.0.0',
        author: 'Videofree Team',
        homepage: 'https://github.com/videofree',
        icon: 'https://picsum.photos/64/64?random=11',
        settings: []
      },
      enabled: true
    },
    {
      metadata: {
        id: 'movie-plugin',
        name: '电影插件',
        description: '提供电影资源的插件',
        version: '2.1.3',
        author: 'Movie Provider',
        homepage: 'https://example.com/movie-plugin',
        icon: 'https://picsum.photos/64/64?random=12',
        settings: [
          {
            key: 'quality',
            type: 'select',
            label: '视频质量',
            defaultValue: '1080p',
            options: ['720p', '1080p', '4K']
          }
        ]
      },
      enabled: true
    },
    {
      metadata: {
        id: 'tv-show-plugin',
        name: '电视剧插件',
        description: '提供电视剧资源的插件',
        version: '1.5.2',
        author: 'TV Provider',
        homepage: 'https://example.com/tv-plugin',
        icon: 'https://picsum.photos/64/64?random=13',
        settings: []
      },
      enabled: false
    },
    {
      metadata: {
        id: 'anime-plugin',
        name: '动漫插件',
        description: '提供动漫资源的插件',
        version: '3.0.1',
        author: 'Anime Provider',
        homepage: 'https://example.com/anime-plugin',
        icon: 'https://picsum.photos/64/64?random=14',
        settings: [
          {
            key: 'subtitles',
            type: 'boolean',
            label: '默认显示字幕',
            defaultValue: true
          }
        ]
      },
      enabled: true
    }
  ];

  useEffect(() => {
    // 使用模拟数据
    setPlugins(mockPluginsData);
  }, []);

  const handleTogglePlugin = (pluginId: string) => {
    // 这里可以实现启用/禁用插件的逻辑
    console.log('Toggle plugin:', pluginId);
    setPlugins(prev => 
      prev.map(plugin => 
        plugin.metadata.id === pluginId 
          ? { ...plugin, enabled: !plugin.enabled }
          : plugin
      )
    );
  };

  const handleConfigurePlugin = (pluginId: string) => {
    // 这里可以实现配置插件的逻辑
    console.log('Configure plugin:', pluginId);
    // 实际应用中可能会打开一个配置对话框
  };

  const handleInstallPlugin = () => {
    // 这里可以实现安装插件的逻辑
    console.log('Install plugin');
    // 实际应用中可能会打开一个文件选择对话框或插件市场
  };

  return (
    <div className="plugins-page">
      <div className="plugins-header">
        <h1>插件管理</h1>
        <button 
          className="install-plugin-button"
          onClick={handleInstallPlugin}
        >
          安装插件
        </button>
      </div>
      
      <div className="plugins-list">
        {plugins.map((plugin) => (
          <div key={plugin.metadata.id} className="plugin-card">
            <div className="plugin-info">
              <img 
                src={plugin.metadata.icon} 
                alt={plugin.metadata.name} 
                className="plugin-icon"
              />
              <div className="plugin-details">
                <h3>{plugin.metadata.name}</h3>
                <p className="plugin-description">{plugin.metadata.description}</p>
                <div className="plugin-meta">
                  <span>版本: {plugin.metadata.version}</span>
                  <span>•</span>
                  <span>作者: {plugin.metadata.author}</span>
                </div>
              </div>
            </div>
            
            <div className="plugin-actions">
              <label className="enable-switch">
                <input
                  type="checkbox"
                  checked={plugin.enabled}
                  onChange={() => handleTogglePlugin(plugin.metadata.id)}
                />
                <span className="switch-slider"></span>
                <span className="switch-label">{plugin.enabled ? '启用' : '禁用'}</span>
              </label>
              
              <button 
                className="configure-plugin-button"
                onClick={() => handleConfigurePlugin(plugin.metadata.id)}
                disabled={!plugin.enabled}
              >
                配置
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginsPage;