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


Promise.all([initialContentLoaded(), getData('/getData/halls')])
.then(data=>data[1])
.then(jsonArray=>{
    var hallNo=document.getElementById("hallno")

    jsonArray.forEach(hallno=>{
        var option=document.createElement("option")
        option.setAttribute("value",hallno.number)
        option.innerText=hallno.name
        hallNo.appendChild(option)
    })
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

function toggleBlock(){
    var submitButton = document.getElementById("submit-button");
    submitButton.classList.toggle("loading");
    if(!submitButton.disabled)
        submitButton.setAttribute("value","Submitting...");
    else
    submitButton.setAttribute("value","Submit");
    submitButton.disabled = !submitButton.disabled;
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

document.addEventListener("DOMContentLoaded", ()=>{
    var newreqForm = document.getElementById("newreq-form");
    newreqForm.addEventListener("submit", event=>{
        event.preventDefault();
        toggleBlock();
        var date         = document.getElementById("date").value;
        var startTime    = document.getElementById("startTime").value;
        var endTime      = document.getElementById("endTime").value;
        var hallNo       = document.getElementById("hallno").value;
        var eventName    = document.getElementById("eventname").value;
        var eventDesc    = document.getElementById("eventdesc").value;
        var organizer    = document.getElementById("organizer").value;
        var reqInfo     = {
            url: "/new-request",
            body: [
                ["eventDate", date],
                ["startTime", startTime],
                ["endTime", endTime],
                ["hallNumber", hallNo],
                ["eventName", eventName],
                ["eventDesc", eventDesc],
                ["organizer", organizer]
            ]
        } 
        postRequest(reqInfo)
        .then(response=>{
            if(!response.success)
                toggleBlock();
            showPopup(response);
        })
        .catch((response)=>{
            showPopup({success: false, error: "Unrecognised Response"})
        })
    })
})