const { request } = require('express');
const customModel = require('./models.js');

module.exports = {
    requests: function requests(userData){
        return new Promise((resolve, reject)=>{
            var returnData = [];
            customModel.Requests.aggregate([
                { $match: { requestor: userData._id } },
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails' } },
                { $lookup: { from: 'users', localField: 'next_approver', foreignField: '_id', as:'user'}},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as:'historyOfApproval' }}
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
                            approved_by: []
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

    approvals: function approvals(userData){
        return new Promise((resolve, reject)=>{
            var requiredApprovals = [];
            customModel.Requests.aggregate([
                { $match: { next_approver: userData._id}},
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

    previous: function(numberOfRequests){
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

    upcoming: function(numberOfRequests){
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
    }
}