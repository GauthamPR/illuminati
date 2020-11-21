const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');

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
    hallId: ObjectID,
    eventName: String,
    eventDesc: String,
    requestor: ObjectID,
    status: String,
    next_approver: ObjectID,
    approved_by: Array
});
const hallSchema = new mongoose.Schema({
    name: String,
    realID: String
});
var Users = mongoose.model('Users', userSchema);
var Requests = mongoose.model('Requests', requestSchema);
var Halls = mongoose.model('Halls', hallSchema);

module.exports = {
    Users: Users,
    Requests: Requests,
    Halls: Halls
}