import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzbWS2nhqlW-Wcvitxdl_prq7Xs766QWA",
  authDomain: "phantom-creative-be7a9.firebaseapp.com",
  databaseURL: "https://phantom-creative-be7a9-default-rtdb.firebaseio.com",
  projectId: "phantom-creative-be7a9",
  storageBucket: "phantom-creative-be7a9.firebasestorage.app",
  messagingSenderId: "468520974182",
  appId: "1:468520974182:web:a8b12f3a54a34deea43aa7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const ADMIN_EMAIL = "legateakanjimusab@gmail.com";
export { ref, get, set, push, onValue, remove, update };

// YOUR GOOGLE APPS SCRIPT URL
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYjME28os3PUuAeKAC9ZyaF-IL_QFBvqHR7ybNIPPI_iLttyhGkaGrPQlU_Z6isu9_3A/exec";
