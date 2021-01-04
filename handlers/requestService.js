const { ObjectID } = require('mongodb');
const customModel = require('./models.js');

function searchHall(key){
    return new Promise((resolve, reject)=>{
        customModel.Halls.findOne(key, (err, hall)=>{
            if(err) console.error(err);
            resolve(hall);
        })
    })
}

function searchRequests(key){
    return new Promise((resolve, reject)=>{
        customModel.Requests.find(key, (err, requests)=>{
            if(err) console.error(err)
            resolve(requests);
        })
    })
}
module.exports = {
    saveRequest: function saveRequest(requestData, userData){
        return new Promise((resolve, reject)=>{
            var newRequest = new customModel.Requests(requestData);
            searchHall({number: requestData.hallNumber})
            .then(hall=>{
                return new Promise((resolve, reject)=>{
                    searchRequests({hallID: hall._id, status: "APPROVED"})
                    .then(existingRequests=>resolve({hall: hall, existingRequests: existingRequests}))
                })
            })
            .then(data=>{
                var hall = data.hall;
                newRequest.hallID = hall._id;
                newRequest.from = new Date(requestData.eventDate + " " + requestData.startTime);
                newRequest.to = new Date(requestData.eventDate + " " + requestData.endTime);
                newRequest.requestor = userData._id;
                newRequest.status = "PENDING";
                newRequest.next_approver = userData.parentID;

                var existingRequests = data.existingRequests;
                existingRequests.forEach((existingRequest)=>{
                    if(existingRequest.from <= newRequest.from && newRequest.from < existingRequest.to){
                        throw new Error("Time Slot Not available");
                    }else if(existingRequest.from < newRequest.to && newRequest.to <= existingRequest.to){
                        throw new Error("Time Slot Not available");
                    }else if(newRequest.from <= existingRequest.from && existingRequest.to < newRequest.from){
                        throw new Error("Time Slot Not available");
                    }
                })
                
                newRequest.save((err, data)=>{
                    if(err) console.error (err);
                    resolve("Successful");
                })
            })
            .catch(err=>reject(err.message));
        })
    },

    update: function update(values){
        return new Promise((resolve, reject)=>{
            var requestID = new ObjectID(values.requestID);
            if(values.response == "approve"){
                customModel.Requests.aggregate([
                    { $match: {_id: requestID} },
                    { $lookup: {from: 'users', localField: 'next_approver', foreignField: '_id', as: 'user'}},
                    { $lookup: {from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hall'}}
                ], (err, requests)=>{
                    if(err) console.error(err);
                    var regex = new RegExp(/.*HALL_ADMIN.*/);
                    requests.forEach(request=>{
                        if(regex.test(request.user[0].role.join()))
                            request.status="APPROVED";
                        else{
                            if(request.user[0].parentID == null)
                                request.next_approver = request.hall[0].in_charge;
                            else
                                request.next_approver = request.user[0].parentID;
                        }
                        request.approved_by.push(values.userID);
                        customModel.Requests.findByIdAndUpdate(request._id, request, (err, updatedDoc)=>{
                            if(err) console.error(err);
                            resolve("approved");
                        })
                    })
                })
            }else if(values.response == "deny"){
                customModel.Requests.findByIdAndUpdate(values.requestID, { status: "DENIED", denied_by: values.userID}, (err, doc)=>{
                    if(err) console.error(err);
                    resolve("denied")
                })
            }
        })
    },

    del: function(requestID){
        return new Promise((resolve, reject)=>{
            customModel.Requests.findById(requestID, (err, result)=>{
                if(err) console.error(err);
                result.remove();
                resolve("Deleted Request")
            })
        })
    }
}