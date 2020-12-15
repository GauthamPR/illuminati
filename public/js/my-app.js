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

Promise.all([initialContentLoaded(), getData('/getData/user-approvals')])
.then(data=>data[1])
.then(jsonArray=>{
    var form=document.getElementById("pending-holder")
    jsonArray.forEach(jsonData=>{

        var subcontainer2=document.createElement("div")
        subcontainer2.setAttribute("class","subContainer2")

        var appButton=document.createElement("button")
        appButton.setAttribute("type","submit")
        appButton.setAttribute("name",jsonData.id)
        appButton.innerText="Approve"
        appButton.setAttribute("value","approve")

        var denyButton=document.createElement("button")
        denyButton.setAttribute("type","submit")
        denyButton.setAttribute("name",jsonData.id)
        denyButton.innerText="Deny"
        denyButton.setAttribute("value","deny")
       

        var desc=document.createElement("div")
        desc.innerText="Description: "+ jsonData.eventDesc
        var appby=document.createElement("div")
        var approverdata
        if (jsonData.approved_by==[])
             approverdata="None"
       else
            approverdata=jsonData.approved_by.reduce(elem=>{

            },[])
        appby.innerText="Approved By:" + approverdata

        var subcontainer1=document.createElement("div")
        subcontainer1.setAttribute("class","subContainer1")

        var panel=document.createElement("div")
        panel.setAttribute("class","panel")

        var hallName=document.createElement("div")
        hallName.innerText=jsonData.hallName
        var dateAndTime=document.createElement("div")
        dateAndTime.innerText=jsonData.startTime
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

        subcontainer2.appendChild(appButton)
        subcontainer2.appendChild(denyButton)
        subcontainer1.appendChild(desc)
        subcontainer1.appendChild(appby)
        panel.appendChild(subcontainer1)
        panel.appendChild(subcontainer2)
        container1.appendChild(hallName)
        container1.appendChild(dateAndTime)
        container1.appendChild(eventName)
        container1.appendChild(status)
        button.appendChild(container1)
        section.appendChild(button)
        section.appendChild(panel)
        form.appendChild(section)
        console.log(jsonData)
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