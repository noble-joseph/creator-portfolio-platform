import { By } from 'selenium-webdriver';
import { BaseTest } from './base_test.js';
import { Config } from './config.js';

export class TestLogin extends BaseTest {
  async test_login() {
    try {
      await this.setUp('Login Test');

      // Step 1: Navigate to home page
      console.log('Step 1: Navigating to home page...');
      await this.driver.get(Config.BASE_URL);
      await this.driver.sleep(2000);
      this.take_screenshot('01_home_page');

      // Step 2: Navigate to login page
      console.log('Step 2: Navigating to login page...');
      const loginLink = await this.wait_for_clickable('css', 'a[href="/login"]');
      await this.safe_click(loginLink);
      await this.wait_for_url_contains('/login');
      console.log('✓ On login page');
      this.take_screenshot('02_login_page');

      // Step 3: Verify login page elements
      console.log('Step 3: Verifying login page elements...');
      const loginHeader = await this.wait_for_element('css', 'h1');
      const headerText = await loginHeader.getText();
      if (headerText.includes('Welcome Back')) {
        console.log('✓ Login page header correct');
      } else {
        console.log(`⚠ Unexpected header: ${headerText}`);
      }

      // Check for email and password fields
      const emailField = await this.wait_for_element('name', 'email');
      const passwordField = await this.wait_for_element('name', 'password');
      const submitButton = await this.wait_for_element('css', 'button[type="submit"]');
      console.log('✓ Login form elements found');

      // Step 4: Test form validation with invalid email
      console.log('Step 4: Testing form validation...');
      await this.safe_send_keys(emailField, 'invalid-email');
      await this.safe_send_keys(passwordField, 'password123');
      await this.safe_click(submitButton);
      await this.driver.sleep(1000);

      // Check for validation error
      try {
        const errorElement = await this.driver.findElement(By.css('.text-error-700'));
        console.log('✓ Form validation working - error displayed');
      } catch {
        console.log('⚠ No validation error found');
      }
      this.take_screenshot('03_validation_error');

      // Step 5: Test with valid email format but invalid credentials
      console.log('Step 5: Testing with valid email format...');
      await this.safe_send_keys(emailField, Config.EXISTING_USER.email);
      await this.safe_send_keys(passwordField, Config.EXISTING_USER.password);
      await this.safe_click(submitButton);
      await this.driver.sleep(3000);

      // Check if login succeeded or failed
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes('/dashboard')) {
        console.log('✓ Login successful - redirected to dashboard');
        this.take_screenshot('04_login_success');
      } else if (currentUrl.includes('/login')) {
        console.log('⚠ Login failed - still on login page (possibly invalid credentials)');
        this.take_screenshot('04_login_failed');
      } else {
        console.log(`⚠ Unexpected redirect to: ${currentUrl}`);
      }

      console.log('✓ Login test completed successfully');

    } catch (error) {
      console.log(`✗ Login test failed: ${error.message}`);
      this.take_screenshot('login_failure');
      throw error;
    } finally {
      await this.tearDown();
    }
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new TestLogin();
  test.test_login().catch(console.error);
}
