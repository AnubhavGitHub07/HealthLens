const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForSelector('.dash-sidebar');
    
    const layout = await page.evaluate(() => {
        const logo = document.querySelector('.dash-sidebar-logo');
        const section = document.querySelector('.dash-sidebar-section');
        const overview = document.querySelector('.dash-nav-btn');
        return {
            logo: { rect: logo.getBoundingClientRect().toJSON(), css: window.getComputedStyle(logo).position },
            section: { rect: section.getBoundingClientRect().toJSON(), css: window.getComputedStyle(section).position },
            overview: { rect: overview.getBoundingClientRect().toJSON(), css: window.getComputedStyle(overview).position }
        };
    });
    console.log(JSON.stringify(layout, null, 2));
    await browser.close();
})();
