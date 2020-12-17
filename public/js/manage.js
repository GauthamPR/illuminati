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

Promise.all([initialContentLoaded(), getData('/getData/manage')])
.then(data=>data[1])
.then(jsonData=>{

console.log(jsonData)
    var unapproved=document.getElementById("unapprove")
    jsonData.unapprovedUsers.forEach(user => {
        var row=document.createElement("div")
        row.setAttribute("class","row user")

        var name=document.createElement("div")
        name.innerText=user.name

        var email=document.createElement("div")
        email.innerText=user.email

        var designation=document.createElement("div")
        designation.innerText=user.designation

        var buttonHolder = document.createElement("div")
        var approve= document.createElement("button")
        approve.setAttribute("type","submit")
        approve.setAttribute("name",user.id)
        approve.setAttribute("value","accept")
        approve.innerText="Approve"

        var deny= document.createElement("button")
        deny.setAttribute("type","submit")
        deny.setAttribute("name",user.id)
        deny.setAttribute("value","deny")
        deny.innerText="Deny"

        buttonHolder.appendChild(approve)
        buttonHolder.appendChild(deny)
        row.appendChild(name)
        row.appendChild(email)
        row.appendChild(designation)
        row.appendChild(buttonHolder)
        unapproved.appendChild(row)
        
    });
    var subordinates=document.getElementById("subordinates")
    jsonData.children.forEach(user => {
        var row=document.createElement("div")
        row.setAttribute("class","row user")

        var name=document.createElement("div")
        name.innerText=user.name

        var email=document.createElement("div")
        email.innerText=user.email

        var designation=document.createElement("div")
        designation.innerText=user.designation

        var buttonHolder = document.createElement("div")
        var replace= document.createElement("button")
        replace.setAttribute("type","button")
        replace.setAttribute("name",user.id)
        replace.setAttribute("value","replace")
        replace.innerText="Approve"

        var del= document.createElement("button")
        del.setAttribute("type","submit")
        del.setAttribute("name",user.id)
        del.setAttribute("value","delete")
        del.innerText="Delete"

        buttonHolder.appendChild(replace)
        buttonHolder.appendChild(del)
        row.appendChild(name)
        row.appendChild(email)
        row.appendChild(designation)
        row.appendChild(buttonHolder)
        subordinates.appendChild(row)

        
    });
})
.catch((err)=>{
    console.log(err);
})