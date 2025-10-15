// Simple store test to verify mock functionality

// Mock the store directly
const mockStore = {
  initializeApp: jest.fn(),
  searchMedia: jest.fn(),
};

describe('Store Mock Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should mock initializeApp correctly', () => {
    // Call the mock function
    mockStore.initializeApp();
    // Verify it was called
    expect(mockStore.initializeApp).toHaveBeenCalled();
  });

  test('should mock searchMedia with parameters', () => {
    // Call the mock function with parameters
    mockStore.searchMedia('test query');
    // Verify it was called with correct parameters
    expect(mockStore.searchMedia).toHaveBeenCalledWith('test query');
  });
});