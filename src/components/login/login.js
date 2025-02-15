"use client";

import FormRow from "./login-form-row";
import { signIn } from 'next-auth/react';
import { useRouter } from "next/navigation";

function LoginForm(){

    const router = useRouter();

    const handleFormSubmission = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        try {
            const result = await signIn('credentials', {
                username: formData.get('username'),
                password: formData.get('password'),
                redirect: false
            });
    
            if(!result?.error) {
                router.push("/home-page");
                router.refresh();
            }
            
        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed, please try again");
        }
    };
    return(
        <form onSubmit={handleFormSubmission} className="w-full">
            <FormRow label="Username" id="username" name="username" />
            <FormRow label="Password" id="password" name="password" type="password" />
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-white text-slate-800 px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">Start Your Adventure</button>
            </div>
        </form>
    );
};

export default LoginForm;
