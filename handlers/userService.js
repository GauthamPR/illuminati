const customModel = require('./models.js');
const bcrypt = require('bcrypt');
const mail = require('./mailer.js');
const {ObjectID} = require('mongodb');
const mailer = require('./mailer.js');

function updateChildrensOf(user){
    return new Promise((resolve, reject)=>{
        customModel.Users.update({parentID: user._id}, {$set:{parentID: user.parentID}}, (err, updatedUsers)=>{
            if(err) console.error(err);
            if(updatedUsers){
                console.log("Updated parents of :");
                updatedUsers.map(user=>{
                    console.log(user.name);
                })
            }
            resolve("Updated Parents");
        })
    })
}
function updateRequestsAssociatedWith(user){
    function updateNextApprover(user){
        return new Promise((resolve, reject)=>{
            customModel.Requests.update({next_approver: user._id}, {$set:{next_approver: user.parentID}}, (err, updatedRequests)=>{
                if(err) console.log(err);
                console.log("Updated next approvers of:");
                updatedRequests.forEach(request=>{
                    console.log(request.name);
                })
                resolve("Updated Next Approvers");
            })
        })
    }
    function deleteRequestsCreatedBy(user){
        return new Promise((resolve, reject)=>{
            customModel.Requests.find({requestor: user._id}, (err, requests)=>{
                if(err) console.error(err);
                console.log("Removed Requests");
                requests.forEach(request=>{
                    console.log(request.name);
                })
                requests.forEach(request=>{
                    request.remove();
                })
                resolve("Deleted Requests");
            })
        })
    }
    return new Promise((resolve, reject)=>{
        
        Promise.all([
            updateNextApprover(user),
            deleteRequestsCreatedBy(user)
        ])
        .then(()=>resolve("Requests Service done"))
    })
}

function changePassword(userID, newPassword){
    return new Promise((resolve, reject)=>{
        newPassword = bcrypt.hashSync(newPassword, 12);
        customModel.Users.findByIdAndUpdate(userID, {password: newPassword}, (err, user)=>{
            if(err) console.error(err);
            resolve("Password Changed");
        })
    })
}

function checkPasswordsConsistency(password, confirmPassword){
    return new Promise((resolve, reject)=>{
        var passwordRegex = new RegExp(/^[\w`~@!#$*%^&*()]*$/);
         if(password !== confirmPassword)
            reject("Passwords mismatch");
        /*else if(!passwordRegex.test(password))
            reject("Passwords can only include letters, alpahbets, `, ~, ! ,@ , #, $, %, ^, &, *, (, )");
        */
        else
            resolve("Passwords Check Done");
    })
}

function checkAdmNoConsistency(admNo){
    return new Promise((resolve, reject)=>{
        var admNoRegex = new RegExp(/[0-9]{6}/);
        if(!admNoRegex.test(admNo))
            reject("Admission Number can only have 6 numbers");
        else
            resolve("Admission Check Done");
    })
}

function checkIfActiveUserExists(admNo) {
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
        if(admNo == "none")
            resolve(null);
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

module.exports = {
    add: function(userData){
        return new Promise((resolve, reject)=>{
            var tempUser = new customModel.tempUsers(userData);
            Promise.all([
                findParentID(userData.supervisor),
                checkAdmNoConsistency(userData.admNo),
                checkPasswordsConsistency(userData.password, userData.confirmPassword),
                checkIfActiveUserExists(tempUser.admNo), 
                checkIfUserAppliedBefore(tempUser.admNo),
                removeUserFromTemp(tempUser.admNo, tempUser.email)
            ])
            .then(messages=>{
                tempUser.password = bcrypt.hashSync(userData.psw, 12);
                tempUser.parentID = messages[0];
                if(tempUser.role[0] === "student"){
                    tempUser.role[0]= "STUDENT";
                }else if(tempUser.role[0] === "teacher"){
                    tempUser.role[0] = "TEACHER";
                }else{
                    tempUser.role[0] = null;
                }
                mail.sendOTP(tempUser.email)
                .then(otp=>{
                    tempUser.otp = otp;
                    tempUser.createdAt = Date.now();
                    tempUser.save((err, doc)=>{
                        if(err) console.error(err);
                        resolve(tempUser.email);
                    })
                })
            })
            .catch(err=>{
                console.error(err)
                reject(err)
            });
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
            if(response.order === "accept"){
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
    },

    changePassword: function(inputData){
        return new Promise((resolve, reject)=>{
            checkPasswordsConsistency(inputData.newPassword, inputData.confirmNewPassword)
            .then(()=>{
                customModel.Users.findById(inputData.userID, (err, user)=>{
                    if(err) console.error(err);
                    if(!user) reject("User Not Found")
                    else if(!bcrypt.compareSync(inputData.oldPassword, user.password)) reject("Wrong Old Password")
                    else{
                        changePassword(inputData.userID, inputData.newPassword)
                        .then(message=>resolve(message))
                        .catch(err=>reject(err))
                    }
                })
                
            })
            .catch(err=>reject(err))
        })
    },

    forgotPassword: function (email){
        return new Promise((resolve, reject)=>{
            customModel.Users.findOne({email: email},(err, user)=>{
                if(err) console.error(err);
                if(!user) reject("No user is registered with emailID as", email);
                else{
                    mail.sendResetLink(email)
                    .then(rand=>{
                        var resetLink = new customModel.resetLinks({userID: user._id, randomValue: rand});
                        resetLink.save((err)=>{
                            if(err) console.error(err);
                            resolve("Reset Link Successfully sent");
                        })
                    })
                }
            })
        })
    },

    verifyResetLink: function(randomValue){
        return new Promise((resolve, reject)=>{
            customModel.resetLinks.findOne({randomValue: randomValue},(err, resetLink)=>{
                if(err) console.error(err);
                if(!resetLink) reject("Invalid Link");
                else resolve("Valid Link");
            })
        })
    },

    resetPassword: function(resetInput){
        return new Promise((resolve, reject)=>{
            checkPasswordsConsistency(resetInput.password, resetInput.confirmPassword)
            .then((message)=>{
                customModel.resetLinks.findOne({randomValue: resetInput.randomValue},(err, resetLink)=>{
                    if(err) console.error(err);
                    if(!resetLink) reject("ERROR");
                    changePassword(resetLink.userID, resetInput.password)
                    .then((message)=>{
                        resetLink.remove();
                        resolve(message)
                    })
                    .catch((err)=>reject(err));
                })
            })
            .catch((err)=>reject(err))
        })
    },

    del: function(response){
        return new Promise((resolve, reject)=>{
            var userID = new ObjectID(response.id);
            if(response.order === "delete"){
                customModel.unapprovedUsers.findById(userID, (err, user)=>{
                    if(err) console.error(err);
                    Promise.all([
                        updateChildrensOf(user),
                        updateRequestsAssociatedWith(user)
                    ])
                    .then(()=>{
                        user.remove();
                        resolve("Deleted User");
                    })
                })
            }else if(response.order === ""){
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