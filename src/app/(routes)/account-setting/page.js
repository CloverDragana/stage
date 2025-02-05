"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/navigation/navbar";
import Topbar from "@/components/navigation/topbar";
import ProfilePicture from "@/components/profile/profile-picture";
import DeleteAccount from "@/components/delete-account/delete";

export default function AccountSetting() {

    const {data: session, update} = useSession();
    const router = useRouter();
    const [showDeletePopUp, setDeletePopUp] = useState(false);

    const [formData, updateFormData] = useState({
        fName: session?.user?.fName || "", 
        lName: session?.user?.lName || "", 
        gender: session?.user?.gender || "", 
        email: session?.user?.email || "", 
        dob: session?.user?.dob || "", 
        // password: "",
    });
 
    useEffect(() => {
        console.log("Session user data:", session?.user);
        if (session?.user) {
            updateFormData({
                fName: session.user.fName || "",
                lName: session.user.lName || "",
                gender: session.user.gender || "",
                email: session.user.email || "",
                dob: session.user.dob ? new Date(session.user.dob).toLocaleDateString("en-GB") : "",
            });
        }
    }, [session]);

    console.log("Session data :", session);

    const handleInfoChange = (event) => {
        const {name, value } = event.target;
        updateFormData((prev) => ({
            ...prev,
            [name]: name === "dob"? value : value,
        }));
    };

    const handleUpdatedInfo = async (event) => {
        event.preventDefault();

        const [day, month, year] = formDatadob.split("/");
        const formatDob= `${year}-${month}-${day}`;
        try{
            const response = await fetch("api/auth/update-user", {
                method: "PUT",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({
                    ...formData,
                    dob: formatDob,
                }),
            });

            const data = await response.json();
            console.log("Update response:", data);
            
            if(response.ok){
                alert("Profile updated!");

                await update();

                await signIn("credentials", {
                    callbackUrl: "/account-setting",
                    redirect: false,
                });
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error){
            console.error("Update unsuccessful", error);
            alert("Update unsuccessful");
        }
    }

    const handleDeleteButtonClick = () => {
        setDeletePopUp(true);
    }

    const handleDeleteAccount = async (event) => {
        event.preventDefault();
        setDeletePopUp(true);

        try{
            const response = await fetch("api/auth/delete-user", {
                method: "DELETE"
            });
            
            if(response.ok){
                alert("Account Deleted!");
                console.log("acount delete");
                router.push('/login');
            } else {
                alert("Account deletion failed");
            }
        } catch (error){
            console.error("Delete failed", error);
            alert("Accoutn Deletion unsuccessful");
        } 
    }

    //add in auth/unauth component to direct unlogged in users to login page

    return (
      <div className="min-h-screen">
        <Topbar />
            <Navbar />
            <div className="ml-[172px] mt-16 p-6">
                <div className="rounded-3xl bg-secondary p-2">
                    <div className="flex flex-row items-center gap-8">
                        <ProfilePicture />
                        <h2 className="font-bold text-4xl p-2 text-white">Profile Information</h2>
                    </div>
                    <div className="w-full px-3 py-6 justify-between">
                        <form className="flex flex-col justify-between gap-14" onSubmit={handleUpdatedInfo}>
                            <div>
                                <input type="text" name="fName" placeholder="First Name" value={formData.fname} onChange={handleInfoChange} className="rounded-full p-2 text-center"></input>
                                <input type="text" name="lName" placeholder="Last Name" value={formData.lname} onChange={handleInfoChange} className="rounded-full p-2 text-center"></input>
                                <input type="text" name="gender" placeholder="Gender" onChange={handleInfoChange} className="rounded-full p-2 text-center"></input>
                            </div>
                            <div>
                                <input type="text" name="email" placeholder="Email Address" value={formData.email} onChange={handleInfoChange} className="rounded-full p-2 text-center"></input>
                                <input type="text" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInfoChange} className="rounded-full p-2 text-center"></input>
                                {/* <input type="password" name="password" placeholder="Change Password" value={formData.password} onChange={handleInfoChange} className="rounded-full p-2"></input> */}
                            </div>
                            <div className="flex justify-between items-center gap-4 py-4">
                                <button type="button" onClick={handleDeleteButtonClick} className="rounded-full bg-white p-2 text-red-600 border-2 border-red-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]">Delete Account</button>
                                <button type="submit" className="rounded-full p-2 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]">Update Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {showDeletePopUp && <DeleteAccount onClose={ () => setDeletePopUp(false)} onDelete={handleDeleteAccount} />}
      </div>
    );
}