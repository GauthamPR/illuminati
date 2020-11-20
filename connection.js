const mongoose = require('mongoose');
const initial = require('./initial.js');

module.exports= function(){

    mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
        .then(()=>{
            console.log("CONNECTED TO DB");
        })
        .catch(error => console.log(error));

    const userSchema = new mongoose.Schema({
        name: String,
        admNo: Number,
        email: String,
        designation: String,
        parentID: ObjectID,
        parent: String
    });
    var Users = mongoose.model('Users', userSchema);
}