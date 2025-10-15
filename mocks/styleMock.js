// Mock CSS files for Jest tests (Jest 28+ compatible)
module.exports = {
  process() {
    return {
      code: '',
    };
  },
  getCacheKey() {
    // The output is always the same.
    return 'css-transformer';
  },
};