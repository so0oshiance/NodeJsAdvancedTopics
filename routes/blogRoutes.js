const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

//we write a middleware so we do not need it any more
//const {clearHash}=require('../services/cache');

const cleanHash=require('../middlewares/cleanCash');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
   
    /**
     * redis
     */
   /*  const redis=require('redis');
    const redisUrl= 'redis://127.0.0.1:6379'
    const client=redis.createClient(redisUrl);
    // client.get needs a callback  in real this is  like below:
    //const cachedBlog= client.get(req.user.id,()={});
    // but util.promisify will gets a function witch have a call back and then 
    // change it to act like a promise ones. then we can use async await syntax with it. 
    const util=require('util');
    client.get=util.promisify(client.get);
    
    //first we should check if we have needed data in our cache then check it with db
    const cachedBlog= await client.get(req.user.id);
    if (cachedBlog) {
      console.log('from the cached data');
      return res.send(JSON.parse(cachedBlog));
    }
    // if no cached data exists we should query it from db
    const blogs = await Blog.find({ _user: req.user.id });

    res.send(blogs);

    // set the data that retrive from db to redis
    client.set(req.user.id,JSON.stringify(blogs));  */

    //global cache
    const blogs = await Blog.find({ _user: req.user.id })
    .cache({key:req.user.id});
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin,cleanHash, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
    //after every post cache should be deleted
    console.log("clear hash user id:"+req.user.id);
    
    /**
     * instead of using this line, we write a middleware to do this for us
     */
    //clearHash(req.user.id);
  });
};
