import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAL8oWCDZ53rD0qnZBm6hkaEn4Qu65XFPM",
  authDomain: "soveside.firebaseapp.com",
  projectId: "soveside",
  storageBucket: "soveside.appspot.com",
  messagingSenderId: "1022650404319",
  appId: "1:1022650404319:web:992eb31b2e966cd3db886a",
  measurementId: "G-X4NL1N6ES7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };