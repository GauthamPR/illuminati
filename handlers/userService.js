const customModel = require('./models.js');
const bcrypt = require('bcrypt');
const mail = require('./mailer.js');
const {ObjectID} = require('mongodb');

module.exports = {
    add: function(userData){
        return new Promise((resolve, reject)=>{
            function checkForInconsitency(userData){
                return new Promise((resolve, reject)=>{
                    var passwordRegex = new RegExp(/^[\w`~@!#$*%^&*()]*$/);
                    var admNoRegex = new RegExp(/[0-9]{6}/);
                    if(!admNoRegex.test(userData.admNo))
                        reject("Admission Number can only have 6 numbers");
                    else if(userData.password !== userData.confirmPassword)
                        reject("Passwords mismatch");
                    else if(!passwordRegex.test(userData.password))
                        reject("Passwords can only include letters, alpahbets, `, ~, ! ,@ , #, $, %, ^, &, *, (, )");
                    else
                        resolve("Passwords Check Done");
                })
            }
            function checkIfUserExists(admNo) {
                return new Promise((resolve, reject)=>{
                    customModel.Users.findOne({admNo: admNo},(err, user)=>{
                        if(err) console.error(err);
                        if(user) reject('User Already Exists');
                        resolve('User Does Not Exist');
                    })
                })
            }
            
            function checkIfUserAppliedBefore(admNo){
                return new Promise((resolve, reject)=>{
                    customModel.unapprovedUsers.findOne({admNo: admNo}, (err, user)=>{
                        if(err) console.error(err);
                        if(user)reject('User Already Applied');
                        resolve('User Not Applied Before');
                    })
                })
            }
            function findParentID(admNo){
                return new Promise((resolve, reject)=>{
                    if(admNo == null)
                        resolve(admNo);
                    else{
                        customModel.Users.findOne({admNo: admNo}, (err, user)=>{
                            if(err) console.error(err);
                            if(!user) reject('Unable to find parent');
                            resolve(user._id);
                        })
                    }
                })
            }
            function removeUserFromTemp(admNo, email){
                return new Promise((resolve)=>{
                    customModel.tempUsers.find({
                        $or: [{admNo: admNo}, {email: email}]
                    }, (err, docs)=>{
                        if(err) console.error(err)
                        if(docs)
                            docs.forEach(tempUser=>tempUser.remove());
                        resolve("TempUser Checked and Cleared");
                    })
                })
            }
            /*userData.password = userData['new-password'];
            delete userData['new-password'];
            userData.confirmPassword = userData['confirm-new-password'];
            delete userData['confirm-new-password'];
            */
            var tempUser = new customModel.tempUsers(userData);
            parentAdmNo = parseInt(userData.parent.match(/\((.*)\)/)[1]);
            Promise.all([
                findParentID(parentAdmNo),
                checkForInconsitency(userData),
                checkIfUserExists(tempUser.admNo), 
                checkIfUserAppliedBefore(tempUser.admNo),
                removeUserFromTemp(tempUser.admNo, tempUser.email)
            ])
                .then(messages=>{
                    tempUser.password = bcrypt.hashSync(userData.password, 12);
                    tempUser.parentID = messages[0];
                    if(tempUser.role === "Student"){
                        tempUser.role = "STUDENT";
                    }else if(tempUser.role === "Teacher"){
                        tempUser.role = "TEACHER";
                    }else{
                        tempUser.role = null;
                    }
                    mail.send(tempUser.email)
                        .then(otp=>{
                            tempUser.otp = otp;
                            tempUser.save((err, doc)=>{
                                if(err) console.error(err);
                                resolve(tempUser.email);
                            })
                        })
                })
                .catch(err=>reject(err));
        })
    },

    verify: function(email, otp){
        return new Promise((resolve, reject)=>{
            customModel.tempUsers.findOne({email: email}, (err, tempUser)=>{
                if(err) console.error(err);
                if(!tempUser) reject('Email: ' + email + ' not found');
                else if(tempUser.otp !== otp) reject('Invalid Otp')
                else{
                    var user = new customModel.unapprovedUsers(tempUser.toJSON());
                    user.save((err)=> {
                        if(err) console.error(err);
                        tempUser.remove((err)=>{
                            if(err) console.error(err);
                        })
                        resolve('Account Verfied Succesfully');
                })
                }
            })
        })
    },

    updateUnapproved: function(response){
        return new Promise((resolve, reject)=>{
            var userID = new ObjectID(response.id);
            if(response.order === "approve"){
                customModel.unapprovedUsers.findById(userID, (err, user)=>{
                    if(err) console.error(err);
                    var newUser = customModel.Users(user.toJSON());
                    newUser.save((err)=>{
                        if(err) console.error(err);
                        user.remove();
                        resolve("Approved User");
                    })
                })

            }else if(response.order === "deny"){
                customModel.unapprovedUsers.findById(userID, (err, user)=>{
                    if(err) console.error(err);
                    user.remove();
                    resolve("User Removed");
                })
            }else{
                reject("Undefined response");
            }
        })
    }
}