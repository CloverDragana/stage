"use client";

import { useRef, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

function ProfilePicture({ userId, profileType, isEditing = false, imageUpdate, isOwnProfile }) {
    const { data: session } = useSession();
    const inputFileRef = useRef(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewProfilePicture, setPreviewProfilePicture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {
        
        if (!userId || !profileType || userId === '0' || profileType === 'default') {
            console.log("Missing or invalid userId or profileType, using default image");
            setProfilePicture("/userIcon.jpeg");
            setIsLoading(false);
            return;
        }

        const fetchProfilePicture = async () => {
            try {
                if (isOwnProfile && session?.user?.id) {
                    
                    const localStoragePP = localStorage.getItem(`profilePicture-${session?.user?.id}-${session?.user?.profileType}`);
                    if (localStoragePP && (localStoragePP.startsWith('data:image')) || localStoragePP.startsWith('/uploads')) {
                        setProfilePicture(localStoragePP);
                    }
                }
                
                const response = await fetch(
                    `${getApiUrl()}/api/profiles/get-profile-picture?userId=${userId}&profileType=${profileType}`, 
                    { 
                        method: "GET", 
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${session.accessToken}` 
                        } 
                    });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.profilePicture) {
                        const imagePath = `/uploads/profile/${data.profilePicture}`;
                        setProfilePicture(imagePath);
                        
                        if (isOwnProfile) {
                            localStorage.setItem(`profilePicture-${session?.user?.id}-${session?.user?.profileType}`, imagePath);
                        }
                    } else {
                        console.log("No profile picture in database, using default");
                        setProfilePicture("/userIcon.jpeg");
                    }
                } else {
                    setProfilePicture("/userIcon.jpeg");
                }
            } catch (error) {
                console.error("Error fetching profile picture:", error);
                setProfilePicture("/userIcon.jpeg");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfilePicture();
    }, [userId, profileType, isOwnProfile, session]);

    const handleImageChangeClick = () => {
        if (isEditing && inputFileRef.current){
            inputFileRef.current.click();
        }
    };

    const handleImageUpload = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                const base64Image = fileReader.result;
                setPreviewProfilePicture(base64Image);

                if(imageUpdate){
                    imageUpdate(file, base64Image, 'profile');
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

    const displayPreview = previewProfilePicture || profilePicture || "/userIcon.jpeg";

    // const getImageUrl = (filename) => {
    //     if (!filename) return null;
        
    //     // Check if it's already a complete URL or data URL
    //     if (filename.startsWith('data:') || filename.startsWith('http')) {
    //       return filename;
    //     }
    //     if (filename.startsWith('/uploads/')) {
    //         return filename; // Next.js will serve from /public
    //       }

    //     // If it's just a filename, construct the full URL
    //     if (filename.includes('/uploads/profile/')) {
    //       return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${filename}`;
    //     } else {
    //       return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/profile/${filename}`;
    //     }
    //   };

    return(
        <div className="relative rounded-full p-3 bg-white overflow-hidden" onClick={handleImageChangeClick}>
            <img 
                // src={previewProfilePicture || (profilePicture ? getImageUrl(profilePicture) : "/userIcon.jpeg")}
                src={displayPreview}
                alt="profile" 
                className="rounded-full w-48 h-48 object-cover"
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