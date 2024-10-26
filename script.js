import { registerNight, getThisNight, findThisNight, getNights } from './nightManager.js';
moment.locale('nb');

const registerBtn = document.querySelector('#register-button')
const typesEl = document.querySelector('#types')
const registeredTimeEl = document.querySelector('#registeredTime')
const dateEl = document.querySelector('#date')

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
    console.log(nightsList);

    const currentYear = new Date().getFullYear();
    const startWeek = 43;
    const weeksContainer = document.querySelector('.nights-display');

    // Finn den seneste registrerte datoen
    const latestNightData = nightsList.reduce((latest, night) => {
        return moment(night.nightDate).isAfter(moment(latest.nightDate)) ? night : latest;
    }, nightsList[0]);

    // Beregn sluttdato for uken som inneholder den seneste registrerte datoen
    const endOfLatestWeek = moment(latestNightData.nightDate).endOf('isoWeek').toDate();

    weeksContainer.innerHTML = "";

    let currentDate = moment().year(currentYear).week(startWeek).startOf('isoWeek').toDate();

    while (currentDate <= endOfLatestWeek) {
        const weekDiv = document.createElement('div');
        weekDiv.classList.add('week');
        const weekNumber = moment(currentDate).isoWeek();
        weekDiv.innerHTML = `<p class="week-nr">${currentYear} - ${weekNumber}</p>`;

        const daysDiv = document.createElement('div');
        daysDiv.classList.add('days');

        for (let day = 0; day < 7; day++) {
            const dayDiv = document.createElement('div');
            const dateKey = moment(currentDate).format('YYYY-MM-DD')
            console.log(currentDate, dateKey)
            const nightData = nightsList.find(night => night.nightDate === dateKey);
            console.log(nightData)
            if (nightData) {
                if (nightData.regType === "success") {
                    dayDiv.classList.add('day', 'success');
                } else if (nightData.regType === "fail") {
                    dayDiv.classList.add('day', 'fail');
                }
            } else if (dateKey > nightDate) {
                dayDiv.classList.add('day')
            } else {
                dayDiv.classList.add('day', 'unregistered');
            }
            console.log(dateKey > nightDate)

            daysDiv.appendChild(dayDiv);
            currentDate.setDate(currentDate.getDate() + 1); // Gå til neste dag
        }

        weekDiv.appendChild(daysDiv);
        weeksContainer.appendChild(weekDiv);
    }
}

await updatePage()
