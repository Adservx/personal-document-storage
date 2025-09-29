// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate required environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Missing Firebase configuration. Using fallback values.');
  // Fallback to existing values if env vars are not set
  firebaseConfig.apiKey = firebaseConfig.apiKey || "AIzaSyBq9Z5g-HP585ms1CkyL9ihk-5BW6JtfLA";
  firebaseConfig.authDomain = firebaseConfig.authDomain || "paworld9.firebaseapp.com";
  firebaseConfig.projectId = firebaseConfig.projectId || "paworld9";
  firebaseConfig.storageBucket = firebaseConfig.storageBucket || "paworld9.firebasestorage.app";
  firebaseConfig.messagingSenderId = firebaseConfig.messagingSenderId || "665278979118";
  firebaseConfig.appId = firebaseConfig.appId || "1:665278979118:web:8e62a4c1d6a4f116ead3bf";
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (prevents IndexedDB issues on localhost)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized successfully');
  } else {
    console.log('Firebase Analytics not supported in this environment');
  }
}).catch((error) => {
  console.log('Firebase Analytics initialization failed:', error);
});

// Export auth and provider for use in the app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { analytics };