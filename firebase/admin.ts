import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore as getFireStore } from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
    try {
        console.log("Initializing Firebase Admin");
        console.log("Project ID:", process.env.PROJECT_ID);
        console.log("Client Email:", process.env.CLIENT_EMAIL);
        console.log("Private Key length:", process.env.PRIVATE_KEY?.length);

        const apps = getApps();
        if (!apps.length) {
            console.log("No apps found, initializing new app");
            initializeApp({
                credential: cert({
                    projectId: process.env.PROJECT_ID,
                    clientEmail: process.env.CLIENT_EMAIL,
                    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n")
                })
            });
            console.log("Firebase Admin SDK initialized successfully");
        } else {
            console.log("Apps already initialized:", apps.length);
        }

        const auth = getAuth();
        const db = getFireStore();
        console.log("Auth and Firestore services initialized");

        return {
            auth,
            db
        };
    } catch (error) {
        console.error("Error initializing Firebase Admin:", error);
        throw error;
    }
};

export const { auth, db } = initFirebaseAdmin();