const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');

const newUserSchema = new mongoose.Schema({
    name: String,
    admNo: Number,
    role: String,
    password: String,
    email: String,
    status: String,
    designation: String,
    parentID: ObjectID,
});

const userSchema = new mongoose.Schema({
    githubID: String,
    googleID: String,
    name: String,
    admNo: Number,
    role: String,
    password: String,
    level: String,
    email: String,
    designation: String,
    parentID: ObjectID,
    parent: String,
    last_login: Date,
    login_count: Number
});
const requestSchema = new mongoose.Schema({
    hallID: ObjectID,
    eventName: String,
    eventDesc: String,
    from: Date,
    to: Date,
    requestor: ObjectID,
    status: String,
    next_approver: ObjectID,
    approved_by: [ObjectID]
});
const hallSchema = new mongoose.Schema({
    name: String,
    in_charge: ObjectID,
    in_charge_name: String
});
var newUsers = mongoose.model('newUsers', newUserSchema);
var Users = mongoose.model('Users', userSchema);
var Requests = mongoose.model('Requests', requestSchema);
var Halls = mongoose.model('Halls', hallSchema);

module.exports = {
    newUsers: newUsers,
    Users: Users,
    Requests: Requests,
    Halls: Halls
}