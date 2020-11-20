window.addEventListener("DOMContentLoaded", (event)=>{
    var userName, level;
    document.cookie.split('; ').forEach((elem)=>{
        if(elem.split('=')[0] == "User Name"){
            userName = elem.split('=')[1];
        }else if(elem.split('=')[0] == "Level"){
            level = elem.split('=')[1];
        }
    })
    console.log(userName, level);
})