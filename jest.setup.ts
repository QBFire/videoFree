/**
 * Jest Setup 文件
 * 用于配置测试环境和导入必要的测试辅助函数
 */

import '@testing-library/jest-dom';

// Mock TextEncoder 和 TextDecoder
if (typeof TextEncoder === 'undefined') {
  // 为浏览器环境创建一个简单的TextEncoder模拟
  Object.defineProperty(window, 'TextEncoder', {
    value: class MockTextEncoder {
      encode(input: string) {
        return new Uint8Array(Array.from(input).map(char => char.charCodeAt(0)));
      }
    },
    writable: true
  });
}

if (typeof TextDecoder === 'undefined') {
  // 为浏览器环境创建一个简单的TextDecoder模拟
  Object.defineProperty(window, 'TextDecoder', {
    value: class MockTextDecoder {
      decode(data: Uint8Array) {
        return Array.from(data).map(byte => String.fromCharCode(byte)).join('');
      }
    },
    writable: true
  });
}

// Mock 全局对象和API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock 控制台方法
jest.spyOn(console, 'warn').mockImplementation(jest.fn());
jest.spyOn(console, 'error').mockImplementation(jest.fn());