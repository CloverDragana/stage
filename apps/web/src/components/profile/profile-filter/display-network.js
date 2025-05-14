"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import UserProfileDisplay from "../user-profile-display";
import Search from "../../navigation/searchbar";

const NetworkList = ({ userData }) => {
    const {data: session} = useSession();
    const router = useRouter();
    const [ users, setUsers ]  = useState([]);
    const [activeFilter, setActiveFilter] = useState("followers");

    const getApiUrl = () => {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    };

    useEffect(() => {  

        if (!userData.userId || !userData.profileId) {
            console.error('User ID and Profile ID required to display network');
            return;
        }

        const getProfileNetwork = async () => {
            try {
                const networkEndpoint = activeFilter === "followers"
                ? `get-followers?profileId=${userData.profileId}` 
                : `get-following?profileId=${userData.profileId}`;

                const response = await fetch(`${getApiUrl()}/api/connections/${networkEndpoint}`, {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to get profile network ${activeFilter}`);
                }

                const networkList =  await response.json();
                setUsers(networkList.users || []);
            } catch (error){
                console.error("Error getting profile network:", error);
                setUsers([]);
            } 
        }
        getProfileNetwork();
    }, [userData, activeFilter, session]);

    const handleClickedResult = (user) => {
        // console.log("Clicked user:", userId, profileType);
        router.push(`/profile/${user.userId}?profileType=${user.profileType}`);
        router.refresh();
        setActiveFilter("");
        setUsers([]);
    };

    return (
        <div>
            <div className="flex justify-evenly space-x-4 pb-4 mt-4">
                <button className={`py-2 px-4 ${activeFilter === 'followers' ? 'border-b-2 border-secondary font-bold' : ''}`} onClick={() => setActiveFilter("followers")}>Followers</button>
                <button className={`py-2 px-4 ${activeFilter === 'following' ? 'border-b-2 border-secondary font-bold' : ''}`}onClick={() => setActiveFilter("following")}>Following</button>
            </div>
            <div className="flex flex-row justify-center space-x-4">
                {users.length === 0 ? (
                    <div className="text-center py-8">No {activeFilter} found</div>
                ) :(
                    <div className="flex flex-col w-3/6 justify-center border-2 border-[rgb(217,217,217)] rounded-lg p-4 my-4">
                        {users.map((user) => (
                            <UserProfileDisplay
                            key={`${user.userId}-${user.profileType}`}
                            user = {user}
                            onClick={handleClickedResult}
                            isOnContent={false}
                            accessToken={session.accessToken}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkList;