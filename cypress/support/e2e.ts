/**
 * Cypress E2E支持文件
 * 用于添加自定义命令和全局配置
 */

// 导入Cypress命令类型定义
/// <reference types="cypress" />

// 导入测试辅助函数
// import './commands';

// 全局配置
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略一些常见的第三方库错误，允许测试继续进行
  console.error('Uncaught exception:', err);
  
  // 如果错误消息包含以下字符串，可以选择忽略
  const ignoreErrors = [
    'ResizeObserver loop limit exceeded',
    'Cannot read properties of null',
    'Failed to fetch',
  ];
  
  // 检查错误是否应该被忽略
  const shouldIgnore = ignoreErrors.some(errorText => 
    err.message.includes(errorText)
  );
  
  if (shouldIgnore) {
    // 忽略错误，继续测试
    return false;
  }
  
  // 默认情况下抛出错误
  return true;
});

// 自定义命令示例 - 可以根据项目需求添加更多自定义命令
Cypress.Commands.add('login', (username, password) => {
  // 这里实现登录逻辑
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('searchMedia', (query) => {
  // 自定义搜索命令
  cy.get('input[type="search"]').clear().type(query);
  cy.get('input[type="search"]').type('{enter}');
});

Cypress.Commands.add('playMedia', (index = 0) => {
  // 自定义播放媒体命令
  cy.get('.media-item').eq(index).click();
  cy.get('[data-testid="mock-player"]').should('exist');
});

Cypress.Commands.add('waitForPlayer', () => {
  // 等待播放器加载完成
  cy.get('[data-testid="mock-player"]').should('exist');
});

// 全局beforeEach钩子示例
// before(() => {
//   // 在所有测试之前执行一次
//   cy.log('Starting E2E tests...');
// });

// beforeEach(() => {
//   // 在每个测试之前执行
//   cy.log('Starting new test...');
// });

// 全局afterEach钩子示例
// afterEach(() => {
//   // 在每个测试之后执行
//   cy.log('Test completed.');
// });