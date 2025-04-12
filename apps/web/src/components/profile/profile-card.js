"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProfilePicture from "./profile-picture";
import PersonalTags from "./personal-tags";
import StarWork from "./star-work";
import BannerImage from "./banner-image";

const ProfileCard = ({ userData, isOwnProfile}) => {
    const { data: session, status: sessionStatus } = useSession();
    const [profileData, setProfileData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [updatedProfileData, setUpdatedProfileData] = useState({
        creativeSlogan: "", 
        bio: "", 
        profilePicture: null,
        bannerImage: null,
        starWorkImages: [ null, null, null]
    });
    
    const [status, setStatus] = useState("idle");

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {
        
        if (userData) {
            setProfileData(userData);
            setUpdatedProfileData({
                creativeSlogan: userData.creativeSlogan || "",
                bio: userData.bio || "",
                profilePicture: null,
                bannerImage: null,
                starWorkImages: [ null, null, null]
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
                profilePicture: null,
                bannerImage: null,
                starWorkImages: [ null, null, null]
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

    // const handleProfilePictureUpdate = (imageFile, base64Image) => {
    //     if (!isOwnProfile || !imageFile) return;

    //     setUpdatedProfileData(prev => ({
    //         ...prev,
    //         profilePicture: imageFile
    //     }));
        
    //     localStorage.setItem(
    //         `profilePicture-${session?.user?.id}-${session?.user?.profileType}`, 
    //         base64Image
    //     );
    // };

    const handleProfileImagesUpdate = (imageFile, base64Image, imageType, imageIndex) => {
        if (!isOwnProfile || !imageFile) return;

        console.log("handleProfileImagesUpdate called with:", {
            imageType,
            imageIndex,
            fileType: imageFile.type,
            fileSize: imageFile.size
        });

        if (imageType === 'profile'){
            setUpdatedProfileData(prev => ({
                ...prev,
                profilePicture: imageFile
            }));
            
            localStorage.setItem(
                `profilePicture-${session?.user?.id}-${session?.user?.profileType}`, 
                base64Image
            );
        } else if (imageType === 'banner'){
            setUpdatedProfileData(prev => ({
                ...prev,
                bannerImage: imageFile
            }));
            
            localStorage.setItem(
                `bannerImage-${session?.user?.id}-${session?.user?.profileType}`, 
                base64Image
            );
        } else if (imageType === 'starWork' && imageIndex !== undefined ){

            console.log("Updating starWork with index:", imageIndex);

            const updateStarWorks = [ ...updatedProfileData.starWorkImages];
            updateStarWorks[imageIndex] = imageFile;

            setUpdatedProfileData(prev => ({
                ...prev,
                starWorkImages: updateStarWorks
            }));

            try {
                const localStorageImageArray = localStorage.getItem(`starWorkImages-${session?.user?.id}-${session?.user?.profileType}`);
                let imagesArray = localStorageImageArray ? JSON.parse(localStorageImageArray) : [null, null, null];

                imagesArray[imageIndex] = base64Image;
                localStorage.setItem(
                    `starWorkImages-${session?.user?.id}-${session?.user?.profileType}`, 
                    JSON.stringify(imagesArray)
                );
            } catch (error){
                console.log("Error updating star works from local storage", error);
            }
        }
    };

    const saveUpdatedProfileData = async () => {
        if (!isOwnProfile) return;
        
        setStatus("saving");
        
        try {
            let isSuccess = true;

            let updatedProfileImages = {
                profilePicture: null,
                bannerImage: null,
                starWorkImages: [null, null, null]
            };
            
            if (updatedProfileData.profilePicture) {

                const formData = new FormData();

                formData.append("userId", session.user.id);
                formData.append("profileType", session.user.profileType);
                formData.append("file", updatedProfileData.profilePicture);
                
                console.log("Uploading profile picture...");
                console.log("Form data:", Object.fromEntries(formData.entries().map(([key, value]) => {
                    return [key, key === 'file' ? `File: ${value.name}` : value];
                })));

                // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

                const pictureResponse = await fetch(`${getApiUrl()}/api/profiles/update-profile-picture`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`
                    },
                    body: formData
                });
                
                if (!pictureResponse.ok) {
                    console.log("Failed to update profile picture");
                    const errorData = await pictureResponse.json();
                    console.error("Error response:", errorData);
                    isSuccess = false;
                } else {
                    console.log("Profile picture updated successfully");

                    const profilePictureData = await pictureResponse.json();
                    console.log("Profile picture response:", profilePictureData);

                    if (profilePictureData.profilePicture) {
                        updatedProfileImages.profilePicture = `/uploads/profile/${profilePictureData.profilePicture}`;
                        console.log("Setting profile picture path in localStorage to:", updatedProfileImages.profilePicture);
                        
                        // Update localStorage with the new path
                        localStorage.setItem(
                            `profilePicture-${session.user.id}-${session.user.profileType}`, 
                            updatedProfileImages.profilePicture
                        );
                    }
                }
            }

            if (updatedProfileData.bannerImage) {

                const formData = new FormData();

                formData.append("userId", session.user.id);
                formData.append("profileType", session.user.profileType);
                formData.append("file", updatedProfileData.bannerImage);
                
                console.log("Uploading Banner Image...");
                const bannerResponse = await fetch(`${getApiUrl()}/api/profiles/update-banner-image`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${session.accessToken}`
                    },
                    body: formData
                });
                
                if (!bannerResponse.ok) {
                    console.log("Failed to update Banner Image");
                    isSuccess = false;
                } else {
                    console.log("Banner Image updated successfully");

                    const bannerImageData = await bannerResponse.json();

                    if (bannerImageData.bannerImage) {
                        updatedProfileImages.bannerImage = `/uploads/profile/${bannerImageData.bannerImage}`;
                        
                        // Update localStorage with the new path
                        localStorage.setItem(
                            `bannerImage-${session.user.id}-${session.user.profileType}`, 
                            updatedProfileImages
                        );
                    }
                }
            }

            if (updatedProfileData.starWorkImages) {

                for (let image = 0; image < updatedProfileData.starWorkImages.length; image++){
                    const starWorkImage = updatedProfileData.starWorkImages[image];
                    if(starWorkImage){
                        const formData = new FormData();

                        formData.append("userId", session.user.id);
                        formData.append("profileType", session.user.profileType);
                        formData.append("file", starWorkImage);
                        formData.append("imageIndex", image.toString());

                        console.log("Preparing to upload starWork image:", {
                            index: image,
                            formDataEntries: Array.from(formData.entries()).map(([key, value]) => {
                                return {key, value: key === 'file' ? 'File object' : value};
                            })
                        });
                        
                        console.log("Uploading Star Work Image with index:", image);
                        console.log("Form data:", Object.fromEntries(formData)); 
                        console.log("Uploading Star Work Images...");
                        const starWorkResponse = await fetch(`${getApiUrl()}/api/profiles/update-star-work-image`, {
                            method: "PUT",
                            headers: {
                                "Authorization": `Bearer ${session.accessToken}`
                            },
                            body: formData
                        });

                        if (!starWorkResponse.ok) {
                            console.log("Failed to update Star Works");
                            isSuccess = false;
                        } else {
                            console.log("Star Work updated successfully");
        
                            const starWorkData = await starWorkResponse.json();

                            const localStorageImages = localStorage.getItem(`starWorkImages-${session.user.id}-${session.user.profileType}`);
                            updatedProfileImages.starWorkImages = localStorageImages ? JSON.parse(localStorageImages) : [null, null, null];
        
                            if (starWorkData.starWorkPath) {
                                updatedProfileImages.starWorkImages[image] = `/uploads/profile/${starWorkData.starWorkPath}`;
                                console.log("Image path set to:",  updatedProfileImages.starWorkImages[image]);
                            }
                            localStorage.setItem(
                                `starWorkImages-${session.user.id}-${session.user.profileType}`, 
                                JSON.stringify(updatedProfileImages.starWorkImages)
                            );
                        }
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

                if (updatedProfileImages) {
                    const updatedDataWithImages = {
                        ... updatedData,
                        profilePicture: updatedProfileImages.profilePicture,
                        bannerImage: updatedProfileImages.bannerImage,
                        starWorkImages: updatedProfileImages.starWorkImages
                    }
                }

                setProfileData(updatedData);
                console.log("Profile data updated successfully:", updatedData);
            }
            
            if (isSuccess) {
                setUpdatedProfileData(prev => ({
                    ...prev,
                    profilePicture: null,
                    bannerImage: null, 
                    starWorkImages: [null, null, null]
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
            <div className="w-full h-52 relative">
                <BannerImage
                    userId={isOwnProfile ? session?.user?.id : userData?.userId} 
                    profileType={isOwnProfile ? session?.user?.profileType : userData?.profileType} 
                    isEditing={isEditing} 
                    imageUpdate={handleProfileImagesUpdate}
                    // imageUpdate={(file, base64) => handleProfileImagesUpdate(file, base64, 'banner')}
                    isOwnProfile={isOwnProfile}
                />
            <div className="absolute -bottom-40 left-8 flex flex-col items-center gap-4 w-52"> 
                    <ProfilePicture 
                        userId={isOwnProfile ? session?.user?.id : userData?.userId} 
                        profileType={isOwnProfile ? session?.user?.profileType : userData?.profileType} 
                        isEditing={isEditing} 
                        imageUpdate={handleProfileImagesUpdate}
                        isOwnProfile={isOwnProfile}
                    />
                    {isOwnProfile ? (
                        isEditing ? (
                            <div className="flex space-x-2">
                                <button 
                                className={`h-10 rounded-full p-2 w-[100px] border-2 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(152,_198,_206,_0.5)] ${isEditing ? "text-red-600 border-red-600 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]" : "text-black border-secondary"}`} 
                                onClick={toggleEditMode}
                                disabled={isSaving}
                                >
                                    Cancel
                                    {/* {isEditing ? "Cancel" : "Edit Profile"} */}
                                </button>
                                <button 
                                className="h-10 rounded-full p-2  w-[100px] bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]"
                                onClick={saveUpdatedProfileData}
                                disabled={isSaving}
                                >
                                    {isSaving ? "..." : "Save"}
                                </button>
                            </div>
                        ) : (
                            <button 
                                className="h-10 rounded-full p-2 w-[150px] border-2 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(152,_198,_206,_0.5)] text-black border-secondary" 
                                onClick={toggleEditMode}
                            >
                                Edit Profile
                            </button>
                        )
                        // <button 
                        //     className={`h-10 rounded-full p-2 w-[150px] border-2 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(152,_198,_206,_0.5)] ${isEditing ? "text-red-600 border-red-600 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]" : "text-black border-secondary"}`} 
                        //     onClick={toggleEditMode}
                        //     disabled={isSaving}
                        // >
                        //     {isEditing ? "Cancel" : "Edit Profile"}
                        // </button>
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
                                    className="p-2 mb-2 border rounded-lg text-xl"
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
                                    className="p-2 border rounded-lg overflow-hidden"
                                    style={{
                                        width: `${(updatedProfileData.bio || "").length * 10}px`,
                                        minWidth: "400px",
                                        maxWidth: "100%"
                                    }}
                                />
                                {/* <button 
                                    className="mt-4 rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]"
                                    onClick={saveUpdatedProfileData}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "..." : "Save"}
                                </button> */}
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
            <StarWork 
               userId={isOwnProfile ? session?.user?.id : userData?.userId} 
               profileType={isOwnProfile ? session?.user?.profileType : userData?.profileType} 
               isEditing={isEditing} 
               imageUpdate={handleProfileImagesUpdate}
               isOwnProfile={isOwnProfile}/>
        </div>
    );
};

export default ProfileCard;