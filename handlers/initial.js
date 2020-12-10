const bcrypt = require('bcrypt');
const customModel = require('./models.js');

var Users = customModel.Users;
var Requests = customModel.Requests;
var Halls = customModel.Halls;

var arrayOfUsers = [
    {
        name: "Soniya",
        admNo: 181001,
        password: "Soniya1001",
        role: "Teacher",
        email: "soniya@gmail.com",
        designation: "IEEE Regional Head",
        parent: null,
        parentID: null
    },
    {
        name: "Arundhathi",
        admNo: 181002,
        password: "Arundhathi1002",
        role: "Student",
        email: "arundhathi@gmail.com",
        designation: "IEEE Student Head",
        parent: "Soniya",
        parentID: null
    },
    {
        name: "Subbu",
        admNo: 182001,
        password: "Subbu2001",
        role: "Teacher",
        email: "subbu@gmail.com",
        designation: "CS HOD",
        parent: null,
        parentID: null
    },
    {
        name: "Kuttymalu",
        admNo: 182002,
        password: "Kuttymalu2002",
        role: "Teacher",
        email: "kuttymalu@gmail.com",
        designation: "Lanscape Faculty Head",
        parent: "Subbu",
        parentID: null
    },
    {
        name: "Sreehari",
        admNo: 182003,
        password: "Sreehari2003",
        role: "Student",
        email: "sreehari@gmail.com",
        designation: "Lanscape Student Head",
        parent: "Kuttymalu",
        parentID: null
    },
    {
        name: "Rejimoan",
        admNo: 180001,
        password: "Rejimoan0001",
        role: "Hall in charge",
        email: "rejimoan@gmail.com",
        designation: "Lab In Charge",
        parent: null,
        parentID: null
    },
    {
        name: "Binu Rajan",
        admNo: 180002,
        password: "Binu00002",
        role: "Hall in charge",
        email: "binuRajan@gmail.com",
        designation: "Class Advisor",
        parent: null,
        parentID: null
    }
];

var arrayOfHalls = [
    {
        name: "101",
        in_charge: null,
        in_charge_name: "Rejimoan",
    },
    {
        name: "301",
        in_charge: null,
        in_charge_name: "Binu Rajan"
    }
];

var arrayOfRequests = [
    {
        hallName: "101",
        eventName: "Acceptance routine",
        eventDescription: "Check for Acceptance",
        from: new Date("12/09/2020 09:00"),
        to: new Date("12/09/2020 12:00"),
        requestorName: "Sreehari",
        status: "PENDING",
    },
    {
        hallName: "101",
        eventName: "Acceptance routine",
        eventDescription: "Check for Acceptance",
        from: new Date("12/09/2020 09:00"),
        to: new Date("12/09/2020 12:00"),
        requestorName: "Sreehari",
        status: "PENDING",
    }
]
module.exports= function(){
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

    console.log("PERSONS UPDATED");

    var saveHall = function(hallData, done){
        var hall = new Halls(hallData);
        hall.save((err, data)=>{
            if(err) return console.log(err);
            done(err, data);
        })
    }

    var assignInChargeId = function(err, hallData){
        if(hallData.in_charge == null){
            Users.findOne({name: hallData.in_charge_name}, (err, inCharge)=>{
                Halls.findOneAndUpdate({in_charge_name: inCharge.name}, {in_charge: inCharge._id}, (err, updatedHall)=>{
                    if(err) console.log(err);
                    console.log("UPDATED HALL");
                })
            })
        }
    }

    arrayOfHalls.forEach(elem => {
        saveHall(elem, assignInChargeId);
    })
}