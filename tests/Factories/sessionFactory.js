const Buffer=require('safe-buffer').Buffer;
const Keygrip=require('keygrip');
const keys=require('../../config/keys');
const keygrip=new Keygrip([keys.cookieKey]);

/**
 * we use id here in our sessionObject, so we should pass mongoose model to this factory
 * to use the _id for sessionObject
 */
module.exports=(user)=>{
   
    const sessionObject={passport:{
        user:user._id.toString()// because user._id is object we need it in String!
    }};
    const session=Buffer.from(
        JSON.stringify(sessionObject))
        .toString('base64');
    const sig= keygrip.sign('session='+session);
    // ES 25 syntax , we do not have to wite  return{session:session,sig:sig}
    // easily we can write just wath we wanna return
    return{session,sig};
}