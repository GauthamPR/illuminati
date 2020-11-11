const mongoose = require('mongoose');
const hierarchy = require('./hierarchy.js');

module.exports= function(){
    mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
        .then(()=>{
            console.log("CONNECTED TO DB");
            hierarchy();
        })
        .catch(error => console.log(error));
}