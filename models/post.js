const mongoose = require('mongoose');


const postschema = mongoose.Schema ({
    user : {
        type :mongoose.Schema.Types.ObjectId,
        ref :"user",
    }, 
    date : {
        type : Date,
        default : Date.now(),
    },
    content : String,
    likes : [{

        
        
        type :mongoose.Schema.Types.ObjectId,
        ref :"user",
    }]
    
})
let postmodel = mongoose.model('post', postschema);
module.exports = postmodel;
