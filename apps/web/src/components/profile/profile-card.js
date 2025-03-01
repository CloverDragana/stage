"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProfilePicture from "@/components/profile/profile-picture";
import PersonalTags from "@/components/profile/personal-tags";

const ProfileCard = () => {
    const { data: session, status } = useSession();
    const [profileData, setProfileData] = useState(null);
    const [inEditMode, setInEditMode] = useState(false);
    const [updatedProfileData, setUpdatedProfileData] = useState({creative_slogan: "", bio: ""});

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect( () => {
        const fetchProfileContent = async () => {
            if (!session?.user?.id || !session?.user?.profileType) return;

            try {
                const userId = session.user.id;
                const profileType = session.user.profileType;
        
                console.log("Fetching profile with:", { userId, profileType });

                const response = await fetch(`${getApiUrl()}/api/profiles/get-profile-content?id=${userId}&profileType=${profileType}`, {
                    method: "GET",
                    headers: { 
                        "Content-Type" : "application/json",
                        "Authorization": `Bearer ${session.accessToken}`
                    }
                });
        
                if (!response.ok){
                    console.log("Failed to retrieved data");
                }

                const profileData = await response.json();
                console.log("Received profile data:", profileData);

                setProfileData(profileData);
                setUpdatedProfileData({
                    creativeSlogan: profileData.creativeSlogan || "",
                    bio: profileData.bio || ""
                });

            } catch (error){
                console.log("Error retrieving profile type data", error);
            } 
        };

        fetchProfileContent();
    }, [session]);

    const handleProfileDataChange = (event) => {
        setUpdatedProfileData({...updatedProfileData, [event.target.name]: event.target.value });
    };

    const saveUpdatedProfileData = async () => {
        try {
            console.log("Sending data:", {
                userId: session.user.id,
                profileType: session.user.profileType,
                creativeSlogan: updatedProfileData.creativeSlogan,
                bio: updatedProfileData.bio
            });

            const response = await fetch(`${getApiUrl()}/api/profiles/update-profile`, {
                method: "PUT",
                headers: { 
                    "Content-Type" : "application/json",
                    "Authorization": `Bearer ${session.accessToken}`
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    profileType: session.user.profileType,
                    creativeSlogan: updatedProfileData.creativeSlogan,
                    bio: updatedProfileData.bio
                })
            });

            if (!response.ok){
                console.log("Failed to update data", error);
                return;
            }

            const updatedData = await response.json();
            setProfileData(updatedData);
            setInEditMode(false);

        } catch (error){
            console.log("Failed to update profile information", error);
        }
    };

    if(status === "loading"){
        return <p className="text-center">Your Adventure Awaits...</p>;
    }

    return(
        <div className="w-full">
            <div className="w-full h-52 bg-blue-500 relative">
                <div className="absolute -bottom-40 left-8 flex flex-col items-center gap-4 w-52"> 
                    <ProfilePicture />
                    <button className={`h-10 rounded-full p-2 w-[150px] border-2 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(152,_198,_206,_0.5)]${inEditMode ? "text-red-600 border-red-600 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]" : " text-black border-secondary"}`} onClick={ () => setInEditMode(!inEditMode)}>{inEditMode ? "Cancel" : "Edit Profile"}</button>
                </div>
            </div>
            <div className="pl-64 pr-8 ">
                <div className=" max-w-full">
                    <div className="flex flex-col mt-2">
                        <span className="text-4xl font-bold">{session?.user?.profileType === 'personal' ? session?.user?.username : `${session?.user?.fullname}`.trim()}</span>
                        {inEditMode ? (
                            <>
                                <input 
                                    type="text" 
                                    name="creativeSlogan"
                                    value={updatedProfileData.creativeSlogan} 
                                    onChange={handleProfileDataChange} 
                                    placeholder="Write your creative slogan here..."
                                    className="p-2 border rounded-full text-xl"
                                    style={{
                                        width: `${updatedProfileData.creativeSlogan.length * 10}px`,
                                        minWidth: "400px",
                                        maxWidth: "100%"
                                    }}/>
                                <input 
                                    type="text" 
                                    name="bio" 
                                    value={updatedProfileData.bio} 
                                    onChange={handleProfileDataChange} 
                                    placeholder="Describe your creative persona" 
                                    className="border rounded-full overflow-hidden"
                                    style={{
                                        width: `${updatedProfileData.bio.length * 10}px`,
                                        minWidth: "400px",
                                        maxWidth: "100%"
                                    }}/>
                                <button className=" mt-4 rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]"onClick={saveUpdatedProfileData}>Save</button>
                            </>
                        ) : (
                            <>
                                <span className="text-xl font-bold pb-4">{profileData?.creativeSlogan || "My creative nature can't be defined!"}</span>
                                <PersonalTags/>
                                <span className="text-base max-w-5xl py-2">{profileData?.bio || "Thinking of something creative to say..." }</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;