import { collection, addDoc, getDocs, updateDoc, doc, query, where, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { db } from './firebase.js';

async function registerNight(type) {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5); // Henter tid i HH:mm format
    const nightsRef = collection(db, 'nights');
    const nightDate = await findThisNight()
    const q = query(nightsRef, where('nightDate', '==', nightDate))
    const querySnapshot = await getDocs(q);
    let regType
    if (type == "off") {
        regType = "unregistered"
    } else {
        let hour = timeString.split(":")[0]
        if (type < hour) {
            regType = "fail"; // Leggetiden er før registrert leggetid
        } else if (hour < 12 && type >= 12) {
            regType = "fail"; // Hvis registrert leggetid er før middag og leggetiden er etter middag
        } else {
            regType = "success"; // Leggetiden er lik eller senere enn registrert leggetid
        }
    }

    if (querySnapshot.empty) {
        // Legg til nytt dokument
        await addDoc(nightsRef, { regType: regType, time: timeString, nightDate: nightDate, type: type });
        console.log('Nytt dokument lagt til:', timeString);
    } else {
        // Oppdater eksisterende dokument
        const docRef = doc(db, 'nights', querySnapshot.docs[0].id);
        await updateDoc(docRef, { regType: regType, time: timeString, nightDate: nightDate, type: type });
        console.log('Dokument oppdatert med ny tid:', nightDate, timeString);
    }

}

async function findThisNight() {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; // Henter dato i YYYY-MM-DD format
    const isAfterNoon = now.getHours() > 12
    const nightDate = isAfterNoon 
        ? dateString 
        : new Date(new Date(dateString).setDate(new Date(dateString).getDate() - 1)).toISOString().split('T')[0];
    
    return nightDate
}

async function getThisNight() {
    const nightsRef = collection(db, 'nights');
    const nightDate = await findThisNight()
    const q = query(nightsRef, where('nightDate', '==', nightDate))
    const querySnapshot = await getDocs(q);

    let data
    if (querySnapshot.empty) {
        return false
    } else {
        querySnapshot.forEach(night => {
            data = night.data()
        });
    }
    return data
}

async function getNights() {
    const nightsRef = collection(db, 'nights')
    const querySnapshot = await getDocs(nightsRef)
    const nightsList = []
    querySnapshot.forEach(doc => {
        nightsList.push({ id: doc.id, ...doc.data() })
    })
    return nightsList
}




export { registerNight, findThisNight, getThisNight, getNights }
