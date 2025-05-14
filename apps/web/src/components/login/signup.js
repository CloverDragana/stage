"use client";

import { useState } from "react";
import AccountToggle from "../navigation/account-toggle";
import FormRow from "./login-form-row";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function SignUpForm({ onError }){ 
    const router = useRouter();
    const [profileType, setProfileType] = useState('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    const handleSignUpForm = async (event) => { 
        event.preventDefault(); 
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const formData = new FormData(event.target); 

            const userInfo = { 
                fullname: formData.get('fullname'),
                email: formData.get('email'), 
                username: formData.get('username'), 
                password: formData.get('password'),
                profileType: profileType,
                personal_account: profileType === 'personal',
                professional_account: profileType === 'professional'
            }; 

            const response = await fetch(`${getApiUrl()}/api/users/register`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(userInfo),
            });

            const data = await response.json();

            if (!response.ok){
                onError(data.error || "Registration failed");
                setIsSubmitting(false);
                return;
            }
            
            const result = await signIn('credentials', {
                username: userInfo.username,
                password: userInfo.password,
                redirect: false
            });
            
            if (result?.error) {
                onError("Login after registration failed. Please try logging in manually.");
                setIsSubmitting(false);
                return;
            } else {
                router.push("/home-page");
                router.refresh();
            }
            
        } catch (error){ 
            console.error('Registration error:', error); 
            onError("An unexpected error occurred whilst creating your account. Please try again.");
            
            // if (error.message.includes('email already registered')) {
            //     onError("This email is already registered. Please use a different email.");
            //     return;
            //     alert('This email is already registered. Please use a different email.');
            // } else if (error.message.includes('username already taken')) {
            //     onError("This username is already taken. Please choose a different username.");
            //     return;
            //     alert('This username is already taken. Please choose a different username.');
            // } else if (error.message.includes('Invalid email')) {
            //     onError("Please enter a valid email address.");
            //     return;
            //     alert('Please enter a valid email address.');
            // } else {
            //     onError("Registration failed. Please try again.");
            //     return;
            //     alert(error.message || 'Registration failed. Please try again.');
            // }
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <form onSubmit={handleSignUpForm} className="w-full">
            <h2 className="text-white text-xl w-full text-center pb-2">
                Would you like to set up a professional or a personal profile?
            </h2>
            <div className="flex justify-center mb-4">
                <AccountToggle 
                    toggleSize="default"
                    onToggle={(type) => {
                        console.log('Profile type selected:', type);
                        setProfileType(type);
                    }}
                    initialProfileType={profileType}
                    usedInSignUp= {true}
                />
            </div>
            <FormRow label="Full Name" id="fullname" name="fullname" />
            <FormRow label="Email Address" id="email" name="email" type="email" />
            <FormRow label="Username" id="username" name="username" />
            <FormRow label="Password" id="password" name="password" type="password" />
            <div className="flex justify-end mt-6">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`bg-white font-bold text-slate-800 px-6 py-2 rounded-full 
                        hover:-translate-y-2 transition-transform duration-200
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Creating Account...' : 'Start Your Adventure'}
                </button>
            </div>
        </form>
    );
} 

export default SignUpForm;