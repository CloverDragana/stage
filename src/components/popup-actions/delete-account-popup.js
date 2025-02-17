"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ConfirmationPopUp from "./popup-structure";

function DeleteAccount ({onClose}) {
    const [isDeleting, setDeletion] = useState(false);
    const router = useRouter();

    const handleDeleteUser = async () => {
        setDeletion(true);

        try {
            // First delete the user from database
            const response = await fetch('/api/auth/delete-user', {
                method: "DELETE",
            });

            if (response.ok) {
                // If deletion was successful, sign out user
                await signOut({
                    redirect: true,
                    callbackUrl: "/login"  // Explicitly redirect to login page
                });
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to delete account');
            }
        } catch(error) {
            console.error('Account deletion error:', error);
            alert("Error deleting account");
        } finally {
            setDeletion(false);
        }
    };

    return (
        <ConfirmationPopUp
            title="Are you sure you want to delete your account?"
            message="This action can't be reversed!"
            onConfirm={handleDeleteUser}
            onClose={onClose}
            confirmLabel="Yes"
            closeLabel="No"
            isLoading={isDeleting}
        />
    );
}

export default DeleteAccount;