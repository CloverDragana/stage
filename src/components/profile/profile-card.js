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

    useEffect( () => {
        const fetchProfileContent = async () => {
            if (!session?.user?.id || !session?.user?.profileType) return;

            try {
                const response = await fetch(`/api/auth/get-profile-content?userId=${session.user.id}&profileType=${session.user.profileType}`, {
                    method: "GET",
                    headers: { 'Content-Type' : 'application/json' }
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

            const response = await fetch('/api/auth/update-profile', {
                method: "PUT",
                headers: { 'Content-Type' : 'application/json' },
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
                <div className="absolute bottom-0 left-8 transform translate-y-1/2"> 
                    <ProfilePicture />
                </div>
            </div>
            <div className=" h-auto flex flex-row justify-between px-2">
                <div className=" flex justify-center"> 
                    <button className={`mt-48 h-10 rounded-full p-2 w-full border-2 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(152,_198,_206,_0.5)]${inEditMode ? "text-red-600 border-red-600 hover:shadow-[inset_0px_0px_20px_4px_rgba(229,_82,_82,_0.4)]" : " text-black border-secondary"}`} onClick={ () => setInEditMode(!inEditMode)}>{inEditMode ? "Cancel" : "Edit Profile"}</button>
                </div>
                <div className="flex flex-col text-black items-start mr-[300px] ml-10 pt-4">
                    <span className="text-4xl font-bold pb-3">{session?.user?.profileType === 'personal' ? session?.user?.username : `${session?.user?.fname} ${session?.user?.lname}`.trim()}</span>
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
                                className="p-2 mt-4 border rounded-full"
                                style={{
                                    width: `${updatedProfileData.bio.length * 10}px`,
                                    minWidth: "400px",
                                    maxWidth: "100%"
                                }}/>
                            <button className=" mt-4 rounded-full p-2 w-16 bg-white border-2 border-green-600 transition-all duration-300 hover:shadow-[inset_0px_0px_20px_4px_rgba(82,_229,_121,_0.4)]"onClick={saveUpdatedProfileData}>Save</button>
                        </>
                    ) : (
                        <>
                            <span className="text-xl pb-3">{profileData?.creativeSlogan || "My creative nature can't be defined!"}</span>
                            <span className="text-base max-w-2xl">{profileData?.bio || "Thinking of something creative to say..." }</span>
                        </>
                    )}
                </div>
                <div className="p-2">
                    <PersonalTags />
                </div>
            </div>
            <hr className="mx-2 w-auto flex h-1 border-0 rounded-sm dark:bg-secondary"></hr>
        </div>
    );
};

export default ProfileCard;