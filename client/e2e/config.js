export const Config = {
  BASE_URL: 'http://localhost:5173',
  API_BASE: 'http://localhost:5000',

  // Test user credentials (you may need to create these in your database)
  EXISTING_USER: {
    email: 'test@example.com',
    password: 'password123'
  },

  // Test data for portfolio creation
  TEST_PORTFOLIO: {
    title: 'Test Portfolio Item',
    description: 'This is a test portfolio item created by Selenium E2E tests',
    link: 'https://example.com/test-work',
    category: 'music',
    tags: 'test, selenium, automation'
  }
};
