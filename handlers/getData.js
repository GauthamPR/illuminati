const customModel = require('./models.js');

module.exports = {
    requests: function requests(userData){
        return new Promise((resolve, reject)=>{
            var returnData = [];
            customModel.Requests.aggregate([
                { $match: { requestor: userData._id } },
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails' }},
                { $lookup: { from: 'users', localField: 'next_approver', foreignField: '_id', as: 'user' }},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as: 'historyOfApproval' }},
                { $lookup: { from: 'users', localField: 'denied_by', foreignField: '_id', as: 'deniedUser' }}
            ], (err, data)=>{
                    if(err) reject(err);
                    data.forEach((request)=>{
                        var jsonObject = {
                            id: request._id.toString(),
                            hallName: request.hallDetails[0].name,
                            startTime: request.from,
                            endTime: request.to,
                            eventName: request.eventName,
                            eventDesc: request.eventDesc,
                            status: request.status,
                            approved_by: [],
                            denied_by: null
                        }
                        if(request.deniedUser.length != 0){
                            jsonObject.denied_by = {
                                admNo: request.deniedUser[0].admNo,
                                name: request.deniedUser[0].name
                            };
                        }
                        if(request.user.length != 0){
                            jsonObject.nextApproverAdmNo= request.user[0].admNo;
                            jsonObject.nextApproverName= request.user[0].name;
                        }
                        if(request.historyOfApproval.length != 0){
                            request.historyOfApproval.forEach(personInHistory=>{
                                jsonObject.approved_by.push({
                                    admNo: personInHistory.admNo,
                                    name: personInHistory.name
                                });
                            })
                        }
                        returnData.push(jsonObject);
                    })
                    resolve(returnData);
                }
            )
        })
    },

    allApprovals: function(userData){
        return new Promise((resolve, reject)=>{
            var requiredApprovals = [];
            customModel.Requests.aggregate([
                { $match: {approved_by: {$in: [userData._id]}}
                },
                { $lookup: { from: 'users', localField: 'requestor', foreignField: '_id', as: 'user'}},
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails'}},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as: 'historyOfApproval' }},
                { $lookup: { from: 'users', localField: 'denied_by', foreignField: '_id', as: 'deniedUser' }}
            ], (err, data)=>{
                if(err) reject(err);
                data.forEach(request=>{
                    var jsonObject = {
                        id: request._id.toString(),
                        requestorAdmNo: request.user[0].admNo,
                        requestorName: request.user[0].name,
                        hallName: request.hallDetails[0].name,
                        startTime: request.from,
                        endTime: request.to,
                        eventName: request.eventName,
                        eventDesc: request.eventDesc,
                        status: request.status,
                        approved_by: [],
                        denied_by: null

                        }
                    if(request.deniedUser.length != 0){
                        jsonObject.denied_by = {
                            admNo: request.deniedUser[0].admNo,
                            name: request.deniedUser[0].name
                        };
                    }
                    if(request.historyOfApproval.length != 0){
                        request.historyOfApproval.forEach(personInHistory=>{
                            jsonObject.approved_by.push({
                                admNo: personInHistory.admNo,
                                name: personInHistory.name
                            });
                        })
                    }
                    requiredApprovals.push(jsonObject);
                })
                resolve(requiredApprovals);
            })
        })
    },

    pendingApprovals: function (userData){
        return new Promise((resolve, reject)=>{
            var requiredApprovals = [];
            customModel.Requests.aggregate([
                { $match: { $and: [{next_approver: userData._id}, {status: "PENDING"}]}
                },
                { $lookup: { from: 'users', localField: 'requestor', foreignField: '_id', as: 'user'}},
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails'}},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as: 'historyOfApproval' }}
            ], (err, data)=>{
                if(err) reject(err);
                data.forEach(request=>{
                    var jsonObject = {
                        id: request._id.toString(),
                        requestorAdmNo: request.user[0].admNo,
                        requestorName: request.user[0].name,
                        hallName: request.hallDetails[0].name,
                        startTime: request.from,
                        endTime: request.to,
                        eventName: request.eventName,
                        eventDesc: request.eventDesc,
                        status: request.status,
                        approved_by: []
                    }
                    if(request.historyOfApproval.length != 0){
                        request.historyOfApproval.forEach(personInHistory=>{
                            jsonObject.approved_by.push({
                                admNo: personInHistory.admNo,
                                name: personInHistory.name
                            });
                        })
                    }
                    requiredApprovals.push(jsonObject);
                })
                resolve(requiredApprovals);
            })
        })
    },

    previousEvents: function(numberOfRequests){
        return new Promise((resolve, reject)=>{
            var previousEvents=[];
            customModel.Requests.aggregate([
                { $match: { 
                    $and:[
                        {to: {$lt : new Date(Date.now())} },
                        { status: "APPROVED"}
                    ]}
                },
                { $lookup: { from: 'users', localField: 'requestor', foreignField: '_id', as: 'user'}},
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails'}},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as: 'historyOfApproval' }}
            ], (err, data)=>{
                if(err) reject(err);
                data.forEach(request=>{
                    var jsonObject = {
                        id: request._id.toString(),
                        requestorAdmNo: request.user[0].admNo,
                        requestorName: request.user[0].name,
                        hallName: request.hallDetails[0].name,
                        startTime: request.from,
                        endTime: request.to,
                        eventName: request.eventName,
                        eventDesc: request.eventDesc,
                        status: request.status,
                        approved_by: []
                    };
                    if(request.historyOfApproval.length != 0){
                        request.historyOfApproval.forEach(personInHistory=>{
                            jsonObject.approved_by.push({
                                admNo: personInHistory.admNo,
                                name: personInHistory.name
                            });
                        })
                    }
                    if(numberOfRequests == undefined){
                        previousEvents.push(jsonObject);
                    }else{
                        if(previousEvents.length < numberOfRequests)
                            previousEvents.push(jsonObject);
                    }
                })
                resolve(previousEvents);
            })
        })
    },

    upcomingEvents: function(numberOfRequests){
        return new Promise((resolve, reject)=>{
            var upcomingEvents = [];
            customModel.Requests.aggregate([
                { $match: { 
                    $and:[
                        {from: {$gt : new Date(Date.now())} },
                        { status: "APPROVED"}
                    ]}
                },
                { $lookup: { from: 'users', localField: 'requestor', foreignField: '_id', as: 'user'}},
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails'}},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as: 'historyOfApproval' }}
            ], (err, data)=>{
                if(err) reject(err);
                data.forEach(request=>{
                    var jsonObject = {
                        id: request._id.toString(),
                        requestorAdmNo: request.user[0].admNo,
                        requestorName: request.user[0].name,
                        hallName: request.hallDetails[0].name,
                        startTime: request.from,
                        endTime: request.to,
                        eventName: request.eventName,
                        eventDesc: request.eventDesc,
                        status: request.status,
                        approved_by: []
                    }
                    if(request.historyOfApproval.length != 0){
                        request.historyOfApproval.forEach(personInHistory=>{
                            jsonObject.approved_by.push({
                                admNo: personInHistory.admNo,
                                name: personInHistory.name
                            });
                        })
                    }
                    if(numberOfRequests == undefined){
                        upcomingEvents.push(jsonObject);
                    }else{
                        if(upcomingEvents.length < numberOfRequests)
                            upcomingEvents.push(jsonObject);
                    }
                })
                resolve(upcomingEvents);
            })
        })
    },
    
    unapprovedUsers: function(user){
        return new Promise((resolve, reject)=>{
            var parentID = user.role[0]=="DATABASE_ADMIN"? null : user._id;
            customModel.unapprovedUsers.find({parentID: parentID},(err, users)=>{
                if(err) console.error(err);
                resolve(users.map(user=>{
                    return({
                        id: user._id.toString(),
                        admNo: user.admNo,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        designation: user.designation
                    })
                }));
            })
        })
    },

    children: function(user){
        return new Promise((resolve, reject)=>{
            var parentID = user.role[0]=="DATABASE_ADMIN"? null : user._id;
            customModel.Users.find({parentID: parentID, role : {$nin: ["DATABASE_ADMIN"]}}, (err, children)=>{
                if(err) console.error(err);
                resolve(children.map(child=>{
                    return({
                        id: child._id.toString(),
                        admNo: child.admNo,
                        name: child.name,
                        email: child.email,
                        role: child.role,
                        designation: child.designation
                    })
                }));
            })
        })
    },

    supervisors: function(){
        return new Promise((resolve, reject)=>{
            customModel.Users.find({role: "TEACHER"}, (err, supervisors)=>{
                if(err) console.error(err);
                resolve(supervisors.map(supervisor=>{
                   return({id:supervisor.admNo,name:supervisor.name})
                }
                ));
            })
        })
    },

    halls: function(){
        return new Promise((resolve, reject)=>{
            customModel.Halls.find({}, (err, halls)=>{
                if(err) console.error(err);
                resolve(halls.map(hall=>{
                    return{
                        number: hall.number,
                        name: hall.name
                    }
                }))
            })
        })
    }
}