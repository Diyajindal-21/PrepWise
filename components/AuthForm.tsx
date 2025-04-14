"use client"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "@/components/FormField"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signup } from "@/lib/actions/auth.action"


const authformschema=(type:FormType)=>{
    return z.object({
        name:type==='sign-up'?z.string().min(3):z.string().optional(),
        email:z.string().email(),
        password:z.string().min(3),

    })
}
const AuthForm=({type}:{type:FormType})=>{
    const router=useRouter();
    const formSchema=authformschema(type);
    // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try{
        if(type==='sign-up'){
            const {name,email,password}=values;
            const userCredentials=await createUserWithEmailAndPassword(auth,email,password);
            const result=await signup({
                uid:userCredentials.user.uid,
                name:name!,
                email,password,
            })
            if(!result?.success){
                toast.error(result?.message)
                return;
            }
            const idToken=await userCredentials.user.getIdToken();
            await signIn({
                email,idToken
            })
            toast.success('Account created successfully');
            router.push('/');
        }
        else{
            const {email,password}=values;
            const userCredential=await signInWithEmailAndPassword(auth,email,password);
            const idToken=await userCredential.user.getIdToken();
            if(!idToken){
                toast.error('Failed to sign in');
                return;
            }
            await signIn({
                email,idToken
            })
            toast.success('Sign in successfully');
            router.push('/');
        }
    }catch(error){
        console.log(error);
        toast.error(`There was an error: ${error}`)
    }
  } 
  const isSignin=type==='sign-in';
    return(
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}></Image>
                    <h2 className="text-primary-100">PrepWise</h2>
                </div>
                <h3>Practice job interview with AI</h3>
            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
        {!isSignin&&(
            <FormField control={form.control} name="name" label="Name" placeholder="Your Name"></FormField>
        )}
        <FormField control={form.control} name="email" label="Email" placeholder="Your Email" type="email"></FormField>
        <FormField control={form.control} name="password" label="Password" placeholder="Enter your password" type="password"></FormField>
        <Button className="btn" type="submit">{isSignin?'Sign In':'Create an Account'}</Button>
      </form>
    </Form>
    <p className="text-center">
        {isSignin?"Don't have an account yet?":"Already have an account?"}
        <Link href={!isSignin?'/sign-in':'sign-up'} className="font-bold text-user-primary ml-1">
        {!isSignin?'Sign In':'Sign Up'}
        </Link>
    </p>
    </div>
        </div>
    )
}
export default AuthForm;