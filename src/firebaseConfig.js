// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB28ipPUlDzsOurSr2ov55kdBSMiR5G7r4",
  authDomain: "autoexcelproject-aep.firebaseapp.com",
  databaseURL: "https://autoexcelproject-aep-default-rtdb.firebaseio.com",
  projectId: "autoexcelproject-aep",
  storageBucket: "autoexcelproject-aep.appspot.com",
  messagingSenderId: "583592046454",
  appId: "1:583592046454:web:36e8e571687ea5ac439457"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { database, db, auth };
