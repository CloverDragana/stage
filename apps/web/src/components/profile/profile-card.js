"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProfilePicture from "./profile-picture";
import PersonalTags from "./personal-tags";
import StarWork from "./star-work";

const ProfileCard = ({ userData, isOwnProfile}) => {
    const { data: session, status: sessionStatus } = useSession();
    const [profileData, setProfileData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [updatedProfileData, setUpdatedProfileData] = useState({
        creativeSlogan: "", 
        bio: "", 
        profilePicture: null
    });
    
    const [status, setStatus] = useState("idle");

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {
        
        if (userData) {
            console.log("user d:", userData);
            setProfileData(userData);
            console.log("profile d:", profileData);
            setUpdatedProfileData({
                creativeSlogan: userData.creativeSlogan || "",
                bio: userData.bio || "",
                profilePicture: null
            });

            if (!isOwnProfile && session?.user?.id) {
                checkFollowExists();
            }
            fetchProfileContent(userData);
        } else if (session?.user?.id && session?.user?.profileType) {
            fetchProfileContent(userData);
        } else {
            fetchProfileContent(userData);
        }
    }, [session, userData, isOwnProfile]);

    const fetchProfileContent = async (userData) => {
        if (!session?.user?.id || !session?.user?.profileType) return;

        try {
            
            const userId = isOwnProfile ? session.user.id : userData?.userId;
            const profileType = isOwnProfile ? session.user.profileType : userData?.profileType;

            if (!userId || !profileType) {
                console.log("Missing user ID or profile type, cannot fetch profile content");
                return;
            }
                
            console.log("id: ", userId," profile type", profileType);
            const response = await fetch(`${getApiUrl()}/api/profiles/get-profile-content?id=${userId}&profileType=${profileType}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.accessToken}`
                }
            });
            
    
            if (!response.ok) {
                console.log("Failed to retrieve data");
                return;
            }

            const profileData = await response.json();
            console.log("printing profile data : ", profileData);

            console.log(profileData.profilePicture); 

            if (profileData.profilePicture) {
                const imagePath = `/uploads/profile/${profileData.profilePicture}`;
                localStorage.setItem(
                    `profilePicture-${userId}-${profileType}`, 
                    imagePath
                );
                
                // Update profileData with the full path
                profileData.profilePicture = imagePath;
            }

            setProfileData(profileData);
            setUpdatedProfileData({
                creativeSlogan: profileData.creativeSlogan || "",
                bio: profileData.bio || "",
                profilePicture: null
            });

        } catch (error) {
            console.log("Error retrieving profile type data", error);
        } 
    };

    const checkFollowExists = async () => {
        try {
            const loggedInProfileId = await fetch(
                `${getApiUrl()}/api/profiles/get-profile-id?userId=${session.user.id}&profileType=${session.user.profileType}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.accessToken}`
                    }
                }
            );

            if (!loggedInProfileId.ok) {
                console.log("Failed to get profile id");
                return;
            }

            const loggedInProfileData = await loggedInProfileId.json();
            const followerProfileId = loggedInProfileData?.profileId;

            const followedProfileId = userData?.profileId;

            console.log("Checking follow relationship between:", {
                followerProfileId,
                followedProfileId
            });

            const followCheckResponse = await fetch(
                `${getApiUrl()}/api/connections/check-follow-exists?followerProfileId=${followerProfileId}&followedProfileId=${followedProfileId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.accessToken}`
                    }
                }
            );

            if (followCheckResponse.ok) {
                const followCheckData = await followCheckResponse.json();
                setIsFollowing(followCheckData.isFollowing);
                console.log("Follow status:", followCheckData.isFollowing);
            } else {
                console.log("Failed to check follow status");
                setIsFollowing(false);
            }

        } catch (error) {
            console.log("Failed to check if following", error);
            setIsFollowing(false);
        }
    };

    const handleFollowingClick = async () => {
        if (status === "following" || !userData?.profileId) return;

        setStatus("following");

        try {
            const loggedInProfileId = await fetch(
                `${getApiUrl()}/api/profiles/get-profile-id?userId=${session.user.id}&profileType=${session.user.profileType}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.accessToken}`
                    }
                }
            );

            if (!loggedInProfileId.ok) {
                console.log("Failed to get profile id");
                return;
            }

            const loggedInProfileData = await loggedInProfileId.json();
            const followerProfileId = loggedInProfileData?.profileId;

            const followedProfileId = userData?.profileId;

            const connectionEndPoint = isFollowing ? "unfollow" : "follow";

            const followResponse = await fetch(
                `${getApiUrl()}/api/connections/${connectionEndPoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json", 
                        "Authorization": `Bearer ${session.accessToken}`
                    }, 
                    body: JSON.stringify({
                        followerProfileId: followerProfileId,
                        followedProfileId: followedProfileId
                    })
                }
            );

            if (followResponse.ok) {
                setIsFollowing(!isFollowing);
                console.log(`Successfully ${connectionEndPoint}ed. New follow state:`, !isFollowing);
            } else {
                console.log(`Failed to ${connectionEndPoint}`);
            }

        } catch (error) {
            console.log("Failed to follow", error);
        } finally {
            setStatus("idle");
        }
    };

    const handleProfileDataChange = (event) => {
        setUpdatedProfileData({
            ...updatedProfileData, 
            [event.target.name]: event.target.value 
        });
    };

    const handleProfilePictureUpdate = (imageFile, base64Image) => {
        if (!isOwnProfile || !imageFile) return;

        // Store the file object in state for later upload
        setUpdatedProfileData(prev => ({
            ...prev,
            profilePicture: imageFile
        }));
        
        // Store in localStorage for immediate display in the ProfilePicture component
        localStorage.setItem(
            `profilePicture-${session?.user?.id}-${session?.user?.profileType}`, 
            base64Image
        );
    };

    const saveUpdatedProfileData = async () => {
        if (!isOwnProfile) return;
        
        setStatus("saving");
        
        try {
            let isSuccess = true;
            let updatedProfilePicture = null;
            
            if (updatedProfileData.profilePicture) {

                const formData = new FormData();

                formData.append("userId", session.user.id);
                formData.append("profileType", session.user.profileType);
                formData.append("file", updatedProfileData.profilePicture);
                
                console.log("Uploading profile picture...");
                const pictureResponse = await fetch(`${getApiUrl()}/api/profiles/update-profile-picture`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`
                    },
                    body: formData
                });
                
                if (!pictureResponse.ok) {
                    console.log("Failed to update profile picture");
                    isSuccess = false;
                } else {
                    console.log("Profile picture updated successfully");

                    const profilePictureData = await pictureResponse.json();

                    if (profilePictureData.profilePicture) {
                        // Store the full path
                        updatedProfilePicture = `/uploads/profile/${profilePictureData.profilePicture}`;
                        
                        // Update localStorage with the new path
                        localStorage.setItem(
                            `profilePicture-${session.user.id}-${session.user.profileType}`, 
                            updatedProfilePicture
                        );
                        
                        console.log("Profile picture updated in localStorage:", updatedProfilePicture);
                    }
                }
            }
        
            console.log("Updating profile text information...");    
            const response = await fetch(`${getApiUrl()}/api/profiles/update-profile`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    profileType: session.user.profileType,
                    creativeSlogan: updatedProfileData.creativeSlogan || "",
                    bio: updatedProfileData.bio || ""
                })
            });
            
            if (!response.ok) {
                console.log("Failed to update data");
                isSuccess = false;
            } else {
                const updatedData = await response.json();

                if (updatedProfilePicture) {
                    updatedData.profilePicture = updatedProfilePicture;
                }

                setProfileData(updatedData);
                console.log("Profile data updated successfully:", updatedData);
            }
            
            if (isSuccess) {
                setUpdatedProfileData(prev => ({
                    ...prev,
                    profilePicture: null
                }));
                setStatus("idle");
                
                await fetchProfileContent();
            }
        } catch (error) {
            console.log("Failed to update profile information", error);
        } finally {
            if (status === "saving") {
                setStatus("idle");
            }
        }
    };

    const toggleEditMode = () => {
        if (status === "editing") {
            setStatus("idle");

            setUpdatedProfileData({
                creativeSlogan: profileData?.creativeSlogan || "",
                bio: profileData?.bio || "",
                profilePicture: null
            });
        } else {
            setStatus("editing");
        }
    };

    if (sessionStatus === "loading") {
        return <p className="text-center">Your Adventure Awaits...</p>;
    }
    

    const user = profileData || session?.user;
    const isSessionUserProfile = user?.profileType === 'personal';

    console.log("meow",user);

    const displayProfileTypeName = isSessionUserProfile 
        ? user?.username 
        : (user?.fullname || "").trim();

    const isEditing = status === "editing";
    const isSaving = status === "saving";
    const isUpdatingFollow = status === "following";

    return (
        <div className="w-full">
            <div className="w-full h-52 bg-blue-500 relative">
            <div className="absolute -bottom-40 left-8 flex flex-col items-center gap-4 w-52"> 
                    <ProfilePicture 
                        userId={isOwnProfile ? session?.user?.id : userData?.userId} 
                        profileType={isOwnProfile ? session?.user?.profileType : userData?.profileType} 
                        isEditing={isEditing} 
                        imageUpdate={handleProfilePictureUpdate}
                        isOwnProfile={isOwnProfile}
                    />
                    {isOwnProfile ? (
                        <button 
                            className={`h-10 rounded-full p-2 w-[150px] border-2 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(152,_198,_206,_0.5)] ${isEditing ? "text-red-600 border-red-600 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]" : "text-black border-secondary"}`} 
                            onClick={toggleEditMode}
                            disabled={isSaving}
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    ) : (
                        <button 
                            className={`h-10 rounded-full p-2 w-[150px] border-2 ${isFollowing ? "text-white bg-secondary border-secondary" : "text-black border-secondary"}`} 
                            onClick={handleFollowingClick}
                            disabled={isUpdatingFollow}
                        >
                            {isUpdatingFollow ? "..." : (isFollowing ? "Following" : "Follow")}
                        </button>
                    )}
                </div>
            </div>
            <div className="pl-64 pr-8 ">
                <div className="max-w-full">
                    <div className="flex flex-col mt-2">
                        <span className="text-4xl font-bold">{displayProfileTypeName}</span>
                        {isEditing && isOwnProfile ? (
                            <>
                                <input 
                                    type="text" 
                                    name="creativeSlogan"
                                    value={updatedProfileData.creativeSlogan || ""} 
                                    onChange={handleProfileDataChange} 
                                    placeholder="Write your creative slogan here..."
                                    className="p-2 border rounded-full text-xl"
                                    style={{
                                        width: `${(updatedProfileData.creativeSlogan || "").length * 10}px`,
                                        minWidth: "400px",
                                        maxWidth: "100%"
                                    }}
                                />
                                <input 
                                    type="text" 
                                    name="bio" 
                                    value={updatedProfileData.bio || ""} 
                                    onChange={handleProfileDataChange} 
                                    placeholder="Describe your creative persona" 
                                    className="p-2 border rounded-full overflow-hidden"
                                    style={{
                                        width: `${(updatedProfileData.bio || "").length * 10}px`,
                                        minWidth: "400px",
                                        maxWidth: "100%"
                                    }}
                                />
                                <button 
                                    className="mt-4 rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]"
                                    onClick={saveUpdatedProfileData}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "..." : "Save"}
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-xl font-bold pb-4">{profileData?.creativeSlogan || "My creative nature can't be defined!"}</span>
                                <PersonalTags/>
                                <span className="text-base max-w-5xl py-2">{profileData?.bio || "Thinking of something creative to say..."}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <StarWork />
        </div>
    );
};

export default ProfileCard;

// "use client";

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import ProfilePicture from "./profile-picture";
// import PersonalTags from "./personal-tags";
// import StarWork from "./star-work";

// const ProfileCard = ({ userData, isOwnProfile = true }) => {
//     const { data: session, status: sessionStatus } = useSession();
//     const [profileData, setProfileData] = useState(null);
//     const [isFollowing, setIsFollowing] = useState(false);
//     const [updatedProfileData, setUpdatedProfileData] = useState({
//         creativeSlogan: "", 
//         bio: "", 
//         profilePicture: null
//     });
    
//     const [status, setStatus] = useState("idle");

//     const getApiUrl = () => {
//         return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
//     };

//     useEffect(() => {
//         // Enhanced debugging for userData
//         if (!isOwnProfile && userData) {
//             console.log("=============== PROFILE CARD ===============");
//             console.log("Viewing OTHER USER profile with userData:", userData);
//             console.log("userData.profilePicture:", userData.profilePicture);
//             console.log("===========================================");
            
//             setProfileData(userData);
//             setUpdatedProfileData({
//                 creativeSlogan: userData.creativeSlogan || "",
//                 bio: userData.bio || "",
//                 profilePicture: userData.profilePicture || null
//             });

//             if (session?.user?.id) {
//                 checkFollowExists();
//             }
//         } else if (userData) {
//             console.log("Viewing OWN profile with userData:", userData);
//             setProfileData(userData);
//             setUpdatedProfileData({
//                 creativeSlogan: userData.creativeSlogan || "",
//                 bio: userData.bio || "",
//                 profilePicture: userData.profilePicture || null
//             });
//         } else if (session?.user?.id && session?.user?.profileType) {
//             fetchProfileContent();
//         }
//     }, [session, userData, isOwnProfile]);

//     const fetchProfileContent = async () => {
//         if (!session?.user?.id || !session?.user?.profileType) return;

//         try {
//             const userId = session.user.id;
//             const profileType = session.user.profileType;

//             const response = await fetch(`${getApiUrl()}/api/profiles/get-profile-content?id=${userId}&profileType=${profileType}`, {
//                 method: "GET",
//                 headers: { 
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${session.accessToken}`
//                 }
//             });
    
//             if (!response.ok) {
//                 console.log("Failed to retrieve data");
//                 return;
//             }

//             const profileData = await response.json();
//             console.log("Fetched own profile data:", profileData);

//             setProfileData(profileData);
//             setUpdatedProfileData({
//                 creativeSlogan: profileData.creativeSlogan || "",
//                 bio: profileData.bio || "",
//                 profilePicture: null
//             });

//         } catch (error) {
//             console.log("Error retrieving profile type data", error);
//         } 
//     };

//     // Rest of the functions remain the same...
//     const checkFollowExists = async () => {
//         // Implementation remains the same
//     };

//     const handleFollowingClick = async () => {
//         // Implementation remains the same
//     };

//     const handleProfileDataChange = (event) => {
//         // Implementation remains the same
//     };

//     const handleProfilePictureUpdate = (imageFile, base64Image) => {
//         if (!isOwnProfile || !imageFile) return;

//         // Store the file object in state for later upload
//         setUpdatedProfileData(prev => ({
//             ...prev,
//             profilePicture: imageFile
//         }));
        
//         // Store in localStorage for immediate display in the ProfilePicture component
//         localStorage.setItem(
//             `profilePicture-${session?.user?.id}-${session?.user?.profileType}`, 
//             base64Image
//         );
//     };

//     const saveUpdatedProfileData = async () => {
//         // Implementation remains the same
//     };

//     const toggleEditMode = () => {
//         // Implementation remains the same
//     };

//     if (sessionStatus === "loading") {
//         return <p className="text-center">Your Adventure Awaits...</p>;
//     }

//     // Determine which user data to use
//     const user = isOwnProfile ? session?.user : userData;
//     const isSessionUserProfile = user?.profileType === 'personal';

//     const displayProfileTypeName = isSessionUserProfile 
//         ? user?.username 
//         : (user?.fullname || "").trim();

//     const isEditing = status === "editing";
//     const isSaving = status === "saving";
//     const isUpdatingFollow = status === "following";

//     // CRITICAL: Determine the correct profile picture path with enhanced debugging
//     const profilePicturePath = isOwnProfile ? profileData?.profilePicture : userData?.profilePicture;
    
//     console.log("Profile picture debug info:", {
//         isOwnProfile,
//         userId: user?.id,
//         profileType: user?.profileType,
//         profileDataPicture: profileData?.profilePicture,
//         userDataPicture: userData?.profilePicture,
//         selectedPicturePath: profilePicturePath
//     });

//     // Enhanced URL construction with better check for valid paths
//     let fullProfilePicturePath = null;
    
//     if (profilePicturePath) {
//         // If it's already a data URL or complete URL, use it as is
//         if (profilePicturePath.startsWith('data:') || profilePicturePath.includes('://')) {
//             fullProfilePicturePath = profilePicturePath;
//         } 
//         // If it's a relative path, append the API URL
//         else {
//             const apiUrl = getApiUrl();
//             fullProfilePicturePath = `${apiUrl}${profilePicturePath.startsWith('/') ? '' : '/'}${profilePicturePath}`;
//         }
//     }
    
//     console.log("Final profile picture path:", fullProfilePicturePath);

//     return (
//         <div className="w-full">
//             <div className="w-full h-52 bg-blue-500 relative">
//             <div className="absolute -bottom-40 left-8 flex flex-col items-center gap-4 w-52"> 
//                     {/* Debug display of raw image for other user profiles */}
//                     {!isOwnProfile && userData?.profilePicture && (
//                         <div className="absolute top-0 right-0 text-xs bg-yellow-100 p-1 z-10">
//                             Raw user image found
//                         </div>
//                     )}
                    
//                     <ProfilePicture 
//                         userId={user?.id || '0'} 
//                         profileType={user?.profileType || 'default'} 
//                         isEditing={isEditing} 
//                         imageUpdate={handleProfilePictureUpdate}
//                         isOwnProfile={isOwnProfile}
//                         externalProfilePicture={!isOwnProfile ? fullProfilePicturePath : null}
//                     />
//                     {isOwnProfile ? (
//                         <button 
//                             className={`h-10 rounded-full p-2 w-[150px] border-2 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(152,_198,_206,_0.5)] ${isEditing ? "text-red-600 border-red-600 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]" : "text-black border-secondary"}`} 
//                             onClick={toggleEditMode}
//                             disabled={isSaving}
//                         >
//                             {isEditing ? "Cancel" : "Edit Profile"}
//                         </button>
//                     ) : (
//                         <button 
//                             className={`h-10 rounded-full p-2 w-[150px] border-2 ${isFollowing ? "text-white bg-secondary border-secondary" : "text-black border-secondary"}`} 
//                             onClick={handleFollowingClick}
//                             disabled={isUpdatingFollow}
//                         >
//                             {isUpdatingFollow ? "..." : (isFollowing ? "Following" : "Follow")}
//                         </button>
//                     )}
//                 </div>
//             </div>
//             <div className="pl-64 pr-8 ">
//                 <div className="max-w-full">
//                     <div className="flex flex-col mt-2">
//                         <span className="text-4xl font-bold">{displayProfileTypeName}</span>
//                         {isEditing && isOwnProfile ? (
//                             <>
//                                 <input 
//                                     type="text" 
//                                     name="creativeSlogan"
//                                     value={updatedProfileData.creativeSlogan || ""} 
//                                     onChange={handleProfileDataChange} 
//                                     placeholder="Write your creative slogan here..."
//                                     className="p-2 border rounded-full text-xl"
//                                     style={{
//                                         width: `${(updatedProfileData.creativeSlogan || "").length * 10}px`,
//                                         minWidth: "400px",
//                                         maxWidth: "100%"
//                                     }}
//                                 />
//                                 <input 
//                                     type="text" 
//                                     name="bio" 
//                                     value={updatedProfileData.bio || ""} 
//                                     onChange={handleProfileDataChange} 
//                                     placeholder="Describe your creative persona" 
//                                     className="p-2 border rounded-full overflow-hidden"
//                                     style={{
//                                         width: `${(updatedProfileData.bio || "").length * 10}px`,
//                                         minWidth: "400px",
//                                         maxWidth: "100%"
//                                     }}
//                                 />
//                                 <button 
//                                     className="mt-4 rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]"
//                                     onClick={saveUpdatedProfileData}
//                                     disabled={isSaving}
//                                 >
//                                     {isSaving ? "..." : "Save"}
//                                 </button>
//                             </>
//                         ) : (
//                             <>
//                                 <span className="text-xl font-bold pb-4">{isOwnProfile ? profileData?.creativeSlogan : userData?.creativeSlogan || "My creative nature can't be defined!"}</span>
//                                 <PersonalTags/>
//                                 <span className="text-base max-w-5xl py-2">{isOwnProfile ? profileData?.bio : userData?.bio || "Thinking of something creative to say..."}</span>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//             <StarWork />
//         </div>
//     );
// };

// export default ProfileCard;