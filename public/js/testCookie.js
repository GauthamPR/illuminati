window.addEventListener("DOMContentLoaded", (event)=>{
    var userName, role;
    console.log(document.cookie)
    document.cookie.split('; ').forEach((elem)=>{
        if(elem.split('=')[0] == "username"){
            userName = elem.split('=')[1];
        }else if(elem.split('=')[0] == "role"){
            role = elem.split('=')[1];
        }
    })
    console.log(userName,role)
})