"use client";

import LoginForm from '@/components/login/login';
import SignUpForm from '@/components/login/signup';
import {useState, useRef, useEffect} from 'react';

export default function Login() {

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
        <div className="min-h-screen flex flex-col bg-[url('/theater-background.jpg')] bg-cover bg-center">
            <div className=" flex mt-40 justify-center items-center">
                <h1 className="text-white text-9xl font-bold">S.T.A.G.E.</h1>
            </div>
            <div ref = {formRef} className="">
                <div className="flex flex-row justify-evenly text-white m-24 ">
                    <button onClick={() => setView("login")} className="bg-slate-600 rounded-full p-3 w-40 hover:shadow-2xl hover:shadow-blue-400">Log In</button>
                    <button onClick={() => setView("signup")} className="bg-slate-600 rounded-full p-3 w-40">Sign Up</button>
                    {view == "login" && (
                    <div className="">
                        <LoginForm />
                    </div>
                    )}
                    {view == "signup" && (
                        <div>
                            <SignUpForm />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}