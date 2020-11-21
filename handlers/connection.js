const mongoose = require('mongoose');
const initial = require('./initial.js');

module.exports =async function main(){

    mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
        .then(()=>{
            console.log("CONNECTED TO DB");
            //initial();
            return ;
        })
        .catch(error => console.log(error));
}