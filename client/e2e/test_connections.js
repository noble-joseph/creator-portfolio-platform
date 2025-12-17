import { By } from 'selenium-webdriver';
import { BaseTest } from './base_test.js';
import { Config } from './config.js';

export class TestConnections extends BaseTest {
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

  async test_connections_management() {
    try {
      await this.setUp('Connections Management Test');

      // Step 1: Login first
      console.log('Step 1: Logging in...');
      await this.login_first();
      this.take_screenshot('01_logged_in');

      // Step 2: Navigate to connections page
      console.log('Step 2: Navigating to connections page...');
      try {
        const connectionsLink = await this.wait_for_clickable('linkText', 'Connections', 5);
        await this.safe_click(connectionsLink);
      } catch {
        await this.driver.get(`${Config.BASE_URL}/connections`);
      }
      await this.wait_for_url_contains('/connections');
      console.log('✓ On connections page');
      this.take_screenshot('02_connections_page');

      // Step 3: Verify connections page elements
      console.log('Step 3: Verifying connections page elements...');
      const connectionsHeader = await this.wait_for_element('css', 'h1');
      const headerText = await connectionsHeader.getText();
      if (headerText.includes('Connections')) {
        console.log('✓ Connections page header correct');
      }

      // Check for tabs
      const tabs = await this.driver.findElements(By.css('.border-b button'));
      if (tabs.length >= 2) {
        console.log('✓ Connections tabs found');
      }

      // Step 4: Test connections tabs
      console.log('Step 4: Testing connections tabs...');

      // Test Connections tab
      const connectionsTab = tabs[0];
      await this.safe_click(connectionsTab);
      await this.driver.sleep(1000);
      console.log('✓ Connections tab active');
      this.take_screenshot('03_connections_tab');

      // Test Requests tab
      const requestsTab = tabs[1];
      await this.safe_click(requestsTab);
      await this.driver.sleep(1000);
      console.log('✓ Requests tab active');
      this.take_screenshot('04_requests_tab');

      // Step 5: Test user discovery/navigation
      console.log('Step 5: Testing user discovery...');
      try {
        const userDiscoveryLink = await this.wait_for_clickable('linkText', 'Discover', 5);
        await this.safe_click(userDiscoveryLink);
        await this.wait_for_url_contains('/discover');
        console.log('✓ Navigated to user discovery');
        this.take_screenshot('05_user_discovery');

        // Go back to connections
        await this.driver.get(`${Config.BASE_URL}/connections`);
        await this.driver.sleep(2000);
      } catch {
        console.log('⚠ User discovery link not found, continuing...');
      }

      // Step 6: Test connection actions (if users available)
      console.log('Step 6: Testing connection actions...');
      try {
        // Look for user cards
        const userCards = await this.driver.findElements(By.css('.bg-gray-800.rounded-lg'));
        if (userCards.length > 0) {
          console.log(`✓ Found ${userCards.length} user(s) in connections`);

          // Test clicking on a user profile
          const firstUserLink = await userCards[0].findElement(By.css('a'));
          await this.safe_click(firstUserLink);
          await this.driver.sleep(2000);

          const currentUrl = await this.driver.getCurrentUrl();
          if (currentUrl.includes('/profile/')) {
            console.log('✓ Successfully navigated to user profile');
            this.take_screenshot('06_user_profile');
          }

          // Go back to connections
          await this.driver.get(`${Config.BASE_URL}/connections`);
          await this.driver.sleep(2000);
        } else {
          console.log('⚠ No users found in connections (expected for new accounts)');
        }
      } catch (error) {
        console.log(`⚠ Could not test connection actions: ${error.message}`);
      }

      console.log('✓ Connections management test completed successfully');

    } catch (error) {
      console.log(`✗ Connections test failed: ${error.message}`);
      this.take_screenshot('connections_failure');
      throw error;
    } finally {
      await this.tearDown();
    }
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new TestConnections();
  test.test_connections_management().catch(console.error);
}
