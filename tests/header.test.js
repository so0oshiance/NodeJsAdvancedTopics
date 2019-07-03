const puppeteer = require('puppeteer');

/**
 * be define browser and page out of beforeEach untill we cann access them in whole file
 * if they were defined in beforeEach we can not use them anynore...
 * 
 */
let browser,page;
beforeEach(async ()=>{
     browser=await puppeteer.launch({
        headless:false
    });
     page= await browser.newPage();
    await page.goto('localhost:3000');
});

// after every test instead of closing chromium manualy we can close it after each of our tests
afterEach(async()=>{
    await browser.close();
});

test("Open chromium page",async()=>{
    /**
     * all of puppeteer methods are async so we should write async await for our test methods
     * headless is true by default to run our test as fast as possible
     * 4 bellow lines we need them for each test so we put them in befoeEAch function
     * these lines launch a browser that we always need for our tests
     */
    /* const browser=await puppeteer.launch({
        headless:false
    });
    const page= await browser.newPage();
    await page.goto('localhost:3000'); */
    // 'brand-logo' is CSS class a tag a in our first page 
    // Js to achieve this text would be : $('a.brand-logo').innerHTML (test it in console browser)
    const text= await page.$eval('a.brand-logo', el=>el.innerHTML);
    expect(text).toEqual('Blogster')
})