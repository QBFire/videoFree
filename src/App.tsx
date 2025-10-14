import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import SamplePlugin from './plugin/SamplePlugin';
import { pluginManager } from './plugin/PluginManager';

import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import Player from './components/Player';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailPage from './pages/DetailPage';
import HistoryPage from './pages/HistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import PluginsPage from './pages/PluginsPage';

import './App.css';

function App() {
  const { loadUserPreferences, currentMedia, setSearchQuery } = useAppStore();

  // 应用初始化
  useEffect(() => {
    const init = async () => {
      // 初始化应用
      loadUserPreferences();
      
      // 注册示例插件
      try {
        const samplePlugin = SamplePlugin;
        pluginManager.registerPlugin(samplePlugin);
        pluginManager.enablePlugin(samplePlugin.metadata.id);
        console.log('Sample plugin registered and enabled');
      } catch (error) {
        console.error('Failed to register sample plugin:', error);
      }
    };

    init();
  }, [loadUserPreferences]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 导航到搜索页面，让SearchPage组件处理实际的搜索逻辑
    window.location.href = '/search';
  };

  return (
    <Router>
      <div className="app-container">
        {/* 导航栏 */}
        <Navbar />
        
        {/* 主内容区 */}
        <main className="main-content">
          {/* 路由配置 */}
          <div className="content-area">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/detail/:id/:source" element={<DetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/plugins" element={<PluginsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
        
        {/* 播放器 */}
        {currentMedia && <Player />}
      </div>
    </Router>
  );
}

export default App
