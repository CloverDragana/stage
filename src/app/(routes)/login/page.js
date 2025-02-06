"use client";

import LoginForm from '@/components/login/login';
import SignUpForm from '@/components/login/signup';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import {useState, useRef, useEffect} from 'react';

export default function Login() {

    // const session = await getServerSession();
    // if(session){
    //     redirect("/");
    // }

    const [view, setView] = useState(null);
    const formRef = useRef(null);

    useEffect(() => {
        const handleClickOffForm = (event) =>{
            if (
                formRef.current && !formRef.current.contains(event.target)
            ) {
                setView(null);
            }
        };

        document.addEventListener("mousedown", handleClickOffForm);
        return () => {
            document.removeEventListener("mousedown", handleClickOffForm);
        };
    }, []);

    return (
        <div className="h-screen flex flex-col bg-[url('/theater-background.jpg')] bg-cover bg-center overflow-hidden">
            <div className=" flex mt-20 justify-center items-center">
                <h1 className="text-white text-8xl font-bold">S.T.A.G.E.</h1>
            </div>
            <div className="flex justify-center mt-16">
                <div ref = {formRef} className="relative">
                    
                    <div className="flex gap-8">
                        <button onClick={() => setView("login")} className={`text-xl px-8 py-2 rounded-full border border-white transition-colors ${view === "login" ? "bg-white text-black" : "bg-transparent text-white hover:bg-white hover:text-black"}`}>Log In</button>
                        <button onClick={() => setView("signup")} className={`text-xl px-8 py-2 rounded-full border border-white transition-colors ${view === "signup" ? "bg-white text-black" : "bg-transparent text-white hover:bg-white hover:text-black"}`}>Sign Up</button>
                    </div>
                    {view && (
                        <div className="absolute top-16 -left-20 bg-slate-600 bg-opacity-80 rounded-3xl p-8 w-auto ">
                            {view === "login" ? <LoginForm/> : <SignUpForm/>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}