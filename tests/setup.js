require('../models/User');

const mongoose=require('mongoose');
const keys=require('../config/keys');
//mongoose by defaulf wont use promise, we should tell it to use it so
mongoose.Promise=global.Promise;
mongoose.connect(keys.mongoURI,{useMongoClient:true});

/**
 * to tell JEST that before runnig test please execute our setup file first ! 
 * we should do sonthing in our package.json file. tag below is added in package.json:
 * "jest":{
    "setupTestFrameworkScriptFile":"./tests/setup.js"
  },
 */