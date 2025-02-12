"use client";

import ConfirmationPopUp from "./popup-structure";

function CreateSecondProfile(){

    const handleCreateSecondProfile = async () => {
        // setDeletion(true);

        try{
            const response = await fetch('api/auth/create-second-profile',{
                method: "POST",
            });

            if (response.ok){
                router.push('/profile');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to create the second profile account');
            }
        } catch(error) {
            console.error('Second profile creation error', error);
            alert("Error creating second account");
        } finally{
            // setDeletion(false);
        }
    };

    return(
        <ConfirmationPopUp 
            title = "You don't have a ... profile"
            message = "Would you like to create a ... profile?"
            onConfirm = {handleCreateSecondProfile}
            onClose = {onClose}
            confirmLabel = "Begin my Adventure"
            closeLabel = "No Thank You"
        />
    )
}

export default CreateSecondProfile; 