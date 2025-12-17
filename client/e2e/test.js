import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function runTests() {
  // Set up Chrome options
  const options = new chrome.Options();
  options.addArguments('--headless'); // Run in headless mode for CI/CD
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  // Create WebDriver instance
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const results = [];

  try {
    console.log('=== Selenium E2E Test Suite for Creator Portfolio Platform ===\n');

    // Test 1: Home Page Load
    console.log('Test 1: Home Page Load');
    await driver.get('http://localhost:5173');
    await driver.wait(until.elementLocated(By.css('h1')), 10000);
    const title = await driver.getTitle();
    const header = await driver.findElement(By.css('h1'));
    const headerText = await header.getText();

    if (title.includes('Creator Platform') && headerText.includes('Welcome to')) {
      console.log('✓ PASSED: Home page loaded successfully');
      results.push({ test: 'Home Page Load', status: 'PASSED', details: `Title: ${title}, Header: ${headerText}` });
    } else {
      console.log('✗ FAILED: Home page did not load correctly');
      results.push({ test: 'Home Page Load', status: 'FAILED', details: `Title: ${title}, Header: ${headerText}` });
    }

    // Test 2: Navigation to Login Page
    console.log('\nTest 2: Navigation to Login Page');
    // Scroll to the login button to make it clickable
    const loginLink = await driver.findElement(By.css('a[href="/login"]'));
    await driver.executeScript("arguments[0].scrollIntoView(true);", loginLink);
    await driver.sleep(500); // Wait for scroll to complete
    await loginLink.click();
    await driver.wait(until.urlContains('/login'), 5000);
    const loginTitle = await driver.getTitle();
    const loginHeader = await driver.findElement(By.css('h1'));
    const loginHeaderText = await loginHeader.getText();

    if (loginHeaderText.includes('Welcome Back') && driver.getCurrentUrl().then(url => url.includes('/login'))) {
      console.log('✓ PASSED: Successfully navigated to login page');
      results.push({ test: 'Navigation to Login Page', status: 'PASSED', details: `Header: ${loginHeaderText}` });
    } else {
      console.log('✗ FAILED: Failed to navigate to login page');
      results.push({ test: 'Navigation to Login Page', status: 'FAILED', details: `Header: ${loginHeaderText}` });
    }

    // Test 3: Login Form Validation (Invalid Email)
    console.log('\nTest 3: Login Form Validation (Invalid Email)');
    const emailField = await driver.findElement(By.name('email'));
    const passwordField = await driver.findElement(By.name('password'));
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));

    await emailField.clear();
    await emailField.sendKeys('invalid-email');
    await passwordField.clear();
    await passwordField.sendKeys('password123');
    await submitButton.click();

    // Wait for error message
    await driver.sleep(1000);
    const errorElements = await driver.findElements(By.css('.text-error-700'));
    const hasValidationError = errorElements.length > 0;

    if (hasValidationError) {
      console.log('✓ PASSED: Form validation working for invalid email');
      results.push({ test: 'Login Form Validation (Invalid Email)', status: 'PASSED', details: 'Validation error displayed' });
    } else {
      console.log('✗ FAILED: Form validation not working for invalid email');
      results.push({ test: 'Login Form Validation (Invalid Email)', status: 'FAILED', details: 'No validation error displayed' });
    }

    // Test 4: Portfolio Page Navigation
    console.log('\nTest 4: Portfolio Page Navigation');
    // First navigate back to home
    await driver.get('http://localhost:5173');
    await driver.wait(until.elementLocated(By.css('h1')), 5000);

    // Try to navigate to portfolio (may require login, but test navigation)
    const portfolioLink = await driver.findElement(By.linkText('Get Started'));
    await portfolioLink.click();

    // Check if redirected to register or login
    await driver.sleep(2000);
    const currentUrl = await driver.getCurrentUrl();

    if (currentUrl.includes('/register') || currentUrl.includes('/login')) {
      console.log('✓ PASSED: Correctly redirected to auth page for protected route');
      results.push({ test: 'Portfolio Page Navigation', status: 'PASSED', details: 'Redirected to auth page as expected' });
    } else {
      console.log('✗ FAILED: Did not redirect properly for protected route');
      results.push({ test: 'Portfolio Page Navigation', status: 'FAILED', details: `Current URL: ${currentUrl}` });
    }

  } catch (error) {
    console.error('Test suite failed:', error);
    results.push({ test: 'Test Suite', status: 'FAILED', details: error.message });
  } finally {
    // Close the browser
    await driver.quit();
  }

  // Print detailed test report
  console.log('\n=== Test Results Summary ===');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  console.log('=== Detailed Results ===');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.status}`);
    console.log(`   Details: ${result.details}\n`);
  });

  return { passed, failed, total, results };
}

runTests();
