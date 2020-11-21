const customModel = require('./models.js');

module.exports = function(){
    saveRequest: function saveRequest(requestData, userData){
        var request = customModel.Requests(requestData);
    }
}