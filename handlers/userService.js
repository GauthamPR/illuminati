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
                    customModel.newUsers.findOne({admNo: admNo}, (err, user)=>{
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
            var newUser = new customModel.newUsers(userData);
            parentAdmNo = parseInt(userData.parent.match(/\((.*)\)/)[1]);
            Promise.all([
                findParentID(parentAdmNo),
                passwordCheck(userData.password, userData.confirmPassword),
                checkIfUserExists(newUser.admNo), 
                checkIfUserAppliedBefore(newUser.admNo),
            ])
                .then(messages=>{
                    newUser.status = "PRE-VERIFICATION";
                    newUser.password = bcrypt.hashSync(userData.password, 12);
                    newUser.parentID = messages[0];
                    mail.send(newUser.email)
                        .then(otp=>{
                            newUser.otp = otp;
                            newUser.save((err, doc)=>{
                                if(err) console.error(err);
                                resolve(newUser.email);
                            })
                        })
                })
                .catch(err=>reject(err));
        })
    },

    verify: function(email, otp){
        return new Promise((resolve, reject)=>{
            customModel.newUsers.findOne({email: email}, (err, newUser)=>{
                if(err) console.error(err);
                if(!newUser) reject('Email: ' + email + ' not found');
                else if(newUser.otp !== otp) reject('Invalid Otp')
                else{
                    var user = new customModel.Users(newUser.toJSON());
                    user.save((err)=> {
                        if(err) console.error(err);
                        newUser.remove((err)=>{
                            if(err) console.error(err);
                        })
                        resolve('Account Verfied Succesfully');
                })
                }
            })
        })
    }
}