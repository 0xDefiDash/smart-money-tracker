// Simple authentication test script
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Navigating to login page...');
    await page.goto('http://100.107.245.157:3001/auth/signin');
    
    console.log('Filling login form...');
    await page.type('input[name="username"]', 'testsettings2');
    await page.type('input[name="password"]', 'password123');
    
    console.log('Clicking login button...');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for navigation...');
    await page.waitForNavigation();
    
    console.log('Navigating to Block Wars...');
    await page.goto('http://100.107.245.157:3001/block-wars');
    
    console.log('Waiting for page to load...');
    await page.waitForTimeout(3000);
    
    console.log('Checking for settings icon...');
    const settingsIcon = await page.$('svg[class*="settings"], button[data-testid="settings"], .settings-button');
    
    if (settingsIcon) {
      console.log('Settings icon found!');
    } else {
      console.log('Settings icon not found.');
    }
    
    await browser.close();
  } catch (error) {
    console.error('Test failed:', error);
  }
})();
