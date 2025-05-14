"use client";

import { useState, useEffect } from "react";

const UserProfileDisplay = ({ user, onClick, isOnContent, accessToken }) => {

    const [profilePicture, setProfilePicture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    // documented
    useEffect(() => {
        setIsLoading(true);

        // if no user data in prop, return with default imaged and cleared loading 
        if (!user) {
            setProfilePicture("/userIcon.jpeg");
            setIsLoading(false);
            return;
        }

        const userId = user?.userId || user?.id;
        const profileType = user?.profileType;
        // if data doesn't exist in prop require for profile picture retrieval
        // return with default image and cleared loading
        if (!userId || !profileType) {
            setProfilePicture("/userIcon.jpeg");
            setIsLoading(false);
            return;
        }

        const fetchProfilePicture = async () => {
            try {
                // if the profile picture exists in the user prop, use it and return
                if (user.profilePicture) {
                    const imagePath = user.profilePicture.startsWith('/uploads') 
                        ? user.profilePicture 
                        : `/uploads/profile/${user.profilePicture}`;
                    setProfilePicture(imagePath);
                    setIsLoading(false);
                    return;
                }

                // if not authenticated return
                if (!accessToken) {
                    setProfilePicture("/userIcon.jpeg");
                    setIsLoading(false);
                    return;
                }

                // retrieve profile picture using userid and profiletype collected from prop
                const response = await fetch(
                    `${getApiUrl()}/api/profiles/get-profile-content?id=${userId}&profileType=${profileType}`,
                    { 
                        method: "GET", 
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${accessToken}` 
                        } 
                    });

                if (response.ok) { // handle response
                    const data = await response.json();
                    // if picture is returned, use it
                    if (data.profilePicture) {
                        const imagePath = `/uploads/profile/${data.profilePicture}`;
                        setProfilePicture(imagePath);
                    } else {
                        // if no picuture is returned from API, set to default image
                        setProfilePicture("/userIcon.jpeg");
                    }
                } else {
                    // use default image if response not successful
                    setProfilePicture("/userIcon.jpeg");
                }
            } catch (error) {
                // log error and set default image
                console.error("Error fetching profile picture:", error);
                setProfilePicture("/userIcon.jpeg");
            } finally {
                // clear loading state
                setIsLoading(false);
            }
        };

        fetchProfilePicture();
    }, [user?.userId, user?.id, user?.profileType, user?.profilePicture, accessToken]);

    //documented
    const handleClick = () => {
        // check if onClick prop was provided by parent component
        if (onClick) {
            // calls parent function and passes user object
            onClick(user);
        } 
    };

    const profileTypeText = user ? (user.profileType === 'personal' ? 'Personal Profile' : 'Professional Profile') : '';
    // const displayName = user ? user.displayName : "User";
    const displayName = user?.profileType === 'personal' ? user?.username : user?.fullname;
    //documented
    return (
        <div 
            className={`flex items-center ${isOnContent !== true ? 'hover:bg-gray-100 cursor-pointer p-3' : ' cursor-pointer p-1'}` }
            onClick={handleClick}
            >
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-3">
                {!isLoading && profilePicture && profilePicture !== "/userIcon.jpeg" ? (
                    <img 
                        src={profilePicture} 
                        alt={displayName || 'User'} 
                        className="w-full h-full object-cover"
                        onError={() => setProfilePicture("/userIcon.jpeg")}
                    />
                ) : (
                     <img 
                     src="/userIcon.jpeg" 
                     alt={displayName || 'User'} 
                     className="w-full h-full object-cover"
                     onError={() => setProfilePicture("/userIcon.jpeg")}
                    />
                )}
            </div>
            <div className="flex-1">
                {!user ? (
                    <div className="font-bold text-xl">User</div>
                ) : (
                    <div className="font-bold text-lg">{displayName || "User"}</div>
                )}
            </div>
            {user && (
                <div className="text-sm text-gray-500 ml-2 mt-1">
                    {profileTypeText}
                </div>
            )}
        </div>
    );
};

export default UserProfileDisplay;
