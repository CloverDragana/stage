"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ConfirmationPopUp from "./popup-structure";

function DeleteAccount ({onClose}) {
    const [isDeleting, setDeletion] = useState(false);
    const { update } = useSession();

    const handleDeleteUser = async () => {
        setDeletion(true);

        try {
            const response = await fetch('/api/auth/delete-user', {
                method: "DELETE",
            });

            if (response.ok) {
                // Force session update
                await update();
                // Sign out and force reload
                await signOut({ 
                    redirect: false 
                });
                // Force a complete page reload
                window.location.href = '/';
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