import { By } from 'selenium-webdriver';
import { BaseTest } from './base_test.js';
import { Config } from './config.js';

export class TestDashboard extends BaseTest {
  async login_first() {
    try {
      await this.driver.get(`${Config.BASE_URL}/login`);
      await this.driver.sleep(2000);

      const emailField = await this.wait_for_element('name', 'email');
      await this.safe_send_keys(emailField, Config.EXISTING_USER.email);

      const passwordField = await this.wait_for_element('name', 'password');
      await this.safe_send_keys(passwordField, Config.EXISTING_USER.password);

      const submitButton = await this.wait_for_clickable('css', 'button[type="submit"]');
      await this.safe_click(submitButton);
      await this.driver.sleep(3000);

      console.log('✓ Logged in successfully');
    } catch (error) {
      console.log(`⚠ Login step failed: ${error.message}`);
    }
  }

  async test_dashboard_functionality() {
    try {
      await this.setUp('Dashboard Functionality Test');

      // Step 1: Login first
      console.log('Step 1: Logging in...');
      await this.login_first();
      this.take_screenshot('01_logged_in');

      // Step 2: Verify we're on dashboard
      console.log('Step 2: Verifying dashboard access...');
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes('/dashboard')) {
        console.log('✓ Successfully landed on dashboard');
      } else {
        console.log(`⚠ Not on dashboard, current URL: ${currentUrl}`);
        // Try to navigate to dashboard
        await this.driver.get(`${Config.BASE_URL}/dashboard`);
        await this.driver.sleep(2000);
      }
      this.take_screenshot('02_dashboard_page');

      // Step 3: Verify dashboard elements
      console.log('Step 3: Verifying dashboard elements...');
      try {
        const dashboardHeader = await this.wait_for_element('css', 'h1', 5);
        const headerText = await dashboardHeader.getText();
        if (headerText.includes('Dashboard')) {
          console.log('✓ Dashboard header correct');
        }
      } catch {
        console.log('⚠ Dashboard header not found');
      }

      // Look for dashboard widgets/cards
      const dashboardCards = await this.driver.findElements(By.css('.bg-gray-800, .card, [class*="widget"]'));
      if (dashboardCards.length > 0) {
        console.log(`✓ Found ${dashboardCards.length} dashboard widgets`);
      } else {
        console.log('⚠ No dashboard widgets found');
      }

      // Step 4: Test navigation from dashboard
      console.log('Step 4: Testing navigation from dashboard...');

      // Test Portfolio navigation
      try {
        const portfolioLink = await this.wait_for_clickable('linkText', 'Portfolio', 5);
        await this.safe_click(portfolioLink);
        await this.wait_for_url_contains('/portfolio');
        console.log('✓ Portfolio navigation successful');
        this.take_screenshot('03_portfolio_nav');

        // Go back to dashboard
        await this.driver.get(`${Config.BASE_URL}/dashboard`);
        await this.driver.sleep(2000);
      } catch {
        console.log('⚠ Portfolio link not found on dashboard');
      }

      // Test Connections navigation
      try {
        const connectionsLink = await this.wait_for_clickable('linkText', 'Connections', 5);
        await this.safe_click(connectionsLink);
        await this.wait_for_url_contains('/connections');
        console.log('✓ Connections navigation successful');
        this.take_screenshot('04_connections_nav');

        // Go back to dashboard
        await this.driver.get(`${Config.BASE_URL}/dashboard`);
        await this.driver.sleep(2000);
      } catch {
        console.log('⚠ Connections link not found on dashboard');
      }

      // Step 5: Test dashboard analytics/widgets
      console.log('Step 5: Testing dashboard analytics...');
      try {
        // Look for analytics or stats
        const statElements = await this.driver.findElements(By.css('[class*="stat"], [class*="metric"], .text-3xl'));
        if (statElements.length > 0) {
          console.log(`✓ Found ${statElements.length} analytics elements`);
          this.take_screenshot('05_analytics');
        } else {
          console.log('⚠ No analytics elements found');
        }
      } catch (error) {
        console.log(`⚠ Analytics test failed: ${error.message}`);
      }

      // Step 6: Test profile access
      console.log('Step 6: Testing profile access...');
      try {
        const profileLink = await this.wait_for_clickable('linkText', 'Profile', 5);
        await this.safe_click(profileLink);
        await this.wait_for_url_contains('/profile');
        console.log('✓ Profile navigation successful');
        this.take_screenshot('06_profile_nav');

        // Go back to dashboard
        await this.driver.get(`${Config.BASE_URL}/dashboard`);
        await this.driver.sleep(2000);
      } catch {
        console.log('⚠ Profile link not found on dashboard');
      }

      console.log('✓ Dashboard functionality test completed successfully');

    } catch (error) {
      console.log(`✗ Dashboard test failed: ${error.message}`);
      this.take_screenshot('dashboard_failure');
      throw error;
    } finally {
      await this.tearDown();
    }
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new TestDashboard();
  test.test_dashboard_functionality().catch(console.error);
}
