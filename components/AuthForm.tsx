"use client"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "@/components/FormField"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, fetchSignInMethodsForEmail } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"
import { useState } from "react"
import { FirebaseError } from "firebase/app"

type FormType = 'sign-in' | 'sign-up';

interface AuthFormProps {
    type: FormType;
}

const authformschema=(type:FormType)=>{
    return z.object({
        name:type==='sign-up'?z.string().min(3):z.string().optional(),
        email:z.string().email(),
        password:z.string().min(3),

    })
}
export default function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const formSchema = authformschema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setError('');
        
        try {
          if (type === "sign-up") {
            const { name, email, password } = data;
    
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
    
            const result = await signUp({
              uid: userCredential.user.uid,
              name: name!,
              email,
              password,
            });
    
            if (!result.success) {
              toast.error(result.message);
              return;
            }
    
            toast.success("Account created successfully. Please sign in.");
            router.push("/sign-in");
          } else {
            const { email, password } = data;
    
            try {
              console.log("Attempting to sign in with email:", email);
              
              // Try direct sign in without checking methods first
              const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
              );
    
              console.log("Firebase auth successful, user:", userCredential.user.uid);
              
              const idToken = await userCredential.user.getIdToken();
              
              // Then sign in with our backend
              const result = await signIn({
                email,
                idToken,
              });
    
              if (result?.success) {
                toast.success("Signed in successfully.");
                router.push("/");
              } else {
                console.error("Backend sign-in failed:", result);
                toast.error("Backend authentication failed. Please try again.");
              }
            } catch (authError: any) {
              console.error("Detailed Firebase Auth Error:", {
                code: authError.code,
                message: authError.message,
                stack: authError.stack,
                fullError: JSON.stringify(authError, null, 2)
              });
              
              // Handle specific Firebase auth errors
              if (authError.code === 'auth/invalid-credential') {
                toast.error("Authentication failed. This could be due to a configuration issue.");
              } else {
                toast.error(`Authentication error: ${authError.message}`);
              }
            }
          }
        } catch (error: any) {
          console.error("Form submission error:", error);
          toast.error(`There was an error: ${error.message || error}`);
        } finally {
          setIsLoading(false);
        }
      };

    const isSignin = type === 'sign-in';
    return (
        <div className="card-border">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}></Image>
                    <h2 className="text-primary-100">PrepWise</h2>
                </div>
                <h3>Practice job interview with AI</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignin && (
                            <FormField control={form.control} name="name" label="Name" placeholder="Your Name"></FormField>
                        )}
                        <FormField control={form.control} name="email" label="Email" placeholder="Your Email" type="email"></FormField>
                        <FormField control={form.control} name="password" label="Password" placeholder="Enter your password" type="password"></FormField>
                        <Button className="btn" type="submit">{isSignin ? 'Sign In' : 'Create an Account'}</Button>
                    </form>
                </Form>
                <p className="text-center">
                    {isSignin ? "Don't have an account yet?" : "Already have an account?"}
                    <Link href={isSignin ? '/sign-up' : 'sign-in'} className="font-bold text-user-primary ml-1">
                        {isSignin ? 'Sign Up' : 'Sign In'}
                    </Link>
                </p>
            </div>
        </div>
    )
}