"use client";

import {useState, useRef, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/login/login';
import SignUpForm from '../components/login/signup';
import ConfirmationPopUp from '../components/popup-actions/popup-structure';

export default function Login() {

    const { data: session, status} = useSession();
    const router = useRouter();
    const [view, setView] = useState(null);
    const [showLogout, setShowLogout ] = useState(false);
    const formRef = useRef(null);

    const [errorPopup, setErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleError = (message) => {
        setErrorMessage(message);
        setErrorPopup(true);
    };

    useEffect ( () => {
        if (status === "authenticated"){
            router.push("/home-page");
            router.refresh();
            return;
        }
    }, [status]);

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
        <div className="h-screen flex flex-col bg-[url('/theater-background.jpg')] bg-cover bg-center">
            <div className=" flex mt-20 justify-center items-center">
                <h1 className="text-white text-8xl font-bold">S.T.A.G.E.</h1>
            </div>
            <div className="flex justify-center mt-8">
                <div ref = {formRef} className="relative">
                    <div className="flex gap-8">
                        <button onClick={() => setView("login")} className={`text-xl px-8 py-2 rounded-full border border-white transition-colors ${view === "login" ? "bg-white text-black" : "bg-transparent text-white hover:bg-white hover:text-black"}`}>Log In</button>
                        <button onClick={() => setView("signup")} className={`text-xl px-8 py-2 rounded-full border border-white transition-colors ${view === "signup" ? "bg-white text-black" : "bg-transparent text-white hover:bg-white hover:text-black"}`}>Sign Up</button>
                    </div>
                    {view && (
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-600 bg-opacity-80 rounded-3xl p-5 w-auto min-w-[600px]">
                            {view === "login" ? <LoginForm onError={handleError}/> : <SignUpForm onError={handleError}/>}
                        </div>
                    )}
                </div>
            </div>
            {errorPopup && (
                <ConfirmationPopUp 
                    title={view === "login" ? "Login Error" : "Registration Error"}
                    message={errorMessage}
                    onClose={() => setErrorPopup(false)}
                    closeLabel="OK"
                    showOneButton={true}
                />
            )}
        </div>
    );
}