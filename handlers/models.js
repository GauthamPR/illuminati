const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');

const tempUserSchema = new mongoose.Schema({
    name: String,
    admNo: Number,
    role: [String],
    password: String,
    otp: String,
    email: String,
    designation: String,
    parentID: ObjectID,
    createdAt: Date
});
tempUserSchema.index({createdAt: 1}, {expires: '15m'});

const resetLinkSchema = new mongoose.Schema({
    userID: ObjectID,
    randomValue: String,
    createdAt: Date
})
resetLinkSchema.index({createdAt: 1}, {expires: '15m'});

const unapprovedUserSchema = new mongoose.Schema({
    name: String,
    admNo: Number,
    role: [String],
    password: String,
    email: String,
    designation: String,
    parentID: ObjectID,
});

const userSchema = new mongoose.Schema({
    googleID: String,
    admNo: Number,
    name: String,
    email: String,
    role: [String],
    designation: String,
    password: String,
    parentID: ObjectID,
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
    approved_by: [ObjectID],
    denied_by: ObjectID
});

const hallSchema = new mongoose.Schema({
    number: Number,
    name: String,
    in_charge: ObjectID
});

var tempUsers = mongoose.model('temp_users', tempUserSchema);
var resetLinks = mongoose.model('reset_links', resetLinkSchema);
var unapprovedUsers = mongoose.model('unapproved_users', unapprovedUserSchema);
var Users = mongoose.model('Users', userSchema);
var Requests = mongoose.model('Requests', requestSchema);
var Halls = mongoose.model('Halls', hallSchema);

module.exports = {
    tempUsers: tempUsers,
    resetLinks: resetLinks,
    unapprovedUsers: unapprovedUsers,
    Users: Users,
    Requests: Requests,
    Halls: Halls
}