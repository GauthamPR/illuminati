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

function parseTime(start, end){
    var start = new Date(start);
    var end = new Date(end);
    var date = start.toLocaleDateString();
    var startTime = start.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    var endTime = end.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    return(date + " (" + startTime + " - " + endTime + ")");
}

Promise.all([initialContentLoaded(), getData('/getData/user-approvals')])
.then(data=>data[1])
.then(jsonObject=>{
    var form=document.getElementById("pending-holder")
    jsonObject.pendingApprovals.forEach(jsonData=>{
        var subContainer2=document.createElement("div")
        subContainer2.setAttribute("class","subContainer2")

        var appButton=document.createElement("button")
        appButton.setAttribute("type","submit")
        appButton.setAttribute("name",jsonData.id)
        appButton.innerText="Approve"
        appButton.setAttribute("value","approve")
        appButton.setAttribute("onclick","pRequest(this)")
        appButton.classList.add("permissionButton")

        var denyButton=document.createElement("button")
        denyButton.setAttribute("type","submit")
        denyButton.setAttribute("name",jsonData.id)
        denyButton.innerText="Deny"
        denyButton.setAttribute("value","deny")
        denyButton.setAttribute("onclick","pRequest(this)")
        denyButton.classList.add("permissionButton")

       

        var desc=document.createElement("div")
        desc.innerText="Description: "+ jsonData.eventDesc
        var appby=document.createElement("div")
        var approverdata
        if (jsonData.approved_by.length==0)
             approverdata="None"
       else
        {
            approverdata=jsonData.approved_by.reduce((total,elem)=>{
                var temp=elem.name+" ("+elem.admNo +")"
                total.push(temp);
                return total
            },[]).join(", ")
        }
        appby.innerText="Approved By: " + approverdata


        var subContainer1=document.createElement("div")
        subContainer1.setAttribute("class","subContainer1")

        var panel=document.createElement("div")
        panel.setAttribute("class","panel")

        var hallName=document.createElement("div")
        hallName.innerText=jsonData.hallName
        var dateAndTime=document.createElement("div")
        dateAndTime.innerText=parseTime(jsonData.startTime, jsonData.endTime);
        var eventName=document.createElement("div")
        eventName.innerText=jsonData.eventName
        var status=document.createElement("div")
        status.innerText=jsonData.status
        if (jsonData.status=="PENDING")
            status.setAttribute("class","status pending")
        else if (jsonData.status=="APPROVED")
            status.setAttribute("class","status approved")
        else if (jsonData.status=="DENIED")
            status.setAttribute("class","status denied")

        var container1=document.createElement("div")
        container1.setAttribute("class","container1")
        
        var button=document.createElement("button") 
        button.setAttribute("type","button")
        button.classList.add("accordion")
        

      
        var section=document.createElement("div")
        section.setAttribute("class","section")

        subContainer2.appendChild(appButton)
        subContainer2.appendChild(denyButton)
        subContainer1.appendChild(desc)
        subContainer1.appendChild(appby)
        panel.appendChild(subContainer1)
        panel.appendChild(subContainer2)
        container1.appendChild(eventName)
        container1.appendChild(hallName)
        container1.appendChild(dateAndTime)
        container1.appendChild(status)
        button.appendChild(container1)
        section.appendChild(button)
        section.appendChild(panel)
        form.appendChild(section)
    })

    var form=document.getElementById("my-approval")
    jsonObject.allApprovals.forEach(jsonData=>{

        var desc=document.createElement("div")
        desc.innerText="Description: "+ jsonData.eventDesc
        var appby=document.createElement("div")
        var approverdata
        if (jsonData.approved_by==[])
             approverdata="None"
       else
        {
            approverdata=jsonData.approved_by.reduce((total,elem)=>{
                var temp=elem.name+" ("+elem.admNo +")"
                total.push(temp);
                return total
            },[]).join(", ")
        }
        appby.innerText="Approved By: " + approverdata

        if(jsonData.denied_by!=null)
        {
            var denyData = document.createElement("div")
            denyData.innerText="Denied By: " + jsonData.denied_by.name + " (" +jsonData.denied_by.admNo +")"
        }


        var subcontainer1=document.createElement("div")
        subcontainer1.setAttribute("class","subContainer1")

        var panel=document.createElement("div")
        panel.setAttribute("class","panel")

        var eventName=document.createElement("div")
        eventName.innerText=jsonData.eventName
        var hallName=document.createElement("div")
        hallName.innerText=jsonData.hallName
        var dateAndTime=document.createElement("div")
        dateAndTime.innerText=parseTime(jsonData.startTime, jsonData.endTime);
        var eventName=document.createElement("div")
        eventName.innerText=jsonData.eventName
        var status=document.createElement("div")
        status.innerText=jsonData.status
        if (jsonData.status=="PENDING")
            status.setAttribute("class","status pending")
        else if (jsonData.status=="APPROVED")
            status.setAttribute("class","status approved")
        else if (jsonData.status=="DENIED")
            status.setAttribute("class","status denied")
    
        var container1=document.createElement("div")
        container1.setAttribute("class","container1")
        
        var button=document.createElement("button") 
        button.setAttribute("type","button")
        button.setAttribute("class","accordion")
      
        var section=document.createElement("div")
        section.setAttribute("class","section")

        subcontainer1.appendChild(desc)
        subcontainer1.appendChild(appby)
        if (jsonData.denied_by!=null)
        {
            subcontainer1.appendChild(denyData)
        }
        panel.appendChild(subcontainer1)
        container1.appendChild(eventName)
        container1.appendChild(hallName)
        container1.appendChild(dateAndTime)
        container1.appendChild(status)
        button.appendChild(container1)
        section.appendChild(button)
        section.appendChild(panel)
        form.appendChild(section)

    })
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.display === "grid") {
          this.parentNode.style.border = "1px solid #ccc";
          panel.style.display = "none";
        } else {
          this.parentNode.style.border = "1px solid #ccc";
          panel.style.display = "grid";
        }
      });
    }
})
.catch((err)=>{
    console.log(err);
})
function showPopup(info){
    var timeOut;
    var popupHolder = document.getElementById("popup-holder");
    var popup = document.getElementById("popup");
    if(info.success){
        popup.innerText = info.message;
        popup.classList.add("success");
        timeOut = 1000;
    }else{
        popup.innerText = info.error;
        popup.classList.add("fail");
        timeOut = 3000;
    }
    popup.classList.add("fadeIn");
    popupHolder.style.display = "block";
    setTimeout(()=>{
        popupHolder.style.display = "none";
        popup.classList.remove("fail");
        if(info.url)
            window.location.replace(info.url)
    }, timeOut);
}

function toggleBlock(element){  
    
    element.classList.toggle("loading");
    if(element.value == "Approve") {
        if(!element.disabled)
            element.innerText = "Approving...";
        else
            element.innerText = "Approve";
        element.disabled = !element.disabled; 

    } else if(element.value=="Deny") {
        if(!element.disabled)
            element.innerText = "Denying..." ;
        else
            element.innerText = "Deny" ;
        element.disabled = !element.disabled;  
    }
} 

function postRequest(reqInfo){
    return new Promise((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open('POST', reqInfo.url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function(){
            if(xhr.status === 200){
                var response = JSON.parse(xhr.response);
                resolve({success: true, message: response.message, url: response.redirectLink})
            }else if(xhr.status === 406){
                var response = JSON.parse(xhr.response);
                resolve({success: false, error: response.error})
            }else{
                reject(xhr.response);
            }
        }
        var body = (reqInfo.body.map(e=>e.join("=")).join("&"));
        xhr.send(body);
    })
}
function pRequest(element) {
    toggleBlock(element);
    
    
    var reqInfo = {
        url: "/my-approvals",
        body: [
            ["name", element.name],
            ["value", element.value]
        ]
    } 
    postRequest(reqInfo)
    .then(response=>{
        if(!response.success)
            toggleBlock(element);
        showPopup(response);
    })
    .catch((response)=>{
        showPopup({success: false, error: "Unrecognised Response"})
    })
    console.log(element);
}



document.addEventListener("DOMContentLoaded", ()=>{
    var myapprovalForm = document.getElementById("pending-holder");
    myapprovalForm.addEventListener("submit", event=>{
        event.preventDefault();
    })
   
})
