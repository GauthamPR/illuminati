const { request } = require("express")

module.exports = function(){
    insertNewRequest: function insertNewRequest(requestData){
        var newRequest = {
            room: requestData.roomId,
            requestor: requestData.ob
        }
    }
}