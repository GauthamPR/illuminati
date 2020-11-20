const { request } = require('express');
const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');
const initial = require('./initial.js');

module.exports= function(done){

    mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
        .then(()=>{
            console.log("CONNECTED TO DB");
            const userSchema = new mongoose.Schema({
                name: String,
                admNo: Number,
                password: String,
                level: String,
                email: String,
                designation: String,
                parentID: ObjectID,
                parent: String
            });
            const requestSchema = new mongoose.Schema({
                room: ObjectID,
                requestor: ObjectID,
                status: String,
                next_approver: ObjectID,
                approved_by: Array
            });
            const roomSchema = new mongoose.Schema({
                name: String,
                realID: String
            });
            var Users = mongoose.model('Users', userSchema);
            var Requests = mongoose.model('Requests', requestSchema);
            var Rooms = mongoose.model('Rooms', roomSchema);
            //initial(Users, Requests, Rooms);
            return done(Users, Requests, Rooms)
        })
        .catch(error => console.log(error));
}