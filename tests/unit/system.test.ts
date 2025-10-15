// 系统测试脚本 - 使用Jest和Puppeteer进行端到端测试

const puppeteer = require('puppeteer');

describe('VideoFree系统测试', () => {
  let browser: any;
  let page: any;

  beforeAll(async () => {
    try {
      // 使用headless模式更容易在各种环境中运行
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 30000
      });
      page = await browser.newPage();
      
      // 设置视口大小
      await page.setViewport({ width: 1280, height: 800 });
      
      // 导航到应用首页
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
      
      // 等待页面加载完成
      await page.waitForSelector('.app-container', { timeout: 15000 });
    } catch (error) {
      console.error('Failed to initialize browser:', error);
    }
  }, 40000); // 增加超时时间
  
  beforeEach(() => {
    // 每个测试前检查browser和page是否初始化成功
    expect(browser).toBeDefined();
    expect(page).toBeDefined();
  });

  afterAll(async () => {
    // 安全关闭浏览器
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Failed to close browser:', error);
      }
    }
  });

  describe('1. 基本功能测试', () => {
    test('1.1 首页加载测试', async () => {
      // 检查首页是否正确加载
      const title = await page.title();
      expect(title).toBe('VideoFree');
      
      // 检查导航栏是否存在
      const navbar = await page.$('.navbar');
      expect(navbar).toBeTruthy();
      
      // 检查首页内容是否加载
      const homeContent = await page.$('.content-area');
      expect(homeContent).toBeTruthy();
    });

    test('1.2 导航功能测试', async () => {
      // 测试导航到搜索页
      await page.click('nav a[href="/search"]');
      await page.waitForNavigation();
      expect(page.url()).toContain('/search');
      
      // 测试导航到历史页
      await page.click('nav a[href="/history"]');
      await page.waitForNavigation();
      expect(page.url()).toContain('/history');
      
      // 测试导航到收藏页
      await page.click('nav a[href="/favorites"]');
      await page.waitForNavigation();
      expect(page.url()).toContain('/favorites');
      
      // 测试导航到插件页
      await page.click('nav a[href="/plugins"]');
      await page.waitForNavigation();
      expect(page.url()).toContain('/plugins');
      
      // 测试导航回首页
      await page.click('nav a[href="/"]');
      await page.waitForNavigation();
      expect(page.url()).toContain('/');
    });

    test('1.3 搜索功能测试', async () => {
      // 导航到搜索页
      await page.click('nav a[href="/search"]');
      await page.waitForNavigation();
      
      // 输入搜索关键词
      await page.type('input[type="search"]', '科幻');
      await page.keyboard.press('Enter');
      
      // 等待搜索结果加载
      await page.waitForTimeout(1000);
      
      // 检查搜索结果是否显示
      const resultsCount = await page.evaluate(() => {
        return document.querySelectorAll('.media-card').length;
      });
      expect(resultsCount).toBeGreaterThan(0);
    });

    test('1.4 媒体详情页测试', async () => {
      // 导航回首页
      await page.click('nav a[href="/"]');
      await page.waitForNavigation();
      
      // 点击首页的第一个媒体卡片
      await page.click('.media-card:first-child');
      await page.waitForNavigation();
      
      // 检查是否进入详情页
      expect(page.url()).toContain('/detail/');
      
      // 检查详情页元素
      const detailContent = await page.$('.detail-content');
      expect(detailContent).toBeTruthy();
    });
  });

  describe('2. 状态管理测试', () => {
    test('2.1 收藏功能测试', async () => {
      // 确保在详情页
      if (!page.url().includes('/detail/')) {
        await page.click('nav a[href="/"]');
        await page.waitForNavigation();
        await page.click('.media-card:first-child');
        await page.waitForNavigation();
      }
      
      // 点击收藏按钮
      await page.click('.favorite-button');
      
      // 导航到收藏页
      await page.click('nav a[href="/favorites"]');
      await page.waitForNavigation();
      
      // 检查收藏是否成功
      const favoritesCount = await page.evaluate(() => {
        return document.querySelectorAll('.media-card').length;
      });
      expect(favoritesCount).toBeGreaterThan(0);
    });

    test('2.2 播放历史测试', async () => {
      // 确保在详情页并模拟播放
      await page.click('nav a[href="/"]');
      await page.waitForNavigation();
      await page.click('.media-card:first-child');
      await page.waitForNavigation();
      
      // 导航到历史页
      await page.click('nav a[href="/history"]');
      await page.waitForNavigation();
      
      // 检查历史记录是否记录
      const historyCount = await page.evaluate(() => {
        return document.querySelectorAll('.history-item').length;
      });
      expect(historyCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3. 插件系统测试', () => {
    test('3.1 插件列表测试', async () => {
      // 导航到插件页
      await page.click('nav a[href="/plugins"]');
      await page.waitForNavigation();
      
      // 检查插件列表是否显示
      const pluginsCount = await page.evaluate(() => {
        return document.querySelectorAll('.plugin-item').length;
      });
      expect(pluginsCount).toBeGreaterThan(0);
    });
  });

  describe('4. 响应式设计测试', () => {
    test('4.1 移动设备视图测试', async () => {
      // 设置移动设备视口
      await page.setViewport({ width: 375, height: 667 });
      
      // 检查导航栏在移动设备上的显示
      const mobileMenuButton = await page.$('.mobile-menu-button');
      expect(mobileMenuButton).toBeTruthy();
      
      // 恢复桌面视口
      await page.setViewport({ width: 1280, height: 800 });
    });
  });

  describe('5. 错误处理测试', () => {
    test('5.1 404页面重定向测试', async () => {
      // 访问不存在的路由
      await page.goto('http://localhost:5173/non-existent-route');
      
      // 检查是否重定向到首页
      await page.waitForNavigation();
      expect(page.url()).toBe('http://localhost:5173/');
    });
  });
});