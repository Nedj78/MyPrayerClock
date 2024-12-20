
const prayerTimesContainer = document.querySelector('.prayer-times');

const loadingIcon = document.querySelector('.icon');

function showLoadingIcon() {
    loadingIcon.style.display = 'block'; 

    setTimeout(function() {
        loadingIcon.style.display = 'none';
    }, 800);
}

function hideLoadingIcon() {
    loadingIcon.style.display = 'none';
}

document.getElementById('input-city').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        showLoadingIcon(); 
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
                if (response.status === 404 || response.status === 400) {
                    prayerTimesContainer.textContent = `Please enter an existing city`;
            } 
                prayerTimesContainer.style.color = "red";
                prayerTimesContainer.style.fontSize = "10pt";
                throw new Error('Failed to fetch data');
            }
            return response.json(); 
        })
        .then(data => {
            prayerTimesContainer.classList.add('fadeIn');
            prayerTimesContainer.innerHTML = ""; 
            createPrayersList(data); 
            document.getElementById('input-city').value = "";  
            hideLoadingIcon();
        })
        .catch(error => {
            console.error('An error occurred:', error);
            if (error.message === 'Failed to fetch') {
                prayerTimesContainer.textContent = `Failure while retrieving data. Please check your internet connection and try again.`;
                prayerTimesContainer.style.color = "red";
                prayerTimesContainer.style.fontSize = "10pt";
            }
        });
};

const createPrayersList = (prayer) => {
    const methodName = prayer.data.meta.method.name;

    const date = prayer.data.date.readable;
    let dayNumber = prayer.data.date.gregorian.day;

    function getOrdinalSuffix(dayNumber) {
        if (dayNumber === 31) {
            return dayNumber + '<sup>st</sup>';
        } else if (dayNumber % 10 === 1) {
            return dayNumber + '<sup>st</sup>';
        } else if (dayNumber % 10 === 3) {
            return dayNumber + '<sup>rd</sup>';
        } else if (dayNumber === 2) {
            return dayNumber + '<sup>nd</sup>';
        } else if (dayNumber === 12) {
            return dayNumber + '<sup>th</sup>';
        } else if (dayNumber === 22) {
            return dayNumber + '<sup>nd</sup>';
        } else {
            return dayNumber + '<sup>th</sup>';
        }
    }
                                   
    dayNumber = getOrdinalSuffix(dayNumber);
    const formattedDayNumber = dayNumber.toString().startsWith('0') ? dayNumber.toString().substring(1) : dayNumber.toString();
     
    let month = prayer.data.date.gregorian.month.en;
    const gregorianYear = prayer.data.date.gregorian.year;
    const gregorianDate = month + " " + formattedDayNumber + ", " + gregorianYear; 

    const hijriDay = prayer.data.date.hijri.day;
    const hijriMonth = prayer.data.date.hijri.month.ar;
    const hijriYear = prayer.data.date.hijri.year;
    const hijriDate = "اليوم " + hijriDay + " " + hijriMonth + " " + hijriYear + " ";

    const fajr = prayer.data.timings.Fajr;
    const shurooq = prayer.data.timings.Sunrise;
    const dhuhr = prayer.data.timings.Dhuhr;
    const asr = prayer.data.timings.Asr;
    const maghrib = prayer.data.timings.Maghrib;
    const isha = prayer.data.timings.Isha;

    const prayerList = document.createElement('div');
    prayerList.classList.add('prayer-times', 'item', 'fadeIn');

    const cityValue = document.getElementById('input-city').value;
    const formattedCityValue = cityValue[0].toUpperCase() + cityValue.slice(1).toLowerCase();

    prayerList.innerHTML = `
        <div class="prayer-info">
            <h3><strong>Today's ${gregorianDate}</strong> at <strong>${formattedCityValue}</strong></h3>
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
            <p style="font-size:8pt">${methodName}</p>
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
    };   

    if (nextPrayerTime) {
        const timeDiff = nextPrayerTime - currentTime;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        const timeRemaining = `${hours}:${minutes}:${seconds}`;

        nextPrayerName = nextPrayerName === 'Sunset' ? 'Maghrib' : (nextPrayerName === 'Sunrise' ? 'Shuruq' : nextPrayerName);

        const getDay = (date) => {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayIndex = date.getDay();
            return daysOfWeek[dayIndex];
        };

        if (getDay(currentTime) === 'Friday' && currentTime > fajr && currentTime < dhuhr) {
            nextPrayerName = 'Jumu\'a';
        }
        
        if (hijriMonth === 'رمضان' && currentTime > maghrib && currentTime < isha) {
            nextPrayerName = 'Taraweeh';
        }
        
        if (nextPrayerName === 'Midnight' || nextPrayerName === 'Firstthird' || nextPrayerName === 'Lastthird' || nextPrayerName === 'Imsak') {
            document.querySelector('#nextPrayerNameHtml').innerHTML = '';
            document.querySelector('#countdown').innerHTML = '';
        }

        let timeRemainingDiv = document.createElement('div');
        timeRemainingDiv.classList.add('prayer-times', 'item');
        timeRemainingDiv.innerHTML = `
            <div class="prayer-info">
                <h3 style="font-weight: lighter" id="nextPrayerNameHtml">Time left for next prayer (${nextPrayerName}):</h3>
                <strong><p id="countdown" style="color: rgba(255, 58, 58, 0.752); -webkit-text-stroke: 1px black; font-size: 20pt; text-shadow: 0 5px 5px 5px rgba(90, 90, 90, 0.752);">${timeRemaining}</p></strong>
                <div class="countdown-container">
            <div class="countdown-circle">
                <div class="countdown-progress" id="countdown-progress"></div><br>
            </div>
            </div>
            </div>
        `;

        if (hours < 0) {
            timeRemainingDiv.style.display = "none";
        }        
    
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
            console.log(hours)

            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            if (countdownElement.textContent === `00 h: 00 m: 00 s`) {
                clearInterval(intervalId);

                countdownElement.textContent = `It's time to pray ${nextPrayerName}! 🤲`;

                Title.textContent = `Time to pray ${nextPrayerName} !`;

                nextPrayerNameHtml.innerHTML = ""; 
            
                textFlashing();
                setInterval(textFlashing, 300);

                const audio = new Audio('prayer_sound.mp3');
                audio.play();
            } else if (countdownElement.textContent !== `00 h: 00 m: 00 s` && seconds < 0) {
                clearInterval(intervalId);

                countdownElement.textContent = `It's time to pray ${nextPrayerName}! 🤲`;

                Title.textContent = `Time to pray ${nextPrayerName} !`;

                nextPrayerNameHtml.innerHTML = ""; 
            
                textFlashing();
                setInterval(textFlashing, 300);

                const audio = new Audio('prayer_sound.mp3');
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
    const currentDayEN = daysOfWeek[now.getDay()];
    
    let arabicDayofWeek;
    
    switch (currentDayEN) {
        case 'Sunday':
            arabicDayofWeek = 'الأحد';
            break;
        case 'Monday':
            arabicDayofWeek = 'الإثنين';
            break;
        case 'Tuesday':
            arabicDayofWeek = 'الثلاثاء';
            break;
        case 'Wednesday':
            arabicDayofWeek = 'الأربعاء';
            break;
        case 'Thursday':
            arabicDayofWeek = 'الخميس';
            break;
        case 'Friday':
            arabicDayofWeek = 'الجمعة';
            break;
        case 'Saturday':
            arabicDayofWeek = 'السبت';
            break;
    }    

    let formattedTime;
    if (hours >= 0 && hours < 12) {
        formattedTime = `${formatTime(currentDayEN)}<br>${arabicDayofWeek}<br><br>${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)} am`;
    } else {
        formattedTime = `${formatTime(currentDayEN)}<br>${arabicDayofWeek}<br><br>${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)} pm`;
    }

    document.getElementById('countup').innerHTML = formattedTime;
}

setInterval(updateClock, 1000);
updateClock();



    /*
    const method_PK = methodID === 1; //University of Islamic Sciences, Karachi

    const method_US = methodID === 2; // Islamic Society of North America (ISNA)

    const method_SA_World_League = methodID === 3; // Muslim World League

    const method_SA_Mekkah = methodID === 4; // Umm Al-Qura University, Makkah

    const method_EG = methodID === 5; // Egyptian General Authority of Survey

    const method_IR = methodID === 7; // Institute of Geophysics, University of Tehran

    const method_Gulf = methodID === 8; // Gulf Region

    const method_KW = methodID === 9; // Kuwait

    const method_AE = methodID === 10; // Qatar

    const method_SG = methodID === 11; // Majlis Ugama Islam Singapura, Singapore

    const method_FR = methodID === 12; // Union Organization Islamic de France

    const method_TR = methodID === 13; // Diyanet İşleri Başkanlığı, Turkey (experimental)

    const method_RU = methodID === 14; // Spiritual Administration of Muslims of Russia

    const method_Worldwide = methodID === 15; // Moonsighting Committee Worldwide

    const method_Dubai = methodID === 16; // Dubai

    const method_MY = methodID === 17; // Jabatan Kemajuan Islam Malaysia (JAKIM)
    const method_TN = methodID === 18; // Tunisia

    const method_DZ = methodID === 19; // Algeria

    const method_ID = methodID === 20; // Kementerian Agama Republik Indonesia

    const method_MA = methodID === 21; // Morocco

    const method_PT = methodID === 22; // Comunidade Islamica de Lisboa

    const method_JO = methodID === 23; // Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan
    */

