import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          Videofree
        </NavLink>
        
        <div className="navbar-menu">
          <NavLink 
            to="/" 
            className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}
            end
          >
            首页
          </NavLink>
          <NavLink 
            to="/search" 
            className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}
          >
            搜索
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}
          >
            历史
          </NavLink>
          <NavLink 
            to="/favorites" 
            className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}
          >
            收藏
          </NavLink>
          <NavLink 
            to="/plugins" 
            className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}
          >
            插件
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;