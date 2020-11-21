const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var arrayOfUsers = [
    {
        name: "Soniya",
        admNo: 181001,
        password: "Soniya1001",
        level: "Alpha",
        email: "soniya@gmail.com",
        designation: "IEEE Regional Head",
        parent: null,
        parentID: null
    },
    {
        name: "Arundhathi",
        admNo: 181002,
        password: "Arundhathi1002",
        level: "Beta",
        email: "arundhathi@gmail.com",
        designation: "IEEE Student Head",
        parent: "Soniya",
        parentID: null
    },
    {
        name: "Subbu",
        admNo: 182001,
        password: "Subbu2001",
        level: "Alpha",
        email: "subbu@gmail.com",
        designation: "CS HOD",
        parent: null,
        parentID: null
    },
    {
        name: "Kuttymalu",
        admNo: 182002,
        password: "Kuttymalu2002",
        level: "Alpha",
        email: "kuttymalu@gmail.com",
        designation: "Lanscape Faculty Head",
        parent: "Subbu",
        parentID: null
    },
    {
        name: "Sreehari",
        admNo: 182003,
        password: "Sreehari2003",
        level: "Beta",
        email: "sreehari@gmail.com",
        designation: "Lanscape Student Head",
        parent: "Kuttymalu",
        parentID: null
    }
];

module.exports= function(Users, Requests, Rooms){
    var savePerson = function(userData, done){
        const hash = bcrypt.hashSync(userData.password, 12);
        userData.password = hash;
        var user = new Users(userData);
        user.save((err, data)=> {
            if (err) return console.log(err);
            done(err, data);
        })
    }

    var assignParentID = function(err, userData){
        if(userData.parent != null){
            Users.findOne({name: userData.parent}, (err, parent)=> {
                Users.findOneAndUpdate({name: userData.name}, {parentID: parent["_id"]}, (err, updatedUser)=> {
                    if(err) console.log(err);
                    console.log("UPDATED: ");
                })
            })
        }
    }

    arrayOfUsers.forEach(elem => {
        savePerson(elem, assignParentID);       
    });

    console.log("DATABASE UPDATED");
}