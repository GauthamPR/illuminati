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


Promise.all([initialContentLoaded(), getData('/getData/supervisors')])
.then(data=>data[1])
.then(jsonArray=>{
    var sv=document.getElementById("supervisor")
    
    var nosv=document.createElement("option")
    nosv.setAttribute("value","none")
    nosv.innerText="No Supervisor"
    sv.appendChild(nosv)


    jsonArray.forEach(supervisor=>{
        var option=document.createElement("option")
        option.setAttribute("value",supervisor.id)
        option.innerText=supervisor.name
        sv.appendChild(option)
    })
})

  .catch((err)=>{
    console.log(err);
})