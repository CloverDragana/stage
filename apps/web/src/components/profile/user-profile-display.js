"use client";

import { useState, useEffect } from "react";

const UserProfileDisplay = ({ user, onClick, isOnPost, accessToken }) => {

    const [profilePicture, setProfilePicture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {

        setIsLoading(true);
        
        console.log("UserProfileDisplay received user:", user);

        // if (!user) {
        //     setProfilePicture("/userIcon.jpeg");
        //     setIsLoading(false);
        //     return;
        // }

        // if (!user?.userId || !user?.profileType) {
        //     console.log("Missing userId or profileType, using default image");
        //     setProfilePicture("/userIcon.jpeg");
        //     setIsLoading(false);
        //     return;
        // }

        const userId = user?.userId || user?.id;
        const profileType = user?.profileType;

        if (!userId || !profileType) {
            setProfilePicture("/userIcon.jpeg");
            setIsLoading(false);
            return;
        }

        const fetchProfilePicture = async () => {
            try {
                console.log("profile picture", user.profilePicture);
                if (user.profilePicture) {
                    const imagePath = user.profilePicture.startsWith('/uploads') 
                        ? user.profilePicture 
                        : `/uploads/profile/${user.profilePicture}`;
                    setProfilePicture(imagePath);
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(
                    `${getApiUrl()}/api/profiles/get-profile-content?id=${userId}&profileType=${profileType}`,
                    { 
                        method: "GET", 
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${accessToken}` 
                        } 
                    });
                console.log("response", response);
                if (response.ok) {
                    const data = await response.json();
                    console.log("data", data);
                    if (data.profilePicture) {
                        const imagePath = `/uploads/profile/${data.profilePicture}`;
                        setProfilePicture(imagePath);
                    } else {
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
    }, [user?.userId, user?.profileType, user?.profilePicture]);

    const handleClick = () => {
        if (onClick) {
        onClick(user);
        } 
    };

    const displayName = user?.profileType === 'personal' ? user?.username : user?.fullname;

    return (
        <div 
            className={`p-3 flex items-center ${isOnPost !== true ? 'hover:bg-gray-100 cursor-pointer' : ' cursor-default'}` }
            onClick={handleClick}
            >
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-3">
            {!isLoading && profilePicture && profilePicture !== "/userIcon.jpeg" ? (
                    <img 
                        src={profilePicture} 
                        alt={displayName} 
                        className="w-full h-full object-cover"
                        onError={() => setProfilePicture("/userIcon.jpeg")}
                    />
                ) : (
                     <img 
                     src="/userIcon.jpeg" 
                     alt={displayName} 
                     className="w-full h-full object-cover"
                     onError={() => setProfilePicture("/userIcon.jpeg")}
                 />
                )}
            </div>
            <div className="flex-1">
                {user.profileType === 'personal' ? (
                <div className="font-bold">{user.username}</div>
                ) : (
                <div className="font-bold">{user.fullname}</div>
                )}
                {isOnPost !== true && user.bio && (
                <div className="text-sm text-gray-600 truncate max-w-xs">{user.bio}</div>
                )}
            </div>
            <div className="text-xs text-gray-500 ml-2">
                {user.profileType === 'personal' ? 'Personal Profile' : 'Professional Profile'}
            </div>
        </div>
    );
};

export default UserProfileDisplay;
