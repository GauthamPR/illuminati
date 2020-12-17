function myFunction(){  
    document.getElementById("myDropdown").classList.toggle("show");
}
window.addEventListener("DOMContentLoaded", (event)=>{
 
    window.onclick = function(e) {
      if (!e.target.matches('.dropbtn')){
        var myDropdown = document.getElementById("myDropdown");
            if (myDropdown.classList.contains('show')){
                myDropdown.classList.remove('show');
            }
        }
    }
    var userName, role;

    document.cookie.split('; ').forEach((elem)=>{
        if(elem.split('=')[0] == "username"){
            userName = elem.split('=')[1].split("%20").join(" ");
        }else if(elem.split('=')[0] == "role"){
            role = elem.split('=')[1];
        }
    })
    var drop = document.getElementById("drop")
    drop.innerText=userName
    if(role=="STUDENT") {
        var addordelete = document.getElementById("add-or-delete")
        addordelete.remove()
        
        var approvelink = document.getElementById("approval-link")
        approvelink.remove()
    
    }
    else if (role=="TEACHER" || role=="HALL_ADMIN"){
        var myreq =document.getElementById("request-link")
        myreq.remove()
    }
})
