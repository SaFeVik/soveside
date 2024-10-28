import { registerNight, getThisNight, findThisNight, getNights } from './nightManager.js';
moment.locale('nb');

const registerBtn = document.querySelector('#register-button')
const typesEl = document.querySelector('#types')
const registeredTimeEl = document.querySelector('#registeredTime')
const dateEl = document.querySelector('#date')

const monthStatEl = document.querySelector('#month-stat')
const lifetimeStatEl = document.querySelector('#lifetime-stat')

registerBtn.addEventListener('click', async () => {
    await registerNight(typesEl.value)
    await updatePage()
})

async function updatePage() {
    const nightDate = await findThisNight();
    const date = nightDate.split("-").reverse().join(".");
    dateEl.innerHTML = `Natt: ${date}`;

    const night = await getThisNight();

    if (!night) {
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

    let currentDate = moment().year(currentYear).week(startWeek).startOf('isoWeek').toDate();

    let monthStat = 0
    let monthNights = 0

    let lifetimeStat = 0
    let lifetimeNights = 0

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const thirtyDaysAgoDate = moment().subtract(30, 'days').startOf('day').toDate();

    const today = new Date();

    while (currentDate <= endOfThisWeek) {

        const weekDiv = document.createElement('div');
        weekDiv.classList.add('week');
        const weekNumber = moment(currentDate).isoWeek();
        weekDiv.innerHTML = `<p class="week-nr">${currentYear} - ${weekNumber}</p>`;

        const daysDiv = document.createElement('div');
        daysDiv.classList.add('days');

        for (let day = 0; day < 7; day++) {
            const dayDiv = document.createElement('div');
            const dateKey = moment(currentDate).format('YYYY-MM-DD')
            const nightData = nightsList.find(night => night.nightDate === dateKey);

            if (nightData) {
                if (currentDate.getTime() > thirtyDaysAgoDate.getTime() && currentDate.getTime() <= today.getTime()) {
                    if (nightData) {
                        monthNights += 1
                        if (nightData.regType === "success") {
                            monthStat += 1
                        }
                    } 

                }
                if (nightData.regType === "success") {
                    dayDiv.classList.add('day', 'success');
                    lifetimeNights += 1
                    lifetimeStat += 1
                } else if (nightData.regType === "fail") {
                    dayDiv.classList.add('day', 'fail');
                    lifetimeNights += 1
                } else {
                    dayDiv.classList.add('day')
                }
            } else if (dateKey > nightDate) {
                dayDiv.classList.add('day')
            } else {
                dayDiv.classList.add('day', 'unregistered');
            }

            daysDiv.appendChild(dayDiv);
            currentDate.setDate(currentDate.getDate() + 1); // Gå til neste dag
        }

        weekDiv.appendChild(daysDiv);
        weeksContainer.appendChild(weekDiv);
    }
    lifetimeStatEl.innerHTML = `${Math.round((lifetimeStat/lifetimeNights)*1000)/10}%`
    monthStatEl.innerHTML = `${Math.round((monthStat/monthNights)*1000)/10}%`
}

await updatePage()
