const customModel = require('./models.js');

module.exports = {
    saveRequest: function saveRequest(requestData, userData){
        var request = new customModel.Requests(requestData);
        customModel.Halls.findOne({name: requestData.hallName}, (err, hall)=>{
            if(err) console.error(err);
            request.hallID = hall._id;
        })
        request.from = new Date(requestData.eventDate + " " + requestData.startTime);
        request.to = new Date(requestData.eventDate + " " + requestData.endTime);
        request.requestor = userData._id;
        request.status = "PENDING";
        request.next_approver = userData.parentID;

        request.save((err, data)=>{
            if(err) return console.log(err);
            console.log(data);
        })
    }
}