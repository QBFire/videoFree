import { useState, useEffect } from 'react';

import type { PluginMetadata } from '../types';
import { pluginManager } from '../plugin/PluginManager';

const PluginsPage = () => {
  const [plugins, setPlugins] = useState<Array<{metadata: PluginMetadata, enabled: boolean}>>([]);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [pluginUrl, setPluginUrl] = useState('');
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState('');

  // 从插件管理器获取插件列表
  useEffect(() => {
    const loadPlugins = () => {
      const allPlugins = pluginManager.getAllPlugins();
      const pluginsWithStatus = allPlugins.map(plugin => ({
        metadata: plugin.metadata,
        enabled: pluginManager.isPluginEnabled(plugin.metadata.id)
      }));
      setPlugins(pluginsWithStatus);
    };

    // 初始加载
    loadPlugins();

    // 监听插件变化 (在实际应用中可能需要使用事件监听)
    const interval = setInterval(loadPlugins, 5000); // 每5秒刷新一次

    return () => clearInterval(interval);
  }, []);

  const handleTogglePlugin = async (pluginId: string) => {
    try {
      const plugin = plugins.find(p => p.metadata.id === pluginId);
      if (plugin) {
        if (plugin.enabled) {
          await pluginManager.disablePlugin(pluginId);
        } else {
          await pluginManager.enablePlugin(pluginId);
        }
        // 刷新插件列表
        const updatedPlugins = plugins.map(p => 
          p.metadata.id === pluginId 
            ? { ...p, enabled: !p.enabled }
            : p
        );
        setPlugins(updatedPlugins);
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  const handleConfigurePlugin = (pluginId: string) => {
    // 这里可以实现配置插件的逻辑
    // 实际应用中可能会打开一个配置对话框
    console.log('Configure plugin:', pluginId);
  };

  const handleInstallPlugin = () => {
    // 打开安装插件的模态框
    setPluginUrl('');
    setInstallError('');
    setShowInstallModal(true);
  };

  const handleInstallFromUrl = async () => {
    // 验证URL
    if (!pluginUrl || !isValidUrl(pluginUrl)) {
      setInstallError('请输入有效的插件URL');
      return;
    }

    try {
      setInstalling(true);
      setInstallError('');
      
      // 显示安装进度信息
      setInstallError('正在从URL加载插件...');
      
      const success = await pluginManager.loadPluginFromUrl(pluginUrl);
      
      if (success) {
        // 刷新插件列表
        const allPlugins = pluginManager.getAllPlugins();
        const pluginsWithStatus = allPlugins.map(plugin => ({
          metadata: plugin.metadata,
          enabled: pluginManager.isPluginEnabled(plugin.metadata.id)
        }));
        setPlugins(pluginsWithStatus);
        
        // 关闭模态框
        setShowInstallModal(false);
      } else {
        setInstallError('插件安装失败，请检查URL是否正确');
      }
    } catch (error) {
      console.error('Failed to install plugin from URL:', error);
      
      // 根据不同类型的错误提供更具体的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Failed to fetch plugin')) {
        setInstallError(`网络错误: 无法从URL获取插件代码。请检查URL是否正确，以及网络连接是否正常。`);
      } else if (errorMessage.includes('Plugin execution failed')) {
        setInstallError(`插件执行错误: 插件代码可能包含语法错误或运行时错误。${errorMessage}`);
      } else if (errorMessage.includes('Invalid plugin format')) {
        setInstallError(`插件格式错误: 插件不符合应用的插件接口规范。${errorMessage}`);
      } else if (errorMessage.includes('Missing required')) {
        setInstallError(`插件结构不完整: ${errorMessage}`);
      } else {
        setInstallError(`插件安装失败: ${errorMessage}`);
      }
    } finally {
      setInstalling(false);
    }
  };

  // 验证URL格式
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
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
      
      {/* 安装插件模态框 */}
      {showInstallModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>通过URL安装插件</h2>
              <button 
                className="close-button"
                onClick={() => setShowInstallModal(false)}
                disabled={installing}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>请输入插件的URL地址，系统将从该地址加载并安装插件：</p>
              
              <div className="form-group">
                <label htmlFor="plugin-url">插件URL：</label>
                <input
                  id="plugin-url"
                  type="url"
                  value={pluginUrl}
                  onChange={(e) => setPluginUrl(e.target.value)}
                  placeholder="https://example.com/path/to/plugin.js"
                  disabled={installing}
                />
              </div>
              
              {installError && (
                <div className="error-message">
                  {installError}
                </div>
              )}
              
              <div className="installation-notice">
                <p>注意：</p>
                <ul>
                  <li>请确保您信任该插件的来源，因为插件将在您的应用中执行代码</li>
                  <li>插件必须符合应用的插件接口规范才能正常工作</li>
                  <li>安装完成后，插件将自动启用并可在列表中查看</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowInstallModal(false)}
                disabled={installing}
              >
                取消
              </button>
              
              <button 
                className="install-button"
                onClick={handleInstallFromUrl}
                disabled={installing || !pluginUrl}
              >
                {installing ? (
                  <>
                    <span className="loading-spinner"></span>
                    安装中...
                  </>
                ) : (
                  '安装插件'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PluginsPage;