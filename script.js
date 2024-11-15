import { registerThisNight, registerNight, getThisNight, findThisNight, getNights } from './nightManager.js';
moment.locale('nb');

const registerBtn = document.querySelector('#register-button')
const typesEl = document.querySelector('#types')
const registeredTimeEl = document.querySelector('#registeredTime')
const dateEl = document.querySelector('#date')

const monthStatEl = document.querySelector('#month-stat')
const lifetimeStatEl = document.querySelector('#lifetime-stat')

registerBtn.addEventListener('click', async () => {
    await registerThisNight(typesEl.value)
    await updatePage()
})

async function updatePage() {
    const nightDate = await findThisNight();
    const date = nightDate.split("-").reverse().join(".");
    dateEl.innerHTML = `Natt: ${date}`;

    const night = await getThisNight();
    if (!night || night.time == "") {
        registeredTimeEl.innerHTML = "Ingen leggetid registrert i dag";
    } else {
        registeredTimeEl.innerHTML = `Leggetid registrert ${night.time}`;
    }

    const nightsList = await getNights();

    const currentYear = new Date().getFullYear();
    const startWeek = 44;
    const weeksContainer = document.querySelector('.nights-display');

    const endOfThisWeek = moment().endOf('isoWeek').toDate();

    weeksContainer.innerHTML = "";

    let indexDate = moment().year(currentYear).week(startWeek).startOf('isoWeek').toDate();

    let monthStat = 0
    let monthNights = 0

    let lifetimeStat = 0
    let lifetimeNights = 0

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const thirtyDaysAgoDate = moment().subtract(30, 'days').startOf('day').toDate();

    const today = new Date();

    while (indexDate <= endOfThisWeek) {
        const weekDiv = document.createElement('div');
        weekDiv.classList.add('week');
        const weekNumber = moment(indexDate).isoWeek();
        weekDiv.innerHTML = `<p class="week-nr">${currentYear} - ${weekNumber}</p>`;

        const daysDiv = document.createElement('div');
        daysDiv.classList.add('days');

        for (let day = 0; day < 7; day++) {
            const dayDiv = document.createElement('div');
            const dateKey = moment(indexDate).format('YYYY-MM-DD')
            const nightData = nightsList.find(night => night.nightDate === dateKey);
            if (!nightData && (moment(dateKey).isoWeekday() === 5 || moment(dateKey).isoWeekday() === 6)) {
                await registerNight("success", "", dateKey, "off")
            }


            if (indexDate.getTime() > thirtyDaysAgoDate.getTime() && indexDate.getTime() <= today.getTime() && dateKey < nightDate) {
                monthNights += 1
                if (nightData) {
                    if (nightData.regType === "success") {
                        monthStat += 1
                    }
                } 

            }
            if (dateKey < nightDate) {
                lifetimeNights += 1
            }

            dayDiv.classList.add('day')
            if (nightData && dateKey < nightDate) {
                if (nightData.time != "") {
                    dayDiv.innerHTML = `<p>${nightData.time.split(":")[0]}</p><p>${nightData.time.split(":")[1]}</p>`
                }
                if (nightData.regType === "success") {
                    dayDiv.classList.add('success');
                    if (moment(indexDate).isBefore(moment(), 'day')) {
                        lifetimeStat += 1
                    }
                } else if (nightData.regType === "fail") {
                    dayDiv.classList.add('fail');
                }
            } else if (dateKey <= nightDate) {
                dayDiv.classList.add('unregistered');
            }

            daysDiv.appendChild(dayDiv);
            indexDate.setDate(indexDate.getDate() + 1)
        }


        weekDiv.appendChild(daysDiv);
        weeksContainer.appendChild(weekDiv);
    }
    let lifetimeStatValue = Math.round((lifetimeStat/lifetimeNights)*1000)/10
    let monthStatValue = Math.round((lifetimeStat/lifetimeNights)*1000)/10
    lifetimeStatEl.innerHTML = `${lifetimeStatValue}%`
    monthStatEl.innerHTML = `${monthStatValue}%`

    if (lifetimeStatValue == 100) {
        lifetimeStatEl.style.textShadow = "0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6)"
    }
    if (monthStatValue == 100) {
        monthStatEl.style.textShadow = "0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6)"
    }

    lifetimeStatEl.style.color = colorPicker(lifetimeStatValue)
    monthStatEl.style.color = colorPicker(monthStatValue)

}

function colorPicker(percentage) {
    if (percentage < 50) {
        return 'rgb(255, 13, 13)'
    } else if (percentage < 60) {
        return 'rgb(255, 78, 17)'
    } else if (percentage < 70) {
        return 'rgb(255, 142, 21)'
    } else if (percentage < 80) {
        return 'rgb(250, 183, 51)'
    } else if (percentage < 90) {
        return 'rgb(172, 179, 52)'
    } else if (percentage < 100) {
        return 'rgb(105, 179, 76)'
    }
    else {
        return 'rgb(255, 215, 0)'
    }
}

await updatePage()
