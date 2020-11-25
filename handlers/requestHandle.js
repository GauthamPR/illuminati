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
    }
}