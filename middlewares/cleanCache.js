const {clearHash} = require('../services/cache');


module.exports=async (req,res,next)=>{
/**
 * as u know, middlewares are executed befor main method. like requireLogin in  blogRouts.js
 * but here we want to our middleware done after main method executed, why! becuase after adding
 * new blog post we want to clear the cache, not before that ! 
 * await is th trick we use here , at firs we await next, this waits until the main method to be executed
 * then we can clear the cache...
 */
 await next();
 clearHash(req.user.id);
};