import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { db } from './firebase.js';

async function registerThisNight(type) {
    try {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0].substring(0, 5); // Henter tid i HH:mm format
        const nightsRef = collection(db, 'nights');
        const nightDate = await findThisNight()
        const q = query(nightsRef, where('nightDate', '==', nightDate))
        const querySnapshot = await getDocs(q);
        let regType
        console.log("type", type)
        console.log("hei")
        if (type == "off") {
            regType = "success"
        } else {
            let time = parseInt(timeString.split(":")[0] + timeString.split(":")[1]);
            let typeNum = parseInt(type);
            
            if (time < 1200) {
                time += 2400
            }
            if (typeNum < 1200) {
                typeNum += 2400
            }

            if (typeNum < time) {
                regType = "fail";
            } else {
                regType = "success";
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
        return true;
    } catch (error) {
        console.error("Error registering night:", error);
        return false;
    }
}

async function registerNight(regType, time, nightDate, type) {
    try {
        const nightsRef = collection(db, 'nights');
        const q = query(nightsRef, where('nightDate', '==', nightDate));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Legg til nytt dokument
            await addDoc(nightsRef, { regType: regType, time: time, nightDate: nightDate, type: type });
            console.log('Nytt dokument lagt til:', nightDate, time);
        } else {
            // Oppdater eksisterende dokument
            const docRef = doc(db, 'nights', querySnapshot.docs[0].id);
            await updateDoc(docRef, { regType: regType, time: time, nightDate: nightDate, type: type });
            console.log('Dokument oppdatert med ny tid:', nightDate, time);
        }
        return true;
    } catch (error) {
        console.error("Error registering night:", error);
        return false;
    }
}

async function findThisNight() {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; // Henter dato i YYYY-MM-DD format
    const isAfterNoon = now.getHours() > 11
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

// For å fikse opp når Marita glemmer å registrere
async function registerMultipleNights(datesList) {
    const nightsRef = collection(db, 'nights');
    
    for (const nightDate of datesList) {
        // Check if document already exists for this date
        const q = query(nightsRef, where('nightDate', '==', nightDate));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            // Add new document only if it doesn't exist
            await addDoc(nightsRef, {
                regType: "success",
                time: "",
                nightDate: nightDate,
                type: "off"
            });
            console.log('Nytt dokument lagt til for:', nightDate);
        } else {
            console.log('Dokument eksisterer allerede for:', nightDate);
        }
    }
}
const dates = [
    "2025-02-24",
];

/* await registerMultipleNights(dates); */

async function updateNight(nightDate, regType, time, type) {
    try {
        const nightsRef = collection(db, 'nights');
        const q = query(nightsRef, where('nightDate', '==', nightDate));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Legg til nytt dokument hvis det ikke finnes
            await addDoc(nightsRef, { regType, time, nightDate, type });
            console.log('Nytt dokument lagt til ved oppdatering:', nightDate);
        } else {
            // Oppdater eksisterende dokument
            const docRef = doc(db, 'nights', querySnapshot.docs[0].id);
            await updateDoc(docRef, { regType, time, nightDate, type });
            console.log('Dokument oppdatert med ny data:', nightDate);
        }
        return true;
    } catch (error) {
        console.error("Error updating night:", error);
        return false;
    }
}

async function getNightByDate(nightDate) {
    try {
        const nightsRef = collection(db, 'nights');
        const q = query(nightsRef, where('nightDate', '==', nightDate));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        } else {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
    } catch (error) {
        console.error("Error getting night by date:", error);
        return null;
    }
}

async function deleteNight(nightDate) {
    try {
        const nightsRef = collection(db, 'nights');
        const q = query(nightsRef, where('nightDate', '==', nightDate));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Slett eksisterende dokument
            const docRef = doc(db, 'nights', querySnapshot.docs[0].id);
            await deleteDoc(docRef);
            console.log('Dokument slettet:', nightDate);
            return true;
        } else {
            console.log('Ingen dokument å slette for:', nightDate);
            return true; // Returnerer true selv om det ikke var noe å slette
        }
    } catch (error) {
        console.error("Error deleting night:", error);
        return false;
    }
}

export { registerThisNight, registerNight, findThisNight, getThisNight, getNights, registerMultipleNights, updateNight, getNightByDate, deleteNight }