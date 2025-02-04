"use client";

import { useSession } from "next-auth/react";
import ProfilePicture from "@/components/profile/profile-picture";
import PersonalTags from "@/components/profile/personal-tags";

const ProfileCard = () => {
    const { data: session, status } = useSession();

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
                    <button className="mt-48 h-10 p-2 rounded-full border-2 border-secondary ">Edit Profile</button>
                </div>
                <div className="flex flex-col text-black items-start mr-[450px] pt-4">
                    <h2 className="text-4xl font-bold pb-3">{session?.user?.username || "Guest" }</h2>
                    <p className="text-xl pb-3">Descriptive few words</p>
                    <p className="text-base max-w-2xl">Bio (up to 100-150 words)</p>
                </div>
                <div className="p-2">
                    <PersonalTags />
                </div>
            </div>
            <hr className="mx-2 w-auto flex h-1 border-0 rounded-sm dark:bg-secondary"></hr>
        </div>
    );
}

export default ProfileCard;