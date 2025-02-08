"use client";

import AccountToggle from "../navigation/account-toggle";
import FormRow from "@/components/login/login-form-row";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function SignUpForm(){ 
    const router = useRouter();

    const handleSignUpForm = async (event) => { 
        event.preventDefault(); 

        try {
            const formData = new FormData(event.target); 

            const userInfo = { 
                fName: formData.get('fName'), 
                lName: formData.get('lName'), 
                email: formData.get('email'), 
                username: formData.get('username'), 
                password: formData.get('password')
            }; 
         
            const response = await fetch('/api/auth/register-user', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json'}, 
                body: JSON.stringify(userInfo), 
            }); 

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "registration failed");
            }

            console.log('sign up successful');
            
            // Sign in the user after successful registration
            const result = await signIn('credentials', {
                username: userInfo.username,
                password: userInfo.password,
                redirect: false
            });

            // if(!result?.error) {
            //     router.push('/profile');
            //     router.refresh();
            // }
            if (result?.error) {
                throw new Error(result.error);
            }

            // Redirect to profile page
            router.push('/profile');
            router.refresh();
            
        } catch (error){ 
            // throw new Error(result.error);
            console.log('registration error', error); 
            
            if (error.message.includes('email already registered')) {
                alert('This email is already registered. Please use a different email.');
            } else if (error.message.includes('username already taken')) {
                alert('This username is already taken. Please choose a different username.');
            } else if (error.message.includes('Invalid email')) {
                alert('Please enter a valid email address.');
            } else {
                alert(error.message || 'Registration failed. Please try again.');
            }
        } 
    };

    return(
        <form onSubmit={handleSignUpForm} className="w-full">
            <h2 className="text-white text-xl w-full text-center pb-2">Would you like to set up a professional or a personal profile?</h2>
            <div className="flex justify-center mb-4">
                <AccountToggle onToggle={(type) => {console.log('Profile type selected:', type); setProfileType(type);}}/>
            </div>
            <FormRow label="First Name" id="fName" name="fName" type="text" />
            <FormRow label="Last Name" id="lName" name="lName" type="text" />
            <FormRow label="Email Address" id="email" name="email" type="email" />
            <FormRow label="Username" id="username" name="username" type="text" />
            <FormRow label="Password" id="password" name="password" type="password"/>
            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-white text-slate-800 px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">
                    Start Your Adventure
                </button>
            </div>
        </form>
    );
} 

export default SignUpForm;