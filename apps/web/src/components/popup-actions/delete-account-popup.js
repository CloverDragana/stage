"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ConfirmationPopUp from "./popup-structure"

function DeleteAccount ({onClose}) {

    const { data: session } = useSession();
    const [isDeleting, setDeletion] = useState(false);
    const router = useRouter();

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    const handleDeleteUser = async () => {
        if (!session?.accessToken) {
            console.error('No access token available');
            alert('Please log in again');
            return;
        }

        setDeletion(true);

        try{

            // use node to delete users entry in the databse 
            const response = await fetch(`${getApiUrl()}/api/users/delete-user`,{
                method: "DELETE",
                headers: {"Authorization": `Bearer ${session.accessToken}`}
            });

            // use signOut to end the users session and token so they are no longer unauthenticated 
            if (response.ok){
                console.log("User successfully deleted from database");
                await signOut({ redirect: false });

                // user router to redirect the user to login page as they are no longer authenticated 
                router.push("/");
                router.refresh();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to delete account');
            }
        } catch(error) {
            console.error('Account deletion error', error);
            alert("Error deleting account");
        } finally{
            setDeletion(false);
        }
    };

    return (
        <ConfirmationPopUp
            title = "Are you sure you want to delete your account?"
            message = "This action can't be reversed!"
            onConfirm = {handleDeleteUser}
            onClose = {onClose}
            confirmLabel = "Yes"
            closeLabel = "No"
            isLoading = {isDeleting}
        />
    );
}

export default DeleteAccount;