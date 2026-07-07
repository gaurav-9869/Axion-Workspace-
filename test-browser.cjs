const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('axion_logs_2026-07-03', JSON.stringify([{
      id: 'test-log',
      subject: 'bio',
      topic: 'Cell Division',
      sessionType: 'Study',
      activeMins: 30,
      distractionMins: 5,
      recoveryMins: 0,
      status: 'completed'
    }]));
  });

  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 1000));
  
  const buttons = await page.$$('nav button');
  await buttons[1].click(); // Archive
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Add missing'));
    if(btn) { btn.click(); }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const textareas = await page.evaluate(() => document.querySelectorAll('textarea').length);
  console.log("Textareas:", textareas);
  
  await browser.close();
})();
