"use client";

import { signIn } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormRow from "./login-form-row";

function LoginForm({ onError }){
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmission = async (event) => {
        event.preventDefault();
        
        setIsSubmitting(true);

        // extract username and password from the login form
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');
        
        try {
            //Use NextAuth credentials provider to log user in with their username and password
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false
            });

            if (result.error){
                // display error message for custom pop-up component
                onError("Incorrect username or password");
            } else {
                // redirect pre-existing users to the homepage
                router.push("/home-page");
                router.refresh();
            }
        } catch (error) {
            onError("Login failed, please try again");
        } finally {
            setIsSubmitting(false);
        }
    };
    return(
            <form onSubmit={handleFormSubmission} className="w-full">
                <FormRow label="Username" id="username" name="username" />
                 <FormRow label="Password" id="password" name="password" type="password" />
                <div className="flex justify-end mt-6">
                    <button type="submit" disabled={isSubmitting} className="bg-white text-slate-800 font-bold px-6 py-2 rounded-full hover:-translate-y-2 transition-transform duration-200">Start Your Adventure</button>
                </div>
            </form>
    );
};

export default LoginForm;
