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



function parseDate(time) {
    time = new Date(time);
    var date = time.toLocaleDateString();
    return (date);
}
function parseTime(start, end) {
    var start = new Date(start);
    var end = new Date(end);
    var startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (startTime + " - " + endTime);
}

Promise.all([initialContentLoaded(), getData('/getData/events/5')])
    .then(data => data[1])
    .then(jsonObject => {
        var upcomingEvents = document.getElementById("upcoming-events")
        var previousEvents = document.getElementById("previous-events")
        jsonObject.upcoming.forEach(event => {


            var cardHolder = document.createElement("div")
            cardHolder.setAttribute("class", "card-holder")

            var card = document.createElement("div")
            card.setAttribute("class", "card")


            var eventName = document.createElement("h4")
            eventName.innerText = event.eventName

            var hr = document.createElement("hr")
            var hallName = document.createElement("p")
            hallName.innerText = "Hall :" + event.hallName

            var date = document.createElement("div")
            date.innerText = "Date :" + parseDate(event.startTime)

            var time = document.createElement("div")
            time.setAttribute("class", "time")
            time.innerText = "Time: " + parseTime(event.startTime, event.endTime)


            var desc = document.createElement("div")
            desc.classList.add("desc")


            var eventDesc = document.createElement("div")
            eventDesc.innerText = "Event Description :" + event.eventDesc

            var organizer = document.createElement("div")
            organizer.innerText = "Organizer: " + event.organizer

            card.appendChild(eventName)
            card.appendChild(hr)
            card.appendChild(hallName)
            card.appendChild(date)
            card.appendChild(time)
            cardHolder.appendChild(card)
            desc.appendChild(eventDesc)
            desc.appendChild(organizer)
            cardHolder.appendChild(desc)
            upcomingEvents.appendChild(cardHolder)

        })

        jsonObject.previous.forEach(event => {


            var cardHolder = document.createElement("div")
            cardHolder.setAttribute("class", "card-holder")

            var card = document.createElement("div")
            card.setAttribute("class", "card")

            var eventName = document.createElement("h4")
            eventName.innerText = event.eventName

            var hr = document.createElement("hr")
            var hallName = document.createElement("p")
            hallName.innerText = "Hall :" + event.hallName

            var date = document.createElement("div")
            date.innerText = "Date :" + parseDate(event.startTime)

            var time = document.createElement("div")
            time.setAttribute("class", "time")
            time.innerText = "Time: " + parseTime(event.startTime, event.endTime)

            var desc = document.createElement("div")
            desc.setAttribute("class", "desc")

            var eventDesc = document.createElement("div")
            eventDesc.innerText = "Event Description :" + event.eventDesc
            
            var organizer = document.createElement("div")
            organizer.innerText = "Organizer: " + event.organizer

            card.appendChild(eventName)
            card.appendChild(hr)
            card.appendChild(hallName)
            card.appendChild(date)
            card.appendChild(time)
            cardHolder.appendChild(card)
            desc.appendChild(eventDesc)
            desc.appendChild(organizer)
            cardHolder.appendChild(desc)
            previousEvents.appendChild(cardHolder)

        })


    })
    .catch((err) => {
        console.log(err);
    })