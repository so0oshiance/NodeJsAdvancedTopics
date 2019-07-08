const puppeteer = require('puppeteer');
const sessionFactory=require('../Factories/sessionFactory');
const userFactory=require('../Factories/userFactory');

class CustomPage{
    static async build(){
       const browser=await puppeteer.launch({
            headless:true,
            // this line would dramaticaly reduse the test time
            args:['--no-sandbox']
        });

        const page= await browser.newPage();
        const custompage=new CustomPage(page);
        /**
         * with including browser here we do not care about the action we wanna use is in
         * page or browser. to manage access to the browser or page we just include it here
         */
        return new Proxy(custompage,{
            get:
                function(target,property){
                    /**
                     * based on priority we write the classes down
                     * browser is grater than page so we should check it first
                     * for ex both browser & page has the close() method and if in our .test.js
                     * file we just say page.close(); it will get close from page class if the
                     * return was like this: 
                     * return CustomPage[property]|| page[property] || browser[property]  ;
                     * and it was not working correctly!
                     */
                    return custompage[property] || browser[property] || page[property] ;
                }
        });
    }
    constructor(page){
        this.page=page;
    }
    async login(){
        const user= await userFactory();
        const{session,sig}=sessionFactory(user);

        await this.page.setCookie({name:"session",value:session});
        await this.page.setCookie({name:"session.sig",value:sig});
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');

    }
    /**
     *  await page.$eval('a[href="/auth/logout"]', el=>el.innerHTML) code is some kind of
     * weired! we wanna make the use of it more easy here...
     */
     async getContentsOf(selector){
        return await this.page.$eval(selector, el=>el.innerHTML);
    }
}
module.exports=CustomPage;