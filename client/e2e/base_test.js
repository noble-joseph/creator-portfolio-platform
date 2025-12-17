import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import path from 'path';

export class BaseTest {
  constructor() {
    this.driver = null;
    this.testName = '';
  }

  async setUp(testName = '') {
    this.testName = testName;

    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode for CI/CD
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    // Create WebDriver instance
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log(`\n=== Starting ${testName} ===`);
  }

  async tearDown() {
    if (this.driver) {
      await this.driver.quit();
      console.log(`=== ${this.testName} Completed ===\n`);
    }
  }

  async wait_for_element(locator, value, timeout = 10) {
    const element = await this.driver.wait(
      until.elementLocated(By[locator](value)),
      timeout * 1000
    );
    return element;
  }

  async wait_for_clickable(locator, value, timeout = 10) {
    const element = await this.driver.wait(
      until.elementLocated(By[locator](value)),
      timeout * 1000
    );
    await this.driver.wait(
      until.elementIsEnabled(element),
      timeout * 1000
    );
    return element;
  }

  async safe_send_keys(element, text) {
    await element.clear();
    await element.sendKeys(text);
  }

  async safe_click(element) {
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
    await this.driver.sleep(500);
    await element.click();
  }

  async scroll_to_element(element) {
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
    await this.driver.sleep(500);
  }

  async take_screenshot(filename) {
    try {
      const screenshotDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      const screenshot = await this.driver.takeScreenshot();
      const filePath = path.join(screenshotDir, `${this.testName}_${filename}.png`);
      fs.writeFileSync(filePath, screenshot, 'base64');
      console.log(`Screenshot saved: ${filePath}`);
    } catch (error) {
      console.log(`Failed to take screenshot: ${error.message}`);
    }
  }

  async wait_for_url_contains(text, timeout = 10) {
    await this.driver.wait(
      async () => {
        const currentUrl = await this.driver.getCurrentUrl();
        return currentUrl.includes(text);
      },
      timeout * 1000
    );
  }
}
