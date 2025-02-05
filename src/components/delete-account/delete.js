"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function DeleteAccount ({onClose}) {

    const [isDeleting, setDeletion] = useState(false);
    const router = useRouter();

    const handleDeleteUser = async () => {
        setDeletion(true);

        try{
            const response = await fetch('api/auth/delete-user',{
                method: "DELETE",
            });

            if (response.ok){
                router.push('/login');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to delete account');
            }
        } catch(error) {
            console.error('account deletion error', error);
            alert("Error deleting account");
        } finally{
            setDeletion(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className=" bg-white w-1/3 p-6 rounded-lg shadow-lg flex flex-col gap-6 text-center">
                <h1 className="text-xl font-bold">Are you sure you want to delete your account?</h1>
                <p>This action can't be reversed!</p>
                <div className="flex justify-center gap-4">
                    <button type="button" onClick={handleDeleteUser} disabled={isDeleting} className="rounded-full p-2 w-16 text-red-600 border-2 border-red-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]">yes</button>
                    <button type="button" onClick={onClose} disabled={isDeleting} className="rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]">no</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteAccount;