document.addEventListener("DOMContentLoaded", (event) => {
    // show warning modal
    const warningModal = new bootstrap.Modal(('.modal[name="warning"]'), {
        keyboard: false,
        backdrop: "static",
        focus: true,
    });
    warningModal.show();

    // replace links
    var links = document.querySelectorAll('span[name="cleveron"]');
    links.forEach(function (link) {
        var newLink = document.createElement('a');
        newLink.classList = 'link-cleveron';
        newLink.setAttribute('href', 'https://cleveron.ch/');
        newLink.setAttribute('target', '_blank');
        newLink.innerHTML = 'Cleveron <sup><i class="fa-solid fa-up-right-from-square"></i></sup>';

        link.parentNode.replaceChild(newLink, link);
    });

    // display temps
    const groupListDisplay = document.getElementById("groupListDisplay");
    fetch("/willitemp/devices.json")
        .then(response => response.json())
        .then(data => {
            for (const group in data) {
                const groupHeading = document.createElement('h3');
                groupHeading.classList = "mt-4";
                groupHeading.style = "font-weight: bold;";
                groupListDisplay.appendChild(groupHeading);

                const roomsContainer = document.createElement("div");
                roomsContainer.classList = 'room-container';

                let room_temps = [];
                let room_humids = [];
                let promises = [];

                data[group].forEach(room => {
                    let promise = fetch("https://server.cleveron.ch/api/functions/getRoomReportData", {
                        method: "POST",
                        body: JSON.stringify({
                            "roomUuid": room,
                            "_ApplicationId": "NjSUT8HxvCz706ldcwUn"
                        })
                    })
                        .then(response => response.json())
                        .then(roomData => {
                            const roomCard = document.createElement('div');
                            roomCard.className = 'card';
                            roomCard.innerHTML = `
                            <div class="card-body" room-id="${room}">
                                <div class="d-flex" style="flex-direction: row; height: 100%;">
                                    <div class="room-name">
                                        ${roomData.result.roomName}
                                    </div>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">
                                            <span class="badge bg-primary">
                                                <i class="fa-solid fa-droplet-percent" style="color: #ffffff;"></i>
                                                ${Math.round(roomData.result.avgHumLastHour, 2)}%
                                            </span>
                                        </li>
                                        <li class="list-group-item">
                                            <span class="badge bg-danger">
                                                <i class="fa-solid fa-temperature-three-quarters" style="color: #ffffff;"></i>
                                                ${Math.round(roomData.result.avgTempLastHour, 2)}°
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>`;

                            room_temps.push(roomData.result.avgTempLastHour);
                            room_humids.push(roomData.result.avgHumLastHour);

                            roomsContainer.appendChild(roomCard);
                        });
                    promises.push(promise);
                });

                groupListDisplay.appendChild(roomsContainer);
                Promise.all(promises).then(() => {
                    let avgTemps = calculateAverage(room_temps);
                    let avgHumids = calculateAverage(room_humids);
                    groupHeading.innerHTML = `
                    ${group}
                    <span style="font-size: 1rem;" class="badge bg-danger">
                        <i class="fa-solid fa-temperature-three-quarters" style="color: #ffffff;"></i>
                        ${Math.round(avgTemps)}°
                    </span>
                    <span style="font-size: 1rem;" class="badge bg-primary">
                        <i class="fa-solid fa-droplet-percent" style="color: #ffffff;"></i>
                        ${Math.round(avgHumids)}%
                    </span>`;
                });
            }
        });
});

function calculateAverage(number_list) {
    let summe = 0
    for (let i = 0; i < number_list.length; i++) {
        summe += number_list[i];
    }
    return summe / number_list.length;
}