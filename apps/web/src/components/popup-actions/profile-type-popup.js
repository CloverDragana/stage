"use client";

import ConfirmationPopUp from "./popup-structure";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; 

function CreateSecondProfile({onClose, profileCreationType}){

    const { data: session, update } = useSession();
    const router = useRouter();

    const handleCreateSecondProfile = async () => {

        if (!session?.user?.userId || !profileCreationType){
            console.log("UserId or profile type missing missing from the session");
            return;
        }

        try{
            const response = await fetch('/api/auth/create-second-profile',{
                method: "POST",
                headers: { 'Content-Type': 'application/json'}, 
                body: JSON.stringify({userId: session.user.userId, profileType: profileCreationType}), 
            });

            if (response.ok){

                const updatedResponse = await fetch('/api/auth/update-profile-type',{
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({ profileType: profileCreationType })
                });

                if (updatedResponse.ok){
                    await update({ 
                        profileType: profileCreationType,
                        professional_account: profileCreationType === 'professional' ? true : session.user.professional_account,
                        personal_account: profileCreationType === 'personal' ? true : session.user.personal_account
                    });
                    onClose();
                    router.push("/profile");
                    router.refresh();
                }

            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create the second profile account');
            }
        } catch(error) {
            console.error('Second profile creation error', error);
            alert("Error creating second account");
        } 
    };

    return(
        <ConfirmationPopUp 
            title = {`You don't have a ${profileCreationType} profile`}
            message = {`Would you like to create a ${profileCreationType} profile?`}
            onConfirm = {handleCreateSecondProfile}
            onClose = {onClose}
            confirmLabel = "Yes"
            closeLabel = "No"
        />
    )
}

export default CreateSecondProfile; 