"use client";

import { signOut } from "next-auth/react";
import ConfirmationPopUp from "@/components/popup-actions/popup-structure"

function LogoutPopUp({onClose}){
    return (
        <ConfirmationPopUp
        title = "Are you sure you would like to log out?"
        onConfirm = {() => signOut({ callbackUrl: "/login"})}
        onClose = {onClose}
        confirmLabel = "Yes"
        closeLabel = "No"
        />
    );
}

export default LogoutPopUp;