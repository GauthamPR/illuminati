const customModel = require('./models.js');
const bcrypt = require('bcrypt');
const mail = require('./mailer.js');

module.exports = {
    add: function(userData){
        return new Promise((resolve, reject)=>{
            function passwordCheck(password, confirmPassword){
                return new Promise((resolve, reject)=>{
                    var regex = new RegExp(/^[\w`~@!#$*%^&*()]*$/);
                    if(password !== confirmPassword)
                        reject("Passwords mismatch");
                    else if(!regex.test(password))
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
            var tempUser = new customModel.tempUsers(userData);
            parentAdmNo = parseInt(userData.parent.match(/\((.*)\)/)[1]);
            Promise.all([
                findParentID(parentAdmNo),
                passwordCheck(userData.password, userData.confirmPassword),
                checkIfUserExists(tempUser.admNo), 
                checkIfUserAppliedBefore(tempUser.admNo),
                removeUserFromTemp(tempUser.admNo, tempUser.email)
            ])
                .then(messages=>{
                    tempUser.status = "PRE-VERIFICATION";
                    tempUser.password = bcrypt.hashSync(userData.password, 12);
                    tempUser.parentID = messages[0];
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
    }
}