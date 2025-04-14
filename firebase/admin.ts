
import { cert, getApps,initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore as getFireStore } from "firebase-admin/firestore";
const initFirebaseAdmin=()=>{
    const apps=getApps();
    if(!apps.length){
        initializeApp({
            credential:cert({
                projectId:process.env.project_id,
                clientEmail:process.env.client_email,
                privateKey:process.env.private_key?.replace(/\\n/g,"\n")
            })
        })
    }
    return {
        auth:getAuth(),
        db:getFireStore()
    }
}
export const {auth,db}=initFirebaseAdmin();