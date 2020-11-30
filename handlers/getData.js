const customModel = require('./models.js');

module.exports = {
    requests: function requests(userData){
        return new Promise((resolve, reject)=>{
            var returnData = [];
            customModel.Requests.aggregate([
                { $match: { requestor: userData._id } },
                { $lookup: { from: 'halls', localField: 'hallID', foreignField: '_id', as: 'hallDetails' } },
                { $lookup: { from: 'users', localField: 'next_approver', foreignField: '_id', as:'user'}}
            ], (err, data)=>{
                    if(err) reject(err);
                    data.forEach((elem)=>{
                        var jsonObject = {
                            id: elem._id.toString(),
                            hallName: elem.hallDetails[0].name,
                            startTime: elem.from,
                            endTime: elem.to,
                            eventName: elem.eventName,
                            eventDesc: elem.eventDesc,
                            status: elem.status,
                            nextApproverAdmNo: elem.user[0].admNo,
                            nextApproverName: elem.user[0].name
                        }
                        returnData.push(jsonObject);
                    })
                    resolve(returnData);
                }
            );
        })
    }
}