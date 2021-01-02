function showPopup(info){
    var timeOut;
    var popup = document.getElementById("popup");
    if(info.success){
        popup.innerText = info.message;
        popup.classList.add("success");
        timeOut = 1000;
    }else{
        popup.innerText = info.error;
        popup.classList.add("fail");
        timeOut = 2000;
    }
    popup.classList.add("fadeIn");
    popup.style.display = "block";
    setTimeout(()=>{
        popup.style.display = "none";
        popup.classList.remove("fail");
        if(info.url)
            window.location.replace(info.url)
    }, timeOut);
}

function postRequest(reqInfo){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', reqInfo.url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function(){
        if(xhr.status === 200){
            var response = JSON.parse(xhr.response);
            showPopup({success: true, message: response.message, url: response.redirectLink})
        }else if(xhr.status === 401){
            var response = JSON.parse(xhr.response);
            showPopup({success: false, error: response.error})
        }else{
            showPopup({success: false, error: "Unrecognised Error"})
        }
    }
    var body = (reqInfo.body.map(e=>e.join("=")).join("&"));
    xhr.send(body);
}

document.addEventListener("DOMContentLoaded", ()=>{
    var loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", event=>{
        event.preventDefault();
        var admNo       = document.getElementById("admNo").value;
        var password    = document.getElementById("password").value;
        var reqInfo     = {
            url: "/login",
            body: [
                ["admNo", admNo],
                ["password", password]
            ]
        } 
        postRequest(reqInfo);
    })
})