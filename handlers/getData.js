const { request } = require('express');
const customModel = require('./models.js');

module.exports = {
    requests: function requests(userData){
        return new Promise(resolve=> {
            var returnData = [];
            customModel.Requests.aggregate([
                { $match: { requestor: userData._id } },
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails' } },
                { $lookup: { from: 'users', localField: 'next_approver', foreignField: '_id', as:'user'}},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as:'historyOfApproval' }}
            ], (err, data)=>{
                    if(err) console.error(err);
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
                    return returnData;
                }
            )
            .then(data=>resolve(data));
        })
    },

    approvals: function approvals(userData){
        return new Promise((resolve)=>{
            var requiredApprovals = [];
            customModel.Requests.aggregate([
                { $match: { next_approver: userData._id}},
                { $lookup: { from: 'users', localField: 'requestor', foreignField: '_id', as: 'user'}},
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails'}},
                { $lookup: { from: 'users', localField: 'approved_by', foreignField: '_id', as: 'historyOfApproval' }}
            ], (err, data)=>{
                if(err) console.error(err);
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
                return requiredApprovals;
            })
            .then(requiredApprovals =>{
                resolve({requiredApprovals: requiredApprovals});
            })
        })
    }
}