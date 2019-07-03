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

test("The header has the correct text",async()=>{
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
});
test("clicking login start oauth flow",async()=>{
    /**
     * '.right a' would select anchor tag we use for login with google
     * click would simulate clicking on it and url would return the the current page url
     * READ puppeteer DOCS
     * we can use content of the page after clicking to check if we are navigating to it
     * or not, but content could be change in time and this would fail our test! so we choose
     * something constant without any change in time like first part of url for googleAuth
     */
    await page.click('.right a');
    const url=page.url();
    //console.log(url); == https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email&client_id=964808011168-29vqsooppd769hk90kjbjm5gld0glssb.apps.googleusercontent.com
    //READ JEST DOCS for expect
    //toMach will get regex to check 
    expect(url).toMatch(/accounts\.google\.com/);
});
//test.only("Show logout when user signed in",async()=>{// ONLY test would be run
test("Show logout when user signed in",async()=>{
    const id= '5d1736c8100fc4335c12a113'; //mongodb user id
/**
 * here we wanna create session string from a valid user id. we explain the flow on papers
 to how get user id from session. now we wanna do reverse here.. create session from valid userId
 */
    const Buffer=require('safe-buffer').Buffer;
    const sessionObject={passport:{
        user:id
    }};
    const sessionString=Buffer.from(
        JSON.stringify(sessionObject))
        .toString('base64');
    
    /**
     * here are codes how in real session would be build, we grab them to creat our own session
     * keygrip uses our cookieKey(we define it) to sign our session.
     * please accept the way we write it!
     */
    const Keygrip=require('keygrip');
    const keys=require('../config/keys');
    const keygrip=new Keygrip([keys.cookieKey]);
    const sig= keygrip.sign('session='+sessionString);
    
    ////// with abovecode we actualy create a session for a real user! now we should use it
    ///// to show to chromium that this is a valid user. 

    /**
     * now we should set our cookie in our chromium object. first we visit puppeteer docs
     * to know how to set cookie for chromium. then we grab the names session and session.sig
     * from our real application. Browser->inspect->application->cookies
     * or after login we can see the cookie in inspect>networt>callbackUrl>all>response
     */
    await page.setCookie({name:"session",value:sessionString});
    await page.setCookie({name:"session.sig",value:sig});
    //we should refresh the page till we get login
    await page.goto('localhost:3000');

    //Now we should check if use is loged in or not

     /**
     * sometimes browser would load the page as soon as posible which makes our test fail!!!
     * becuase befor logout btn apper on the screen and chromium load it expect command runs
     * and it would failed our test !!!
     * so we should wait until page load. we goto puppeteer DOCs and find the solution.
     */
    await page.waitFor('a[href="/auth/logout"]');
    const text= await page.$eval('a[href="/auth/logout"]', el=>el.innerHTML);
    expect(text).toEqual('Logout');
    
});