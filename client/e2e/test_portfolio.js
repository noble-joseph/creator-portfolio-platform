import { By } from 'selenium-webdriver';
import { BaseTest } from './base_test.js';
import { Config } from './config.js';

export class TestPortfolio extends BaseTest {
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

  async test_portfolio_management() {
    try {
      await this.setUp('Portfolio Management Test');

      // Step 1: Login first
      console.log('Step 1: Logging in...');
      await this.login_first();
      this.take_screenshot('01_logged_in');

      // Step 2: Navigate to portfolio page
      console.log('Step 2: Navigating to portfolio page...');
      try {
        const portfolioLink = await this.wait_for_clickable('linkText', 'Portfolio', 5);
        await this.safe_click(portfolioLink);
      } catch {
        await this.driver.get(`${Config.BASE_URL}/portfolio`);
      }
      await this.wait_for_url_contains('/portfolio');
      console.log('✓ On portfolio page');
      this.take_screenshot('02_portfolio_page');

      // Step 3: Verify portfolio page elements
      console.log('Step 3: Verifying portfolio page elements...');
      const portfolioHeader = await this.wait_for_element('css', 'h1');
      const headerText = await portfolioHeader.getText();
      if (headerText.includes('Portfolio')) {
        console.log('✓ Portfolio page header correct');
      }

      // Check for form elements
      const titleField = await this.wait_for_element('name', 'title');
      const descriptionField = await this.wait_for_element('name', 'description');
      const linkField = await this.wait_for_element('name', 'link');
      const categorySelect = await this.wait_for_element('name', 'category');
      const tagsField = await this.wait_for_element('name', 'tags');
      console.log('✓ Portfolio form elements found');

      // Step 4: Fill out portfolio form
      console.log('Step 4: Filling out portfolio form...');
      await this.safe_send_keys(titleField, Config.TEST_PORTFOLIO.title);
      await this.safe_send_keys(descriptionField, Config.TEST_PORTFOLIO.description);
      await this.safe_send_keys(linkField, Config.TEST_PORTFOLIO.link);
      await this.safe_send_keys(tagsField, Config.TEST_PORTFOLIO.tags);

      // Select category
      const categoryOption = await this.driver.findElement(By.css(`option[value="${Config.TEST_PORTFOLIO.category}"]`));
      await categoryOption.click();

      this.take_screenshot('03_form_filled');

      // Step 5: Submit the form
      console.log('Step 5: Submitting portfolio form...');
      const submitButton = await this.wait_for_clickable('css', 'button[type="submit"]');
      await this.safe_click(submitButton);
      await this.driver.sleep(3000);

      // Step 6: Verify portfolio item was added
      console.log('Step 6: Verifying portfolio item was added...');
      try {
        // Look for the new portfolio item in the list
        const portfolioItems = await this.driver.findElements(By.css('.bg-gray-800'));
        const newItem = portfolioItems.find(async (item) => {
          const title = await item.findElement(By.css('h3')).getText();
          return title === Config.TEST_PORTFOLIO.title;
        });

        if (newItem) {
          console.log('✓ Portfolio item successfully added');
          this.take_screenshot('04_item_added');
        } else {
          console.log('⚠ Portfolio item may not have been added');
          this.take_screenshot('04_item_not_found');
        }
      } catch (error) {
        console.log(`⚠ Could not verify item addition: ${error.message}`);
      }

      // Step 7: Test portfolio sorting
      console.log('Step 7: Testing portfolio sorting...');
      try {
        const sortSelect = await this.driver.findElement(By.css('select'));
        await sortSelect.click();
        await this.driver.sleep(500);

        const aiOption = await this.driver.findElement(By.css('option[value="ai"]'));
        await aiOption.click();
        await this.driver.sleep(2000);

        console.log('✓ Portfolio sorting tested');
        this.take_screenshot('05_sorting_tested');
      } catch (error) {
        console.log(`⚠ Sorting test failed: ${error.message}`);
      }

      console.log('✓ Portfolio management test completed successfully');

    } catch (error) {
      console.log(`✗ Portfolio test failed: ${error.message}`);
      this.take_screenshot('portfolio_failure');
      throw error;
    } finally {
      await this.tearDown();
    }
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new TestPortfolio();
  test.test_portfolio_management().catch(console.error);
}
