"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

function ProfilePicture({ userId, profileType, isEditing = false, imageUpdate }) {
    const inputFileRef = useRef(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewProfilePicture, setPreviewProfilePicture] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);
    
    // Store the initially loaded profile picture
    const [storedProfilePicture, setStoredProfilePicture] = useState(null);

    useEffect(() => {
        console.log("ProfilePicture component rendering with:", {userId, profileType});

        // Only attempt to load from localStorage on initial mount or 
        // when userId/profileType legitimately change (not become undefined)
        if (!initialLoad && (!userId || !profileType || userId === '0')) {
            return;
        }
        
        if (!userId || !profileType) {
            console.log("Missing userId or profileType, using default image");
            setProfilePicture("/userIcon.jpeg");
            return;
        }

        try {
            const localStoragePP = localStorage.getItem(`profilePicture-${userId}-${profileType}`);

            if (localStoragePP) {
                console.log('localStoragePP:', localStoragePP);
                setProfilePicture(localStoragePP);
                setStoredProfilePicture(localStoragePP);
                setInitialLoad(false);
            } else {
                console.log("nothing found in local storage");
                setProfilePicture("/userIcon.jpeg");
                setInitialLoad(false);
            }
        } catch (err) {
            console.error("Error accessing localStorage:", err);
            setProfilePicture("/userIcon.jpeg");
            setInitialLoad(false);
        }
    }, [userId, profileType, initialLoad]);
    
    // If userId becomes undefined after initial load, use the stored profile picture
    useEffect(() => {
        if (!initialLoad && (!userId || userId === '0') && storedProfilePicture) {
            console.log("Using stored profile picture as userId is now undefined");
            setProfilePicture(storedProfilePicture);
        }
    }, [userId, initialLoad, storedProfilePicture]);

    const handleImageChangeClick = () => {
        if (isEditing && inputFileRef.current){
            inputFileRef.current.click();
        }
    };

    const handleImageUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileReader = new FileReader();

            fileReader.onload = (event) => {
                const base64Image = fileReader.result;
                setPreviewProfilePicture(base64Image);

                if(imageUpdate){
                    imageUpdate(file, base64Image);
                }
            };

            fileReader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        return () => {
            if (previewProfilePicture) {
                URL.revokeObjectURL(previewProfilePicture);
            }
        };
    }, [previewProfilePicture]);

    const displayPreview = previewProfilePicture || profilePicture;

    return(
        <div className="relative rounded-full p-3 bg-white overflow-hidden" onClick={handleImageChangeClick}>
            <img 
                src={displayPreview || "/userIcon.jpeg"} 
                alt="profile" 
                className="rounded-full w-48 h-48 object-cover"
                onError={() => {
                    setProfilePicture("/userIcon.jpeg");
                }}
            />
            
            {isEditing && (
                <>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
                    <div className="text-white text-5xl font-light transition-transform duration-200 group-hover:scale-110">+</div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={inputFileRef}
                        onChange={handleImageUpload}
                    />
                </div>
                </>
            )}
        </div>
    );
}

export default ProfilePicture;