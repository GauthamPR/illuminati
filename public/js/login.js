function showPopup(info){
    var popup = document.getElementById("popup");
    popup.innerText = info.message;
    if(info.success){
        popup.classList.add("success");
    }else{
        popup.classList.add("fail");
    }
    popup.style.display = "block";
    setTimeout(()=>{
        popup.style.display = "none";
        if(info.url)
            window.location.replace(info.url)
    }, 2000);
}

function postRequest(reqInfo){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', reqInfo.url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function(){
        if(xhr.status === 200){
            console.log(xhr.response);
            showPopup({success: true, message: "Login Successful", url: "/"})
        }else{
            console.log("error", xhr.status, "ready state", xhr.readyState);
        }
    }
    var body = JSON.stringify(array.map(e=>e.join("=")).join("&"));
    xhr.send(body);
}

document.addEventListener("DOMContentLoaded", ()=>{
    var loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", event=>{
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
        event.preventDefault();
    })
})