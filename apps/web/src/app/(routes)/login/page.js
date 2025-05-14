"use client";

import {useState, useRef, useEffect} from 'react';
import LoginForm from '../../../components/login/login';
import SignUpForm from '../../../components/login/signup';
import ConfirmationPopUp from '../../../components/popup-actions/popup-structure';

export default function Login() {

    const [view, setView] = useState(null);
    const formRef = useRef(null);

    //states to show custom pop-up with custom error messages
    //documented
    const [errorPopup, setErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // allows the pop up  to be displayed with custom messages based login or signup form errors
    //documented
    const handleError = (message) => {
        setErrorMessage(message);
        setErrorPopup(true);
    };

    //https://www.preciousorigho.com/articles/a-better-way-to-create-event-listeners-in-react
    //documented
    useEffect(() => {
        const handleClickOffForm = (event) =>{
            if (formRef.current && !formRef.current.contains(event.target)) {
                //hide form when container holding login and signup form is cliked off of
                setView(null);
            }
        };

        // add mouse click event listener to div holding the login and signup forms
        document.addEventListener("mousedown", handleClickOffForm);
        // clean up event listener when div is unclicked
        return () => {
            document.removeEventListener("mousedown", handleClickOffForm);
        };
    }, []);


    //documented
    return (
        <div className="h-screen flex flex-col bg-[url('/theater-background.jpg')] bg-cover bg-center">
            <div className=" flex mt-20 justify-center items-center">
                <h1 className="text-white text-8xl font-bold">S.T.A.G.E.</h1>
            </div>
            <div className="flex justify-center mt-8">
                <div ref={formRef} className="relative">
                    <div className="flex gap-8">
                        <button onClick={() => setView("login")} className={`text-xl font-bold px-8 py-2 rounded-full border-4 border-white transition-colors 
                            ${view === "login" ? "bg-white text-black" : "bg-cyan-950 bg-opacity-50 text-white hover:bg-white hover:text-black"}`}>Log In</button>
                        <button onClick={() => setView("signup")} className={`text-xl font-bold px-8 py-2 rounded-full border-4 border-white transition-colors 
                            ${view === "signup" ? "bg-white text-black" : "bg-cyan-950 bg-opacity-50 text-white hover:bg-white hover:text-black"}`}>Sign Up</button>
                    </div>
                    {/* show either the login or signup form depending on which button has been clicked */}
                    {view && (
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-cyan-950 bg-opacity-80 rounded-3xl p-5 w-auto min-w-[600px] shadow-[0px_10px_40px_4px_rgba(119,196,210,_0.4)]">
                            {view === "login" ? <LoginForm onError={handleError}/> : <SignUpForm onError={handleError}/>}
                        </div>
                    )}
                </div>
            </div>
            {/* renders pop-up if there are errors in the login or signup form */}
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