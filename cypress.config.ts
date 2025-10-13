/**
 * Cypress配置文件
 * 配置端到端测试环境和设置
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // 实现节点事件监听器，例如添加自定义任务或修改配置
      return config;
    },
    baseUrl: 'http://localhost:5173', // 设置基础URL，对应开发服务器的地址
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', // 测试文件的匹配模式
    supportFile: 'cypress/support/e2e.{js,jsx,ts,tsx}', // 支持文件的路径
    fixturesFolder: 'cypress/fixtures', // 测试数据fixtures的路径
    screenshotsFolder: 'cypress/screenshots', // 截图保存路径
    videosFolder: 'cypress/videos', // 视频记录保存路径
    video: true, // 是否录制测试视频
    viewportWidth: 1280, // 默认视口宽度
    viewportHeight: 720, // 默认视口高度
    pageLoadTimeout: 60000, // 页面加载超时时间
    defaultCommandTimeout: 4000, // 默认命令超时时间
    requestTimeout: 5000, // API请求超时时间
    responseTimeout: 30000, // API响应超时时间
    retries: {
      runMode: 2, // 运行模式下的重试次数
      openMode: 0, // 打开模式下的重试次数
    },
    trashAssetsBeforeRuns: true, // 运行前清理旧的截图和视频
  },
});