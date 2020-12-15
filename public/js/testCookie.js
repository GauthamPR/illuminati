window.addEventListener("DOMContentLoaded", (event)=>{
    var userName, role;
    document.cookie.split('; ').forEach((elem)=>{
        if(elem.split('=')[0] == "username"){
            userName = elem.split('=')[1];
        }else if(elem.split('=')[0] == "role"){
            role = elem.split('=')[1];
        }
    })
})