const prayerTimesContainer = document.querySelector('.prayer-times');
const cityValue = document.getElementById('input-city').value;

document.getElementById('input-city').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        fetchPrayerTimes();
    } 
});

function fetchPrayerTimes() {
    const cityValue = document.getElementById('input-city').value;

    fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${cityValue}`)
    .then(response => {
        if (!response.ok) {
            if (response.status === 400 || response.status === 404) {
                prayerTimesContainer.innerHTML = ""; 
                prayerTimesContainer.innerHTML += `Please, enter an existing city.`;
                prayerTimesContainer.style.color = 'red';
                throw new Error('City not found in the database.');
            } else {
                throw new Error('An error occurred while fetching data.');
            }
        }
            return response.json(); 
        })
        .then(data => {
            prayerTimesContainer.innerHTML = ""; 

            createPrayersList(data); 

            document.getElementById('input-city').value = "";
        })
        .catch(error => {
            console.error('An error occurred:', error.message); 
            error.textContent = "<p>An error occurred while fetching data. Please try again later.</p>";
        });
}

function createPrayersList(prayer) {
    const date = prayer.data.date.readable;
    const fajr = prayer.data.timings.Fajr;
    const shurooq = prayer.data.timings.Sunrise;
    const dhuhr = prayer.data.timings.Dhuhr;
    const asr = prayer.data.timings.Asr;
    const maghrib = prayer.data.timings.Maghrib;
    const isha = prayer.data.timings.Isha;

    const prayerList = document.createElement('div');
    prayerList.classList.add('prayer-times', 'item');

    const cityValue = document.getElementById('input-city').value;
    const formattedCityValue = cityValue[0].toUpperCase() + cityValue.slice(1);

    prayerList.innerHTML = `
        <div class="prayer-info">
            <h3>${date} at <strong>${formattedCityValue}</strong></h3>
            <center><table>
                <tr>
                    <td>Fajr:</td>
                    <td>${fajr} am</td> 
                </tr>
                <tr>
                    <td>Shurooq:</td>
                    <td>${shurooq} am</td>
                </tr>
                <tr>
                    <td>Dhuhr:</td>
                    <td>${dhuhr} pm</td>
                </tr>
                <tr>
                    <td>Asr:</td>
                    <td>${asr} pm</td>
                </tr>
                <tr>
                    <td>Maghrib:</td>
                    <td>${maghrib} pm</td>
                </tr>
                <tr>
                    <td>Isha:</td>
                    <td>${isha} pm</td>
                </tr>
            </table></center>
        </div>
    `;

    prayerTimesContainer.appendChild(prayerList);

    const currentTime = new Date();
    let nextPrayerName = "";
    let nextPrayerTime = null;

    for (const prayerName in prayer.data.timings) {
        const prayerTime = new Date(date + " " + prayer.data.timings[prayerName]);
        if (prayerTime > currentTime) {
            nextPrayerName = prayerName;
            nextPrayerTime = prayerTime;
            break;
        }
    }

    if (nextPrayerTime) {
        const timeDiff = nextPrayerTime - currentTime;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        const timeRemaining = `${hours}:${minutes}:${seconds}`;
    
        const timeRemainingDiv = document.createElement('div');
        timeRemainingDiv.classList.add('prayer-times', 'item');
        timeRemainingDiv.innerHTML = `
            <div class="prayer-info">
                <h3 style="font-weight: lighter">Time left for next prayer (${nextPrayerName}):</h3>
                <p id="countdown" style="color: rgba(255, 58, 58, 0.752); font-size: 18pt;">${timeRemaining}</p>
            </div>
        `;
    
        prayerTimesContainer.appendChild(timeRemainingDiv);
    
        // Countdown timer
        const countdownElement = document.getElementById('countdown');
    
        function updateCountdown() {
            const currentTime = new Date();
            const timeDiff = nextPrayerTime - currentTime;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
            if (hours === 2 && minutes === 1 && seconds === 0) {
                clearInterval(intervalId);
                countdownElement.textContent = `It's time to pray! 🤲`;

                function textFlashing() {
                    countdownElement.style.visibility = (countdownElement.style.visibility === 'hidden') ? 'visible' : 'hidden';
                }
                setInterval(textFlashing, 300);
            } else {
                countdownElement.textContent = `${formatTime(hours)} h: ${formatTime(minutes)} m: ${formatTime(seconds)} s`;
            }
        }
        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);
    }
}


function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[now.getDay()];

    let formattedTime;
    if (hours >= 0 && hours < 12) {
        formattedTime = `${formatTime(currentDay)}<br>${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)} am`;
    } else {
        formattedTime = `${formatTime(currentDay)}<br>${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)} pm`;
    }

    document.getElementById('countup').innerHTML = formattedTime;
}

setInterval(updateClock, 1000);
updateClock();
