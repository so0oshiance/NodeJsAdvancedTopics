require('../models/User');
/**
 * by defaut JEST would give any test to pass or fail in just 5seconds !
 * absolutely it is not enough for some of our test, to launch browser,click,check and so on...
 * so we wanna rewirte the default settings of JEST here...
 */
jest.setTimeout(60000);//30 seconds

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