const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;

var arrayOfUsers = [
    {
        name: "Soniya",
        email: "soniya@gmail.com",
        designation: "IEEE Regional Head",
        parent: null,
        parentID: null
    },
    {
        name: "Arundhathi",
        email: "arundhathi@gmail.com",
        designation: "IEEE Student Head",
        parent: "Soniya",
        parentID: null
    },
    {
        name: "Subbu",
        email: "subbu@gmail.com",
        designation: "CS HOD",
        parent: null,
        parentID: null
    },
    {
        name: "Kuttymalu",
        email: "kuttymalu@gmail.com",
        designation: "Lanscape Faculty Head",
        parent: "Subbu",
        parentID: null
    },
    {
        name: "Sreehari",
        email: "sreehari@gmail.com",
        designation: "Lanscape Student Head",
        parent: "Kuttymalu",
        parentID: null
    }
];

module.exports= function(){
    const personSchema = new mongoose.Schema({
        name: String,
        email: String,
        designation: String,
        parentID: ObjectID,
        parent: String
    });
    var personModel = mongoose.model('personModel', personSchema);
    
    var savePerson = function(userData, done){
        var person = new personModel(userData);
        person.save((err, data)=> {
            if (err) return console.log(err);
            done(err, data);
        })
    }

    var assignParentID = function(err, userData){
        if(userData.parent != null){
            personModel.findOne({name: userData.parent}, (err, parent)=> {
                personModel.findOneAndUpdate({name: userData.name}, {parentID: parent["_id"]}, (err, updatedUser)=> {
                    if(err) console.log(err);
                    console.log("UPDATED: ", updatedUser.name)
                })
            })
        }
    }
    var printDatabase = function(err, data){
        console.log("DATABASE: ", data);
    }

    arrayOfUsers.forEach(elem => {
        savePerson(elem, assignParentID);       
    });
}