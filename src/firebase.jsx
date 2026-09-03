import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCvSt5JwygvwIXXCRpDrV227AeYbNk8uU",
  authDomain: "fir-auth-1132-c8e90.firebaseapp.com",
  projectId: "fir-auth-1132-c8e90",
  storageBucket: "fir-auth-1132-c8e90.appspot.com",
  messagingSenderId: "1031736487663",
  appId: "1:1031736487663:web:022799cc74139219a3f51a",
  measurementId: "G-GXQ98SGN9R",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();

export { app, auth, signOut };
