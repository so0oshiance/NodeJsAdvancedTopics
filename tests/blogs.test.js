const Page=require('./helpers/page');

let page;

beforeEach(async()=>{
   page=await Page.build();
   await page.goto('http://localhost:3000');
});

afterEach(async()=>{
   await page.close();
});

/**
 * we use describe to group test that have same conditiond wich we can write it down in 
 * before each, like when we are logged in.
 * so we can now read the  '' messages like this for tests in a describe :
 *  'when logged in , can see blog create form'
 */
describe('when we logged in',async()=>{
    beforeEach(async()=>{
        await page.login();
        await page.click('a.btn-floating');
    });
    test("can see blog create form",async()=>{
        //await page.waitFor('form lable');
        const lable=await page.getContentsOf('form label');
        expect(lable).toEqual('Blog Title');
    });
   /**
    * This is nested describe, sometimes we need to assert some tests which would have
    * same beforeEach and need another top level conditions. in such cases we use 
    * nested describes...
    */
    describe('and using VALID inputs',async()=>{
        
        beforeEach(async()=>{
            /**
             * This will add text to our inputs and press the submit btn
             */
            await page.type('.title input','My title');
            await page.type('.content input','My content');
            await page.click('form button');            
        });
        test('Submitting takes user to review page',async()=>{
                
            const text= await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });
        test('Submitting then saving adds blog to index(/blog) page',async()=>{
            await page.click('button.green');
            //any time we have some I/O prcess, API or AJAX call  we should waitFor 
                // elements to be appear on pupeteer page 
            await page.waitFor('.card');

            const title=await page.getContentsOf('.card-title');
            const content=await page.getContentsOf('p');

            expect(title).toEqual('My title');
            expect(content).toEqual('My content');
        });
    });
    describe('and using invalid inputs',async()=>{
        beforeEach(async()=>{
            await page.click('form button');
        });
        test('the form shows an error message',async()=>{
   
            const titleError=await page.getContentsOf('.title .red-text');
            const contentError=await page.getContentsOf('.content .red-text');
            console.log(titleError);
            console.log(contentError);
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });

});

describe.only('User is not logged in',async()=>{
    test('can not create a blog post',async()=>{
    /**
     * we want to simulate user making blog post without login,also we can implement this 
     * with jest hese but we want this to be real and execute calling blog POST route in
     * chromium using FETCH method which you can read about it. it releases in ES 2015...
     * you can directly call fetch in browser console without importing any library, we use
     * puppeteer evaluate method to fetch directy in chromium.
     * this page.evaluate gets afunction to exacute and return result!
     */
        const result=await page.evaluate(
           /**
            * in this ()=>{} method of evaluate, chromium will execute the () method
            * and the result would be returned into our test so we assign page.evaluate 
            * to a const parameter
            */
            ()=>{

                /**
                 * we chain .then of fetch method to get the result which is a row data
                 * and convert it into JSON.
                 */
                return  fetch('/api/blogs',{
                    method:'POST',
                    credentials:'same-origin',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({title:'my other title',content:'my othe content'})
                }).then(res=>res.json());
            }
        );
            console.log(result);
            expect(result).toEqual({ error: 'You must log in!' });
    });
    test('can not see blog posts',async()=>{
        const result= await page.evaluate(
            ()=>{
                return fetch('/api/blogs',{
                    method:'GET',
                    credentials:'same-origin',
                    headers:{
                        'Content-Type':'application/json'
                    }
                   
                }).then(res=>res.json());
            }
        );
            console.log(result);
            expect(result).toEqual({ error: 'You must log in!' });
    });

});