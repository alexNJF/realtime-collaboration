// playwright.config.js
module.exports = {
    testDir: './tests', // Directory containing test files
    timeout: 30000, // Timeout for each test in milliseconds
    use: {
      headless: false, // Run in headless mode
      viewport: { width: 1280, height: 720 },
    },
  };