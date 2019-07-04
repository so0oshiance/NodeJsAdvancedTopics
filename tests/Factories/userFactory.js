const mongoose=require('mongoose');
const User=mongoose.model('User');

module.exports=()=>{
    /**
     * new User({}).save() would return promis and is a asyc task so we can await for that
     * where we wanna use
     */
    return new User({}).save(); 
}