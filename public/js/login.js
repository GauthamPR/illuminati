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
    popupHolder.style.display = "grid";
    setTimeout(()=>{
        popupHolder.style.display = "none";
        popup.classList.remove("fail");
        if(info.url)
            window.location.replace(info.url)
    }, timeOut);
}

function toggleBlock(){
    var submitButton = document.getElementById("signin-button");
    submitButton.classList.toggle("loading");
    if(!submitButton.disabled)
        submitButton.innerText = "Signing In...";
    else
        submitButton.innerText = "Sign In";
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
            }else if(xhr.status === 401){
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
    var loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", event=>{
        event.preventDefault();
        toggleBlock();
        var admNo       = document.getElementById("admNo").value;
        var password    = document.getElementById("password").value;
        var reqInfo     = {
            url: "/login",
            body: [
                ["admNo", admNo],
                ["password", password]
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