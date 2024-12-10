import { initializeApp } from "firebase/app";

import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOiqWHcZsNUrFl8gajnChQpNV6iBs4vXI",
  authDomain: "health-safe-955c9.firebaseapp.com",
  projectId: "health-safe-955c9",
  storageBucket: "health-safe-955c9.appspot.com",
  messagingSenderId: "598455838910",
  appId: "1:598455838910:web:d22a0a73a7f83bd0ef56ef"
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;