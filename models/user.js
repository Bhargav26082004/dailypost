const { name } = require('ejs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/youtube');
 const userSchema = mongoose.Schema ({
    username :String,
    name : String,
    age : {type: Number, min: 1},
    profilepic : {type : String, default : "profileimage.jpg"},
 email : String,
    password : String,
    posts : [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }]

})
const user = mongoose.model('user', userSchema);
module.exports = user;