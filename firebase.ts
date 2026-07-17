import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDJQ32w0CPMpy4Lg5O0LHkjlNJoyB2A8mY",
  authDomain: "zxh4panel.firebaseapp.com",
  projectId: "zxh4panel",
  storageBucket: "zxh4panel.firebasestorage.app",
  messagingSenderId: "658175438053",
  appId: "1:658175438053:web:60ee70296b2decdaad780c",
  measurementId: "G-4C3QVSYJHL",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics only works in the browser, so we guard it for SSR.
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  isSupported().then((ok) => {
    if (ok) analytics = getAnalytics(app);
  });
}

export { app, auth, db, analytics };
