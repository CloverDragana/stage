"use client";

import { signOut } from "next-auth/react";

function LogoutPopUp({onClose}){
    const confirmLogout = () => {
        signOut({ callbackUrl: "/login"});
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className=" bg-white w-1/3 p-6 rounded-lg shadow-lg flex flex-col gap-6 text-center">
                <h2 className="text-xl font-bold">Are you sure you would like to log out?</h2>
                <div className="flex justify-center gap-4">
                    <button onClick={confirmLogout} className="rounded-full p-2 w-16 text-red-600 border-2 border-red-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]">Yes</button>
                    <button onClick={onClose} className="rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]">No</button>
                </div>
            </div>
        </div>
    )
}

export default LogoutPopUp;