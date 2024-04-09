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
            console.log("Données récupérées avec succès :", data);

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
    const dayNumber = prayer.data.date.gregorian.month.number;
    const month = prayer.data.date.gregorian.month.en;
    const year = prayer.data.date.gregorian.year;
    const gregorianDate = month + " " + dayNumber + ", " + year; 

    const hijriDay = prayer.data.date.hijri.day;
    const hijriMonth = prayer.data.date.hijri.month.ar;
    const hijriYear = prayer.data.date.hijri.year;
    const hijriDate = hijriYear + ", " + hijriMonth + " " + hijriDay; 

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
            <h3><strong>${gregorianDate}</strong> at <strong>${formattedCityValue}</strong></h3>
            <h3><strong>${hijriDate}</strong></h3>
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
        const prayerTime = new Date(gregorianDate + " " + prayer.data.timings[prayerName]);
    
        if (prayerTime > currentTime) {
            nextPrayerName = prayerName;
            nextPrayerTime = prayerTime;
            break;
        } else if (prayerName === 'Isha') {
            const tomorrow = new Date(currentTime);
            tomorrow.setDate(tomorrow.getDate() + 1); // Obtenez la date du lendemain
    
            // Obtenez l'heure de Fajr pour le jour suivant
            const fajrNextDay = new Date(tomorrow.toDateString() + " " + prayer.data.timings.Fajr);
    
            nextPrayerName = 'Fajr'; // La prochaine prière est Fajr du jour suivant
            nextPrayerTime = fajrNextDay;
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
                <h3 style="font-weight: lighter" id="nextprayer">Time left for next prayer (${nextPrayerName}):</h3>
                <p id="countdown" style="color: rgba(255, 58, 58, 0.752); font-size: 18pt;">${timeRemaining}</p>
            </div>
        `;
    
        prayerTimesContainer.appendChild(timeRemainingDiv);
    
        function updateCountdown() {
            const currentTime = new Date();
            const timeDiff = nextPrayerTime - currentTime;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
            const countdownElement = document.getElementById('countdown'); 
            if (hours === 0 && minutes === 0 && seconds === 0) {

                let nextPrayerIndex = Object.keys(prayer.data.timings).indexOf(nextPrayerName);
                nextPrayerIndex++; // Passer à la prière suivante

                const nextPrayerKeys = Object.keys(prayer.data.timings);
                let nextPrayerNextName = nextPrayerKeys[nextPrayerIndex];

                // Exclure les valeurs non souhaitées de l'api
                const excludedKeys = ["Sunrise", "Sunset", "Imsak", "Midnight", "Firstthird", "Lastthird"];
                while (excludedKeys.includes(nextPrayerNextName)) {
                    nextPrayerIndex++;
                    if (nextPrayerIndex >= nextPrayerKeys.length) {
                        nextPrayerIndex = 0; // Si on dépasse la dernière prière, revenir à la première
                    }
                    nextPrayerNextName = nextPrayerKeys[nextPrayerIndex];
                    }               

                const nextPrayerNext = document.querySelector('#nextprayer');
                nextPrayerNext.textContent = `The after prayer is (${nextPrayerNextName}).`;
                
                clearInterval(intervalId);
                countdownElement.textContent = `It's time to pray ${nextPrayerName}! 🤲`;
            
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

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

setInterval(updateClock, 1000);
updateClock();
