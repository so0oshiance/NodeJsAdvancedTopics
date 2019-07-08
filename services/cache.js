const mongoose = require('mongoose');
const redis=require('redis');
const keys=require('../config/keys');
//we move this line into keys file beacuse it maybe different in ci,dev and commercial enviroment
//const redisUrl= 'redis://127.0.0.1:6379'
const client=redis.createClient(keys.redisUrl);

 // client.get needs a callback  in real this is  like below:
    //const cachedBlog= client.get(req.user.id,()={});
    // but util.promisify will gets a function witch have a call back and then 
    // change it to act like a promise ones. then we can use async await syntax with it. 
const util=require('util');
client.hget=util.promisify(client.hget);

/** 
 * we do not want all of our queries to be cached so we write this function and add a
 *  parameter named useCache to set to true if we wanna cache the query then we will check
 * this parameter in out exec file to see if we want to read from cache or not
 * point that at first we write exec method then to make our code better we're writing this one
 * we get options to our code be more resuable, in this situation when you wanna call this method
 * easily you can specify your keys to store in redis.
 */
mongoose.Query.prototype.cache = async function (options={}) {
    // the names useCache and hashKey are whatever you want !
    this.useCache=true;
    //every key should be number or string so we should stringify the key
    //if key where empty in options so we use '' as key in redis
    // so we use this key for our top level key in redis
    this.hashKey=JSON.stringify(options.key || '');
    return this; //this line will make this cache function chainable
    /**
     * chainable means we can use this function like this
     *  const blogs = await Blog.find({ _user: req.user.id }).cache().limit(10);
     */
}

//if loock at mongoose source on github, we will know that exec function is in bellow path,
//in lib folder, query.js file, we can find how exec method defines and now we want to
// rewrite that function to add generall cache to our app

// we keep the original function here
const exec = mongoose.Query.prototype.exec;

// now we overwite the file
mongoose.Query.prototype.exec = async function () {

    /**
     * the useCache to not use cache codes we write if it is fasle. we would run
     * original exec of mongoose if this condition occures.
     */
    if(!this.useCache){
        return exec.apply(this,arguments);
    }
    //  Object.assign would copy objects very safe withoud changing the original ones,
    //  {} is an empty object that second and third other parameters would be added to it
    // exapme: {_user:'4fsdhghghi342f4g53b542',collection:'blogs'}
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));
    // hget is used to get nested hash
    const cacheValue =await client.hget(this.hashKey,key);

    if (cacheValue) {
        // console.log("cached value:",cacheValue);
        //this will prepare the data like what mongoose model would return.
        //we should check if the model of mongoose is array or not becuase in different situations
        //mongoose would handel the data would be return is object or list of objects
       const doc= JSON.parse(cacheValue);
       return  Array.isArray(doc)
            ? doc.map(d=> new this.model(d))
            : new this.model(doc); 
       
    }
    const result = await exec.apply(this, arguments);
    
    client.hset(this.hashKey,key,JSON.stringify(result));
    /**
     * with bellow code we can expire what we cache ... be aware of writing EX in capital
     * and 10 is in seconds.
     */
    //client.set(key,JSON.stringify(result),'EX',10);

    return result;
   


}

/**
 * here we want to write a method to  use it in our code like middleware to clear 
 * cache when we want, like when user write new blog post! cache should be clear to appear
 * correct data wich has the new post
 */
module.exports={
    clearHash(hashKey){
        console.log("in clear hash method cache: "+hashKey);
        client.del(JSON.stringify(hashKey));
    }

};