"use client";

import { signIn } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { useState } from "react";

import FormRow from "./login-form-row";
import ConfirmationPopUp from '../popup-actions/popup-structure';

function LoginForm({ onError }){

    const router = useRouter();

    const [errorPopup, setErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleFormSubmission = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        const username = formData.get('username');
        const password = formData.get('password');

        console.log("Attempting login with:", { username, password: "****" });
        
        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false
            });

            if (result.error){
                onError("Incorrect username or password");
                return;
            } else {
                router.push("/home-page");
                router.refresh();
            }
            
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed, please try again");
        }
    };
    return(
        <>
            <form onSubmit={handleFormSubmission} className="w-full">
                <FormRow label="Username" id="username" name="username" />
                 <FormRow label="Password" id="password" name="password" type="password" />
                <div className="flex justify-end mt-6">
                    <button type="submit" className="bg-white text-slate-800 px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">Start Your Adventure</button>
                </div>
            </form>
            {errorPopup && (<ConfirmationPopUp title="Login Error" message={errorMessage} onClose={() => setErrorPopup(false)} closeLabel="OK" showOneButton={true}/>)}
        </>
        
    );
};

export default LoginForm;
