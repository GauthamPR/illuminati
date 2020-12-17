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
        console.log(hallno)
    })
})

.catch((err)=>{
    console.log(err);
})