function initialContentLoaded() {
    return new Promise((resolve) => {
        window.addEventListener("DOMContentLoaded", () => {
            resolve("CONTENT LOADED");
        })
    })
}

function getData(url) {
    return new Promise((resolve) => {
        fetch(url)
            .then(response => resolve(response.json()))
    })
}

Promise.all([initialContentLoaded(), getData('/getData/manage')])
    .then(data => data[1])
    .then(jsonData => {
        var unapproved = document.getElementById("unapprove")
        jsonData.unapprovedUsers.forEach(user => {
            var row = document.createElement("div")
            row.setAttribute("class", "row user")

            var name = document.createElement("div")
            name.innerText = user.name

            var email = document.createElement("div")
            email.innerText = user.email

            var designation = document.createElement("div")
            designation.innerText = user.designation

            var buttonHolder = document.createElement("div")
            var approve = document.createElement("button")
            approve.setAttribute("type", "submit")
            approve.setAttribute("name", user.id)
            approve.innerText = "Approve"
            approve.setAttribute("value", "accept")
            approve.setAttribute("onclick", "pUnapproved(this)")
            approve.classList.add("permissionButton")

            var deny = document.createElement("button")
            deny.setAttribute("type", "submit")
            deny.setAttribute("name", user.id)
            deny.innerText = "Deny"
            deny.setAttribute("value", "deny")
            deny.setAttribute("onclick", "pUnapproved(this)")
            deny.classList.add("permissionButton")

            buttonHolder.appendChild(approve)
            buttonHolder.appendChild(deny)
            row.appendChild(name)
            row.appendChild(email)
            row.appendChild(designation)
            row.appendChild(buttonHolder)
            unapproved.appendChild(row)

        });
        var subordinates = document.getElementById("subordinates")
        jsonData.children.forEach(user => {
            var row = document.createElement("div")
            row.setAttribute("class", "row user")

            var name = document.createElement("div")
            name.innerText = user.name

            var email = document.createElement("div")
            email.innerText = user.email

            var designation = document.createElement("div")
            designation.innerText = user.designation

            var buttonHolder = document.createElement("div")
            var replace = document.createElement("button")
            replace.setAttribute("type", "button")
            replace.innerText = "Replace"
            replace.setAttribute("disabled", "true")
            replace.classList.add("permissionButton")
            replace.setAttribute("title", "Not Working")

            var del = document.createElement("button")
            del.setAttribute("type", "submit")
            del.setAttribute("name", user.id)
            del.setAttribute("value", "delete")
            del.innerText = "Delete"
            del.setAttribute("onclick", "pSubordinates(this)")
            del.classList.add("permissionButton")

            buttonHolder.appendChild(replace)
            buttonHolder.appendChild(del)
            row.appendChild(name)
            row.appendChild(email)
            row.appendChild(designation)
            row.appendChild(buttonHolder)
            subordinates.appendChild(row)


        });
    })
    .catch((err) => {
        console.log(err);
    })
function showPopup(info) {
    var timeOut;
    var popupHolder = document.getElementById("popup-holder");
    var popup = document.getElementById("popup");
    if (info.success) {
        popup.innerText = info.message;
        popup.classList.add("success");
        timeOut = 3000;
    } else {
        popup.innerText = info.error;
        popup.classList.add("fail");
        timeOut = 3000;
    }
    popup.classList.add("fadeIn");
    popupHolder.style.display = "block";
    setTimeout(() => {
        popupHolder.style.display = "none";
        popup.classList.remove("fail");
        if (info.url)
            window.location.replace(info.url)
    }, timeOut);
}

function toggleBlock(element) {

    element.classList.toggle("loading");
    if (element.innerText == "Approve") {
        if (!element.disabled)
            element.innerText = "Approving...";
        else
            element.innerText = "Approve";
        element.disabled = !element.disabled;

    } else if (element.innerText == "Deny") {
        if (!element.disabled)
            element.innerText = "Denying...";
        else
            element.innerText = "Deny";
        element.disabled = !element.disabled;
    } else if (element.innerText == "Delete") {
        if (!element.disabled)
            element.innerText = "Deleting...";
        else
            element.innerText = "Delete";
        element.disabled = !element.disabled;
    }
}

function postRequest(reqInfo) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', reqInfo.url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.response);
                resolve({ success: true, message: response.message, url: response.redirectLink })
            } else if (xhr.status === 406) {
                var response = JSON.parse(xhr.response);
                resolve({ success: false, error: response.error })
            } else {
                reject(xhr.response);
            }
        }
        var body = (reqInfo.body.map(e => e.join("=")).join("&"));
        xhr.send(body);
    })
}
function pSubordinates(element) {
    toggleBlock(element);


    var reqInfo = {
        url: "/manage/subordinates",
        body: [
            ["name", element.name],
            ["value", element.value]
        ]
    }

    postRequest(reqInfo)
        .then(response => {
            if (!response.success)
                toggleBlock(element);
            showPopup(response);
        })
        .catch((response) => {
            showPopup({ success: false, error: "Unrecognised Response" })
        })
}

function pUnapproved(element) {
    toggleBlock(element);


    var reqInfo = {
        url: "/manage/unapproved",
        body: [
            ["name", element.name],
            ["value", element.value]
        ]
    }

    postRequest(reqInfo)
        .then(response => {
            if (!response.success)
                toggleBlock(element);
            showPopup(response);
        })
        .catch((response) => {
            showPopup({ success: false, error: "Unrecognised Response" })
        })
}

document.addEventListener("DOMContentLoaded", () => {
    var unapproveForm = document.getElementById("unapprove");
    unapproveForm.addEventListener("submit", event => {
        event.preventDefault();
    })
    var subForm = document.getElementById("subordinates");
    subForm.addEventListener("submit", event => {
        event.preventDefault();
    })

})
