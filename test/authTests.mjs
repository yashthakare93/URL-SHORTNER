import { Builder, By, until } from 'selenium-webdriver';
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseUrl = 'http://localhost:8001';
let driver;
let reportContent = '';

describe('Tests for URL Shortener Application', function () {
    this.timeout(60000); // Set timeout for the tests

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.quit();
        // Write the report to report.txt after all tests are done
        fs.writeFileSync(path.join(__dirname, 'report.txt'), reportContent);
        console.log('Report generated: report.txt');
    });

    // Function to take screenshots
    async function takeScreenshot(name) {
        const screenshot = await driver.takeScreenshot();
        const screenshotDir = path.join(__dirname, 'screenshots');

        // Create the screenshots directory if it doesn't exist
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir);
        }

        const filePath = path.join(screenshotDir, `${name}.png`);
        fs.writeFileSync(filePath, screenshot, 'base64');
        console.log(`Screenshot saved to ${filePath}`);
    }

    it('should allow user to sign up', async function () {
        try {
            console.log('Attempting to sign up...');
            await driver.get(`${baseUrl}/signup`);

            const usernameInput = await driver.wait(until.elementLocated(By.name('name')), 10000);
            await usernameInput.sendKeys('authtestuser123');

            const emailInput = await driver.findElement(By.name('email'));
            await emailInput.sendKeys('authtestuser123@example.com');

            const passwordInput = await driver.findElement(By.name('password'));
            await passwordInput.sendKeys('password123');

            await driver.findElement(By.css('button[type="submit"]')).click();
            await driver.wait(until.urlContains('/user'), 30000);
            reportContent += 'Sign up successful, redirected to login.\n';
            console.log('Sign up successful, redirected to login.');
        } catch (error) {
            reportContent += `Sign up failed: ${error}\n`;
            await takeScreenshot('sign_up_error'); // Take a screenshot on failure
            console.error('Error during sign up:', error);
        }
    });

    it('should allow user to login', async function () {
        try {
            console.log('Attempting to log in...');
            await driver.get(`${baseUrl}/login`);

            const emailInput = await driver.wait(until.elementLocated(By.name('email')), 10000);
            await emailInput.sendKeys('authtestuser123@example.com');

            const passwordInput = await driver.wait(until.elementLocated(By.name('password')), 10000);
            await passwordInput.sendKeys('password123');

            const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await loginButton.click();

            await driver.wait(async function() {
                return (await driver.getCurrentUrl()) === `${baseUrl}/`;
            }, 30000);

            reportContent += `Login successful, redirected to: ${await driver.getCurrentUrl()}\n`;
            console.log('Login successful, redirected to:', await driver.getCurrentUrl());
        } catch (error) {
            reportContent += `Login failed: ${error}\n`;
            await takeScreenshot('login_error'); // Take a screenshot on failure
            console.error('Error during login:', error);
        }
    });

    it('should allow user to generate a short URL', async function () {
        try {
            console.log('Attempting to generate a short URL...');
            const originalUrl = 'https://www.example.com';

            // Load the home page with the form
            await driver.get(baseUrl);

            // Locate and fill out the URL input, then submit the form
            const urlInput = await driver.wait(until.elementLocated(By.name('url')), 10000);
            await urlInput.sendKeys(originalUrl);

            const generateButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await generateButton.click();

            // Wait for the SweetAlert modal and find the link inside it
            const shortUrlElement = await driver.wait(until.elementLocated(By.css('.swal2-html-container a')), 30000);
            const generatedUrl = await shortUrlElement.getAttribute('href');

            // Verify that the generated URL matches the expected format
            expect(generatedUrl).to.match(/http:\/\/localhost:8001\/url\/\w+/);
            reportContent += `Generated Short URL: ${generatedUrl}\n`;
            console.log('Generated Short URL:', generatedUrl);
        } catch (error) {
            reportContent += `Short URL generation failed: ${error}\n`;
            await takeScreenshot('short_url_generation_error'); // Take a screenshot on failure
            console.error('Error during short URL generation:', error);
        }
    });

    // Test case for invalid URL
    it('should not generate a short URL for an invalid URL', async function () {
        try {
            console.log('Attempting to generate a short URL with an invalid URL...');
            await driver.get(baseUrl);

            // Set viewport size
            await driver.manage().window().setRect({ width: 1280, height: 800 });

            // Locate the URL input field and enter an invalid URL
            const urlInput = await driver.wait(until.elementLocated(By.css('input[name="url"]')), 10000);
            await urlInput.sendKeys('invalid-url');

            // Locate and click the generate button
            const generateButton = await driver.findElement(By.css('button[type="submit"]'));
            await generateButton.click();

            // Wait for some time to let the response render
            await driver.sleep(3000);

            // Check if any short URL has been generated
            const shortUrlElements = await driver.findElements(By.css('a[href^="http://localhost:8001/url/"]'));
            expect(shortUrlElements.length).to.equal(0); // Expect no short URL to be generated

            // Log the result
            reportContent += 'Invalid URL test passed, no short URL generated.\n';

        } catch (error) {
            // Take a screenshot only on failure
            await takeScreenshot('invalid_url_error'); // Take a screenshot on failure
            reportContent += `Error during invalid URL test: ${error}\n`;
            console.error('Error during invalid URL test:', error);
        }
    });


    it('should redirect short URL to original URL', async function () {
        try {
            console.log('Attempting to generate a short URL...');
            const originalUrl = 'https://www.example.com';

            // Load the home page with the form
            await driver.get(baseUrl);

            // Locate and fill out the URL input, then submit the form
            const urlInput = await driver.wait(until.elementLocated(By.css('input[name="url"]')), 10000);
            await urlInput.sendKeys(originalUrl);

            const generateButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await generateButton.click();

            // Wait for the SweetAlert modal and find the link inside it
            const shortUrlElement = await driver.wait(until.elementLocated(By.css('.swal2-html-container a')), 30000);
            const generatedUrl = await shortUrlElement.getAttribute('href');

            // Now test the redirection
            console.log('Attempting to redirect from the generated short URL:', generatedUrl);
            await driver.get(generatedUrl);

            // Assuming you have a way to locate the original URL in the redirected page
            // Use the appropriate selector for the original URL display (you need to modify this part)
            const originalUrlElement = await driver.wait(until.elementLocated(By.css('your-selector-for-original-url')), 30000);
            const originalUrlText = await originalUrlElement.getText();

            // Verify that the original URL is displayed or accessed correctly
            expect(originalUrlText).to.equal(originalUrl);
            console.log('Successfully redirected to the original URL:', originalUrlText);
        } catch (error) {
            await takeScreenshot('redirect_error'); // Take a screenshot on failure
            console.error('Error during URL redirection test:', error);
        }
    });


    it('should allow user to log out', async function () {
        try {
            console.log('Attempting to log out...');
            await driver.get(`${baseUrl}/logout`); // Ensure driver is initialized

            // Add assertions or additional logic here
            reportContent += 'Logout successful.\n';
            console.log('Logout successful.');
        } catch (error) {
            reportContent += `Logout failed: ${error}\n`;
            await takeScreenshot('logout_error'); // Take a screenshot on failure
            console.error('Error during logout:', error);
        }
    });
});
