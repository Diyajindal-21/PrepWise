'use server'

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      console.log("User already exists in Firestore:", uid);
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    // save user to db with better error handling
    try {
      console.log("Attempting to save user to Firestore:", uid);
      
      const userData = {
        name,
        email,
        createdAt: new Date(),
        // Add any other fields you want to store
      };
      
      console.log("User data to be saved:", userData);
      
      await db.collection("users").doc(uid).set(userData);
      
      console.log("User successfully saved to Firestore:", uid);
      
      return {
        success: true,
        message: "Account created successfully. Please sign in.",
      };
    } catch (firestoreError) {
      console.error("Error saving user to Firestore:", firestoreError);
      
      // Log more details about the error
      if (firestoreError instanceof Error) {
        console.error("Error message:", firestoreError.message);
        console.error("Error stack:", firestoreError.stack);
      }
      
      return {
        success: false,
        message: "Failed to save user data. Please try again.",
      };
    }
  } catch (error: any) {
    console.error("Error in sign-up process:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}
export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
    
    // Add this return statement to indicate successful sign-in
    return {
      success: true,
      message: "Signed in successfully."
    };
  } catch (error: any) {
    console.log("");

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}



export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get('session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
    if (!userRecord.exists) {
      return null;
    }
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}