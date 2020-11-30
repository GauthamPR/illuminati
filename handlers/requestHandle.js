const { request } = require('express');
const { ObjectID } = require('mongodb');
const customModel = require('./models.js');

module.exports = {
    saveRequest: function saveRequest(requestData, userData){
        return new Promise(async (resolve, reject)=>{
            var newRequest = new customModel.Requests(requestData);
            await customModel.Halls.findOne({name: requestData.hallName}, (err, hall)=>{
                if(err) console.error(err);
                newRequest.hallID = hall._id;
                newRequest.from = new Date(requestData.eventDate + " " + requestData.startTime);
                newRequest.to = new Date(requestData.eventDate + " " + requestData.endTime);
                newRequest.requestor = userData._id;
                newRequest.status = "PENDING";
                newRequest.next_approver = userData.parentID;
            })
            await customModel.Requests.find({hallID: newRequest.hallID}, (err, existingRequests)=>{
                if(err) console.error(err);
                var available = true;
                existingRequests.forEach((existingRequest)=>{
                    if(existingRequest.from <= newRequest.from && newRequest.from < existingRequest.to){
                        available = false;
                    }else if(existingRequest.from < newRequest.to && newRequest.to <= existingRequest.to){
                        available = false;
                    }else if(newRequest.from <= existingRequest.from && existingRequest.to < newRequest.from){
                        available = false;
                    }
                })
                if(!available){
                    reject(new Error("Time Slot Not available"));
                }else{
                    newRequest.save((err, data)=>{
                        if(err) console.error (err);
                        console.log("SUCCESSFUL");
                        resolve("Successful");
                    })
                }
            })
        })
    },
    update: async function update(values){
        var requestID = new ObjectID(values.requestID);
        if(values.response == "approve"){
            await customModel.Requests.aggregate([
                { $match: {_id: requestID} },
                { $lookup: {from: 'users', localField: 'next_approver', foreignField: '_id', as: 'user'}}
            ], (err, requests)=>{
                if(err) console.error(err);
                requests.forEach(request=>{
                    request.next_approver = request.user[0].parentID;
                    if(request.user[0].parentID == null){
                        request.status = "APPROVED"
                    }
                    request.approved_by.push(values.userID);
                    customModel.Requests.findByIdAndUpdate(request._id, request, (err, updatedDoc)=>{
                        if(err) console.error(err);
                    })
                })
            })
        }else if(values.response == "decline"){
            customModel.Requests.findByIdAndUpdate(values.requestID, { status: "DENIED"}, (err, doc)=>{
                if(err) console.error(err);
            })
        }
    }
}