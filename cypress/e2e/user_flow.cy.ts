/**
 * 用户流程端到端测试
 * 测试用户浏览首页、搜索媒体、播放媒体的完整流程
 */

describe('用户流程端到端测试', () => {
  beforeEach(() => {
    // 访问应用首页
    cy.visit('/');
  });

  it('should load the home page successfully', () => {
    // 验证首页标题显示
    cy.title().should('contain', 'VideoFree');
    
    // 验证欢迎信息显示
    cy.contains('Welcome to VideoFree').should('be.visible');
    
    // 验证搜索栏存在
    cy.get('input[type="search"]').should('exist');
    
    // 验证热门推荐区域存在
    cy.contains('Popular Recommendations').should('be.visible');
  });

  it('should search for media and display results', () => {
    // 获取搜索输入框
    const searchInput = cy.get('input[type="search"]');
    
    // 输入搜索关键词
    searchInput.type('test');
    
    // 模拟按回车键搜索
    searchInput.type('{enter}');
    
    // 验证导航到搜索页面
    cy.url().should('include', '/search');
    
    // 验证搜索结果显示
    cy.contains('Search Results').should('be.visible');
    
    // 注意：实际测试中，这里应该验证搜索结果的具体内容，但由于我们使用模拟数据，
    // 实际测试可能需要根据实际应用的行为调整断言
  });

  it('should navigate through different pages', () => {
    // 点击导航链接到历史记录页面
    cy.contains('History').click();
    cy.url().should('include', '/history');
    
    // 点击导航链接到收藏页面
    cy.contains('Favorites').click();
    cy.url().should('include', '/favorites');
    
    // 点击导航链接返回首页
    cy.contains('Home').click();
    cy.url().should('eq', 'http://localhost:5173/');
  });

  it('should handle empty search query', () => {
    // 获取搜索输入框
    const searchInput = cy.get('input[type="search"]');
    
    // 输入空字符串
    searchInput.type('{enter}');
    
    // 验证不会导航到搜索页面
    cy.url().should('eq', 'http://localhost:5173/');
  });

  it('should handle special characters in search query', () => {
    // 获取搜索输入框
    const searchInput = cy.get('input[type="search"]');
    
    // 输入包含特殊字符的搜索查询
    searchInput.type('test@123!#$%');
    
    // 模拟按回车键搜索
    searchInput.type('{enter}');
    
    // 验证导航到搜索页面
    cy.url().should('include', '/search');
    
    // 验证搜索页面正确加载
    cy.contains('Search Results').should('be.visible');
  });

  it('should handle responsive design on different screen sizes', () => {
    // 测试移动设备尺寸
    cy.viewport(375, 667);
    cy.get('input[type="search"]').should('be.visible');
    
    // 测试平板设备尺寸
    cy.viewport(768, 1024);
    cy.get('input[type="search"]').should('be.visible');
    
    // 测试桌面设备尺寸
    cy.viewport(1280, 720);
    cy.get('input[type="search"]').should('be.visible');
  });

  // 注意：以下测试需要实际的媒体项在首页显示
  // 由于我们使用模拟数据，这些测试可能需要根据实际应用的行为调整
  it('should play media when clicking on recommendations', () => {
    // 查找并点击第一个推荐媒体项
    cy.get('.media-item').first().click();
    
    // 验证播放器加载
    cy.get('[data-testid="mock-player"]').should('exist');
    
    // 验证播放器显示当前媒体标题
    cy.get('[data-testid="current-media-title"]').should('be.visible');
  });

  it('should handle navigation while playing media', () => {
    // 先播放一个媒体
    cy.get('.media-item').first().click();
    cy.get('[data-testid="mock-player"]').should('exist');
    
    // 导航到其他页面
    cy.contains('History').click();
    
    // 验证播放器仍然显示
    cy.get('[data-testid="mock-player"]').should('exist');
  });

  it('should handle error states gracefully', () => {
    // 测试不存在的页面
    cy.visit('/non-existent-page');
    
    // 验证404页面或错误处理
    // 注意：实际应用中应实现404页面
    cy.contains('Page not found').should('be.visible');
  });

  it('should maintain state after page refresh', () => {
    // 先搜索一个关键词
    cy.get('input[type="search"]').type('test{enter}');
    cy.url().should('include', '/search');
    
    // 刷新页面
    cy.reload();
    
    // 验证状态保持
    cy.url().should('include', '/search');
  });
});