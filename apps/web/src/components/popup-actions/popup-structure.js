"use client";

import { useState } from "react";

function ConfirmationPopUp ({
    title,
    message,
    onConfirm,
    onClose,
    confirmLabel = "",
    closeLabel = "",
    showOneButton = false,
    isLoading = false
}) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className=" bg-white w-1/3 p-6 rounded-lg shadow-lg flex flex-col gap-6 text-center">
                <h2 className="text-xl font-bold">{title}</h2>
                {message && <p>{message}</p>}
                <div className="flex justify-center gap-4">
                    {showOneButton ? (
                        <button type="button" onClick={onClose} disabled={isLoading} className="rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]">{closeLabel}</button>
                    ) : ( <>
                        <button type="button" onClick={onConfirm} disabled={isLoading} className="rounded-full p-2 w-16 text-red-600 border-2 border-red-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]">{isLoading ? "..." : confirmLabel}</button> 
                        <button type="button" onClick={onClose} disabled={isLoading} className="rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]">{closeLabel}</button>
                        </> 
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConfirmationPopUp;