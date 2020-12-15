const bcrypt = require('bcrypt');
const customModel = require('./models.js');

var Users = customModel.Users;
var Requests = customModel.Requests;
var Halls = customModel.Halls;

const parentOf = {
    "Soniya": null,
    "Arundhathi": "Soniya",
    "Subbu": null,
    "Kuttymalu": "Subbu",
    "Sreehari": "Kuttymalu"
};

const inChargeOf = {
    "101": "Rejimoan",
    "301": "Binu Rajan"
}
const DATABASE_ADMIN = "DATABASE_ADMIN";
const TEACHER = "TEACHER";
const STUDENT = "STUDENT";
const HALL_ADMIN = "HALL_ADMIN";

var arrayOfUserData = [
    {
        name: "Administrator",
        admNo: 123456,
        password: "Admin3456",
        role: [DATABASE_ADMIN],
        email: "dbadmin@gmail.com",
        designation: "Database Admin"
    },
    {
        name: "Soniya",
        admNo: 181001,
        password: "Soniya1001",
        role: [TEACHER],
        email: "soniya@gmail.com",
        designation: "IEEE Regional Head",
        parentID: null
    },
    {
        name: "Arundhathi",
        admNo: 181002,
        password: "Arundhathi1002",
        role: [STUDENT],
        email: "arundhathi@gmail.com",
        designation: "IEEE Student Head",
        parentID: null
    },
    {
        name: "Subbu",
        admNo: 182001,
        password: "Subbu2001",
        role: [TEACHER],
        email: "subbu@gmail.com",
        designation: "CS HOD",
        parentID: null
    },
    {
        name: "Kuttymalu",
        admNo: 182002,
        password: "Kuttymalu2002",
        role: [TEACHER],
        email: "kuttymalu@gmail.com",
        designation: "Lanscape Faculty Head",
        parentID: null
    },
    {
        name: "Sreehari",
        admNo: 182003,
        password: "Sreehari2003",
        role: [STUDENT],
        email: "sreehari@gmail.com",
        designation: "Lanscape Student Head",
        parentID: null
    },
    {
        name: "Rejimoan",
        admNo: 180001,
        password: "Rejimoan0001",
        role: [HALL_ADMIN],
        email: "rejimoan@gmail.com",
        designation: "Lab In Charge",
        parentID: null
    },
    {
        name: "Binu Rajan",
        admNo: 180002,
        password: "Binu00002",
        role: [HALL_ADMIN],
        email: "binuRajan@gmail.com",
        designation: "Class Advisor",
        parentID: null
    }
];

var arrayOfHallsData = [
    {
        hallID: "101",
        name: "101"
    },
    {
        hallID: "301",
        name: "301"
    }
];

/*var arrayOfRequests = [
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
]*/

function updateParents() {
    for(var child in parentOf){
        if(parentOf[child] != null){
            Users.findOne({name: parentOf[child]},(err, parent)=>{
                if(err) console.error(err);
                var childName;
                for(var child in parentOf){
                    if(parentOf[child] == parent.name){
                        childName = child;
                        break;
                    }
                }
                if(!parent) console.log(parentOf[child])
                Users.findOneAndUpdate({name: child}, {parentID: parent._id}, (err, updatedChild)=>{
                    if(err) console.error(err);
                    console.log(parent.name, "is set as the parent of", updatedChild.name);
                })
            })
        }
    }
}

function updateHalls() {
    for(var hall in inChargeOf){
        Users.findOne({name: inChargeOf[hall]},(err, hallAdmin)=>{
            if(err) console.error(err);
            var hallNo;
            for(var hall in inChargeOf){
                if(inChargeOf[hall] == hallAdmin.name){
                    hallNo = hall;
                    break;
                }
            }
            if(!hallAdmin) console.log(inChargeOf[hallNo])
            Halls.findOneAndUpdate({name: hallNo}, {in_charge: hallAdmin._id}, (err, updatedHall)=>{
                if(err) console.error(err);
                console.log(hallAdmin.name, "is set as the hall admin of", updatedHall.name);
            })
        })
    }
}
module.exports= function(){
    var arrayOfUsers = arrayOfUserData.map(userData=> {
        userData.password = bcrypt.hashSync(userData.password, 12);
        return(new Users(userData))
    });
    Users.insertMany(arrayOfUsers, (err)=>{
        if(err) console.error(err);
        updateParents();
        console.log("USERS INSERTED");
    })

    var arrayOfHalls = arrayOfHallsData.map(hallData=>new Halls(hallData));
    Halls.insertMany(arrayOfHalls, (err)=>{
        if(err) console.error(err);
        updateHalls();
        console.log("HALLS INSERTED");
    })
/*
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
*/
}