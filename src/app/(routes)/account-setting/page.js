"use client";

import { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
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
        fname: "", 
        lname: "", 
        gender: "", 
        email: "", 
        dob: "",
    });

    useEffect(() => {

        if (!session || !session?.user) return
       
        updateFormData(prev => {
            if (
               prev.fname === session.user.fname &&
               prev.lname === session.user.lname &&
               prev.gender === session.user.gender &&
               prev.email === session.user.email &&
               prev.dob === (session.user.dob ? new Date(session.user.dob).toLocaleDateString("en-GB") : "")
            ){
                return prev;
            }
            return {
                fname: session.user.fname || "",
                lname: session.user.lname || "",
                gender: session.user.gender || "",
                email: session.user.email || "",
                dob: session.user.dob ? new Date(session.user.dob).toLocaleDateString("en-GB") : "",
            };
        });
   }, [session]);

    const handleInfoChange = (event) => {
        const {name, value} = event.target;
        updateFormData(prev => ({
            ...prev,
            [name]: name === "dob" ? value : value,
        }));
    };

    const handleUpdatedInfo = async (event) => {
        event.preventDefault();

        let formatDob = null;
        if(formData.dob) {
            const [day, month, year] = formData.dob.split("/");
            if (day && month && year){
                formatDob = `${year}-${month}-${day}`;
            }
        }

        try {
            console.log("updating profile with:", formData);

            const response = await fetch("/api/auth/update-user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, dob: formatDob, userId: session.user.userId}),
            });

            if(!response.ok) {
                throw new Error("Update failed");
            }

            const data = await response.json();
            console.log("Update successful", data);

            // console.log("session before update:", update);

            await update({ ...session, user: data.user });
            await getSession();

            console.log("session after update:", session);
    
        } catch (error) {
            console.error("Update unsuccessful", error);
            alert("Update unsuccessful");
        }
    };

   const handleDeleteAccount = async (event) => {
       event.preventDefault();
       try {
           const response = await fetch("/api/auth/delete-user", {
               method: "DELETE"
           });
           
           if(response.ok) {
               alert("Account Deleted!");
               router.push('/login');
               router.refresh(); // clear cache
           } else {
               alert("Account deletion failed");
           }
       } catch (error) {
           console.error("Delete failed", error);
           alert("Account Deletion unsuccessful");
       } 
   };

   return (
    <div className="min-h-screen">
        <Topbar />
        <Navbar />
        <div className="ml-[194px] mt-[78px] p-6">
            <div className="rounded-3xl bg-secondary p-2">
                <div className="flex flex-row items-center gap-8">
                    <ProfilePicture />
                    <h2 className="font-bold text-4xl p-2 text-white">Profile Information</h2>
                </div>
                <div className="w-full px-3 py-6 justify-between">
                    <form className="flex flex-col justify-between gap-14" onSubmit={handleUpdatedInfo}>
                        <div>
                            <input type="text" name="fname" placeholder="First Name" value={formData.fname} onChange={handleInfoChange} className="rounded-full p-2 text-center" />
                            <input type="text" name="lname" placeholder="Last Name" value={formData.lname} onChange={handleInfoChange} className="rounded-full p-2 text-center" />
                            <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleInfoChange} className="rounded-full p-2 text-center" />
                        </div>
                        <div>
                            <input type="text" name="email" placeholder="Email Address" value={formData.email} onChange={handleInfoChange} className="rounded-full p-2 text-center" />
                            <input type="text" name="dob" placeholder="Date of Birth DD/MM/YYYY" value={formData.dob} onChange={handleInfoChange} className="rounded-full p-2 text-center" />
                        </div>
                        <div className="flex justify-between items-center gap-4 py-4">
                            <button type="button" onClick={() => setDeletePopUp(true)} className="rounded-full bg-white p-2 text-red-600 border-2 border-red-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]">Delete Account</button>
                            <button type="submit" className="rounded-full p-2 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]">Update Account</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        {showDeletePopUp && <DeleteAccount onClose={() => setDeletePopUp(false)} onDelete={handleDeleteAccount} />}
    </div>
);
}