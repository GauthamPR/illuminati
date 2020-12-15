function initialContentLoaded(){
    return new Promise((resolve)=>{
        window.addEventListener("DOMContentLoaded", ()=>{
            resolve("CONTENT LOADED");
        })
    })
}

function getData(url){
    return new Promise((resolve)=>{
        fetch(url)
        .then(response => resolve(response.json()))
    })
}

Promise.all([initialContentLoaded(), getData('/getData/manage')])
.then(data=>data[1].unapprovedUsers)
.then(jsonData=>{
    var table = document.getElementById("table");
    jsonData.forEach(user=>{
        var userDetails = document.createElement("span");
        userDetails.innerText = "Name: " + user.name + "\tEmail" + user.email;

        var approveButton = document.createElement("button");
        approveButton.setAttribute("type", "submit");
        approveButton.setAttribute("name", user.id);
        approveButton.setAttribute("value", "approve");
        approveButton.innerText = "Approve";
        
        var denyButton = document.createElement("button");
        denyButton.setAttribute("type", "submit");
        denyButton.setAttribute("name", user.id);
        denyButton.setAttribute("value", "deny");
        denyButton.innerText = "Deny";

        var containerForEach = document.createElement("div");
        containerForEach.appendChild(userDetails);
        containerForEach.appendChild(approveButton);
        containerForEach.appendChild(denyButton);

        table.appendChild(containerForEach);
    })
})
.catch((err)=>{
    console.log(err);
})