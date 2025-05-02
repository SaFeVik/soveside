import { registerThisNight, registerNight, getThisNight, findThisNight, getNights, updateNight, getNightByDate, deleteNight } from './nightManager.js';
moment.locale('nb');

const registerBtn = document.querySelector('#register-button')
const typesEl = document.querySelector('#types')
const registeredTimeEl = document.querySelector('#registeredTime')
const dateEl = document.querySelector('#date')

const monthStatEl = document.querySelector('#month-stat')
const lifetimeStatEl = document.querySelector('#lifetime-stat')

// Globale variabler for redigering
let editOverlay = null;
let currentEditDate = null;

registerBtn.addEventListener('click', async () => {
    const result = await registerThisNight(typesEl.value)
    if (result) {
        await updatePage()
    } else {
        // Show error to user
        alert("Det oppstod et problem ved registrering. Vennligst prøv igjen.")
    }
})

// Funksjon for å åpne redigeringspanelet
async function openEditPanel(nightDate) {
    // Forhindre flere redigeringspaneler
    if (editOverlay) {
        return;
    }
    
    currentEditDate = nightDate;
    
    // Hent nattdata hvis den eksisterer
    const nightData = await getNightByDate(nightDate);
    
    // Sjekk om det er helg (fredag = 5, lørdag = 6)
    const isWeekend = moment(nightDate).isoWeekday() === 5 || moment(nightDate).isoWeekday() === 6;
    
    // Opprett overlay
    editOverlay = document.createElement('div');
    editOverlay.className = 'edit-overlay';
    
    // Formatert dato for visning
    const formattedDate = moment(nightDate).format('DD.MM.YYYY');
    
    // Panel-innhold
    editOverlay.innerHTML = `
        <div class="edit-panel">
            <h3>Rediger natt: ${formattedDate}</h3>
            ${!isWeekend ? '<button type="button" class="reset-btn">Nullstill</button>' : ''}
            <form class="edit-form">
                <div class="form-group">
                    <label for="edit-type">Type</label>
                    <select id="edit-type">
                        <option value="2115">Tidlig skole (21:15)</option>
                        <option value="2200">Sen skole (22:00)</option>
                        <option value="2215">Tidlig skole🩸 (22:15)</option>
                        <option value="2300">Sen skole🩸 (23:00)</option>
                        <option value="off">Det er fri!</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-time">Leggetid (HH:MM)</label>
                    <input type="text" id="edit-time" placeholder="f.eks. 22:30" value="${nightData && nightData.time ? nightData.time : ''}">
                    <small style="color: #aaa; font-size: 0.8rem; margin-top: 3px;">La være tom for å fjerne registrert tid</small>
                </div>
                <div class="form-group">
                    <label for="edit-status">Status</label>
                    <select id="edit-status">
                        <option value="success">Suksess</option>
                        <option value="fail">Feil</option>
                    </select>
                </div>
                <div class="edit-actions">
                    <button type="button" class="cancel-btn">Avbryt</button>
                    <button type="button" class="save-btn">Lagre</button>
                </div>
            </form>
        </div>
    `;
    
    // Legg til overlay på siden
    document.body.appendChild(editOverlay);
    
    // Sett riktige verdier i feltene hvis det er eksisterende data
    if (nightData) {
        document.getElementById('edit-type').value = nightData.type || 'off';
        document.getElementById('edit-status').value = nightData.regType || 'success';
    }
    
    // Legg til event listeners for knappene
    editOverlay.querySelector('.cancel-btn').addEventListener('click', closeEditPanel);
    editOverlay.querySelector('.save-btn').addEventListener('click', saveNightData);
    
    // Legg til event listener for nullstill-knappen hvis den eksisterer (ikke helg)
    if (!isWeekend) {
        const resetBtn = editOverlay.querySelector('.reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetNightData);
        }
    }
}

// Funksjon for å lukke redigeringspanelet
function closeEditPanel() {
    if (editOverlay) {
        document.body.removeChild(editOverlay);
        editOverlay = null;
        currentEditDate = null;
    }
}

// Funksjon for å lagre redigert data
async function saveNightData() {
    if (!currentEditDate) return;
    
    const type = document.getElementById('edit-type').value;
    const time = document.getElementById('edit-time').value;
    const regType = document.getElementById('edit-status').value;
    
    // Validering av tid
    if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        alert("Ugyldig tidsformat. Bruk HH:MM (f.eks. 22:30)");
        return;
    }
    
    // Lagre data
    const result = await updateNight(currentEditDate, regType, time, type);
    
    if (result) {
        closeEditPanel();
        await updatePage(); // Oppdater siden med ny data
    } else {
        alert("Det oppstod et problem ved lagring. Vennligst prøv igjen.");
    }
}

// Funksjon for å nullstille data for en natt
async function resetNightData() {
    if (!currentEditDate) return;
    
    // Sjekk om det er helg (fredag = 5, lørdag = 6)
    const isWeekend = moment(currentEditDate).isoWeekday() === 5 || moment(currentEditDate).isoWeekday() === 6;
    
    // Ikke tillat nullstilling av helger
    if (isWeekend) {
        alert("Helgedager kan ikke nullstilles. De er alltid markert som fri.");
        return;
    }
    
    // Bekreftelse fra bruker
    if (confirm("Er du sikker på at du vil nullstille denne datoen? Dette vil fjerne all registrert data.")) {
        const result = await deleteNight(currentEditDate);
        
        if (result) {
            closeEditPanel();
            await updatePage(); // Oppdater siden med ny data
        } else {
            alert("Det oppstod et problem ved nullstilling. Vennligst prøv igjen.");
        }
    }
}

// Legg til funksjon for å legge til klikk-lyttere på dager
function addDayClickListeners() {
    const days = document.querySelectorAll('.day');
    days.forEach(day => {
        // Fjern eventuelle eksisterende lyttere først
        const newDay = day.cloneNode(true);
        day.parentNode.replaceChild(newDay, day);
        
        // Legg til ny lytter med data-attributt
        const dateKey = newDay.getAttribute('data-date');
        if (dateKey) {
            newDay.addEventListener('click', () => openEditPanel(dateKey));
        }
    });
}

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

    // Sorter nettene kronologisk (eldste først)
    nightsList.sort((a, b) => moment(a.nightDate).diff(moment(b.nightDate)));

    // Finn den første registrerte søvndatoen
    const firstNight = nightsList.reduce((earliest, night) => {
        return moment(night.nightDate).isBefore(moment(earliest.nightDate)) ? night : earliest;
    }, nightsList[0]);

    // Sett indexDate til den første registrerte søvndatoen
    let indexDate = moment(firstNight.nightDate).startOf('isoWeek').toDate();

    const weeksContainer = document.querySelector('.nights-display');

    const endOfThisWeek = moment().endOf('isoWeek').toDate();

    weeksContainer.innerHTML = "";

    let monthStat = 0
    let monthNights = 0

    let lifetimeStat = 0
    let lifetimeNights = 0

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const thirtyDaysAgoDate = moment().subtract(30, 'days').startOf('day').toDate();

    const today = new Date();

    // Find streak days
    let streakDays = new Set();
    let currentStreak = 0;

    // Calculate streaks by going forwards through the nights
    for (let i = 0; i < nightsList.length; i++) {
        const night = nightsList[i];
        if (night.nightDate >= nightDate) continue; // Skip today and future dates

        if (night.regType === "success") {
            currentStreak++;
            if (currentStreak >= 30) {
                // Add only this day to streakDays when reaching exactly 30
                streakDays.add(night.nightDate);
            }
        } else {
            currentStreak = 0;
        }
    }

    while (indexDate <= endOfThisWeek) {
        const weekDiv = document.createElement('div');
        weekDiv.classList.add('week');
        const weekNumber = moment(indexDate).isoWeek();
        weekDiv.innerHTML = `<p class="week-nr">${moment(indexDate).format('YYYY')} - ${weekNumber}</p>`;

        const daysDiv = document.createElement('div');
        daysDiv.classList.add('days');

        for (let day = 0; day < 7; day++) {
            const dayDiv = document.createElement('div');
            const dateKey = moment(indexDate).format('YYYY-MM-DD')
            const nightData = nightsList.find(night => night.nightDate === dateKey);
            if (!nightData && (moment(dateKey).isoWeekday() === 5 || moment(dateKey).isoWeekday() === 6)) {
                try {
                    await registerNight("success", "", dateKey, "off")
                } catch (error) {
                    console.error("Failed to register weekend night:", error);
                }
            }


            if (indexDate.getTime() >= thirtyDaysAgoDate.getTime() && indexDate.getTime() <= today.getTime() && dateKey < nightDate) {
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

            dayDiv.classList.add('day');
            // Legg til data-attributt for dato
            dayDiv.setAttribute('data-date', dateKey);
            
            if (nightData && dateKey < nightDate) {
                let timeDisplay = nightData.time ? `${nightData.time.split(":")[0]}:${nightData.time.split(":")[1]}<br>` : '';
                const dateDisplay = moment(dateKey).format('D. MMM').split('.')
                dayDiv.innerHTML = `<p>${dateDisplay[0]}. ${dateDisplay[1]}</p><p>${timeDisplay}</p>`;
                
                if (nightData.regType === "success") {
                    dayDiv.classList.add('success');
                    if (moment(indexDate).isBefore(moment(), 'day')) {
                        lifetimeStat += 1
                    }
                    // Add streak class if this day is part of a streak
                    if (streakDays.has(dateKey)) {
                        dayDiv.classList.add('streak');
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
    let monthStatValue = Math.round((monthStat/monthNights)*1000)/10
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
    
    // Legg til klikk-lyttere etter at alle dagene er opprettet
    addDayClickListeners();
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
