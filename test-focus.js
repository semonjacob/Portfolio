const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/index.html');

  const focusableElements = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      'a, button, input, textarea, select, details, [tabindex]'
    );
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      text: el.innerText || el.getAttribute('aria-label') || el.getAttribute('alt'),
      tabindex: el.getAttribute('tabindex')
    }));
  });

  console.log('Focusable Elements:', focusableElements);

  await browser.close();
})();