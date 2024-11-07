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
    this.timeout(60000);
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
        // console.log(`Screenshot saved to ${filePath}`);
    }

    /**
     * Test case: User Signup
     * Description: Verifies if a user can successfully sign up for an account.
     */
    it('should allow user to sign up', async function () {
        try {
            console.log('Attempting to sign up...');
            await driver.get(`${baseUrl}/signup`);

            const usernameInput = await driver.wait(until.elementLocated(By.name('name')), 20000);
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
            // console.error('Error during sign up:', error);
        }
    });

    /**
     * Test case: User Login
     * Description: Verifies if a registered user can successfully log in.
     */
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
            // console.error('Error during login:', error);
        }
    });

    /**
     * Test case: Generate Short URL
     * Description: Tests if the application generates a short URL for a valid input URL.
     */
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
            // console.error('Error during short URL generation:', error);
        }
    });

    /**
     * Test case: Invalid URL Handling
     * Description: Ensures that the application does not generate a short URL for an invalid URL.
     */
    it('should not generate a short URL for an invalid URL', async function () {
        try {
            console.log('Attempting to generate a short URL with an invalid URL...');
            await driver.get(baseUrl);
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
            console.log("Short URL Elements Found:", shortUrlElements.length);
            expect(shortUrlElements.length).to.equal(0);
            reportContent += 'Invalid URL test passed, no short URL generated.\n';
        } catch (error) {
            await takeScreenshot('invalid_url_error');
            reportContent += `Error during invalid URL test: ${error}\n`;
            // console.error('Error during invalid URL test:', error);
        }
    });


    /**
     * Test case: Empty URL Handling
     * Description: Checks that a short URL is not generated when no URL is provided.
     */
    it('should not generate a short URL for an empty URL', async function () {
        try {
            await driver.get(baseUrl);
            const urlInput = await driver.wait(until.elementLocated(By.name('url')), 10000);
            await urlInput.sendKeys(''); // Empty URL
            const generateButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await generateButton.click();
            const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000); // Adjust the selector for error message
            const messageText = await errorMessage.getText();
            expect(messageText).to.include('Please enter a valid URL');
        } catch (error) {
            await takeScreenshot('empty_url_error');
            reportContent += `Error during empty URL test: ${error}\n`;
            // console.error('Error during empty URL test:', error);
        }
    });

    /**
     * Test case: Short URL Redirection
     * Description: Verifies that the generated short URL redirects to the original URL.
     */
    it('should redirect short URL to original URL', async function () {
        try {
            console.log('Attempting to generate a short URL...');
            const originalUrl = 'https://www.example.com';
            await driver.get(baseUrl);
            // Locate and fill out the URL input, then submit the form
            const urlInput = await driver.wait(until.elementLocated(By.css('input[name="url"]')), 10000);
            await urlInput.sendKeys(originalUrl);
            const generateButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await generateButton.click();
            const shortUrlElement = await driver.wait(until.elementLocated(By.css('.swal2-html-container a')), 30000);
            const generatedUrl = await shortUrlElement.getAttribute('href');
            // Now test the redirection
            console.log('Attempting to redirect from the generated short URL:', generatedUrl);
            await driver.get(generatedUrl);
            // Verify the redirected page is the original URL
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl.startsWith(originalUrl)).to.be.true;
            reportContent += `Redirection successful from ${generatedUrl} to ${currentUrl}\n`;
            console.log('Redirection successful');
        } catch (error) {
            await takeScreenshot('url_redirect_error');
            reportContent += `Error during URL redirection: ${error}\n`;
            // console.error('Error during URL redirection:', error);
        }
    });

    /**
     * Test case: Duplicate URL Handling
     * Description: Ensures that a duplicate URL does not generate multiple different short URLs.
     */
    it('should not generate duplicate short URLs', async function () {
        try {
            const originalUrl = 'https://www.example.com';
            await driver.get(baseUrl);
            // Generate the first short URL
            const urlInput = await driver.wait(until.elementLocated(By.name('url')), 10000);
            await urlInput.sendKeys(originalUrl);
            const generateButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await generateButton.click();
            const shortUrlElement = await driver.wait(until.elementLocated(By.css('.swal2-html-container a')), 30000);
            const firstGeneratedUrl = await shortUrlElement.getAttribute('href');
            // Generate the second short URL for the same original URL
            await driver.get(baseUrl);
            await urlInput.clear();
            await urlInput.sendKeys(originalUrl);
            await generateButton.click();
            const secondShortUrlElement = await driver.wait(until.elementLocated(By.css('.swal2-html-container a')), 30000);
            const secondGeneratedUrl = await secondShortUrlElement.getAttribute('href');
            // Verify that the short URLs are the same, ensuring no duplication
            expect(firstGeneratedUrl).to.equal(secondGeneratedUrl);
            reportContent += `No duplicate short URL generated, both attempts gave the same result: ${firstGeneratedUrl}\n`;
            console.log('No duplicate short URL generated');
        } catch (error) {
            await takeScreenshot('duplicate_url_error');
            reportContent += `Error during duplicate URL test: ${error}\n`;
            // console.error('Error during duplicate URL test:', error);
        }
    });

    /**
     * Test case: Redirection to HTTPS Site
     * Description: Verifies that when a secure (HTTPS) original URL is shortened, the redirection to the shortened URL leads to an HTTPS site.
     */
    it('should redirect short URL to HTTPS site when original URL is secure', async function () {
        try {
            const originalUrl = 'https://www.example.com';

            // Generate the short URL first
            await driver.get(baseUrl);
            const urlInput = await driver.wait(until.elementLocated(By.name('url')), 10000);
            await urlInput.sendKeys(originalUrl);
            const generateButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await generateButton.click();

            // Wait for the generated short URL
            const shortUrlElement = await driver.wait(until.elementLocated(By.css('.swal2-html-container a')), 30000);
            const generatedUrl = await shortUrlElement.getAttribute('href');
            console.log('Generated Short URL:', generatedUrl);

            // Now test the redirection
            await driver.get(generatedUrl);

            // Verify the redirected page is the original HTTPS URL
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl.startsWith('https://')).to.be.true;

            reportContent += `Redirection successful to HTTPS site: ${currentUrl}\n`;
            console.log('Redirection successful to HTTPS site');
        } catch (error) {
            await takeScreenshot('https_redirect_error');
            reportContent += `Error during HTTPS redirection: ${error}\n`;
            // console.error('Error during HTTPS redirection:', error);
        }
    });

    /**
     * Test case: Signup with Already Registered Email
     * Description: Ensures that the system prevents signup with an email that is already registered.
     */
    it('should not allow signup with an already registered email', async function () {
        try {
            console.log('Attempting to sign up with an already registered email...');
            await driver.get(`${baseUrl}/signup`);

            const usernameInput = await driver.wait(until.elementLocated(By.name('name')), 20000);
            await usernameInput.sendKeys('authtestuser123');

            const emailInput = await driver.findElement(By.name('email'));
            await emailInput.sendKeys('authtestuser123@example.com');

            const passwordInput = await driver.findElement(By.name('password'));
            await passwordInput.sendKeys('password123');

            await driver.findElement(By.css('button[type="submit"]')).click();

            // Wait for the error message to be visible
            const errorMessage = await driver.wait(
                until.elementLocated(By.css('.error-message')), 20000
            );
            await driver.wait(until.elementIsVisible(errorMessage), 20000);

            const errorText = await errorMessage.getText();
            expect(errorText).to.include('Email already registered');
            console.log('Signup failed with already registered email.');

        } catch (error) {
            await takeScreenshot('signup_existing_email_error');
            // console.error('Error during signup with existing email:', error);
        }
    });


    /**
     * Test case: Signup with Invalid Email Format
     * Description: Verifies that the system prevents signup with an invalid email format.
     */
    it('should not allow signup with an invalid email format', async function () {
        try {
            console.log('Attempting to sign up with an invalid email format...');
            await driver.get(`${baseUrl}/signup`);

            const usernameInput = await driver.wait(until.elementLocated(By.name('name')), 20000);
            await usernameInput.sendKeys('authtestuser1234');

            const emailInput = await driver.findElement(By.name('email'));
            await emailInput.sendKeys('invalid-email'); // Invalid email format

            const passwordInput = await driver.findElement(By.name('password'));
            await passwordInput.sendKeys('password1234');

            await driver.findElement(By.css('button[type="submit"]')).click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('.error-message')), 20000
            );

            // Wait for error message to be visible
            await driver.wait(until.elementIsVisible(errorMessage), 20000);

            const errorText = await errorMessage.getText();
            expect(errorText).to.include('Invalid email format');
            console.log('Signup failed with invalid email format.');
        } catch (error) {
            await takeScreenshot('signup_invalid_email_error');
            // console.error('Error during signup with invalid email:', error);
        }
    });

    /**
     * Test case: Login with Incorrect Password
     * Description: Ensures that users cannot log in with an incorrect password.
     */
    it('should not allow login with incorrect password', async function () {
        try {
            console.log('Attempting to log in with incorrect password...');
            await driver.get(`${baseUrl}/login`);

            const emailInput = await driver.wait(until.elementLocated(By.name('email')), 10000);
            await emailInput.sendKeys('authtestuser123@example.com');

            const passwordInput = await driver.wait(until.elementLocated(By.name('password')), 10000);
            await passwordInput.sendKeys('wrongpassword'); // Incorrect password

            const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await loginButton.click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('.error-message')), 20000
            );

            // Wait for error message to be visible
            await driver.wait(until.elementIsVisible(errorMessage), 20000);

            const errorText = await errorMessage.getText();
            expect(errorText).to.include('Invalid email or password');
            console.log('Login failed with incorrect password.');
        } catch (error) {
            await takeScreenshot('login_incorrect_password_error');
            // console.error('Error during login with incorrect password:', error);
        }
    });

    /**
     * Test case: Login with Unregistered Email
     * Description: Ensures that users cannot log in with an email that is not registered in the system.
     */
    it('should not allow login with unregistered email', async function () {
        try {
            console.log('Attempting to log in with unregistered email...');
            await driver.get(`${baseUrl}/login`);

            const emailInput = await driver.wait(until.elementLocated(By.name('email')), 10000);
            await emailInput.sendKeys('unregistered@example.com'); // Unregistered email

            const passwordInput = await driver.wait(until.elementLocated(By.name('password')), 10000);
            await passwordInput.sendKeys('password123');

            const loginButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
            await loginButton.click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('.error-message')), 20000
            );

            // Wait for error message to be visible
            await driver.wait(until.elementIsVisible(errorMessage), 20000);

            const errorText = await errorMessage.getText();
            expect(errorText).to.include('Email not registered');
            console.log('Login failed with unregistered email.');
        } catch (error) {
            await takeScreenshot('login_unregistered_email_error');
            // console.error('Error during login with unregistered email:', error);
        }
    });

    /**
     * Test case: Signup with Short Password
     * Description: Verifies that the system prevents signup with a password that is too short.
     */
    it('should not allow signup with a short password', async function () {
        try {
            console.log('Attempting to sign up with a short password...');
            await driver.get(`${baseUrl}/signup`);

            const usernameInput = await driver.wait(until.elementLocated(By.name('name')), 20000);
            await usernameInput.sendKeys('authtestuser12345');

            const emailInput = await driver.findElement(By.name('email'));
            await emailInput.sendKeys('authtestuser12345@example.com');

            const passwordInput = await driver.findElement(By.name('password'));
            await passwordInput.sendKeys('short'); // Password is too short

            await driver.findElement(By.css('button[type="submit"]')).click();

            const errorMessage = await driver.wait(
                until.elementLocated(By.css('.error-message')), 20000
            );

            // Wait for error message to be visible
            await driver.wait(until.elementIsVisible(errorMessage), 20000);

            const errorText = await errorMessage.getText();
            expect(errorText).to.include('Password must be at least 6 characters');
            console.log('Signup failed due to short password.');
        } catch (error) {
            await takeScreenshot('signup_short_password_error');
            // console.error('Error during signup with short password:', error);
        }
    });
    /**
     * Test case: Logout Functionality
     * Description: Ensures that the user is able to successfully log out.
     */
    it('should allow user to log out', async function () {
        try {
            console.log('Attempting to log out...');
            await driver.get(`${baseUrl}/logout`);
            await driver.wait(until.urlContains('/login'), 30000);
            reportContent += 'User successfully logged out.\n';
            console.log('User successfully logged out.');
        } catch (error) {
            await takeScreenshot('logout_error');
            reportContent += `Error during logout: ${error}\n`;
            // console.error('Error during logout:', error);
        }
    });

});
