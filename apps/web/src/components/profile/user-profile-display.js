"use client";

import { useState, useEffect } from "react";

const UserProfileDisplay = ({ user, onClick }) => {

    const [profilePicture, setProfilePicture] = useState(null);
    // const [initialLoad, setInitialLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        setIsLoading(true);
        
        if (!user?.userId || !user?.profileType) {
            console.log("Missing userId or profileType, using default image");
            setProfilePicture("/userIcon.jpeg");
            setIsLoading(false);
            return;
        }

        const fetchProfilePicture = async () => {
            try {
                if (user.profilePicture) {
                    const imagePath = user.profilePicture.startsWith('/uploads') 
                        ? user.profilePicture 
                        : `/uploads/profile/${user.profilePicture}`;
                    setProfilePicture(imagePath);
                    setIsLoading(false);
                    return;
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const response = await fetch(
                    `${apiUrl}/api/profiles/get-profile-content?id=${user.userId}&profileType=${user.profileType}`,
                    { method: "GET", headers: { "Content-Type": "application/json" } }
                );
                
                if (response.ok) {
                    const data = await response.json();
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
                // setInitialLoad(false);
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

    return (
        <div 
            className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={handleClick}
            >
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-3">
            {!isLoading && profilePicture && profilePicture !== "/userIcon.jpeg" ? (
                    <img 
                        src={profilePicture} 
                        alt={user.displayName || ""} 
                        className="w-full h-full object-cover"
                        onError={() => setProfilePicture("/userIcon.jpeg")}
                    />
                ) : (
                     <img 
                     src="/userIcon.jpeg" 
                     alt={user.displayName || ""} 
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
                {user.bio && (
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
