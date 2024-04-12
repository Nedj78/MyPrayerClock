const prayerTimesContainer = document.querySelector('.prayer-times');
const cityValue = document.getElementById('input-city').value;

document.getElementById('input-city').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        fetchPrayerTimes();
    } 
});

const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
}

const fetchPrayerTimes = () => {
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

            console.log("Retrieved data", data);

            prayerTimesContainer.classList.add('fadeIn');

            prayerTimesContainer.innerHTML = ""; 

            createPrayersList(data); 

            document.getElementById('input-city').value = "";
            
        })
        .catch(error => {
            console.error('An error occurred:', error.message); 
            error.textContent = "<p>An error occurred while fetching data. Please try again later.</p>";
        });
}

const createPrayersList = (prayer) => {
    const calculMethod = prayer.data.meta.method.name;

    const date = prayer.data.date.readable;
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
    prayerList.classList.add('prayer-times', 'item', 'fadeIn');

    const cityValue = document.getElementById('input-city').value;
    const formattedCityValue = cityValue[0].toUpperCase() + cityValue.slice(1);

    prayerList.innerHTML = `
        <div class="prayer-info">
            <h3><strong>${gregorianDate}</strong> at <strong>${formattedCityValue}</strong></h3>
            <h3>${hijriDate}</h3>
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
            </table></center><br>
            <p style="font-size:8pt"><strong>Calcul</strong>: ${calculMethod}</p>
        </div>
    `;

    prayerTimesContainer.appendChild(prayerList);

    let prayerTime; 
    const currentTime = new Date();
    let nextPrayerName = "";
    let nextPrayerTime = null;

    for (const currentPrayerName in prayer.data.timings) {
        prayerTime = new Date(date + " " + prayer.data.timings[currentPrayerName]);
        if (prayerTime > currentTime) {
            nextPrayerName = currentPrayerName;
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
        console.log(nextPrayerName)

        nextPrayerName = nextPrayerName === 'Sunset' ? 'Maghrib' : (nextPrayerName === 'Sunrise' ? 'Shuruq' : nextPrayerName);

        const getDay = (date) => {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayIndex = date.getDay();
            return daysOfWeek[dayIndex];
        }
        
        nextPrayerName = getDay(new Date()) === 'Friday' ? 'Jumu\'a' : nextPrayerName;
        
        if (nextPrayerName === 'Firstthird' || nextPrayerName === 'Lastthird' || nextPrayerName === 'Imsak') {
            document.querySelector('#nextPrayerNameHtml').innerHTML = '';
            document.querySelector('#countdown').innerHTML = '';
        }

        let timeRemainingDiv = document.createElement('div');
        timeRemainingDiv.classList.add('prayer-times', 'item');
        timeRemainingDiv.innerHTML = `
            <div class="prayer-info">
                <h3 style="font-weight: lighter" id="nextPrayerNameHtml">Time left for next prayer (${nextPrayerName}):</h3>
                <p id="countdown" style="color: rgba(255, 58, 58, 0.752); font-size: 18pt;">${timeRemaining}</p>
            </div>
        `;
    
        prayerTimesContainer.appendChild(timeRemainingDiv);
    
        // Countdown timer
        const countdownElement = document.getElementById('countdown');
        const nextPrayerNameHtml = document.getElementById('nextPrayerNameHtml');
        const Title = document.querySelector('title');

        const textFlashing = () => {
            countdownElement.style.visibility = (countdownElement.style.visibility === 'hidden') ? 'visible' : 'hidden';
            Title.visibility = (Title.style.visibility === 'hidden') ? 'visible' : 'hidden'; 
        }
    
        function updateCountdown() {
            const currentTime = new Date();
            const timeDiff = nextPrayerTime - currentTime;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
            if (hours === 0 && minutes === 0 && seconds === 0) {
                clearInterval(intervalId);
                countdownElement.textContent = `It's time to pray ${nextPrayerName}! 🤲`;
                Title.textContent = `Time to pray ${nextPrayerName} !`;

                nextPrayerNameHtml.innerHTML = "";
            
                textFlashing();
                setInterval(textFlashing, 300);
            } else {
                countdownElement.textContent = `${formatTime(hours)} h: ${formatTime(minutes)} m: ${formatTime(seconds)} s`;
            }            
        }
        updateCountdown();
    }
    const intervalId = setInterval(updateCountdown, 1000);
}

const updateClock = () => {
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



